// app/api/chat/route.ts
import { mistral } from "@ai-sdk/mistral";
import { streamText, embed } from "ai";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
	const { messages } = await req.json();

	// Get the user's last message
	const prompt = messages[messages.length - 1].content;

	// Embed the user's last message

	// Connect to the Neon database

	// find the most similar document to the user's last message

	// Stream the user's messages and the most similar document to the model and include the document in the system message. Here's an example of how you can do this:

  const documents = await sql`...`;

  // The Vercel AI SDK, allows you to set a system message that provides additional context to the model. This message is not included in the final response to the user. You can use the following prompt to include the most similar document in the system message:
  // "You have access to information that might help answer the user's question. Use this information if it's relevant to the user's query, but don't mention it explicitly unless asked. If the information isn't relevant, rely on your general knowledge to answer. Here is the information: <most-relevant-document>"
	
  const result = ...

	return result.toAIStreamResponse();
}