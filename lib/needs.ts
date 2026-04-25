import { getBrowserClient } from './supabase';

export type StoreNeed = {
  id: string;
  item: string;
  quantity: number;
  note: string | null;
  done: boolean;
  created_at: string;
};

export async function fetchNeeds(): Promise<StoreNeed[]> {
  const supabase = getBrowserClient();
  const { data, error } = await supabase
    .from('store_needs')
    .select('*')
    .order('done', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function addNeed(item: string, quantity: number, note: string): Promise<StoreNeed> {
  const supabase = getBrowserClient();
  const { data, error } = await supabase
    .from('store_needs')
    .insert({ item: item.trim(), quantity, note: note.trim() || null })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function toggleNeed(id: string, done: boolean): Promise<void> {
  const supabase = getBrowserClient();
  const { error } = await supabase
    .from('store_needs')
    .update({ done })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteNeed(id: string): Promise<void> {
  const supabase = getBrowserClient();
  const { error } = await supabase
    .from('store_needs')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export function subscribeNeeds(onChange: () => void) {
  const supabase = getBrowserClient();
  const channel = supabase
    .channel('store_needs_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'store_needs' }, onChange)
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}
