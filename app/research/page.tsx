'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Search, X, Loader2, ExternalLink, TrendingUp, TrendingDown, Building2, Globe, AlertCircle } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { getSession } from '@/lib/auth';
import { STOCK_DATABASE, SECTOR_COLORS, getFinnhubSymbol, Asset } from '@/lib/stocks';

const RANGES = ['1W', '1M', '3M', '6M', '1Y'] as const;
type Range = typeof RANGES[number];

export default function ResearchPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selected, setSelected] = useState<Asset | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [quote, setQuote] = useState<any>(null);
  const [candles, setCandles] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [range, setRange] = useState<Range>('3M');
  const [loadingData, setLoadingData] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) { router.push('/auth?mode=signin'); return; }
    setUser(session);
  }, [router]);

  // Click outside to close suggestions
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.trim().toUpperCase();
    const symbolPrefix = STOCK_DATABASE.filter(s => s.symbol.startsWith(q));
    const namePrefix = STOCK_DATABASE.filter(s => !symbolPrefix.includes(s) && s.name.toUpperCase().split(/\s+/).some(w => w.startsWith(q)));
    const contains = STOCK_DATABASE.filter(s => !symbolPrefix.includes(s) && !namePrefix.includes(s) && (s.symbol.includes(q) || s.name.toUpperCase().includes(q)));
    return [...symbolPrefix, ...namePrefix, ...contains].slice(0, 8);
  }, [search]);

  const fetchAll = useCallback(async (asset: Asset, r: Range) => {
    setLoadingData(true);
    setLoadingChart(true);
    const finSym = getFinnhubSymbol(asset);
    const isCrypto = asset.type === 'Crypto';

    try {
      // Quote
      const qRes = await fetch(`/api/quote?symbol=${encodeURIComponent(finSym)}`);
      const qData = await qRes.json();
      setQuote(qData);

      // Candles
      const cRes = await fetch(`/api/candle?symbol=${encodeURIComponent(finSym)}&range=${r}&crypto=${isCrypto}`);
      const cData = await cRes.json();
      setCandles(cData.candles || []);
      setLoadingChart(false);

      // Profile + recommendations + news (only for stocks/ETFs, not crypto)
      if (!isCrypto) {
        const [pRes, nRes] = await Promise.all([
          fetch(`/api/profile?symbol=${encodeURIComponent(asset.symbol)}`),
          fetch(`/api/news?symbol=${encodeURIComponent(asset.symbol)}`),
        ]);
        const pData = await pRes.json();
        const nData = await nRes.json();
        setProfile(pData.profile);
        setRecommendations(pData.recommendations || []);
        setNews(nData.news || []);
      } else {
        setProfile(null);
        setRecommendations([]);
        setNews([]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingData(false);
    setLoadingChart(false);
  }, []);

  const selectStock = (stock: Asset) => {
    setSelected(stock);
    setSearch(`${stock.symbol} — ${stock.name}`);
    setShowSuggestions(false);
    fetchAll(stock, range);
  };

  // Re-fetch chart when range changes
  useEffect(() => {
    if (selected) {
      const finSym = getFinnhubSymbol(selected);
      const isCrypto = selected.type === 'Crypto';
      setLoadingChart(true);
      fetch(`/api/candle?symbol=${encodeURIComponent(finSym)}&range=${range}&crypto=${isCrypto}`)
        .then(r => r.json())
        .then(d => { setCandles(d.candles || []); setLoadingChart(false); })
        .catch(() => setLoadingChart(false));
    }
  }, [range, selected]);

  if (!user) return <div style={{ minHeight: '100vh', background: '#1a1815' }} />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1a1815' }}>
      <Sidebar username={user.username} />
      <main style={{ flex: 1, padding: '40px 48px', overflow: 'auto' }}>
        <div style={{ marginBottom: 32 }}>
          <div className="stat-label" style={{ marginBottom: 4 }}>Look up any stock · live data</div>
          <div className="display-font" style={{ fontSize: 44, fontWeight: 500, color: '#e8e3d8', letterSpacing: '-0.03em', lineHeight: 1 }}>Research</div>
        </div>

        {/* Search bar */}
        <div style={{ position: 'relative', marginBottom: 32, maxWidth: 720 }} ref={searchRef}>
          <div style={{ position: 'relative' }}>
            <Search size={17} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6b6358' }} />
            <input
              className="input"
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); if (selected && !e.target.value) { setSelected(null); setQuote(null); setCandles([]); setProfile(null); setRecommendations([]); setNews([]); } }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search a ticker or company name (AAPL, NVDA, Tesla, BTC…)"
              style={{ paddingLeft: 48, paddingRight: 40, padding: '16px 16px 16px 48px', fontSize: 15 }}
            />
            {selected && (
              <button onClick={() => { setSelected(null); setSearch(''); setQuote(null); setCandles([]); setProfile(null); setRecommendations([]); setNews([]); }} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#6b6358', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            )}
          </div>
          {showSuggestions && suggestions.length > 0 && !selected && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#1a1815', border: '1px solid #2e2a25', borderRadius: 3, maxHeight: 360, overflowY: 'auto', zIndex: 100, boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}>
              {suggestions.map(stock => (
                <div key={stock.symbol} onClick={() => selectStock(stock)} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #2e2a25', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="mono-font" style={{ fontWeight: 600, color: '#d97757', fontSize: 14 }}>{stock.symbol}</span>
                      <span className="badge" style={{ background: `${SECTOR_COLORS[stock.sector] || '#6b6358'}20`, color: SECTOR_COLORS[stock.sector] || '#8a8275' }}>{stock.type}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#8a8275', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stock.name}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#6b6358' }}>{stock.sector}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!selected && (
          <div className="card" style={{ textAlign: 'center', padding: 80, maxWidth: 720 }}>
            <Search size={36} strokeWidth={1} style={{ color: '#6b6358', marginBottom: 20 }} />
            <div className="display-font" style={{ fontSize: 22, color: '#e8e3d8', marginBottom: 8 }}>Search to begin</div>
            <div style={{ color: '#8a8275', fontSize: 14, lineHeight: 1.6, maxWidth: 460, margin: '0 auto' }}>
              Look up any stock, ETF, or cryptocurrency to see live charts, analyst recommendations, news, and key financials.
            </div>
          </div>
        )}

        {selected && (
          <div className="fade-in">
            {/* Quote header */}
            <div style={{ background: 'linear-gradient(135deg, #221f1b 0%, #2a2520 100%)', border: '1px solid #2e2a25', borderRadius: 4, padding: 32, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 300, height: 300, background: 'radial-gradient(circle, rgba(217,119,87,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <span className="mono-font" style={{ fontSize: 20, fontWeight: 600, color: '#d97757' }}>{selected.symbol}</span>
                    <span className="badge" style={{ background: `${SECTOR_COLORS[selected.sector] || '#6b6358'}20`, color: SECTOR_COLORS[selected.sector] || '#8a8275' }}>{selected.type}</span>
                    <span style={{ fontSize: 11, color: '#8a8275', letterSpacing: '0.05em' }}>{selected.sector}</span>
                  </div>
                  <div className="display-font" style={{ fontSize: 28, color: '#e8e3d8', fontWeight: 500 }}>{selected.name}</div>
                </div>
                {quote && quote.c > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <div className="display-font" style={{ fontSize: 40, fontWeight: 500, color: '#e8e3d8', lineHeight: 1 }}>
                      ${quote.c.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: quote.c < 1 ? 4 : 2 })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', marginTop: 8, color: quote.d >= 0 ? '#7fb069' : '#d4615e', fontSize: 15, fontWeight: 600 }}>
                      {quote.d >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      <span className="mono-font">{quote.d >= 0 ? '+' : ''}${Math.abs(quote.d).toFixed(2)} ({quote.dp >= 0 ? '+' : ''}{quote.dp.toFixed(2)}%)</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#6b6358', marginTop: 6 }}>Today's change</div>
                  </div>
                )}
              </div>
              {quote && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16, marginTop: 24, paddingTop: 20, borderTop: '1px solid #2e2a25' }}>
                  <Stat label="Open" value={`$${quote.o?.toFixed(2) || '—'}`} />
                  <Stat label="Day High" value={`$${quote.h?.toFixed(2) || '—'}`} />
                  <Stat label="Day Low" value={`$${quote.l?.toFixed(2) || '—'}`} />
                  <Stat label="Prev Close" value={`$${quote.pc?.toFixed(2) || '—'}`} />
                </div>
              )}
            </div>

            {/* Chart with range tabs */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div className="stat-label">Price History</div>
                  <div className="display-font" style={{ fontSize: 20, marginTop: 4, color: '#e8e3d8' }}>Trend</div>
                </div>
                <div style={{ display: 'flex', gap: 4, background: '#1a1815', padding: 4, borderRadius: 3, border: '1px solid #2e2a25' }}>
                  {RANGES.map(r => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      style={{
                        background: range === r ? '#d97757' : 'transparent',
                        color: range === r ? '#1a1815' : '#8a8275',
                        border: 'none', padding: '6px 14px', borderRadius: 2,
                        fontSize: 11, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.05em',
                        transition: 'all 0.15s'
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {loadingChart ? (
                <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 size={24} className="spin" style={{ color: '#d97757' }} />
                </div>
              ) : candles.length === 0 ? (
                <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6358', fontSize: 13 }}>
                  No chart data available for this range.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={candles}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d97757" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#d97757" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2e2a25" />
                    <XAxis dataKey="date" stroke="#6b6358" tick={{ fontSize: 11 }} interval={Math.floor(candles.length / 8)} />
                    <YAxis stroke="#6b6358" tick={{ fontSize: 11 }} domain={['auto', 'auto']} tickFormatter={(v) => `$${v < 1 ? v.toFixed(3) : v.toFixed(0)}`} />
                    <Tooltip contentStyle={{ background: '#1a1815', border: '1px solid #2e2a25', borderRadius: 3, fontSize: 12 }} formatter={(v: any) => [`$${v.toFixed(2)}`, 'Price']} />
                    <Area type="monotone" dataKey="close" stroke="#d97757" strokeWidth={2} fill="url(#chartGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Recommendations + Profile row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16, marginBottom: 24 }}>
              {/* Analyst recommendations */}
              {recommendations.length > 0 && (
                <div className="card">
                  <div className="stat-label">Analyst Recommendations</div>
                  <div className="display-font" style={{ fontSize: 18, marginBottom: 16, color: '#e8e3d8' }}>What Wall Street thinks</div>
                  {(() => {
                    const latest = recommendations[0];
                    const total = latest.strongBuy + latest.buy + latest.hold + latest.sell + latest.strongSell;
                    const buyPct = ((latest.strongBuy + latest.buy) / total) * 100;
                    const sellPct = ((latest.strongSell + latest.sell) / total) * 100;
                    const consensus = buyPct > 60 ? 'BUY' : buyPct > 40 ? 'HOLD' : sellPct > 40 ? 'SELL' : 'MIXED';
                    const consensusColor = consensus === 'BUY' ? '#7fb069' : consensus === 'SELL' ? '#d4615e' : '#a89968';
                    return (
                      <>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 }}>
                          <div className="display-font" style={{ fontSize: 32, fontWeight: 600, color: consensusColor, lineHeight: 1 }}>{consensus}</div>
                          <div style={{ fontSize: 12, color: '#8a8275' }}>{total} analysts · {latest.period}</div>
                        </div>
                        <RecBar label="Strong Buy" count={latest.strongBuy} total={total} color="#5b8c4a" />
                        <RecBar label="Buy" count={latest.buy} total={total} color="#7fb069" />
                        <RecBar label="Hold" count={latest.hold} total={total} color="#a89968" />
                        <RecBar label="Sell" count={latest.sell} total={total} color="#d4615e" />
                        <RecBar label="Strong Sell" count={latest.strongSell} total={total} color="#a83838" />
                      </>
                    );
                  })()}
                  <div style={{ marginTop: 16, padding: 12, background: '#1a1815', borderRadius: 3, fontSize: 11, color: '#6b6358', lineHeight: 1.6 }}>
                    Aggregated analyst ratings reflect consensus, not certainty. Always research the underlying reasoning.
                  </div>
                </div>
              )}

              {/* Company profile */}
              {profile && (
                <div className="card">
                  <div className="stat-label">Company Profile</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                    {profile.logo && <img src={profile.logo} alt={profile.name} style={{ width: 44, height: 44, borderRadius: 4, background: 'white', padding: 4, objectFit: 'contain' }} />}
                    <div>
                      <div className="display-font" style={{ fontSize: 18, color: '#e8e3d8', fontWeight: 600 }}>{profile.name}</div>
                      <div style={{ fontSize: 12, color: '#8a8275', marginTop: 2 }}>{profile.exchange} · {profile.country}</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                    <ProfileItem label="Industry" value={profile.finnhubIndustry} />
                    <ProfileItem label="IPO Date" value={profile.ipo} />
                    <ProfileItem label="Market Cap" value={profile.marketCapitalization ? `$${(profile.marketCapitalization / 1000).toFixed(2)}B` : '—'} />
                    <ProfileItem label="Currency" value={profile.currency} />
                  </div>
                  {profile.weburl && (
                    <a href={profile.weburl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, color: '#d97757', fontSize: 12, textDecoration: 'none' }}>
                      Visit website <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* News */}
            {news.length > 0 && (
              <div className="card">
                <div className="stat-label">Latest News</div>
                <div className="display-font" style={{ fontSize: 18, marginBottom: 16, color: '#e8e3d8' }}>Recent coverage</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {news.slice(0, 6).map((item: any) => (
                    <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ padding: 16, background: '#1a1815', borderRadius: 3, border: '1px solid #2e2a25', transition: 'border-color 0.15s', display: 'flex', gap: 14 }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#d97757'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2e2a25'}>
                        {item.image && <img src={item.image} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, color: '#e8e3d8', fontWeight: 500, marginBottom: 4, lineHeight: 1.4 }}>{item.headline}</div>
                          <div style={{ fontSize: 11, color: '#8a8275' }}>{item.source} · {new Date(item.datetime * 1000).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div style={{ marginTop: 24, padding: 16, background: '#221f1b', border: '1px solid #2e2a25', borderRadius: 3, fontSize: 11, color: '#6b6358', lineHeight: 1.6 }}>
              Data via Finnhub. Quotes may be delayed by up to a few seconds on the free tier. Analyst ratings and news are aggregated from public sources. None of this is investment advice — do your own research.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#8a8275', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div className="mono-font" style={{ fontSize: 14, color: '#e8e3d8', fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: '#8a8275', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#e8e3d8' }}>{value || '—'}</div>
    </div>
  );
}

function RecBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: '#e8e3d8' }}>{label}</span>
        <span className="mono-font" style={{ color: '#8a8275' }}>{count}</span>
      </div>
      <div style={{ height: 5, background: '#1a1815', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.3s' }}></div>
      </div>
    </div>
  );
}
