// Server-side Finnhub client. The API key never leaves the server.
// Uses Next.js fetch caching to stay under the 60 req/min free tier limit.

const BASE = 'https://finnhub.io/api/v1';

function getKey(): string {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error('FINNHUB_API_KEY not set');
  return key;
}

// Cache durations (in seconds). Tweak these if you hit rate limits.
const QUOTE_CACHE_SEC = 30;     // current price - refresh every 30s
const CANDLE_CACHE_SEC = 300;   // historical chart - 5 min
const PROFILE_CACHE_SEC = 86400; // company profile - 1 day
const NEWS_CACHE_SEC = 600;     // news - 10 min

export type Quote = {
  c: number;  // current price
  d: number;  // change
  dp: number; // percent change
  h: number;  // high of day
  l: number;  // low of day
  o: number;  // open
  pc: number; // previous close
  t: number;  // timestamp
};

export async function fetchQuote(symbol: string): Promise<Quote> {
  const url = `${BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${getKey()}`;
  const res = await fetch(url, { next: { revalidate: QUOTE_CACHE_SEC } });
  if (!res.ok) {
    throw new Error(`Finnhub quote failed: ${res.status}`);
  }
  return res.json();
}

export type Candle = {
  c: number[]; // close
  h: number[]; // high
  l: number[]; // low
  o: number[]; // open
  t: number[]; // timestamps
  v: number[]; // volume
  s: string;   // status
};

export async function fetchCandle(
  symbol: string,
  resolution: string,
  from: number,
  to: number
): Promise<Candle> {
  const url = `${BASE}/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${to}&token=${getKey()}`;
  const res = await fetch(url, { next: { revalidate: CANDLE_CACHE_SEC } });
  if (!res.ok) {
    throw new Error(`Finnhub candle failed: ${res.status}`);
  }
  return res.json();
}

// For crypto we need the crypto/candle endpoint
export async function fetchCryptoCandle(
  symbol: string,
  resolution: string,
  from: number,
  to: number
): Promise<Candle> {
  const url = `${BASE}/crypto/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${to}&token=${getKey()}`;
  const res = await fetch(url, { next: { revalidate: CANDLE_CACHE_SEC } });
  if (!res.ok) {
    throw new Error(`Finnhub crypto candle failed: ${res.status}`);
  }
  return res.json();
}

export type CompanyProfile = {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
};

export async function fetchProfile(symbol: string): Promise<CompanyProfile | null> {
  const url = `${BASE}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${getKey()}`;
  const res = await fetch(url, { next: { revalidate: PROFILE_CACHE_SEC } });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.ticker) return null;
  return data;
}

export type NewsItem = {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
};

export async function fetchNews(symbol: string): Promise<NewsItem[]> {
  // Last 30 days of news
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  const url = `${BASE}/company-news?symbol=${encodeURIComponent(symbol)}&from=${fmt(from)}&to=${fmt(to)}&token=${getKey()}`;
  const res = await fetch(url, { next: { revalidate: NEWS_CACHE_SEC } });
  if (!res.ok) return [];
  return res.json();
}

// Recommendation trends - analyst ratings
export type Recommendation = {
  buy: number;
  hold: number;
  period: string;
  sell: number;
  strongBuy: number;
  strongSell: number;
  symbol: string;
};

export async function fetchRecommendations(symbol: string): Promise<Recommendation[]> {
  const url = `${BASE}/stock/recommendation?symbol=${encodeURIComponent(symbol)}&token=${getKey()}`;
  const res = await fetch(url, { next: { revalidate: 86400 } }); // 1 day
  if (!res.ok) return [];
  return res.json();
}

// Basic financials for the research page
export type BasicFinancials = {
  metric: Record<string, number>;
};

export async function fetchFinancials(symbol: string): Promise<BasicFinancials | null> {
  const url = `${BASE}/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${getKey()}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return null;
  return res.json();
}
