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

export async function getSession() {
  const supabase = getBrowserClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}
