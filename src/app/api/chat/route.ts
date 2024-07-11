// app/api/chat/route.ts
export async function POST(req: Request) {
	const { messages } = await req.json();

	return new Response("Chat messages received!");
}
