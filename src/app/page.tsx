"use client";

import { useChat } from "ai/react";

/**
  This page utilizes the useChat hook, which will, by default, use the POST API route you created earlier (/api/chat). The hook provides functions and state for handling user input and form submission. The useChat hook provides multiple utility functions and state variables:

  - messages - the current chat messages (an array of objects with id, role, and content properties).
  - input - the current value of the user's input field.
  - handleInputChange and handleSubmit - functions to handle user interactions (typing into the input field and submitting the form, respectively).
  - isLoading - boolean that indicates whether the API request is in progress.
 */

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
