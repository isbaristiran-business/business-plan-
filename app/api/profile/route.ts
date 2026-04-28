import { NextResponse } from 'next/server';
import { fetchProfile, fetchRecommendations, fetchFinancials } from '@/lib/finnhub';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  if (!symbol) return NextResponse.json({ error: 'symbol required' }, { status: 400 });

  try {
    const [profile, recommendations, financials] = await Promise.allSettled([
      fetchProfile(symbol),
      fetchRecommendations(symbol),
      fetchFinancials(symbol),
    ]);

    return NextResponse.json({
      profile: profile.status === 'fulfilled' ? profile.value : null,
      recommendations: recommendations.status === 'fulfilled' ? recommendations.value : [],
      financials: financials.status === 'fulfilled' ? financials.value : null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
