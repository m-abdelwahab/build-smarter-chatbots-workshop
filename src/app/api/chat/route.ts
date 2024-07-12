// app/api/chat/route.ts
import { mistral } from "@ai-sdk/mistral";
import { streamText, embed } from "ai";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
	const { messages } = await req.json();

	// Get the user's last message
	const prompt = messages[messages.length - 1].content;

	// Embed the user's last message
	const { embedding } = await embed({
		model: mistral.embedding("mistral-embed"),
		value: prompt,
	});

	const sql = neon(process.env.DATABASE_URL!);

	// find the most similar document to the user's last message
	const documents = await sql`
      SELECT * FROM documents
      ORDER BY embedding <->  ${JSON.stringify(embedding)}::vector
      LIMIT 1
    `;

	// Stream the user's messages and the most similar document to the model and include the document in the system message
	const result = await streamText({
		model: mistral("open-mistral-7b"),
		messages,
		system: `You have access to relevant information that might help answer the user's question. Here it is: "${documents.map((d) => d.content).join(" ")}". Use this information if it's relevant to the user's query, but don't mention it explicitly unless asked. If the information isn't relevant, rely on your general knowledge to answer.`,
	});

	return result.toAIStreamResponse();
}
