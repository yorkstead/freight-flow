import { google } from "@ai-sdk/google";

/**
 * AI Model Configuration
 * ======================
 * Single source of truth for the AI model used across the application.
 * Every file that needs AI imports `model` from here.
 *
 * To switch models, change this one line:
 *   - google("gemini-2.0-flash")     — fast, cheap, good for most tasks
 *   - google("gemini-2.5-pro")       — slower, smarter, for complex reasoning
 *
 * To switch providers entirely (e.g., OpenAI):
 *   1. npm install @ai-sdk/openai
 *   2. import { openai } from "@ai-sdk/openai"
 *   3. export const model = openai("gpt-4o")
 *   4. Update .env with OPENAI_API_KEY
 *
 * The AI SDK handles the rest — your route handlers don't change.
 */
export const model = google("gemini-2.0-flash");
