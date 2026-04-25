'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSession, signOut } from '@/lib/auth';
import { fetchNeeds, addNeed, toggleNeed, deleteNeed, subscribeNeeds, type StoreNeed } from '@/lib/needs';

export default function NeedsPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [needs, setNeeds] = useState<StoreNeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [note, setNote] = useState('');
  const [adding, setAdding] = useState(false);
  const itemRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSession().then((session) => {
      if (!session) { router.push('/login'); return; }
      setAuthed(true);
    });
  }, [router]);

  const load = async () => {
    try {
      const data = await fetchNeeds();
      setNeeds(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בטעינה');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authed) return;
    void load();
    return subscribeNeeds(() => void load());
  }, [authed]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.trim()) return;
    setAdding(true);
    try {
      const created = await addNeed(item, parseInt(quantity) || 1, note);
      setNeeds((prev) => [created, ...prev]);
      setItem('');
      setQuantity('1');
      setNote('');
      itemRef.current?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בהוספה');
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (need: StoreNeed) => {
    setNeeds((prev) => prev.map((n) => n.id === need.id ? { ...n, done: !n.done } : n));
    try {
      await toggleNeed(need.id, !need.done);
    } catch {
      setNeeds((prev) => prev.map((n) => n.id === need.id ? { ...n, done: need.done } : n));
    }
  };

  const handleDelete = async (id: string) => {
    setNeeds((prev) => prev.filter((n) => n.id !== id));
    try {
      await deleteNeed(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה במחיקה');
      void load();
    }
  };

  const pending = needs.filter((n) => !n.done);
  const done = needs.filter((n) => n.done);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-700 transition">← הזמנות</Link>
          <h1 className="text-lg font-bold text-gray-800">חוסרים בחנות</h1>
        </div>
        <button
          onClick={async () => { await signOut(); router.push('/login'); }}
          className="text-sm text-gray-400 hover:text-gray-700 transition"
        >
          יציאה
        </button>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-5">

        {/* Add form */}
        <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              ref={itemRef}
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="שם פריט..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              required
            />
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="כמות"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="הערה (אופציונלי)..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <button
              type="submit"
              disabled={adding || !item.trim()}
              className="bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 transition disabled:opacity-40 shrink-0"
            >
              {adding ? '...' : '+ הוסף'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Pending list */}
        {loading ? (
          <div className="text-center text-gray-400 py-10 text-sm">טוען...</div>
        ) : (
          <>
            {pending.length === 0 && done.length === 0 && (
              <div className="text-center text-gray-400 py-10 text-sm">אין חוסרים — הכל במלאי 🎉</div>
            )}

            {pending.length > 0 && (
              <div className="flex flex-col gap-2">
                {pending.map((need) => (
                  <NeedRow key={need.id} need={need} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </div>
            )}

            {/* Done section */}
            {done.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-gray-400 px-1">הגיע ({done.length})</p>
                {done.map((need) => (
                  <NeedRow key={need.id} need={need} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function NeedRow({
  need,
  onToggle,
  onDelete,
}: {
  need: StoreNeed;
  onToggle: (n: StoreNeed) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className={`bg-white rounded-xl border px-4 py-3 flex items-center gap-3 shadow-sm transition ${need.done ? 'border-gray-100 opacity-50' : 'border-gray-200'}`}>
      <button
        onClick={() => onToggle(need)}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
          need.done ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-gray-500'
        }`}
      >
        {need.done && <span className="text-white text-xs">✓</span>}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${need.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {need.item}
          <span className="text-gray-400 font-normal mr-1">× {need.quantity}</span>
        </p>
        {need.note && <p className="text-xs text-gray-400 mt-0.5">{need.note}</p>}
      </div>

      <button
        onClick={() => onDelete(need.id)}
        className="text-gray-300 hover:text-red-400 transition text-lg leading-none shrink-0"
        title="מחק"
      >
        ×
      </button>
    </div>
  );
}
