# Architecture

How this codebase is organized and the reasoning behind it.

This document is for any developer picking up this project — including future you.

---

## Product boundary

FreightFlow is an operational intelligence and action layer, not a transportation management system.

The upstream TMS remains authoritative for quoting, tendering, carrier contracting, load creation, customer master data, shipment records, accounting, and invoicing. FreightFlow should consume those records, never recreate or silently compete with them.

FreightFlow owns the work around the record:

1. Detect what needs attention.
2. Explain why it matters.
3. Prioritize who should act.
4. Recommend or orchestrate the next action.
5. Track the deadline, communication, and resolution.
6. Measure operational friction for managers.

New features must fit one of those six responsibilities. A screen that creates, tenders, dispatches, invoices, or edits an authoritative shipment record belongs in the source TMS unless it is explicitly an operational handoff or simulation.

---

## Folder Structure

```
src/
├── app/          ← Routes, layouts, pages, API endpoints
├── actions/      ← Server Actions (form handlers, mutations)
├── components/   ← React components (client and server)
└── lib/          ← Shared utilities, configs, and business logic
```

### `src/app/` — Routes & API

Next.js App Router uses **file-system routing**. Every folder under `app/` becomes a URL:

| File | URL | Type |
|---|---|---|
| `app/page.tsx` | `/` | Page (server component) |
| `app/dashboard/page.tsx` | `/dashboard` | Page |
| `app/api/health/route.ts` | `/api/health` | API endpoint |
| `app/api/ai/chat/route.ts` | `/api/ai/chat` | API endpoint |

**Layouts** (`layout.tsx`) wrap all pages in their directory. The root layout at `app/layout.tsx` wraps the entire application.

### `src/actions/` — Server Actions

Functions marked with `"use server"` that run on the server but can be called from client components. Next.js handles the network request automatically.

**Use Server Actions for:**
- Form submissions
- Database writes (create, update, delete)
- Any user-triggered mutation

**Use API Routes (`app/api/`) for:**
- Webhooks from external services
- Streaming responses (like AI chat)
- Endpoints consumed by non-browser clients
- Background processing

### `src/components/` — UI Components

React components. Two types:

| Type | Directive | Runs On | Can Use |
|---|---|---|---|
| **Server Component** | (default) | Server only | `async/await`, direct DB access, secrets |
| **Client Component** | `"use client"` | Browser | `useState`, `useEffect`, event handlers |

**Rule of thumb:** Start with server components. Add `"use client"` only when you need interactivity (clicks, typing, browser APIs).

### `src/lib/` — Shared Code

Utilities, configuration, and business logic that doesn't belong to a specific component or route.

| File | Purpose |
|---|---|
| `lib/ai.ts` | AI model configuration (single source of truth) |
| `lib/utils.ts` | Small helper functions |

As the project grows, add files here for database clients, auth helpers, validation schemas, etc.

---

## AI Integration

The AI setup is intentionally simple:

```
Client Component  →  fetch("/api/ai/chat")  →  API Route  →  AI SDK  →  Model
     (chat.tsx)          (ReadableStream)       (route.ts)    (ai.ts)   (Gemini)
```

1. **`src/lib/ai.ts`** — Configures which model to use. Change it in one place, everything updates.
2. **`src/app/api/ai/chat/route.ts`** — Receives messages, calls `streamText()`, returns a stream.
3. **`src/components/chat.tsx`** — Reads the stream with the standard `ReadableStream` API.

To add a new AI feature (e.g., document summarization):
1. Create a new route: `src/app/api/ai/summarize/route.ts`
2. Import `model` from `@/lib/ai`
3. Use `streamText()` or `generateText()` from the `ai` package
4. Build a component that calls the endpoint

---

## Styling

This project uses **Tailwind CSS v4** with the new CSS-first configuration.

- All styles are utility classes in JSX: `className="px-4 py-2 bg-blue-600"`
- Theme customization goes in `src/app/globals.css` using `@theme`
- No `tailwind.config.js` — that's the old way (v3)
- No component library — build what you need with Tailwind utilities

---

## Adding a Database

The starter doesn't include a database — that's project-specific. Here's the pattern:

### 1. Choose your database

| Use Case | Database | Package |
|---|---|---|
| Simple tools, local apps | SQLite | `better-sqlite3` |
| Production web apps, POS | PostgreSQL | `pg` or Prisma |
| Embedded, mobile | SQLite | `better-sqlite3` |
| Key-value / cache | Redis | `ioredis` |

### 2. Create a client file

```typescript
// src/lib/db.ts
import { Pool } from "pg";

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});
```

### 3. Use it in Server Actions or API routes

```typescript
// src/actions/products.ts
"use server";
import { db } from "@/lib/db";

export async function getProducts() {
  const result = await db.query("SELECT * FROM products");
  return result.rows;
}
```

### 4. Add to Docker Compose

Uncomment the database service in `docker-compose.yml`.

---

## Adding Authentication

Same pattern — add it when you need it, not before.

### Lightweight (session cookies)

For internal tools or simple apps, roll your own with:
- A login Server Action that verifies credentials
- `cookies()` from `next/headers` to set/read a session token
- Middleware (`middleware.ts`) to protect routes

### Full-featured

For customer-facing apps, consider:
- [Lucia Auth](https://lucia-auth.com/) — lightweight, self-hosted
- [Auth.js](https://authjs.dev/) — supports many providers

Both are self-hosted (no SaaS dependency), fit the Yorkstead philosophy.

---

## Conventions

- **File naming:** `kebab-case` for files, `PascalCase` for components
- **Imports:** Use the `@/` alias (maps to `src/`) — never relative `../../`
- **Comments:** Every file has a header comment explaining what it does
- **Server vs Client:** Default to server components; add `"use client"` only when needed
- **Environment variables:** Add to both `.env` and `.env.example`
