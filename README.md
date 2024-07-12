# Build Smarter Chatbots

![build-smarter-chatbots-workshop](https://github.com/user-attachments/assets/5b1a5af5-426d-4470-ac36-1003b594f1c3)

In this workshop, you'll build an AI-powered chatbot that is able to access external data to provide the most accurate answer.

This workshop is perfect for developers who have a basic understanding of web development and want to expand their skills in building modern, AI-powered applications.

## Workshop activities

The workshop includes a mix of two activities:
- **Conceptual overviews** — these are explanations of key concepts that you need to understand to complete the exercises.
- **Exercises** – these are hands-on activities that guide you to achieve a specific goal. You will have a chance to implement the concepts you learned in the conceptual overviews and you will have code snippets to help you along the way.

## Workshop outline

The workshop is divided into the following sections:
- Exercise #0 - Setting up the project & development environment
- Conceptual Overview - what are LLMs?
- Exercise #1 - Adding AI capabilities to the chatbot
- Conceptual Overview - what is Retreival-Augmented Generation (RAG)?
- Exercise #2 - using Postgres as a vector store
- Exercise #3 - adding RAG to the chatbot

## Prerequisites

To complete this workshop, you'll need to have basic working knowledge of:

- Building APIs and writing server-side code using JavaScript/TypeScript
- Working with the command-line and installing Node.js packages
- SQL

The app you'll build today has both a front-end and back-end components. This workshop focuses on building the backend, and won't dive deep into the front-end.

## Exercise #0 - Setting up the project & development environment

In this exercise, you'll set up your development environment. You can either use your local machine or instead use Stackblitz, an online development environment.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/~/github.com/m-abdelwahab/build-smarter-chatbots)

Using Stackblitz will automatically install the project's dependencies for you and start the development server by running `npm install && npx next dev` for you.

<details>
  <summary>Setting up the project on your local machine</summary>

Before getting started, you will need to have the following installed on your machine:

- [Git](https://git-scm.com/) (to be able to follow along and complete the exercises)
- [Node.js](https://nodejs.org/) - installation instructions (at least version 18 is required. You can check the Node version installed on your machine by running `node -v`)

To get started, run the following commands:

1. In the directory of your choice, clone the starter repo

```bash
git clone https://github.com/neondatabase/build-smarter-chatbots-workshop
```

1. Navigate to the cloned repo, install the project's dependencies and start the development server

```bash
cd build-smarter-chatbots-workshop

npm i

npm run dev
```

This will start a local development server at [http://localhost:3000](http://localhost:3000/)

</details>

As it stands, this chatbot is non-functional (yet)

### Project overview

You'll find the following directory structure:

```
build-better-chatbots/
┣ public/
┣ src/
┃ ┗ app/
┃   ┣ api/
┃	  ┗ chat/
┃	    ┗ route.ts
┃   ┣ favicon.ico
┃   ┣ globals.css
┃   ┣ layout.tsx
┃   ┗ page.tsx
┣ .env.local.example
┣ .gitignore
┣ README.md
┣ next-env.d.ts
┣ next.config.mjs
┣ package-lock.json
┣ package.json
┣ postcss.config.mjs
┣ setup.ts
┣ tailwind.config.ts
┗ tsconfig.json

```

The `.env.local.example` and `setup.ts` files will be used later.


Next.js uses a file-system based router where folders located under the `app` directory are used to define routes. Each folder represents a route segment that maps to a URL segment. To create a nested route, you can nest folders inside each other.

![Next.js file-system based router](https://nextjs.org/_next/image?url=%2Fdocs%2Fdark%2Froute-segments-to-path-segments.png&w=3840&q=75)

The app has a single route defined in the `src/app/page.tsx` file. This route will be rendered at the index route `/`. This is the page that will be displayed when you visit the app in the browser and where you'll see the chatbot UI.

When you add a special `route.ts` file inside a folder, it will make the full path of the folder a route. For example, in this project you have a `app/api/chat` with a `route.ts` file nested under it. This will create a route at `/api/chat` which will be used to handle the chatbot's requests. You're going to implement the logic to handle the chatbot's requests in this file.


<details>
  <summary>Frontend code overview</summary>
  If you open the `src/app/page.tsx` file, you'll see the following code:

  ```tsx
  "use client";

  import { useChat } from "ai/react";

  export default function Chat() {
    const { messages, input, handleInputChange, handleSubmit } = useChat();
    return (
      <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
        {messages.map((m) => (
          <div key={m.id} className="whitespace-pre-wrap">
            {m.role === "user" ? "User: " : "AI: "}
            {m.content}
          </div>
        ))}

        <form onSubmit={handleSubmit}>
          <input
            className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
        </form>
      </div>
    );
  }
  ```

  The `"use client"` directive placed at the top of the file means the page will be rendered on the client.

  The`useChat` hook is then imported from the Vercel AI SDK, a library that provides a set of tools that allows developers to integrate artificial intelligence (AI) capabilities into their applications. It also provides pre-built functions and APIs for popular AI services, which you'll use later.

  This hook returns multiple values which are used to build the UI:
  - `messages` - the current chat messages (an array of objects with id, role, and content properties).
  - `input` - the current value of the user's input field.
  - `handleInputChange` and `handleSubmit` - functions to handle user interactions (typing into the input field and submitting the form, respectively).
  - `isLoading` - boolean that indicates whether the API request is in progress.
</details>


## Conceptual Overview - what are LLMs?

Large Language Models (LLMs) are a type of artificial intelligence (AI) model that can generate human-like text. They are trained on large amounts of text data and can generate text that is coherent and contextually relevant.

<img width="1512" alt="What are LLMs?" src="https://github.com/user-attachments/assets/9670312b-e83e-4a1f-abab-3f7f04433480">

LLMs are used in a wide range of applications:
-  Chatbots 
-  Language translation
-  Content generation
-  Code geenration
-  And more...


For this workshop you'll use the [Mistral 7B model](https://docs.mistral.ai/getting-started/models/#overview)	. Mistral provides access to this model through their API, allowing developers to integrate AI capabilities into various applications.

## Exercise #1 - Adding AI capabilities to the chatbot

The goal of this exercise is to make the chatbot work. Right now, if you try the app will not work because we have an API endpoint that is not implemented.


If you open the `app/api/chat/route.ts` file, you'll find the following code:

```ts
// app/api/chat/route.ts
export async function POST(req: Request) {
	const { messages } = await req.json();

	return new Response("Chat messages received!");
}

```

The code defines an asynchronous function named `POST` that handle POST requests made to this route. The function takes a single parameter `req` of type `Request`, which represents the incoming HTTP request.

We then use destructuring to extract a `messages` property from the JSON body of the request. This property will contain an array of messages sent by the user. Finally, we return a new Response object with a message indicating that the chat messages have been received.

We want to pass the messages array to an AI model and return the generated text as response.

To do that, we'll use Mistral's API along with the Vercel AI SDK, which simplifies working with LLMs by offering a standardized way of integrating them into your app. You get a unified interface that allows you to switch between AI model providers (e.g, OpenAI, Mistral, Google, etc.) with ease while using the same API for all providers. 

![Vercel AI SDK](https://sdk.vercel.ai/images/ai-sdk-diagram.png)

Here's a quick overview of the Vercel AI SDK:

Each AI company provider (such as OpenAI, Mistral, etc.) has its own dedicated npm package that lists the available models. For example, here's how you can install the [Mistral AI provider package](https://sdk.vercel.ai/providers/ai-sdk-providers/mistral):

```bash
npm install @ai-sdk/mistral
```

You can then import the default provider instance `mistral` from `@ai-sdk/mistral`:

```ts
import { mistral } from '@ai-sdk/mistral';
```

You can then specify which model you want to use by passing the model ID to the `mistral` instance:

```ts
const model = mistral('mistral-large-latest');
```

The Vercel AI SDK will look for a `MISTRAL_API_KEY` environment variable. To get generate an API key, you must do the following:

<!-- Image of Mistral's console -->
1. Create a Mistral account or sign in at [console.mistral.ai](https://console.mistral.ai).
2. Then, navigate to "Workspace" and "Billing" to add your payment information and activate payments on your account.
3. After that, go to the "API keys" page and make a new API key by clicking "Create new key". Make sure to copy the API key, save it safely, and do not share it with anyone.


`TODO`: Copy the `.env.local.example` file to a new file called `.env.local` and add your API key there. It should look like this: 

```bash
MISTRAL_API_KEY=your-api-key
# Will be added later, you can leave it empty for now
DATABASE_URL=
```

>[!NOTE]
> The `.env` file included by Stackblitz will work as well but `.env.local` is the recommended approach when using environment variables locally with Next.js.


Once you install the provider package and have set up an API key, you can then use functions from the Vercel AI SDK core package (it has been added to your project already and was installed by running `npm install ai`). 

For example, here's how you can use the `streamText()` function for interactive use cases such as chat bots and other real-time applications:

```ts
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const result = await streamText({
  model: openai('gpt-4-turbo'),
  prompt: 'Invent a new holiday and describe its traditions.',
});


return result.toAIStreamResponse();
```

`TODO:` Update the `app/api/chat/route.ts` file to use the Vercel AI SDK to generate text using the Mistral AI model. The generated text should be returned as the response to the user's messages.

Here are some resources you can use:
- [API reference for the `streamText()` function from the Vercel AI SDK core package](https://sdk.vercel.ai/docs/reference/ai-sdk-core/stream-text)
- [Mistral AI provider documentation](https://sdk.vercel.ai/providers/ai-sdk-providers/mistral)

>[!TIP]
>The `streamText()` function accepts a `messages` parameter that should contain an  array of messages sent by the user. 

You can test that the chatbot is working by starting the development server (`npm run dev`) and submitting a message. You should see a response from the chatbot.

<details>
  <summary>Solution</summary>
  Here's the solution to the exercise:

  ```ts
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
  ```
</details>



## Conceptual Overview - what is RAG?

LLMs will *always* give you an answer, but not necessarily the one you need or the correct one (this is what is known as a hallucination). 

Here's an example prompt:

```
User: What's my favorite food?

AI: I don't know your favorite food yet. Could you tell me what it is?
```

Fortunately, we can provide the LLM with extra information to generate the correct response.

<img width="1512" alt="Screenshot 2024-07-12 at 9 11 22 AM" src="https://github.com/user-attachments/assets/38ae2ad6-032b-49d0-a7ef-023163363bf3">


But first, there's an important question: assuming we already have data that we know is factually correct, how do we:

- Understand what the user means by their prompt
- Know which exact information to give the LLM, given that we have unlimited prompts

This is where vector embeddings come in.

### Vector Embeddings

A vector embedding is a vector(list) of floating point numbers. It can represent unstructured data (e.g., text, images, audio, or other types of information).

What's powerful about embeddings is that they can capture the meaning behind the text and can be used to measure the relatedness of text strings.

![image](https://github.com/user-attachments/assets/b58a9679-8f37-41ed-adce-feeab302605d)
*source: https://qdrant.tech/articles/what-are-embeddings/*

The smaller the distance between two vectors, the more they're related to each other and vice-versa.

For example, the distance between the vector representing the word `banana` and the one representing the word `apple` will be smaller than the distance between a vector representing the word `banana` and the word `book` 

### Generating vector embeddings

One way to generate vector embeddings is by using an embeddings API. Here’s an example of how you can use Mistral's embeddings API and the Vercel AI SDK:

```ts
import { mistral } from "@ai-sdk/mistral";
import { embed } from "ai";

// 'embedding' is an array of numbers.
const { embedding } = await embed({
  model: mistral.embedding("mistral-embed"),
  value: "sunny day at the beach",
});
```

The Vercel AI SDK also provides an `embedMany()` function that can be used to embed many values at once (batch embedding).

```ts
import { mistral } from "@ai-sdk/mistral";
import { embedMany } from 'ai';

// 'embeddings' is an array of embedding objects (number[][]).
// It is sorted in the same order as the input values.
const { embeddings } = await embedMany({
  model: openai.embedding('mistral-embed'),
  values: [
    'sunny day at the beach',
    'rainy afternoon in the city',
    'snowy night in the mountains',
  ],
});
```

This is useful when you have a large number of values to embed and want to do it in a single request. We'll use this function later in the workshop.

### Storing and querying vector embeddings in Postgres with pgvector

The process of representing data into embeddings and calculating the similarity between one or more items is known as vector search (or similarity search). It has a wide range of applications:

- Information Retrieval: you can retrieve relevant information based on user queries since you can accurately search based on the meaning of the user query. (This is what YC idea matcher does)
- Natural Language Processing: since embeddings capture the meaning of the text, you can use them to classify text and run sentiment analysis.
- Recommendation Systems: You can recommend similar items based on a given set of items. (e.g., movies/products/books, etc.)
- Anomaly Detection: since you can determine the similarity between items in a given dataset, you can determine items that don’t belong.

Storing and retrieving vector embeddings can be done in Postgres. This is incredibly useful because it eliminates the need to introduce an external vector store when building AI and LLM applications if you're already using Postgres.

To get started, you first enable the extension. You can do so by running `CREATE EXTENSION vector`

You then need to create a column that stores the vector data

```sql
CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT,
  embedding VECTOR(3)
);
```

Here, the `embedding` column is capable of storing vectors with 3 dimensions. Depending on the embedding model you use, this number will be different.

> [!TIP]
> The `mistral-embed` model generates embedding vectors of dimension 1024 for each text string, regardless of its length. So, this will be the value we use when we create the table.

To retrieve vectors and calculate similarity, use `SELECT` statements and the built-in vector operators. For instance, you can find the top 5 most similar items to a given embedding using the following query:

`SELECT * FROM documents ORDER BY embedding <-> '[3,1,2]' LIMIT 5;`

This query computes the Euclidean distance (L2 distance) between the given vector and the vectors stored in the items table, sorts the results by the calculated distance, and returns the top 5 most similar items.

Supported distance functions include:

- `<->` - L2 distance
- `<#>` - (negative) inner product
- `<=>` - cosine distance
- `<+>` - L1 distance

### RAG architecture


At a high-level, this is how the app will work:

1. The user sends a message.
2. We convert the message into a vector embedding using an AI model.
3. We query the database for the most similar text content based on the user's message embedding.
4. We return the most similar text content as the response to the user's message.
5. We pass the response to the LLM as a system prompt to generate the final response.
6. The LLM generates the final response based on the user's message and the most similar text content.
7. We returns the final response to the user.

<img width="1512" alt="RAG" src="https://github.com/user-attachments/assets/67888ef4-0ea4-4655-ad5d-3a0ba97918e9">

## Exercise #2 - setting up the vector store

### Signing up for a Neon account

To set up the vector store, you'll need to sign up for a [Neon account](https://console.neon.tech/signup). Neon is fully managed Postgres database that allows you to store and query vector embeddings in Postgres.

After you sign up, you are guided through some onboarding steps that ask you to create a Project. After that, you are presented with the project Quickstart where you can grab a connection string to connect to your database.


<img width="1512" alt="Screenshot 2024-07-11 at 8 16 47 AM" src="https://github.com/m-abdelwahab/build-smarter-chatbots/assets/27310414/59c445e3-81ec-4463-8eac-9981f785c2ad">


<img width="1512" alt="Screenshot 2024-07-11 at 8 17 07 AM" src="https://github.com/m-abdelwahab/build-smarter-chatbots/assets/27310414/1c840dde-2702-4135-91aa-86e4ddf847a6">

In Neon, everything starts with the Project

It is the top-level container that holds your branches, databases, and roles. Typically, you should create a project for each repository in your application. This allows you to manage your database branches just like you manage your code branches: a branch for production, staging, development, new features, previews, and so forth.

We create your default branch main for you

main is the default (primary) branch and hosts your database, role, and a compute endpoint that you can connect your application to.


To set up the database, you can run the following command:

```bash
npm run db:setup
```

This will run the `setup.ts` script, which is responsible for setting up the database and inserting some sample data.

If you open the `setup.ts` file, you'll see the following code:

```ts
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
```

The `main()` function connects to a database, defines a set of text samples, and generates embeddings for these samples using the Mistral AI model. It first installs the pgvector extension if it doesn't exist and then sets up a database table designed to store text content alongside their vector embeddings. Each text sample and its corresponding embedding is then inserted into the database.

## Exercise #3 - adding RAG to the chatbot

In this exercise, you will modify the `src/app/api/chat/route.ts` file to query the database for relevant information.

Here are the steps that you need to take:

1. Connect to the Neon database using the `neon` function from the `@neondatabase/serverless` package.
1. Embed the user's message using the Mistral AI model.
1. Query the database for the most similar text content based on the user's message embedding. You can use the `<->` operator to calculate the Euclidean distance between the user's message embedding and the embeddings stored in the database. Sort the results by the calculated distance and return the most similar text content.
1. Return the most similar text content as the response to the user's message.
1. Pass the response to the LLM as a system prompt to generate the final response.


To get started, you can use the following code snippet as a reference:

```ts
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
```

Here are some resources you can use:
- [API reference for the `embed()` function from the Vercel AI SDK core package](https://sdk.vercel.ai/docs/reference/ai-sdk-core/embed)
- [Neon Serverless Driver documentation](https://neon.tech/docs/serverless/serverless-driver#use-the-driver-over-http)
- [pgvector documentation on querying vectors](https://github.com/pgvector/pgvector?tab=readme-ov-file#querying)
- [API reference for the `streamText()` function from the Vercel AI SDK core package](https://sdk.vercel.ai/docs/reference/ai-sdk-core/stream-text)
- [Mistral AI provider documentation](https://sdk.vercel.ai/providers/ai-sdk-providers/mistral)


To make sure that the chatbot is working as expected, you can start the development server (`npm run dev`) and submit a message. You should see a response from the chatbot that is relevant to the user's message.

Here are some example prompts you can use to test the chatbot:

> "What's the weather like today?"
> "Tell me about the best beaches in the world"



<details>
  <summary>Solution</summary>

  Here's the solution to the exercise:

  ```ts
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
  ```
</details>
