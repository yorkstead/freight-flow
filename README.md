# Yorkstead Starter

A minimal, self-hostable Next.js App Router starter template by **Yorkstead Systems**.

Fork this repo for every new project — workflow automations, POS systems, manufacturing tools, and everything in between. The boring plumbing is done; you just build features.

---

## Principles

- **No SaaS lock-in.** Runs anywhere Docker runs. Not tied to Vercel or any platform.
- **Client-owned.** The client gets the full source code, forever.
- **Minimal dependencies.** 12 npm packages total — nothing decorative.
- **Well-documented.** Every file explains what it does and why.

---

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- [Docker](https://www.docker.com/) (for production deployment)
- A [Google AI Studio API key](https://aistudio.google.com/apikey) (free, for AI features)

---

## Quick Start

```bash
# 1. Clone the repo
git clone <your-repo-url> my-project
cd my-project

# 2. Set up environment variables
cp .env.example .env
# Edit .env and add your GOOGLE_GENERATIVE_AI_API_KEY

# 3. Install dependencies
npm install

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you're running.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server with hot reload |
| `npm run build` | Creates an optimized production build |
| `npm start` | Runs the production build locally |
| `npm run lint` | Runs ESLint |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | For AI features | API key from [Google AI Studio](https://aistudio.google.com/apikey) |
| `NEXT_PUBLIC_APP_NAME` | No | Display name used in the UI (default: "Yorkstead App") |

Add new variables to both `.env` and `.env.example` (without values in the example).

---

## Deployment

### Docker (Recommended)

The included Dockerfile produces a slim (~150MB) production image.

```bash
# Build the image
docker build -t my-project .

# Run it
docker run -p 3000:3000 --env-file .env my-project
```

Or use Docker Compose:

```bash
docker compose up --build
```

This works on any VPS, dedicated server, or cloud VM (DigitalOcean, Hetzner, AWS EC2, etc.).

### Any Node.js Host

```bash
npm run build
npm start
```

The `output: "standalone"` setting in `next.config.ts` means the build output is self-contained — you can copy the `.next/standalone` directory to any server with Node.js and run `node server.js`.

---

## Fork for a New Project

```bash
# 1. Copy the starter
cp -r project-starter my-new-project
cd my-new-project

# 2. Update package.json
#    - Change "name" to your project name
#    - Update "description"

# 3. Update .env
#    - Set NEXT_PUBLIC_APP_NAME to your project name

# 4. Delete the demo components you don't need
#    - src/components/chat.tsx (unless you need AI chat)
#    - src/actions/example.ts (replace with your own)

# 5. Start building
npm run dev
```

---

## Backup & Restore

This application is just files. There's no proprietary format or cloud lock-in.

### What to Back Up

| What | Where | How |
|---|---|---|
| Source code | Git repo | `git push` to your remote |
| Environment vars | `.env` | Store securely (password manager, encrypted backup) |
| Database (if any) | Depends on your DB | `pg_dump`, `sqlite3 .backup`, etc. |
| Uploaded files (if any) | `/public` or external storage | File copy / rsync |

### How to Restore

```bash
# 1. Clone the repo
git clone <your-repo-url>

# 2. Restore .env
cp /path/to/backup/.env .env

# 3. Restore database (if applicable)
# e.g., psql mydb < backup.sql

# 4. Build and run
npm install
npm run build
npm start
```

That's it. Any developer who can read TypeScript can maintain this.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) | Full-stack React with built-in routing, API, and SSR |
| Language | TypeScript | Type safety, better DX, easier maintenance |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first, no build-time CSS bloat |
| AI | [Vercel AI SDK](https://sdk.vercel.ai/) (`ai`) | Lightweight streaming AI integration |
| Containerization | Docker | Consistent deploys, self-hostable anywhere |

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed code organization.
