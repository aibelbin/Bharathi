# Bharathi 🌟

> **Build for India** Hackathon | Organized by **Kerala Startup Mission (KSUM)**
>
> Project by **Team Loreal**

---

## 👥 Team

**Team Name:** Loreal

| Name | Role |
|------|------|
| Aibel Bin Zacariah | Team Leader |
| Aravind Manoj | Team Member |
| Abin Thomas | Team Member |
| Devadarsan C P | Team Member |

---

## 📖 Project Description

### 🔍 The Problem

UPI made digital payments universally accessible by removing technical complexity. Any business small or large can integrate payments without building financial infrastructure from scratch.

Intelligent voice agents do not offer the same accessibility.

Deploying a voice agent today requires custom development, AI model integration, telephony setup, API orchestration, and infrastructure management. This demands AI engineers and significant financial investment.

As a result, most businesses — including large platforms — do not implement intelligent voice agents. The capability exists, but the deployment layer remains complex and inaccessible.

### 💡 The Solution

**Bharathi is the UPI moment for voice AI..**
It is a no-code platform that enables any business — from a street-scale vendor to a large enterprise — to deploy a fully functional AI voice agent in just 2–3 clicks or trigger one directly through a call. No code, no AI engineers, and no infrastructure overhead.
Bharathi removes barriers of:

🌐 Language Multi language support

🧓 Age & Tech Literacy Voice first, no digital navigation required

📱 Platform  No app downloads

🏪 Business Size  Scales from local shops to enterprises

At its core, Bharathi runs on an agentic AI architecture where autonomous agents understand context, invoke tools, maintain memory, and execute multi-step workflows — handling bookings, queries, calls, and task coordination end-to-end.

### 🤖 Agentic AI Capabilities
- **Autonomous Orchestration** — Agents independently plan and execute multi-step tasks
- **Tool Use** — Agents call external tools and APIs (voice, image gen, search) to complete goals
- **Persistent Memory** — Supermemory gives agents long-term context across sessions
- **Multi-modal** — Agents work across text, voice, and images
- **Observability** — Full tracing of agent reasoning and actions via Langfuse + OpenTelemetry

### ⚙️ Platform Integrations
- 🤖 **AI Models** — Google Gemini & Groq (Llama) for language understanding and generation
- 🧠 **Memory Layer** — Supermemory for persistent AI context and tool access
- 📞 **Voice Calls** — Twilio integration for call-based agent interactions
- 🖼️ **Image Generation** — When a business adds a new offer or seasonal promotion, Bharathi automatically generates a professional poster and posts it to the company's social media — no designer, no manual effort required
- 📊 **Dashboard** — A rich, interactive dashboard with real-time data
- 🔐 **Authentication** — Secure auth with `better-auth`
- ⚡ **Background Jobs** — Inngest for reliable background processing
- 🗄️ **Database** — PostgreSQL with Drizzle ORM
- ☁️ **Storage** — AWS S3 for file/media storage
- 📡 **API Layer** — tRPC for end-to-end type-safe APIs

---

## 🛠️ Tech Stack

### Frontend
- [Next.js 16](https://nextjs.org/) (React 19)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) + Radix UI
- [Framer Motion](https://www.framer.com/motion/) for animations
- [tRPC](https://trpc.io/) + [TanStack Query](https://tanstack.com/query)

### Backend
- Python (FastAPI / scripts)
- [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL
- [Inngest](https://www.inngest.com/) for background jobs
- [Better Auth](https://better-auth.com/) for authentication

### AI / Integrations
- [Vercel AI SDK](https://sdk.vercel.ai/)
- Google Gemini (`@ai-sdk/google`)
- Groq / Llama (`@ai-sdk/groq`)
- [Supermemory](https://supermemory.ai/)
- [Sarvam AI](https://www.sarvam.ai/) (`sarvamai`)
- [Twilio](https://www.twilio.com/) for voice
- [AWS S3](https://aws.amazon.com/s3/) for storage
- [Upstash Redis](https://upstash.com/)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18 and **Bun** (or npm/yarn/pnpm)
- **Python** >= 3.11 and **uv** (Python package manager)
- **PostgreSQL** database
- Required API keys (see Environment Variables below)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd bharathi
   ```

2. **Install Node dependencies:**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Install Python dependencies:**
   ```bash
   uv sync
   ```

4. **Set up environment variables** (see [Environment Variables](#environment-variables))

5. **Run database migrations:**
   ```bash
   bun run db:migrate
   # or
   npx drizzle-kit migrate
   ```

### Running the Development Server

```bash
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running the Python Backend

```bash
cd backend
uv run python main.py
```

---

## 🔑 Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
# Database
DATABASE_URL=

# Auth
BETTER_AUTH_SECRET=

# AI
GOOGLE_GENERATIVE_AI_API_KEY=
GROQ_API_KEY=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Supermemory
SUPERMEMORY_API_KEY=

# Langfuse (Observability)
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=
LANGFUSE_HOST=

# Sarvam AI
SARVAM_API_KEY=
```

---

## 📁 Project Structure

```
bharathi/
├── app/                  # Next.js App Router pages
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard pages
│   ├── call/             # Call-related pages
│   ├── login/            # Auth pages
│   └── register/
├── backend/              # Python backend scripts
│   ├── main.py
│   ├── contextGen.py
│   └── imageGen.py
├── components/           # Shared React components
├── db/                   # Database schema & config
├── drizzle/              # Drizzle migrations
├── inngest/              # Background job functions
├── lib/                  # Shared utilities
├── platform/             # Platform-specific logic
├── trpc/                 # tRPC router definitions
└── public/               # Static assets
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start development server |
| `bun build` | Build for production |
| `bun start` | Start production server |
| `bun lint` | Run ESLint |

---

