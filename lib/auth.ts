import { getBrowserClient } from './supabase';

export async function signIn(email: string, password: string) {
  // Use server-side proxy to avoid Supabase CORS restrictions on this subdomain
  const res = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Invalid login credentials');

  // Inject the session into the browser Supabase client so getSession() works
  const supabase = getBrowserClient();
  await supabase.auth.setSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });
  return data;
}

export async function signOut() {
  const supabase = getBrowserClient();
  await supabase.auth.signOut();
}

// Mobile-safe: uses getUser() which hits the server instead of relying on local storage
export async function getSession() {
  const supabase = getBrowserClient();

  // First try getSession (fast, local)
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session) return sessionData.session;

  // Fallback: refreshSession forces a server round-trip — works on mobile
  const { data: refreshData } = await supabase.auth.refreshSession();
  return refreshData.session ?? null;
}
