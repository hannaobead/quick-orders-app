'use client';

import { useState } from 'react';
import type { ManualOrder } from '@/lib/orders';

type FormData = Omit<ManualOrder, 'id' | 'priority_rank' | 'created_at'>;

const PRIORITIES = ['נמוכה', 'רגילה', 'דחופה', 'הכי דחופה'];
const STATUSES = ['חדש', 'בטיפול', 'ממתין ללקוח', 'מוכן', 'נמסר', 'בוטל'];

export default function OrderForm({
  onSubmit,
  loading,
  submitLabel,
  initial,
}: {
  onSubmit: (data: FormData) => void;
  loading: boolean;
  submitLabel: string;
  initial?: ManualOrder;
}) {
  const [form, setForm] = useState<FormData>({
    customer_name: initial?.customer_name ?? '',
    phone: initial?.phone ?? '',
    product_name: initial?.product_name ?? '',
    order_details: initial?.order_details ?? '',
    due_date: initial?.due_date ?? '',
    priority: initial?.priority ?? 'רגילה',
    status: initial?.status ?? 'חדש',
    notes: initial?.notes ?? '',
  });

  const set = (key: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value || null }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      phone: form.phone || null,
      order_details: form.order_details || null,
      due_date: form.due_date || null,
      notes: form.notes || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-5 shadow-sm">
      <Field label="שם לקוח *">
        <input
          required
          type="text"
          value={form.customer_name ?? ''}
          onChange={(e) => set('customer_name', e.target.value)}
          className={input}
          placeholder="ישראל ישראלי"
        />
      </Field>

      <Field label="טלפון">
        <input
          type="tel"
          value={form.phone ?? ''}
          onChange={(e) => set('phone', e.target.value)}
          className={input}
          placeholder="050-0000000"
          dir="ltr"
        />
      </Field>

      <Field label="מוצר / שירות *">
        <input
          required
          type="text"
          value={form.product_name ?? ''}
          onChange={(e) => set('product_name', e.target.value)}
          className={input}
          placeholder="10x15 × 50 תמונות"
        />
      </Field>

      <Field label="פרטי הזמנה">
        <textarea
          rows={3}
          value={form.order_details ?? ''}
          onChange={(e) => set('order_details', e.target.value)}
          className={input}
          placeholder="פרטים נוספים..."
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="עדיפות">
          <select
            value={form.priority ?? 'רגילה'}
            onChange={(e) => set('priority', e.target.value)}
            className={input}
          >
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>

        <Field label="סטטוס">
          <select
            value={form.status ?? 'חדש'}
            onChange={(e) => set('status', e.target.value)}
            className={input}
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      <Field label="תאריך יעד">
        <input
          type="date"
          value={form.due_date ?? ''}
          onChange={(e) => set('due_date', e.target.value)}
          className={input}
          dir="ltr"
        />
      </Field>

      <Field label="הערות פנימיות">
        <textarea
          rows={2}
          value={form.notes ?? ''}
          onChange={(e) => set('notes', e.target.value)}
          className={input}
          placeholder="הערות לצוות..."
        />
      </Field>

      <button
        type="submit"
        disabled={loading}
        className="bg-gray-900 text-white font-semibold rounded-xl py-3 text-sm hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-1"
      >
        {loading ? 'שומר...' : submitLabel}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

const input = 'border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 w-full bg-white';
