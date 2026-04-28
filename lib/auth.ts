// Client-side auth helpers. Uses bcrypt for password hashing and
// localStorage for persistence. For a production app with multiple
// devices, swap these for real backend calls + JWT tokens.
'use client';

import bcrypt from 'bcryptjs';

const USERS_KEY = 'ledger:users';
const SESSION_KEY = 'ledger:session';
const PORTFOLIO_PREFIX = 'ledger:portfolio:';

export type User = { username: string };

export type Investment = {
  id: number;
  symbol: string;
  name: string;
  sector: string;
  type: 'Stock' | 'ETF' | 'Crypto';
  shares: number;
  buyPrice: number;
  commission: number;
  dateBought: string;
  finnhubSymbol?: string;
};

type StoredUser = {
  username: string;
  passwordHash: string;
  createdAt: string;
};

function getUsers(): Record<string, StoredUser> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setUsers(users: Record<string, StoredUser>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function signUp(username: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const cleanUser = username.trim().toLowerCase();
  if (!cleanUser || cleanUser.length < 3) return { ok: false, error: 'Username must be at least 3 characters' };
  if (!/^[a-z0-9_]+$/.test(cleanUser)) return { ok: false, error: 'Username can only contain letters, numbers, and underscores' };
  if (!password || password.length < 4) return { ok: false, error: 'Password must be at least 4 characters' };

  const users = getUsers();
  if (users[cleanUser]) return { ok: false, error: 'Username already taken — try signing in instead' };

  const passwordHash = await bcrypt.hash(password, 10);
  users[cleanUser] = { username: cleanUser, passwordHash, createdAt: new Date().toISOString() };
  setUsers(users);

  // Initialize empty portfolio
  localStorage.setItem(`${PORTFOLIO_PREFIX}${cleanUser}`, JSON.stringify([]));

  // Create session
  setSession({ username: cleanUser });
  return { ok: true };
}

export async function signIn(username: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const cleanUser = username.trim().toLowerCase();
  const users = getUsers();
  const user = users[cleanUser];

  if (!user) return { ok: false, error: 'No account found with that username' };
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { ok: false, error: 'Incorrect password' };

  setSession({ username: cleanUser });
  return { ok: true };
}

export function signOut() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSession(user: User) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

// Portfolio storage
export function getPortfolio(username: string): Investment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${PORTFOLIO_PREFIX}${username}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePortfolio(username: string, investments: Investment[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${PORTFOLIO_PREFIX}${username}`, JSON.stringify(investments));
}
