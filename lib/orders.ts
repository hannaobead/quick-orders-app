// Hardcoded — this app only ever talks to the main Momento API
const API_BASE = 'https://momentoprint.app';

async function apiFetch(path: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload?.error ?? `HTTP ${res.status}`);
  return payload;
}

export type ManualOrder = {
  id: string;
  customer_name: string;
  phone: string | null;
  product_name: string;
  order_details: string | null;
  due_date: string | null;
  priority: string;
  priority_rank: number;
  status: string;
  notes: string | null;
  created_at: string;
};

export async function fetchOrders(token: string): Promise<ManualOrder[]> {
  const data = await apiFetch('/api/quick-orders', token);
  return data.orders ?? [];
}

export async function createOrder(token: string, body: Omit<ManualOrder, 'id' | 'priority_rank' | 'created_at'>): Promise<ManualOrder> {
  const data = await apiFetch('/api/quick-orders', token, { method: 'POST', body: JSON.stringify(body) });
  return data.order;
}

export async function updateOrderStatus(token: string, id: string, status: string): Promise<ManualOrder> {
  const data = await apiFetch('/api/quick-orders', token, { method: 'PATCH', body: JSON.stringify({ id, status }) });
  return data.order;
}

export async function updateOrder(token: string, order: ManualOrder): Promise<ManualOrder> {
  const data = await apiFetch('/api/quick-orders', token, { method: 'PUT', body: JSON.stringify(order) });
  return data.order;
}
