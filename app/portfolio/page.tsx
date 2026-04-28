'use client';

import { useEffect, useState, useMemo, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, Search, Wallet, Activity, Target, AlertCircle, ArrowUpRight, ArrowDownRight, X, Loader2, RefreshCw, BarChart3 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { getSession, getPortfolio, savePortfolio, Investment } from '@/lib/auth';
import { STOCK_DATABASE, SECTOR_COLORS, getFinnhubSymbol, Asset, findAsset } from '@/lib/stocks';

type LiveQuote = { c: number; d: number; dp: number; pc: number };
type EnrichedInvestment = Investment & {
  currentPrice: number;
  dayChange: number;
  dayChangePct: number;
  cost: number;
  value: number;
  gain: number;
  gainPct: number;
};

function PortfolioInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initialTab = params.get('tab') || 'dashboard';

  const [user, setUser] = useState<{ username: string } | null>(null);
  const [tab, setTab] = useState(initialTab);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [quotes, setQuotes] = useState<Record<string, LiveQuote>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const initialLoad = useRef(true);

  // Auth check
  useEffect(() => {
    const session = getSession();
    if (!session) { router.push('/auth?mode=signin'); return; }
    setUser(session);
    setInvestments(getPortfolio(session.username));
    setLoading(false);
  }, [router]);

  // Save portfolio when it changes
  useEffect(() => {
    if (loading || !user) return;
    if (initialLoad.current) { initialLoad.current = false; return; }
    setSaving(true);
    savePortfolio(user.username, investments);
    setTimeout(() => setSaving(false), 400);
  }, [investments, user, loading]);

  // Fetch live quotes
  const refreshQuotes = useCallback(async () => {
    if (investments.length === 0) return;
    setRefreshing(true);
    try {
      const symbols = investments.map(i => getFinnhubSymbol({ symbol: i.symbol, finnhubSymbol: i.finnhubSymbol }));
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols }),
      });
      const data = await res.json();
      if (data.quotes) {
        setQuotes(data.quotes);
        setLastRefresh(new Date());
      }
    } catch (e) {
      console.error('Failed to fetch quotes', e);
    }
    setRefreshing(false);
  }, [investments]);

  // Auto-refresh on mount + every 60s
  useEffect(() => {
    if (investments.length === 0) return;
    refreshQuotes();
    const interval = setInterval(refreshQuotes, 60000);
    return () => clearInterval(interval);
  }, [investments.length, refreshQuotes]);

  // Sync URL tab → state when params change
  useEffect(() => {
    const t = params.get('tab') || 'dashboard';
    if (t !== tab) setTab(t);
  }, [params, tab]);

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    router.replace(`/portfolio${newTab !== 'dashboard' ? `?tab=${newTab}` : ''}`, { scroll: false });
  };

  // Enrich investments with live prices
  const enriched: EnrichedInvestment[] = useMemo(() => {
    return investments.map(inv => {
      const finnhubSym = getFinnhubSymbol({ symbol: inv.symbol, finnhubSymbol: inv.finnhubSymbol });
      const q = quotes[finnhubSym];
      const currentPrice = q?.c ?? inv.buyPrice; // fall back to buy price if no quote yet
      const dayChange = q?.d ?? 0;
      const dayChangePct = q?.dp ?? 0;
      const cost = inv.shares * inv.buyPrice + inv.commission;
      const value = inv.shares * currentPrice;
      const gain = value - cost;
      const gainPct = cost > 0 ? (gain / cost) * 100 : 0;
      return { ...inv, currentPrice, dayChange, dayChangePct, cost, value, gain, gainPct };
    });
  }, [investments, quotes]);

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1815' }}>
        <Loader2 size={28} className="spin" style={{ color: '#d97757' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1a1815' }}>
      <Sidebar username={user.username} saving={saving} activeTab={tab} onTabChange={handleTabChange} />
      <main style={{ flex: 1, padding: '40px 48px', overflow: 'auto' }}>
        {tab === 'dashboard' && <Dashboard enriched={enriched} username={user.username} setTab={handleTabChange} refreshing={refreshing} lastRefresh={lastRefresh} onRefresh={refreshQuotes} hasInvestments={investments.length > 0} />}
        {tab === 'holdings' && <Holdings enriched={enriched} setInvestments={setInvestments} investments={investments} refreshing={refreshing} onRefresh={refreshQuotes} />}
        {tab === 'add' && <AddInvestment investments={investments} setInvestments={setInvestments} setTab={handleTabChange} />}
        {tab === 'analytics' && <Analytics enriched={enriched} />}
        {tab === 'insights' && <Insights enriched={enriched} />}
      </main>
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#1a1815' }} />}>
      <PortfolioInner />
    </Suspense>
  );
}

