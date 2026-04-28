import { NextResponse } from 'next/server';
import { STOCK_DATABASE } from '@/lib/stocks';

// We use our local database for autocomplete (faster + saves API calls).
// For unknown symbols, you could add a Finnhub /search call here later.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim().toUpperCase() || '';
  if (!q) return NextResponse.json({ results: [] });

  // Tiered search: prefix-symbol, prefix-name, then contains
  const symbolPrefix = STOCK_DATABASE.filter(s => s.symbol.startsWith(q));
  const namePrefix = STOCK_DATABASE.filter(
    s => !symbolPrefix.includes(s) && s.name.toUpperCase().split(/\s+/).some(w => w.startsWith(q))
  );
  const contains = STOCK_DATABASE.filter(
    s => !symbolPrefix.includes(s) && !namePrefix.includes(s) &&
    (s.symbol.includes(q) || s.name.toUpperCase().includes(q))
  );

  return NextResponse.json({
    results: [...symbolPrefix, ...namePrefix, ...contains].slice(0, 10),
  });
}
