import Link from "next/link";
import { Chat } from "@/components/chat";

/**
 * Landing page — demonstrates the starter's capabilities.
 *
 * Replace this entirely when you fork for a new project.
 */
export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight">
          {process.env.NEXT_PUBLIC_APP_NAME ?? "Yorkstead App"}
        </h1>
        <p className="mt-2 text-gray-600">
          Minimal Next.js starter — fork this for every new project.
        </p>
      </header>

      {/* Quick links */}
      <section className="mb-12 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Quick Links</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              href="/api/health"
              className="text-blue-600 underline hover:text-blue-800"
            >
              /api/health
            </Link>
            {" — "}
            <span className="text-gray-500">
              Health check endpoint (JSON response)
            </span>
          </li>
          <li>
            <span className="text-gray-500">
              POST /api/ai/chat — Streaming AI endpoint (used by the demo below)
            </span>
          </li>
        </ul>
      </section>

      {/* Streaming chat demo */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Streaming Chat Demo</h2>
        <p className="mb-4 text-sm text-gray-500">
          Requires a valid <code className="rounded bg-gray-100 px-1">GOOGLE_GENERATIVE_AI_API_KEY</code> in
          your <code className="rounded bg-gray-100 px-1">.env</code> file.
        </p>
        <Chat />
      </section>
    </main>
  );
}
