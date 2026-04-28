import { NextResponse } from 'next/server';
import { fetchCandle, fetchCryptoCandle } from '@/lib/finnhub';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const range = searchParams.get('range') || '1M'; // 1W, 1M, 3M, 6M, 1Y
  const isCrypto = searchParams.get('crypto') === 'true';

  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 });

  // Map range to Finnhub resolution + lookback days
  const ranges: Record<string, { resolution: string; days: number }> = {
    '1W': { resolution: '60', days: 7 },
    '1M': { resolution: 'D', days: 30 },
    '3M': { resolution: 'D', days: 90 },
    '6M': { resolution: 'D', days: 180 },
    '1Y': { resolution: 'W', days: 365 },
  };
  const cfg = ranges[range] || ranges['1M'];

  const to = Math.floor(Date.now() / 1000);
  const from = to - cfg.days * 86400;

  try {
    const data = isCrypto
      ? await fetchCryptoCandle(symbol, cfg.resolution, from, to)
      : await fetchCandle(symbol, cfg.resolution, from, to);

    if (data.s === 'no_data' || !data.c) {
      return NextResponse.json({ candles: [] });
    }

    // Reformat for recharts
    const candles = data.t.map((ts, i) => ({
      time: ts * 1000,
      date: new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      volume: data.v[i],
    }));

    return NextResponse.json({ candles });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
