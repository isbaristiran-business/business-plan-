# Ledger — Live Portfolio Tracker

A Next.js portfolio tracker with **live market data** via Finnhub. Track stocks, ETFs, and crypto with real prices that auto-update every 60 seconds. Includes a research page where you can look up any ticker and see live charts, analyst recommendations, news, and company profiles.

## What you get

- **Live prices** — Real market data from Finnhub, refreshing automatically
- **5 dashboards** — Dashboard, Holdings, Log Investment, Analytics, Insights
- **Research page** — Search any stock, see charts (1W/1M/3M/6M/1Y), analyst ratings, news
- **Multi-user accounts** — Each user has their own private portfolio
- **Bcrypt password hashing**
- **Dark editorial design** — Built with Fraunces + JetBrains Mono

---

## Step-by-step deployment guide

### 1. Get a free Finnhub API key (2 minutes)

1. Go to **[finnhub.io/register](https://finnhub.io/register)**
2. Sign up with email (free tier — no credit card)
3. Once logged in, copy your **API key** from the dashboard
4. Free tier gives you **60 API calls/minute** — way more than enough for personal use

### 2. Push the code to GitHub (5 minutes)

You need a GitHub account ([github.com](https://github.com) — also free).

**Option A: Using GitHub web UI (easiest):**
1. Go to [github.com/new](https://github.com/new)
2. Name your repo (e.g. `ledger-portfolio`)
3. Make it public or private — both work
4. Click **Create repository**
5. On the next page, click **uploading an existing file**
6. Drag-and-drop **all the files from this project folder** (including hidden files like `.gitignore`)
7. Click **Commit changes**

**Option B: Using git CLI** (if you know git):
```bash
cd ledger-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ledger-portfolio.git
git push -u origin main
```

### 3. Deploy to Vercel (3 minutes)

1. Go to **[vercel.com/signup](https://vercel.com/signup)** and sign in with your GitHub account
2. Click **Add New → Project**
3. Find your `ledger-portfolio` repo and click **Import**
4. Under **Environment Variables**, add:
   - **Name**: `FINNHUB_API_KEY`
   - **Value**: paste the API key you copied from Finnhub
5. Click **Deploy**
6. Wait ~60 seconds — Vercel will build and deploy your app
7. You'll get a URL like `https://ledger-portfolio-xyz.vercel.app` — that's your live app! 🎉

### 4. Use your app

- Visit your Vercel URL
- Click **Sign Up**, create an account
- Log your first investment — current price auto-fills from live market data
- Watch the dashboard update with real prices

---

## How the live data works

- **Server-side API routes** (`/app/api/*`) call Finnhub on the server. Your API key never touches the browser.
- **Caching**: Quotes cached for 30 seconds, charts for 5 minutes, profiles for 1 day. This keeps you well under the 60/min rate limit.
- **Auto-refresh**: Portfolio quotes refresh every 60 seconds automatically. There's a manual refresh button too.
- **Rate limit safety**: We cap batch quote requests at 50 symbols and rely on Next.js's built-in `fetch` deduplication.

---

## Project structure

```
ledger-app/
├── app/
│   ├── page.tsx              # Landing page
│   ├── auth/page.tsx         # Sign in / Sign up
│   ├── portfolio/page.tsx    # Main portfolio app (5 tabs)
│   ├── research/page.tsx     # Research page (search + live charts)
│   ├── api/
│   │   ├── quote/            # Single quote
│   │   ├── quotes/           # Batch quotes (for portfolio)
│   │   ├── candle/           # Historical chart data
│   │   ├── profile/          # Company profile + recommendations
│   │   ├── news/             # Recent news for a ticker
│   │   └── search/           # Symbol autocomplete
│   ├── globals.css
│   └── layout.tsx
├── components/
│   └── Sidebar.tsx
├── lib/
│   ├── auth.ts               # Client auth + bcrypt + localStorage
│   ├── finnhub.ts            # Server-side Finnhub client
│   └── stocks.ts             # Stock database (symbols, sectors, types)
├── package.json
├── next.config.js
├── tsconfig.json
└── .env.local.example
```

---

## Running locally (optional)

If you want to test before deploying:

```bash
# Install dependencies
npm install

# Create .env.local with your Finnhub key
cp .env.local.example .env.local
# Then edit .env.local and paste your key

# Start dev server
npm run dev
```

Visit `http://localhost:3000`.

---

## Limitations & honest notes

**Storage is browser-based.** User accounts and portfolios are stored in `localStorage`. This means:
- Your data persists across sessions on the same browser/device
- It does NOT sync across devices or browsers
- Clearing browser data wipes accounts

**To fix this for real production use**, swap `lib/auth.ts` to call a backend with a real database (Vercel Postgres, Supabase, MongoDB Atlas — all have free tiers). The rest of the app (Finnhub, charts, UI) works as-is.

**Finnhub free tier covers US stocks, major ETFs, and crypto.** International stocks (LSE, ASX, etc.) need a paid plan.

**Quotes can be delayed by a few seconds** on the free tier — fine for portfolio tracking, not high-frequency trading.

**Crypto charts** use a separate Finnhub endpoint (`/crypto/candle`). The app handles this automatically.

---

## License

Personal use. Built for educational purposes. Not financial advice.
