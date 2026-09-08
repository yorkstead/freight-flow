import { streamText } from "ai";
import { model } from "@/lib/ai";

/**
 * POST /api/ai/chat
 *
 * Accepts a JSON body with a `messages` array and returns a streaming
 * text response from the configured AI model.
 *
 * Request body:
 *   { "messages": [{ "role": "user", "content": "Hello" }] }
 *
 * Response:
 *   A streaming text response (Content-Type: text/plain; charset=utf-8)
 *   that can be consumed with the standard ReadableStream API.
 *
 * This is the pattern you'll reuse for every AI-powered feature:
 *   1. Receive input from the client
 *   2. Call streamText() with the model and messages
 *   3. Return the stream as the response
 */
export async function POST(request: Request) {
  const { messages } = await request.json();

  const result = streamText({
    model,
    system: "You are a helpful assistant for Yorkstead Systems.",
    messages,
  });

  return result.toTextStreamResponse();
}
