'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { signIn, signUp } from '@/lib/auth';

function AuthInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<'signin' | 'signup'>(
    params.get('mode') === 'signup' ? 'signup' : 'signin'
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    setBusy(true);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setBusy(false);
        return;
      }
      const res = await signUp(username, password);
      if (!res.ok) { setError(res.error!); setBusy(false); return; }
    } else {
      const res = await signIn(username, password);
      if (!res.ok) { setError(res.error!); setBusy(false); return; }
    }

    router.push('/portfolio');
  };

  const onKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') submit(); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'radial-gradient(ellipse at top right, rgba(217,119,87,0.06), transparent 60%), #1a1815' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <button style={{ background: 'transparent', border: 'none', color: '#8a8275', cursor: 'pointer', fontSize: 12, padding: '8px 0', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Back to home
          </button>
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <span className="display-font" style={{ fontSize: 40, fontWeight: 600, color: '#e8e3d8' }}>Ledger</span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97757', display: 'inline-block' }}></span>
          </div>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8a8275' }}>Portfolio Tracker</div>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <div className="display-font" style={{ fontSize: 26, color: '#e8e3d8', marginBottom: 4 }}>
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </div>
          <div style={{ color: '#8a8275', fontSize: 13, marginBottom: 28 }}>
            {mode === 'signin' ? 'Sign in to access your portfolio' : 'Start tracking your investments'}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="stat-label" style={{ display: 'block', marginBottom: 10 }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b6358' }} />
              <input className="input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={onKey} placeholder="your_username" autoComplete="username" style={{ paddingLeft: 40 }} />
            </div>
          </div>

          <div style={{ marginBottom: mode === 'signup' ? 16 : 24 }}>
            <label className="stat-label" style={{ display: 'block', marginBottom: 10 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b6358' }} />
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={onKey} placeholder="••••••••" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} style={{ paddingLeft: 40 }} />
            </div>
          </div>

          {mode === 'signup' && (
            <div style={{ marginBottom: 24 }}>
              <label className="stat-label" style={{ display: 'block', marginBottom: 10 }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b6358' }} />
                <input className="input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyDown={onKey} placeholder="••••••••" autoComplete="new-password" style={{ paddingLeft: 40 }} />
              </div>
            </div>
          )}

          {error && (
            <div style={{ marginBottom: 16, padding: 10, background: 'rgba(212, 97, 94, 0.1)', border: '1px solid #d4615e40', borderRadius: 3, color: '#d4615e', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={13} /> {error}
            </div>
          )}

          <button className="btn-primary" onClick={submit} disabled={busy} style={{ width: '100%' }}>
            {busy ? <Loader2 size={15} className="spin" /> : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#8a8275' }}>
            {mode === 'signin' ? "Don't have an account?" : 'Already have one?'}{' '}
            <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }} style={{ background: 'none', border: 'none', color: '#d97757', cursor: 'pointer', fontWeight: 600, fontSize: 13, padding: 0 }}>
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 20, padding: 12, fontSize: 11, color: '#6b6358', textAlign: 'center', lineHeight: 1.6 }}>
          Accounts are stored in your browser. Don't reuse passwords from other sites.
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#1a1815' }} />}>
      <AuthInner />
    </Suspense>
  );
}
