'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BarChart3, Wallet, Target, Search, Sparkles, ShieldCheck, User, Lightbulb, PieChart as PieIcon, Activity } from 'lucide-react';
import { getSession } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) setHasSession(true);
  }, []);

  const features = [
    { icon: Wallet, title: 'Log every position', body: 'Record what you bought, when, and at what price. Capture commissions and fees so your cost basis is accurate. Search 70+ stocks, ETFs, and crypto.' },
    { icon: BarChart3, title: 'Live market data', body: 'Real prices update automatically — no manual entry. Your portfolio value, gains, and percentages reflect what the market is actually doing right now.' },
    { icon: PieIcon, title: 'Understand your allocation', body: 'Pie charts break down your portfolio by sector and asset type. Bar charts rank every position by return. Spot concentration risk before it becomes a problem.' },
    { icon: Search, title: 'Research any stock', body: 'Search any ticker, see live charts across multiple time ranges, analyst recommendations, news, and key financials before you buy.' },
    { icon: Lightbulb, title: 'Personalized insights', body: 'Plain-English feedback flagging heavy concentration, oversized crypto allocations, low diversification, and underperforming positions.' },
    { icon: Activity, title: 'Auto-saved & private', body: 'Every change saves automatically. Your portfolio is tied to your account and only you can see it.' },
  ];

  const steps = [
    { num: '01', title: 'Create your account', body: 'Pick a username and password. Your portfolio is private to you.' },
    { num: '02', title: 'Log your first investment', body: 'Search for a ticker, enter shares + buy price. The current price syncs automatically from live market data.' },
    { num: '03', title: 'Watch your portfolio update', body: 'Prices refresh automatically. Charts, allocations, and insights recalculate in real time as the market moves.' },
    { num: '04', title: 'Research before you buy', body: 'Use the Research page to look up any stock, see charts and analyst ratings, then come back and log it.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#1a1815', overflow: 'auto' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(26, 24, 21, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #2e2a25', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="display-font" style={{ fontSize: 22, fontWeight: 600, color: '#e8e3d8' }}>Ledger</span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97757', display: 'inline-block' }}></span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {hasSession ? (
            <Link href="/portfolio">
              <button className="btn-primary" style={{ padding: '9px 18px', fontSize: 12 }}>Go to Portfolio →</button>
            </Link>
          ) : (
            <>
              <Link href="/auth?mode=signin"><button className="btn-ghost" style={{ padding: '8px 16px', fontSize: 12 }}>Sign In</button></Link>
              <Link href="/auth?mode=signup"><button className="btn-primary" style={{ padding: '9px 18px', fontSize: 12 }}>Sign Up</button></Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', padding: '100px 32px 80px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(217,119,87,0.12) 0%, transparent 60%)', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(93,122,140,0.08) 0%, transparent 60%)', pointerEvents: 'none' }}></div>

        <div style={{ maxWidth: 920, margin: '0 auto', position: 'relative', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, background: 'rgba(217,119,87,0.1)', border: '1px solid rgba(217,119,87,0.25)', marginBottom: 28 }}>
            <Sparkles size={12} style={{ color: '#d97757' }} />
            <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#d97757', fontWeight: 600 }}>Live market data · Auto-updating</span>
          </div>

          <h1 className="display-font" style={{ fontSize: 'clamp(40px, 7vw, 76px)', fontWeight: 500, color: '#e8e3d8', lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: 24 }}>
            Your portfolio,<br /><span style={{ fontStyle: 'italic', color: '#d97757' }}>understood.</span>
          </h1>

          <p style={{ fontSize: 18, color: '#b8b0a0', lineHeight: 1.6, maxWidth: 620, margin: '0 auto 40px' }}>
            Log your stocks, ETFs, and crypto. Live prices update automatically. Research any ticker. Get personalized insights on what's working and what isn't.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth?mode=signup"><button className="btn-primary" style={{ padding: '15px 28px', fontSize: 13 }}>Get Started Free <ArrowRight size={15} /></button></Link>
            <Link href="/auth?mode=signin"><button className="btn-ghost" style={{ padding: '14px 24px', fontSize: 13 }}>I already have an account</button></Link>
          </div>

          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', fontSize: 12, color: '#6b6358' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={13} /> No credit card</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={13} /> Account in 30 seconds</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BarChart3 size={13} /> Live market prices</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 32px', borderTop: '1px solid #2e2a25', background: '#1f1c18' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="stat-label" style={{ marginBottom: 8, color: '#d97757' }}>What Ledger does</div>
            <h2 className="display-font" style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 500, color: '#e8e3d8', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Six tools, one portfolio.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} className="card">
                <div style={{ width: 44, height: 44, borderRadius: 6, background: 'rgba(217,119,87,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <f.icon size={20} style={{ color: '#d97757' }} strokeWidth={1.5} />
                </div>
                <div className="display-font" style={{ fontSize: 19, fontWeight: 600, color: '#e8e3d8', marginBottom: 8 }}>{f.title}</div>
                <p style={{ color: '#8a8275', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 32px', borderTop: '1px solid #2e2a25' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="stat-label" style={{ marginBottom: 8, color: '#d97757' }}>How it works</div>
            <h2 className="display-font" style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 500, color: '#e8e3d8', letterSpacing: '-0.03em', lineHeight: 1.1 }}>From signup to insight.</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 28, padding: '24px 28px', background: '#221f1b', border: '1px solid #2e2a25', borderRadius: 4 }}>
                <div className="mono-font" style={{ fontSize: 32, fontWeight: 600, color: '#d97757', lineHeight: 1, minWidth: 56 }}>{s.num}</div>
                <div>
                  <div className="display-font" style={{ fontSize: 20, fontWeight: 600, color: '#e8e3d8', marginBottom: 6 }}>{s.title}</div>
                  <p style={{ color: '#8a8275', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 32px', borderTop: '1px solid #2e2a25', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(217,119,87,0.1) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
          <h2 className="display-font" style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 500, color: '#e8e3d8', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20 }}>
            Ready to see your<br /><span style={{ fontStyle: 'italic', color: '#d97757' }}>real returns?</span>
          </h2>
          <p style={{ fontSize: 16, color: '#b8b0a0', lineHeight: 1.6, marginBottom: 32 }}>
            Sign up free, log your first investment, and watch live prices update.
          </p>
          <Link href="/auth?mode=signup"><button className="btn-primary" style={{ padding: '16px 32px', fontSize: 14 }}>Create Your Account <ArrowRight size={16} /></button></Link>
        </div>
      </section>

      <footer style={{ padding: 32, borderTop: '1px solid #2e2a25', textAlign: 'center', fontSize: 11, color: '#6b6358', letterSpacing: '0.05em' }}>
        <div style={{ marginBottom: 8 }}>Ledger · Portfolio Tracker · v 1.0</div>
        <div style={{ maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
          Ledger provides educational tools and personal portfolio tracking. Live data via Finnhub. Not financial advice.
        </div>
      </footer>
    </div>
  );
}
