# Build Smarter Chatbots

![build-smarter-chatbots-workshop](https://github.com/user-attachments/assets/5b1a5af5-426d-4470-ac36-1003b594f1c3)

In this workshop, you'll create an AI-powered chatbot that can access external data to provide accurate answers. This workshop is ideal for developers with basic web development knowledge who want to expand their skills in building modern, AI-enhanced applications.

## Workshop Structure

The workshop combines two types of activities:
- **Concept overviews**: Explanations of key ideas you'll need to understand.
- **Hands-on exercises**: Guided activities where you'll apply what you've learned, with helpful code snippets provided.

## Workshop outline

1. Exercise #0: Set up your project and development environment
2. Concept Overview: What are Large Language Models (LLMs)
3. Exercise #1: Add AI capabilities to your chatbot
4. Concept Overview: Exploring Retrieval-Augmented Generation (RAG)
5. Exercise #2: Use Postgres as a vector store
6. Exercise #3: Implement RAG in your chatbot

## Prerequisites

To get the most out of this workshop, you should have:

- Basic knowledge of building APIs and server-side code with JavaScript/TypeScript
- Familiarity with command-line tools and installing Node.js packages
- Some understanding of SQL

This workshop focuses primarily on the backend and won't dive into the front-end part of the app you'll be building today.

## Exercise #0: Set up your project and development environment

Choose between using your local machine or Stackblitz, an online development environment.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/~/github.com/m-abdelwahab/build-smarter-chatbots)

Stackblitz will automatically set everything up for you. It will automatically install the project's dependencies for you and start the development server by running `npm install && npx next dev` for you.

<img width="1512" alt="Screenshot 2024-07-12 at 4 11 26 AM" src="https://github.com/user-attachments/assets/c6bfae94-53b7-4a89-958f-f9c3401e25d6">