// =============== DASHBOARD ===============
function Dashboard({ enriched, username, setTab, refreshing, lastRefresh, onRefresh, hasInvestments }: any) {
  const stats = useMemo(() => {
    const totalCost = enriched.reduce((s: number, i: EnrichedInvestment) => s + i.cost, 0);
    const totalValue = enriched.reduce((s: number, i: EnrichedInvestment) => s + i.value, 0);
    const totalGain = totalValue - totalCost;
    const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
    // Day change: weighted by position size
    const totalDayChange = enriched.reduce((s: number, i: EnrichedInvestment) => s + (i.dayChange * i.shares), 0);
    const totalDayChangePct = totalValue > 0 ? (totalDayChange / (totalValue - totalDayChange)) * 100 : 0;
    const winners = enriched.filter((i: EnrichedInvestment) => i.gain > 0).length;
    const losers = enriched.filter((i: EnrichedInvestment) => i.gain < 0).length;
    return { totalCost, totalValue, totalGain, totalGainPct, totalDayChange, totalDayChangePct, winners, losers };
  }, [enriched]);

  if (!hasInvestments) {
    return (
      <div className="fade-in">
        <Header title={`Hello, ${username}`} subtitle="Welcome to your portfolio" />
        <div className="card" style={{ textAlign: 'center', padding: 64 }}>
          <Wallet size={32} strokeWidth={1} style={{ color: '#6b6358', marginBottom: 16 }} />
          <div className="display-font" style={{ fontSize: 22, color: '#e8e3d8', marginBottom: 8 }}>Your portfolio is empty</div>
          <div style={{ color: '#8a8275', fontSize: 14, marginBottom: 24 }}>Log your first investment to see live prices, charts, and insights.</div>
          <button className="btn-primary" onClick={() => setTab('add')}><Plus size={15} /> Log First Investment</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <Header title={`Hello, ${username}`} subtitle="Portfolio overview" />
        <button className="btn-ghost" onClick={onRefresh} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={13} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #221f1b 0%, #2a2520 100%)', border: '1px solid #2e2a25', borderRadius: 4, padding: '40px 36px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 300, height: 300, background: 'radial-gradient(circle, rgba(217,119,87,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        <div className="stat-label">Total Portfolio Value · Live</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
          <div className="display-font" style={{ fontSize: 56, fontWeight: 500, color: '#e8e3d8', lineHeight: 1 }}>
            ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: stats.totalGain >= 0 ? '#7fb069' : '#d4615e', fontSize: 18, fontWeight: 600 }}>
            {stats.totalGain >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
            <span className="mono-font">{stats.totalGainPct >= 0 ? '+' : ''}{stats.totalGainPct.toFixed(2)}%</span>
          </div>
        </div>
        <div style={{ marginTop: 12, color: '#8a8275', fontSize: 14 }}>
          <span className="mono-font" style={{ color: stats.totalGain >= 0 ? '#7fb069' : '#d4615e' }}>
            {stats.totalGain >= 0 ? '+' : ''}${stats.totalGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          {' · '}invested ${stats.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        {lastRefresh && (
          <div style={{ marginTop: 14, fontSize: 11, color: '#6b6358' }}>
            Last updated {lastRefresh.toLocaleTimeString()} · Auto-refreshes every 60s
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Today's Change" value={`${stats.totalDayChange >= 0 ? '+' : ''}$${Math.abs(stats.totalDayChange).toFixed(2)}`} mono accent={stats.totalDayChange >= 0 ? '#7fb069' : '#d4615e'} />
        <StatCard label="Positions" value={enriched.length} mono />
        <StatCard label="Winners" value={stats.winners} mono accent="#7fb069" />
        <StatCard label="Losers" value={stats.losers} mono accent="#d4615e" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <TopMovers enriched={enriched} type="winners" />
        <TopMovers enriched={enriched} type="losers" />
      </div>
    </div>
  );
}

function StatCard({ label, value, mono, accent }: any) {
  return (
    <div className="card">
      <div className="stat-label">{label}</div>
      <div className={mono ? 'mono-font' : 'display-font'} style={{ fontSize: 26, fontWeight: mono ? 500 : 600, color: accent || '#e8e3d8', marginTop: 4 }}>{value}</div>
    </div>
  );
}

function TopMovers({ enriched, type }: any) {
  const sorted = [...enriched].sort((a, b) => type === 'winners' ? b.gainPct - a.gainPct : a.gainPct - b.gainPct).slice(0, 3);
  return (
    <div className="card">
      <div className="stat-label" style={{ marginBottom: 16 }}>{type === 'winners' ? '↗ Top Performers' : '↘ Underperformers'}</div>
      {sorted.length === 0 && <div style={{ color: '#6b6358', fontSize: 13 }}>No data</div>}
      {sorted.map((inv: EnrichedInvestment) => (
        <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #2e2a25' }}>
          <div>
            <div className="mono-font" style={{ fontSize: 14, fontWeight: 600, color: '#e8e3d8' }}>{inv.symbol}</div>
            <div style={{ fontSize: 11, color: '#8a8275', marginTop: 2 }}>{inv.name}</div>
          </div>
          <div className="mono-font" style={{ fontSize: 15, fontWeight: 600, color: inv.gainPct >= 0 ? '#7fb069' : '#d4615e' }}>
            {inv.gainPct >= 0 ? '+' : ''}{inv.gainPct.toFixed(2)}%
          </div>
        </div>
      ))}
    </div>
  );
}

// =============== HOLDINGS ===============
function Holdings({ enriched, setInvestments, investments, refreshing, onRefresh }: any) {
  const sorted = [...enriched].sort((a, b) => b.value - a.value);
  const handleDelete = (id: number) => {
    if (window.confirm('Remove this position from your portfolio?')) {
      setInvestments(investments.filter((i: Investment) => i.id !== id));
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <Header title="Holdings" subtitle={`${enriched.length} active position${enriched.length !== 1 ? 's' : ''} · live prices`} />
        <button className="btn-ghost" onClick={onRefresh} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={13} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {enriched.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 64 }}>
          <Wallet size={32} strokeWidth={1} style={{ color: '#6b6358', marginBottom: 16 }} />
          <div className="display-font" style={{ fontSize: 22, color: '#e8e3d8', marginBottom: 8 }}>No holdings yet</div>
          <div style={{ color: '#8a8275', fontSize: 14 }}>Log your first investment to get started.</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '90px 2fr 80px 100px 110px 110px 120px 120px 50px', gap: 16, padding: '14px 20px', borderBottom: '1px solid #2e2a25', alignItems: 'center', background: '#1f1c18', color: '#8a8275', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
            <div>Symbol</div><div>Name</div><div>Shares</div><div>Buy</div><div>Current</div><div>Day</div><div>Value</div><div>Return</div><div></div>
          </div>
          {sorted.map((inv: EnrichedInvestment) => (
            <div key={inv.id} style={{ display: 'grid', gridTemplateColumns: '90px 2fr 80px 100px 110px 110px 120px 120px 50px', gap: 16, padding: '16px 20px', borderBottom: '1px solid #2e2a25', alignItems: 'center' }}>
              <div>
                <div className="mono-font" style={{ fontWeight: 600, color: '#e8e3d8', fontSize: 14 }}>{inv.symbol}</div>
                <div className="badge" style={{ background: `${SECTOR_COLORS[inv.sector] || '#6b6358'}20`, color: SECTOR_COLORS[inv.sector] || '#8a8275', marginTop: 4 }}>{inv.type}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#e8e3d8' }}>{inv.name}</div>
                <div style={{ fontSize: 11, color: '#8a8275', marginTop: 2 }}>{inv.sector} · {inv.dateBought}</div>
              </div>
              <div className="mono-font" style={{ fontSize: 13 }}>{inv.shares}</div>
              <div className="mono-font" style={{ fontSize: 13, color: '#8a8275' }}>${inv.buyPrice.toFixed(2)}</div>
              <div className="mono-font" style={{ fontSize: 13, color: '#e8e3d8', fontWeight: 600 }}>${inv.currentPrice.toFixed(2)}</div>
              <div className="mono-font" style={{ fontSize: 12, color: inv.dayChangePct >= 0 ? '#7fb069' : '#d4615e' }}>
                {inv.dayChangePct >= 0 ? '+' : ''}{inv.dayChangePct.toFixed(2)}%
              </div>
              <div className="mono-font" style={{ fontSize: 13, color: '#e8e3d8', fontWeight: 600 }}>
                ${inv.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="mono-font" style={{ fontSize: 13, fontWeight: 600, color: inv.gainPct >= 0 ? '#7fb069' : '#d4615e' }}>
                <div>{inv.gainPct >= 0 ? '+' : ''}{inv.gainPct.toFixed(2)}%</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>{inv.gain >= 0 ? '+' : ''}${inv.gain.toFixed(2)}</div>
              </div>
              <div>
                <button onClick={() => handleDelete(inv.id)} style={{ background: 'transparent', border: 'none', color: '#6b6358', cursor: 'pointer', padding: 6 }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============== ADD INVESTMENT ===============
function AddInvestment({ investments, setInvestments, setTab }: any) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Asset | null>(null);
  const [shares, setShares] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [commission, setCommission] = useState('');
  const [dateBought, setDateBought] = useState(new Date().toISOString().split('T')[0]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    const query = search.trim().toUpperCase();
    const symbolPrefix = STOCK_DATABASE.filter(s => s.symbol.startsWith(query));
    const namePrefix = STOCK_DATABASE.filter(s => !symbolPrefix.includes(s) && s.name.toUpperCase().split(/\s+/).some(w => w.startsWith(query)));
    const contains = STOCK_DATABASE.filter(s => !symbolPrefix.includes(s) && !namePrefix.includes(s) && (s.symbol.includes(query) || s.name.toUpperCase().includes(query)));
    return [...symbolPrefix, ...namePrefix, ...contains].slice(0, 8);
  }, [search]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectStock = async (stock: Asset) => {
    setSelected(stock);
    setSearch(`${stock.symbol} — ${stock.name}`);
    setShowSuggestions(false);
    setFetchingPrice(true);
    try {
      const sym = getFinnhubSymbol(stock);
      const res = await fetch(`/api/quote?symbol=${encodeURIComponent(sym)}`);
      const q = await res.json();
      if (q.c && q.c > 0) {
        setCurrentPrice(q.c.toString());
        if (!buyPrice) setBuyPrice(q.c.toString());
      }
    } catch (e) { console.error(e); }
    setFetchingPrice(false);
  };

  const clearSelection = () => { setSelected(null); setSearch(''); setCurrentPrice(''); };

  const submit = () => {
    setError('');
    if (!selected) { setError('Please select a stock from the list'); return; }
    if (!shares || parseFloat(shares) <= 0) { setError('Enter valid share quantity'); return; }
    if (!buyPrice || parseFloat(buyPrice) <= 0) { setError('Enter valid purchase price'); return; }

    const newInv: Investment = {
      id: Date.now() + Math.random(),
      symbol: selected.symbol,
      name: selected.name,
      sector: selected.sector,
      type: selected.type,
      shares: parseFloat(shares),
      buyPrice: parseFloat(buyPrice),
      commission: parseFloat(commission) || 0,
      dateBought,
      finnhubSymbol: selected.finnhubSymbol,
    };
    setInvestments([...investments, newInv]);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setSelected(null); setSearch(''); setShares(''); setBuyPrice(''); setCurrentPrice(''); setCommission('');
    }, 1200);
  };

  return (
    <div className="fade-in">
      <Header title="Log Investment" subtitle="Record a position. Current price auto-fills from live data." />
      <div className="card" style={{ maxWidth: 720 }}>
        <div style={{ marginBottom: 24, position: 'relative' }} ref={searchRef}>
          <label className="stat-label" style={{ display: 'block', marginBottom: 10 }}>Search Asset</label>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b6358', pointerEvents: 'none' }} />
            <input className="input" type="text" value={search} onChange={(e) => { setSearch(e.target.value); setSelected(null); setShowSuggestions(true); }} onFocus={() => setShowSuggestions(true)} placeholder="Type a ticker or company name (e.g. AAPL, Apple, VOO)" style={{ paddingLeft: 40, paddingRight: selected ? 40 : 14 }} />
            {selected && <button onClick={clearSelection} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#6b6358', cursor: 'pointer' }}><X size={14} /></button>}
          </div>

          {showSuggestions && suggestions.length > 0 && !selected && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#1a1815', border: '1px solid #2e2a25', borderRadius: 3, maxHeight: 320, overflowY: 'auto', zIndex: 100, boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}>
              {suggestions.map(stock => (
                <div key={stock.symbol} onClick={() => selectStock(stock)} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #2e2a25', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="mono-font" style={{ fontWeight: 600, color: '#d97757', fontSize: 14 }}>{stock.symbol}</span>
                      <span className="badge" style={{ background: `${SECTOR_COLORS[stock.sector] || '#6b6358'}20`, color: SECTOR_COLORS[stock.sector] || '#8a8275' }}>{stock.type}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#8a8275', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stock.name}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#6b6358', letterSpacing: '0.05em' }}>{stock.sector}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          <div>
            <label className="stat-label" style={{ display: 'block', marginBottom: 10 }}>Shares / Units</label>
            <input className="input mono-font" type="number" step="any" value={shares} onChange={(e) => setShares(e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <label className="stat-label" style={{ display: 'block', marginBottom: 10 }}>Date Bought</label>
            <input className="input mono-font" type="date" value={dateBought} onChange={(e) => setDateBought(e.target.value)} />
          </div>
          <div>
            <label className="stat-label" style={{ display: 'block', marginBottom: 10 }}>Buy Price ($)</label>
            <input className="input mono-font" type="number" step="any" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <label className="stat-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span>Current Price ($)</span>
              {fetchingPrice && <span style={{ color: '#d97757', fontSize: 9, textTransform: 'none' }}>fetching live…</span>}
              {!fetchingPrice && currentPrice && selected && <span style={{ color: '#d97757', fontSize: 9, textTransform: 'none' }}>live</span>}
            </label>
            <input className="input mono-font" type="number" step="any" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} placeholder="0.00" disabled />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label className="stat-label" style={{ display: 'block', marginBottom: 10 }}>Commission / Fees ($)</label>
            <input className="input mono-font" type="number" step="any" value={commission} onChange={(e) => setCommission(e.target.value)} placeholder="0.00" />
          </div>
        </div>

        {error && <div style={{ marginTop: 20, padding: 12, background: 'rgba(212, 97, 94, 0.1)', border: '1px solid #d4615e40', borderRadius: 3, color: '#d4615e', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}><AlertCircle size={14} /> {error}</div>}
        {success && <div style={{ marginTop: 20, padding: 12, background: 'rgba(127, 176, 105, 0.1)', border: '1px solid #7fb06940', borderRadius: 3, color: '#7fb069', fontSize: 13 }}>✓ Investment saved · prices will update automatically</div>}

        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <button className="btn-primary" onClick={submit}><Plus size={15} /> Log Investment</button>
          <button className="btn-ghost" onClick={() => setTab('holdings')}>View Holdings</button>
        </div>
      </div>
    </div>
  );
}

// =============== ANALYTICS ===============
function Analytics({ enriched }: any) {
  const sectorData = useMemo(() => {
    const map: Record<string, number> = {};
    enriched.forEach((i: EnrichedInvestment) => { map[i.sector] = (map[i.sector] || 0) + i.value; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [enriched]);

  const typeData = useMemo(() => {
    const map: Record<string, number> = {};
    enriched.forEach((i: EnrichedInvestment) => { map[i.type] = (map[i.type] || 0) + i.value; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [enriched]);

  const performanceByPosition = useMemo(() => {
    return [...enriched].sort((a, b) => b.gainPct - a.gainPct).map(i => ({ symbol: i.symbol, gain: i.gainPct }));
  }, [enriched]);

  if (enriched.length === 0) {
    return (
      <div className="fade-in">
        <Header title="Analytics" subtitle="Portfolio breakdown" />
        <div className="card" style={{ textAlign: 'center', padding: 64 }}>
          <Activity size={32} strokeWidth={1} style={{ color: '#6b6358', marginBottom: 16 }} />
          <div style={{ color: '#8a8275', fontSize: 14 }}>Add investments to view analytics.</div>
        </div>
      </div>
    );
  }

  const total = sectorData.reduce((s, x) => s + x.value, 0);

  return (
    <div className="fade-in">
      <Header title="Analytics" subtitle="Portfolio breakdown · live values" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="stat-label">Allocation by Sector</div>
          <div className="display-font" style={{ fontSize: 18, marginBottom: 16, color: '#e8e3d8' }}>Where your capital lives</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={sectorData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={2}>
                {sectorData.map((entry, idx) => (<Cell key={idx} fill={SECTOR_COLORS[entry.name] || '#8a8275'} />))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1815', border: '1px solid #2e2a25', borderRadius: 3, fontSize: 12 }} formatter={(v: any) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 12 }}>
            {[...sectorData].sort((a, b) => b.value - a.value).map(s => (
              <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12, borderBottom: '1px solid #2e2a25' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: SECTOR_COLORS[s.name] || '#8a8275' }}></div>
                  <span style={{ color: '#e8e3d8' }}>{s.name}</span>
                </div>
                <span className="mono-font" style={{ color: '#8a8275' }}>{((s.value / total) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="stat-label">Allocation by Asset Type</div>
          <div className="display-font" style={{ fontSize: 18, marginBottom: 16, color: '#e8e3d8' }}>Stocks, ETFs, crypto</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} paddingAngle={2}>
                {typeData.map((_, idx) => { const colors = ['#d97757', '#5d7a8c', '#a78050']; return <Cell key={idx} fill={colors[idx % colors.length]} />; })}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1815', border: '1px solid #2e2a25', borderRadius: 3, fontSize: 12 }} formatter={(v: any) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="stat-label">Position Performance · Live</div>
        <div className="display-font" style={{ fontSize: 18, marginBottom: 20, color: '#e8e3d8' }}>Returns by holding</div>
        <ResponsiveContainer width="100%" height={Math.max(250, performanceByPosition.length * 36)}>
          <BarChart data={performanceByPosition} layout="vertical" margin={{ left: 20, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e2a25" horizontal={false} />
            <XAxis type="number" stroke="#6b6358" tick={{ fontSize: 11 }} tickFormatter={(v: any) => `${v.toFixed(0)}%`} />
            <YAxis type="category" dataKey="symbol" stroke="#6b6358" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} width={70} />
            <Tooltip contentStyle={{ background: '#1a1815', border: '1px solid #2e2a25', borderRadius: 3, fontSize: 12 }} formatter={(v: any) => [`${v.toFixed(2)}%`, 'Return']} />
            <Bar dataKey="gain" radius={[0, 2, 2, 0]}>
              {performanceByPosition.map((entry, idx) => (<Cell key={idx} fill={entry.gain >= 0 ? '#7fb069' : '#d4615e'} />))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// =============== INSIGHTS ===============
function Insights({ enriched }: any) {
  const insights = useMemo(() => {
    if (enriched.length === 0) return [];
    const totalValue = enriched.reduce((s: number, i: EnrichedInvestment) => s + i.value, 0);
    const totalCost = enriched.reduce((s: number, i: EnrichedInvestment) => s + i.cost, 0);
    const totalGainPct = ((totalValue - totalCost) / totalCost) * 100;
    const sectorMap: Record<string, number> = {};
    const typeMap: Record<string, number> = {};
    enriched.forEach((i: EnrichedInvestment) => { sectorMap[i.sector] = (sectorMap[i.sector] || 0) + i.value; typeMap[i.type] = (typeMap[i.type] || 0) + i.value; });
    const topSector = Object.entries(sectorMap).sort((a, b) => b[1] - a[1])[0];
    const topSectorPct = (topSector[1] / totalValue) * 100;
    const cryptoPct = ((typeMap['Crypto'] || 0) / totalValue) * 100;
    const etfPct = ((typeMap['ETF'] || 0) / totalValue) * 100;
    const winners = enriched.filter((i: EnrichedInvestment) => i.gain > 0);
    const list: any[] = [];

    if (totalGainPct > 15) list.push({ type: 'positive', title: 'Strong portfolio performance', body: `You're up ${totalGainPct.toFixed(1)}% — ahead of historical S&P 500 averages of ~10% annually. Consider rebalancing if any position has grown disproportionately.` });
    else if (totalGainPct < -10) list.push({ type: 'negative', title: 'Portfolio in drawdown', body: `Down ${Math.abs(totalGainPct).toFixed(1)}%. Drawdowns are normal. Review if each losing position's thesis still holds; consider tax-loss harvesting.` });
    else list.push({ type: 'neutral', title: 'Tracking near baseline', body: `At ${totalGainPct >= 0 ? '+' : ''}${totalGainPct.toFixed(1)}%. Steady. Keep contributing regularly; avoid trading on short-term moves.` });

    if (topSectorPct > 50) list.push({ type: 'warning', title: `Heavy concentration in ${topSector[0]}`, body: `${topSectorPct.toFixed(1)}% in one sector. Diversifying into uncorrelated sectors reduces single-sector risk.` });
    else if (topSectorPct > 35) list.push({ type: 'neutral', title: `${topSector[0]} is your largest exposure`, body: `${topSectorPct.toFixed(1)}% — meaningful tilt. Make sure you're comfortable with the sector-specific risk.` });

    if (cryptoPct > 20) list.push({ type: 'warning', title: 'High crypto allocation', body: `Crypto is ${cryptoPct.toFixed(1)}%. Most advisors cap speculative assets at 5–10% given volatility.` });
    else if (cryptoPct > 0 && cryptoPct < 5) list.push({ type: 'positive', title: 'Crypto well-sized', body: `${cryptoPct.toFixed(1)}% — small enough to capture upside without putting the portfolio at risk.` });

    if (etfPct > 70) list.push({ type: 'positive', title: 'Strong index foundation', body: `${etfPct.toFixed(1)}% in ETFs — low-cost, diversified base. Solid foundation under your individual picks.` });
    else if (etfPct < 20 && enriched.length >= 3) list.push({ type: 'neutral', title: 'Low passive exposure', body: `Only ${etfPct.toFixed(1)}% in ETFs. Broad funds (VOO, VTI) tend to outperform stock-pickers long-term.` });

    const winRate = (winners.length / enriched.length) * 100;
    if (winRate >= 70) list.push({ type: 'positive', title: `${winners.length} of ${enriched.length} positions profitable`, body: `${winRate.toFixed(0)}% win rate — strong. Watch position sizing so a single loss doesn't erase wins.` });
    else if (winRate < 40 && enriched.length >= 3) list.push({ type: 'warning', title: `Only ${winners.length} of ${enriched.length} profitable`, body: `${winRate.toFixed(0)}% win rate is low. Review what's not working — timing, sectors, or specific picks?` });

    if (enriched.length === 1) list.push({ type: 'warning', title: 'Single position is high risk', body: 'Holding only one asset means your entire return depends on it. Even a few additional positions reduce risk significantly.' });

    return list;
  }, [enriched]);

  if (enriched.length === 0) {
    return (
      <div className="fade-in">
        <Header title="Insights" subtitle="Feedback on your portfolio" />
        <div className="card" style={{ textAlign: 'center', padding: 64 }}>
          <Target size={32} strokeWidth={1} style={{ color: '#6b6358', marginBottom: 16 }} />
          <div style={{ color: '#8a8275', fontSize: 14 }}>Add investments for personalized insights.</div>
        </div>
      </div>
    );
  }

  const colorMap: Record<string, any> = {
    positive: { bg: 'rgba(127, 176, 105, 0.08)', border: '#7fb06940', accent: '#7fb069', symbol: '↗' },
    negative: { bg: 'rgba(212, 97, 94, 0.08)', border: '#d4615e40', accent: '#d4615e', symbol: '↘' },
    warning: { bg: 'rgba(217, 119, 87, 0.08)', border: '#d9775740', accent: '#d97757', symbol: '!' },
    neutral: { bg: 'rgba(138, 130, 117, 0.08)', border: '#8a827540', accent: '#a89968', symbol: '·' },
  };

  return (
    <div className="fade-in">
      <Header title="Insights" subtitle={`${insights.length} observation${insights.length !== 1 ? 's' : ''} · based on live data`} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 800 }}>
        {insights.map((insight, idx) => {
          const c = colorMap[insight.type];
          return (
            <div key={idx} style={{ background: c.bg, border: `1px solid ${c.border}`, borderLeft: `3px solid ${c.accent}`, borderRadius: 3, padding: '20px 24px' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div className="display-font" style={{ fontSize: 24, color: c.accent, lineHeight: 1, fontWeight: 600, marginTop: 2, minWidth: 24 }}>{c.symbol}</div>
                <div style={{ flex: 1 }}>
                  <div className="display-font" style={{ fontSize: 17, fontWeight: 600, color: '#e8e3d8', marginBottom: 6 }}>{insight.title}</div>
                  <div style={{ color: '#b8b0a0', fontSize: 13, lineHeight: 1.6 }}>{insight.body}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 32, padding: 16, background: '#221f1b', border: '1px solid #2e2a25', borderRadius: 3, fontSize: 11, color: '#6b6358', maxWidth: 800, lineHeight: 1.6 }}>
        These are heuristic observations from your live portfolio data — not personalized financial advice.
      </div>
    </div>
  );
}

function Header({ title, subtitle }: any) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div className="stat-label" style={{ marginBottom: 4 }}>{subtitle}</div>
      <div className="display-font" style={{ fontSize: 44, fontWeight: 500, color: '#e8e3d8', letterSpacing: '-0.03em', lineHeight: 1 }}>{title}</div>
    </div>
  );
}
