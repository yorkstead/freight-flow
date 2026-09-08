"use server";

/**
 * Example Server Action
 * =====================
 * Server Actions are functions that run on the server but can be called
 * directly from client components — no API route needed.
 *
 * WHEN TO USE SERVER ACTIONS:
 *   ✅ Form submissions (create, update, delete)
 *   ✅ Database mutations
 *   ✅ Anything triggered by a user action that mutates data
 *
 * WHEN TO USE API ROUTES INSTEAD:
 *   ✅ Webhooks from external services
 *   ✅ Streaming responses (like the AI chat endpoint)
 *   ✅ Endpoints consumed by non-browser clients (mobile apps, other servers)
 *   ✅ Long-running background work
 *
 * HOW TO USE:
 *   Import this function in a client or server component and call it.
 *   Next.js handles the network request automatically.
 *
 *   import { submitFeedback } from "@/actions/example";
 *
 *   <form action={submitFeedback}>
 *     <input name="message" />
 *     <button type="submit">Send</button>
 *   </form>
 */

interface ActionResult {
  success: boolean;
  message: string;
}

export async function submitFeedback(formData: FormData): Promise<ActionResult> {
  const message = formData.get("message");

  // --- Validation ---
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return { success: false, message: "Message is required." };
  }

  // --- Your logic here ---
  // e.g., save to database, send email, call an API
  console.log("[Server Action] Feedback received:", message);

  // --- Response ---
  return { success: true, message: "Feedback submitted. Thank you!" };
}
