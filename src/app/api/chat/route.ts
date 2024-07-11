// app/api/chat/route.ts
import { mistral } from "@ai-sdk/mistral";
import { streamText } from "ai";

export async function POST(req: Request) {
	const { messages } = await req.json();
	const result = await streamText({
		model: mistral("open-mistral-7b"),
		messages,
	});

	return result.toAIStreamResponse();
}
