'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { fetchOrders, updateOrder, type ManualOrder } from '@/lib/orders';
import OrderForm from '@/components/OrderForm';

export default function EditOrderPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<ManualOrder | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) { router.push('/login'); return; }
      setToken(session.access_token);
      try {
        const orders = await fetchOrders(session.access_token);
        const found = orders.find((o) => o.id === id);
        if (!found) { router.push('/'); return; }
        setOrder(found);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'שגיאה בטעינה');
      }
    });
  }, [id, router]);

  const handleSubmit = (data: Omit<ManualOrder, 'id' | 'priority_rank' | 'created_at'>) => {
    if (!token || !order) return;
    setError(null);
    startTransition(async () => {
      try {
        await updateOrder(token, { ...order, ...data });
        router.push('/');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'שגיאה בשמירה');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800 transition">
          ← חזרה
        </button>
        <h1 className="text-lg font-bold text-gray-800">עריכת הזמנה</h1>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}
        {!order ? (
          <div className="text-center text-gray-400 py-16 text-sm">טוען...</div>
        ) : (
          <OrderForm onSubmit={handleSubmit} loading={isPending} submitLabel="שמור שינויים" initial={order} />
        )}
      </main>
    </div>
  );
}
