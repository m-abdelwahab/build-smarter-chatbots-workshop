import { embedMany } from "ai";
import { mistral } from "@ai-sdk/mistral";
import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const main = async () => {
	const sql = neon(process.env.DATABASE_URL!);

	const values = [
		"sunny day at the beach",
		"rainy afternoon in the city",
		"snowy night in the mountains",
	];

	const { embeddings } = await embedMany({
		model: mistral.embedding("mistral-embed"),
		values: values,
	});

	// Create extension and table if they don't exist
	await sql.transaction([
		sql`CREATE EXTENSION IF NOT EXISTS vector`,
		sql`CREATE TABLE IF NOT EXISTS documents(id UUID PRIMARY KEY DEFAULT gen_random_uuid(), content TEXT NOT NULL, embedding vector(1024));`,
	]);

	// Insert embeddings one by one
	for (let i = 0; i < values.length; i++) {
		await sql`
      INSERT INTO documents (content, embedding) 
      VALUES (${values[i]}, ${JSON.stringify(embeddings[i])}::vector)
    `;
		console.log(`Embedding ${i + 1} inserted successfully`);
	}

	console.log("All embeddings inserted successfully");
};

main().catch(console.error);
