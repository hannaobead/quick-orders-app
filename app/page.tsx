'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSession, signOut } from '@/lib/auth';
import { getBrowserClient } from '@/lib/supabase';
import { fetchOrders, updateOrderStatus, type ManualOrder } from '@/lib/orders';

const STATUSES = ['חדש', 'בטיפול', 'ממתין ללקוח', 'מוכן', 'נמסר', 'בוטל'];

const STATUS_COLORS: Record<string, string> = {
  'חדש': 'bg-blue-100 text-blue-800',
  'בטיפול': 'bg-yellow-100 text-yellow-800',
  'ממתין ללקוח': 'bg-purple-100 text-purple-800',
  'מוכן': 'bg-green-100 text-green-800',
  'נמסר': 'bg-gray-100 text-gray-600',
  'בוטל': 'bg-red-100 text-red-700',
};

const PRIORITY_COLORS: Record<string, string> = {
  'נמוכה': 'text-gray-400',
  'רגילה': 'text-gray-600',
  'דחופה': 'text-orange-500',
  'הכי דחופה': 'text-red-600 font-bold',
};

export default function OrdersPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [orders, setOrders] = useState<ManualOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('חדש');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getBrowserClient();

    // Start loading orders immediately from local session (fast path)
    void getSession().then((session) => {
      if (!session) { router.push('/login'); return; }
      setToken(session.access_token);
    });

    // onAuthStateChange handles token refresh / logout on mobile
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { router.push('/login'); return; }
      setToken((prev) => prev === session.access_token ? prev : session.access_token);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const load = useCallback(async (t: string) => {
    // Show cached orders instantly while fetching fresh data
    const cached = sessionStorage.getItem('orders_cache');
    if (cached) {
      try { setOrders(JSON.parse(cached)); setLoading(false); } catch {}
    }

    setError(null);
    try {
      const data = await fetchOrders(t);
      setOrders(data);
      sessionStorage.setItem('orders_cache', JSON.stringify(data));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'שגיאה בטעינה';
      if (!cached) setError(`${msg} (token: ${t ? t.slice(0, 10) + '...' : 'none'})`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) void load(token);
  }, [token, load]);

  const handleStatusChange = async (order: ManualOrder, status: string) => {
    if (!token) return;
    setUpdatingId(order.id);
    try {
      const updated = await updateOrderStatus(token, order.id, status);
      setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'שגיאה בעדכון');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const filtered = statusFilter ? orders.filter((o) => o.status === statusFilter) : orders;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">הזמנות מהירות</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/needs"
            className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-2 rounded-lg transition"
          >
            חוסרים
          </Link>
          <Link
            href="/new"
            className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            + הזמנה חדשה
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-800 transition"
          >
            יציאה
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-5 flex-wrap">
          {STATUSES.map((s) => {
            const count = orders.filter((o) => o.status === s).length;
            if (!count) return null;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${statusFilter === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'}`}
              >
                {s} ({count})
              </button>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-16 text-sm">טוען...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-16 text-sm">אין הזמנות</div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 px-4 py-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-semibold ${PRIORITY_COLORS[order.priority] ?? ''}`}>
                        {order.priority}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                      {order.due_date && (
                        <span className="text-xs text-gray-400">
                          עד {new Date(order.due_date).toLocaleDateString('he-IL')}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-gray-900 text-sm truncate">{order.customer_name}</p>
                    <p className="text-sm text-gray-600 truncate">{order.product_name}</p>
                    {order.phone && <p className="text-xs text-gray-400 mt-0.5" dir="ltr">{order.phone}</p>}
                    {order.order_details && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{order.order_details}</p>
                    )}
                    {order.notes && (
                      <p className="text-xs text-orange-600 mt-1">📝 {order.notes}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 items-end shrink-0">
                    <Link
                      href={`/edit/${order.id}`}
                      className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-2 py-1 transition"
                    >
                      עריכה
                    </Link>
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white disabled:opacity-50 cursor-pointer"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
