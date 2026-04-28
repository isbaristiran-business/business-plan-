'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, Wallet, Plus, Activity, Target, Search, LogOut } from 'lucide-react';
import { signOut } from '@/lib/auth';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/portfolio' },
  { id: 'holdings', label: 'Holdings', icon: Wallet, href: '/portfolio?tab=holdings' },
  { id: 'add', label: 'Log Investment', icon: Plus, href: '/portfolio?tab=add' },
  { id: 'analytics', label: 'Analytics', icon: Activity, href: '/portfolio?tab=analytics' },
  { id: 'insights', label: 'Insights', icon: Target, href: '/portfolio?tab=insights' },
  { id: 'research', label: 'Research', icon: Search, href: '/research' },
];

export default function Sidebar({
  username,
  saving,
  activeTab,
  onTabChange,
}: {
  username: string;
  saving?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (item: typeof NAV_ITEMS[number]) => {
    if (item.id === 'research') {
      router.push('/research');
    } else if (onTabChange) {
      onTabChange(item.id);
    } else {
      router.push(item.href);
    }
  };

  const handleLogout = () => {
    signOut();
    router.push('/');
  };

  return (
    <aside style={{ width: 240, background: '#1f1c18', borderRight: '1px solid #2e2a25', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div style={{ padding: '32px 24px 24px', borderBottom: '1px solid #2e2a25', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="display-font" style={{ fontSize: 28, fontWeight: 600, color: '#e8e3d8' }}>Ledger</span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97757', display: 'inline-block' }}></span>
          </div>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8a8275', marginTop: 6 }}>Portfolio Tracker</div>
        </div>
      </Link>

      <nav className="sidebar-nav" style={{ flex: 1, padding: '20px 0' }}>
        {NAV_ITEMS.map(item => {
          const isActive = item.id === 'research'
            ? pathname === '/research'
            : pathname === '/portfolio' && (activeTab || 'dashboard') === item.id;
          return (
            <button
              key={item.id}
              className={`nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleClick(item)}
            >
              <item.icon size={15} strokeWidth={1.5} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: 16, borderTop: '1px solid #2e2a25' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #d97757, #c2410c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a1815', fontWeight: 700, fontSize: 13 }}>
            {username.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: '#e8e3d8', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username}</div>
            <div style={{ fontSize: 10, color: saving ? '#d97757' : '#6b6358', letterSpacing: '0.05em' }}>
              {saving ? 'saving…' : 'all saved'}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ width: '100%', background: 'transparent', color: '#8a8275', border: '1px solid #2e2a25', padding: '8px 12px', borderRadius: 3, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          <LogOut size={11} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
