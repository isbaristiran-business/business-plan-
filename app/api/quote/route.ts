import { NextResponse } from 'next/server';
import { fetchQuote } from '@/lib/finnhub';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 });

  try {
    const quote = await fetchQuote(symbol);
    return NextResponse.json(quote);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
