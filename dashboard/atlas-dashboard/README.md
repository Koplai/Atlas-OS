This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Environment

Create a `.env` file (you can start from `.env.example`) with:

```env
DATABASE_URL=postgresql://atlas:atlas@db:5432/atlas
# Optional (recommended in prod): protect /api/*
ATLAS_DASHBOARD_TOKEN=change-me

POSTGRES_USER=atlas
POSTGRES_PASSWORD=atlas
POSTGRES_DB=atlas
```

Auth behavior:
- If `ATLAS_DASHBOARD_TOKEN` is set, protected `/api/*` routes require:
  - `Authorization: Bearer <token>` or header `x-atlas-token: <token>`
- `/api/health` is always public.

## Local STT (Docker)
The stack includes a local Whisper service (`stt-whisper`) and a proxy route:
- `POST /api/voice/stt` (multipart form-data with `file`)
- Dashboard forwards to `STT_URL` (default: `http://stt-whisper:9000/asr`)

Quick test:
```bash
curl -sS -X POST http://localhost:3000/api/voice/stt \
  -H "x-atlas-token: $ATLAS_DASHBOARD_TOKEN" \
  -F "file=@/path/to/audio.webm"
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