<details>
  <summary>Local setup instructions</summary>

  You'll need:
  - [Git](https://git-scm.com/)
  - [Node.js](https://nodejs.org/) (version 18+). You can check the Node version installed on your machine by running `node -v` in your terminal.

  Steps:
  1. Clone the repo:
     ```bash
     git clone https://github.com/neondatabase/build-smarter-chatbots-workshop
     ```
  2. Set up the project:
     ```bash
     cd build-smarter-chatbots-workshop
     npm i
     npm run dev
     ```

  This starts a local server at [http://localhost:3000](http://localhost:3000/)
</details>

### Project overview

Here's the basic structure of your project:

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

Next.js uses a file-system based router where folders located under the `app` directory are used to define routes. Each folder represents a route segment that maps to a URL segment. To create a nested route, you can nest folders inside each other.

![Next.js file-system based router](https://nextjs.org/_next/image?url=%2Fdocs%2Fdark%2Froute-segments-to-path-segments.png&w=3840&q=75)

The app has a single route defined in the `src/app/page.tsx` file. This route will be rendered at the index route `/`. This is the page that will be displayed when you visit the app in the browser and where you'll see the chatbot UI.

When you add a special `route.ts` file inside a folder, it will make the full path of the folder an API endpoint. For example, in this project you have a `app/api/chat` with a `route.ts` file nested under it. This will create a route at `/api/chat` endpoint which will handle the chatbot's requests. 

You're going to implement the logic to handle the chatbot's requests in this file.

<details>
  <summary>Frontend code explanation</summary>
    The `src/app/page.tsx` file contains the following code:

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

  This uses the Vercel AI SDK, a library that provides a set of tools that allows developers to integrate artificial intelligence (AI) capabilities into their applications. It also provides pre-built functions and APIs for popular AI services, which you'll use later.

  - The `"use client"` directive placed at the top of the file means the page will be rendered on the client.
  
  The `useChat` hook is used to manage chat state and interactions. It returns multiple values which are used to build the UI:
  - `messages` - the current chat messages (an array of objects with id, role, and content properties).
  - `input` - the current value of the user's input field.
  - `handleInputChange` and `handleSubmit` - functions to handle user interactions (typing into the input field and submitting the form, respectively).
  - `isLoading` - boolean that indicates whether the API request is in progress.
</details>


## Conceptual Overview - What are Large Language Models (LLMs)?

LLMs are AI models trained on vast amounts of text data to generate human-like text. They're used in chatbots, translation, content creation, and more.

<img width="1512" alt="What are LLMs?" src="https://github.com/user-attachments/assets/9670312b-e83e-4a1f-abab-3f7f04433480">

We'll use the [Mistral 7B model](https://docs.mistral.ai/getting-started/models/#overview) via Mistral's API for this workshop.


## Exercise #1 - Add AI capabilities to your chatbot

Let's make the chatbot functional by implementing the API endpoint.


Current `app/api/chat/route.ts`:

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

The Vercel AI SDK will look for a `MISTRAL_API_KEY` environment variable. To generate an API key, you must do the following:

1. Create a Mistral account or sign in at [console.mistral.ai](https://console.mistral.ai).
2. Then, navigate to "Workspace" and "Billing" to add your payment information and activate payments on your account.
3. After that, go to the "API keys" page and make a new API key by clicking "Create new key". Make sure to copy the API key, save it safely, and do not share it with anyone.

➡️ `TODO:` 
1. Install the Mistral AI provider package
2. Copy the `.env.local.example` file to a new file called `.env.local` and add your API key there. It should look like this: 

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

➡️ `TODO:` Update the `app/api/chat/route.ts` file to use the Vercel AI SDK to generate text using the Mistral AI model. The generated text should be returned as the response to the user's messages.

Here are some resources you can use:
- [API reference for the `streamText()` function from the Vercel AI SDK core package](https://sdk.vercel.ai/docs/reference/ai-sdk-core/stream-text)
- [Mistral AI provider documentation](https://sdk.vercel.ai/providers/ai-sdk-providers/mistral)

>[!TIP]
>The `streamText()` function accepts a `messages` parameter that should contain an  array of messages sent by the user. 

You can test that the chatbot is working by starting the development server (`npm run dev`) and submitting a message. You should see a response from the chatbot if everything was set up correctly.

<details>
  <summary>Solution you can also run `git checkout exercise-1-solution` if you're working locally </summary>
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

Large Language Models (LLMs) always provide an answer, but it may not always be the correct or needed one.

Here's an example prompt:

```
User: What's my favorite food?

AI: I don't know your favorite food yet. Could you tell me what it is?
```

To generate more accurate responses, we can supply the LLM with additional context. 

However, this raises an important question: Given a set of factually correct data, how do we:

1. Interpret the user's intent from their prompt
2. Determine which specific information to provide the LLM

<img width="1512" alt="Screenshot 2024-07-12 at 9 11 22 AM" src="https://github.com/user-attachments/assets/38ae2ad6-032b-49d0-a7ef-023163363bf3">


This is where vector embeddings come into play.

### Vector Embeddings

Vector embeddings are lists of floating-point numbers that can represent various types of unstructured data (text, images, audio, etc.). 

Their power lies in their ability to capture the meaning behind the data and measure the relatedness between different text strings.


![image](https://github.com/user-attachments/assets/b58a9679-8f37-41ed-adce-feeab302605d)
*source: https://qdrant.tech/articles/what-are-embeddings/*

The closer two vectors are in this space, the more related they are and vice-versa. 

For instance, the vectors for "banana" and "apple" would be closer together than the vectors for "banana" and "book".

### Generating vector embeddings

You can create vector embeddings using an embeddings API. Here's an example using Mistral's API with the Vercel AI SDK:

```typescript
import { mistral } from "@ai-sdk/mistral";
import { embed, embedMany } from "ai";

// Single embedding
const { embedding } = await embed({
  model: mistral.embedding("mistral-embed"),
  value: "sunny day at the beach",
});

// Batch embedding. This is useful when you have a large number of values to embed and want to do it in a single request. We'll use this function later in the workshop.
const { embeddings } = await embedMany({
  model: mistral.embedding('mistral-embed'),
  values: [
    'sunny day at the beach',
    'rainy afternoon in the city',
    'snowy night in the mountains',
  ],
});
```

### Storing and querying vector embeddings in Postgres with pgvector

Vector search (or similarity search) has numerous applications, including information retrieval, natural language processing, recommendation systems, and anomaly detection.

Postgres can store and retrieve vector embeddings, eliminating the need for an external vector store in many AI and LLM applications. This possible through the [pgvector](https://github.com/pgvector/pgvector?tab=readme-ov-file#querying) extension, which provides efficient storage and querying mechanisms for vector data.


Here's how to get started:

	1.	Enable the pgvector extension:

```SQL
CREATE EXTENSION vector;
```

	2.	Create a table with a vector column:

```SQL
CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT,
  embedding VECTOR(1024)
);
```

Here, the `embedding` column is capable of storing vectors with 3 dimensions. Depending on the embedding model you use, this number will be different.

> [!TIP]
> The `mistral-embed` model generates embedding vectors of dimension 1024 for each text string, regardless of its length. So, this will be the value we use when we create the table.


	3.	Query for similar items:

```SQL
SELECT * FROM documents 
ORDER BY embedding <-> '[3,1,2,...]' 
LIMIT 5;
```

This finds the top 5 most similar items using Euclidean distance.

By leveraging vector embeddings and efficient storage/querying mechanisms, we can significantly enhance the accuracy and relevance of LLM responses in various applications.


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

## Exercise #2 - Use Postgres as a vector store

### Signing up for a Neon account

To create your vector store, you'll need a [Neon account](https://console.neon.tech/signup). Neon provides a fully managed PostgreSQL database service that supports storing and querying vector embeddings.

Follow these steps to get started:

1. Sign up for a Neon account using the link above.
2. Complete the onboarding process, which includes creating a new Project.
3. Once your Project is set up, you'll be directed to the Project Quickstart page.
4. On this page, you'll find your database connection string. You'll need this to connect to your new database.

<img width="1512" alt="Screenshot 2024-07-11 at 8 16 47 AM" src="https://github.com/m-abdelwahab/build-smarter-chatbots/assets/27310414/59c445e3-81ec-4463-8eac-9981f785c2ad">


<img width="1512" alt="Screenshot 2024-07-11 at 8 17 07 AM" src="https://github.com/m-abdelwahab/build-smarter-chatbots/assets/27310414/1c840dde-2702-4135-91aa-86e4ddf847a6">


➡️ `TODO`: 

1. Add the connection string to the `.env.local` file. It should look like this:

```bash
MISTRAL_API_KEY=your-api-key
DATABASE_URL=your-neon-connection-string
```

2. set up the database by running the following command in your terminal:
 
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

The `main()` function connects to a database, defines a set of text samples, and generates embeddings for these samples using the Mistral AI model. The pgvector extension is then installed if it doesn't exist and then table designed to store text content alongside their vector embeddings is created. Each text sample and its corresponding embedding is then inserted into the database.

## Exercise #3 -  Implement RAG in your chatbot

In this exercise, you will modify the `src/app/api/chat/route.ts` file to query the database for relevant information.

Here are the steps that you need to take:

1. Connect to the Neon database using the `neon` function from the `@neondatabase/serverless` package.
1. Embed the user's message using the Mistral AI model.
1. Query the database for the most similar text content based on the user's message embedding. You can use the `<->` operator to calculate the Euclidean distance between the user's message embedding and the embeddings stored in the database. Sort the results by the calculated distance and return the most similar text content.
1. Return the most similar text content as the response to the user's message.
1. Pass the response to the LLM as a system prompt to generate the final response.


Open the file `app/api/chat/route.ts` in your project and replace the existing code with the following code snippet:

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

If you prefer, you can switch to the exercise-3 branch, which already includes this code snippet. To do so:
	1.	Open your terminal.
	2.	Run the command: git checkout exercise-3

This branch contains the pre-configured code, allowing you to start working on the chat functionality immediately.

>[!TIP]
>You can use the `setup.ts` file as a reference throughout this exercise.

Here are some additional resources you can use:
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
  <summary>Solution - you can also run `git checkout exercise-3-solution` if you're working locally</summary>

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

You can find the complete solution in the `final` branch of the repository.


## Conclusion

You've built an AI chatbot that uses external data for more accurate responses.

You can extend this by:
  •	Handling more complex queries
  •	Integrating different AI models
  •	Working with various data types (images, audio, etc.) and potentially introducing a  framework like [Langchain](https://www.langchain.com/langchain) that allows you to embed any type of data into a vector
  •	Building other AI-powered apps needing external data

Happy coding! 🚀