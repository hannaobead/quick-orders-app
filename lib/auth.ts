import { getBrowserClient } from './supabase';

export async function signIn(email: string, password: string) {
  const supabase = getBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data.session;
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
