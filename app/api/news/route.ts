import { NextResponse } from 'next/server';
import { fetchNews } from '@/lib/finnhub';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 });

  try {
    const news = await fetchNews(symbol);
    // Limit to top 10 most recent
    return NextResponse.json({ news: news.slice(0, 10) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
