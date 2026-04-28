import { NextResponse } from 'next/server';
import { fetchQuote } from '@/lib/finnhub';

export async function POST(request: Request) {
  try {
    const { symbols } = await request.json();
    if (!Array.isArray(symbols)) {
      return NextResponse.json({ error: 'symbols array required' }, { status: 400 });
    }

    // Cap at 50 to be safe with rate limits (free tier: 60/min)
    const capped = symbols.slice(0, 50);

    // Fire all in parallel - Next.js will dedupe and cache
    const results = await Promise.allSettled(
      capped.map(sym => fetchQuote(sym))
    );

    const quotes: Record<string, any> = {};
    capped.forEach((sym, i) => {
      const r = results[i];
      if (r.status === 'fulfilled' && r.value && r.value.c > 0) {
        quotes[sym] = r.value;
      }
    });

    return NextResponse.json({ quotes });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
