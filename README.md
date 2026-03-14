# FormFlow

Create forms, collect submissions, receive them as PDF attachments by email.

## Stack

- **Next.js 14** (App Router)
- **Supabase** (database + RLS)
- **Resend** (transactional email)
- **jsPDF** (PDF generation)
- **Tailwind CSS** (styling)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Copy your project URL, anon key, and service role key from **Settings → API**

### 3. Set up Resend

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. (Optional) Add and verify your own domain to send from a custom address — update the `from` field in `src/lib/email.ts`

### 4. Environment variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```bash
cp .env.local.example .env.local
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push to GitHub
2. Import in [vercel.com](https://vercel.com)
3. Add the environment variables in Vercel's project settings
4. Deploy

## How It Works

1. **Create a form** at `/forms/new` — add fields, set the email address
2. **Share the link** — anyone can fill it out at `/f/{form-id}`
3. **Submissions are saved** to Supabase and a **PDF is emailed** to your address
4. **View submissions** at `/forms/{form-id}`

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage — list all forms
│   ├── forms/
│   │   ├── new/page.tsx      # Form builder
│   │   └── [id]/page.tsx     # View form + submissions
│   ├── f/[id]/page.tsx       # Public form (shareable)
│   └── api/
│       ├── forms/            # CRUD for forms
│       ├── submit/[id]/      # Public submission endpoint
│       └── submissions/[id]/ # List submissions
├── components/
│   ├── Navbar.tsx
│   ├── FormBuilder.tsx
│   ├── FormRenderer.tsx
│   └── SubmissionsList.tsx
└── lib/
    ├── supabase.ts           # DB client + types
    ├── pdf.ts                # PDF generation
    └── email.ts              # Email sending
```
