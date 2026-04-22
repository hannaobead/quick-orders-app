'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { createOrder } from '@/lib/orders';
import OrderForm from '@/components/OrderForm';

export default function NewOrderPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (data: Parameters<typeof createOrder>[1]) => {
    setError(null);
    startTransition(async () => {
      try {
        const session = await getSession();
        if (!session) { router.push('/login'); return; }
        await createOrder(session.access_token, data);
        router.push('/');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'שגיאה ביצירת ההזמנה');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800 transition">
          ← חזרה
        </button>
        <h1 className="text-lg font-bold text-gray-800">הזמנה חדשה</h1>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}
        <OrderForm onSubmit={handleSubmit} loading={isPending} submitLabel="צור הזמנה" />
      </main>
    </div>
  );
}
