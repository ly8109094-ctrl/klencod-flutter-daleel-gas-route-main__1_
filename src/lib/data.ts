// DEMO DATA ONLY — no real database. Real permissions will be enforced server-side later.
export type Agent = { id: string; name: string; area: string; district: string; active: boolean };
export type Batch = {
  id: string;
  code: string;
  createdAt: string;
  totalCylinders: number;
  status: "open" | "archived";
  closedAt?: string;
};
export type Allocation = { id: string; batchId: string; agentId: string; quantity: number };
export type Delivery = {
  id: string;
  agentId: string;
  batchId: string;
  recipientName: string;
  quantity: number;
  date: string;
  time: string;
  status: "approved" | "pending";
  citizenId?: string;
};
export type Adjustment = {
  id: string;
  agentId: string;
  batchId: string;
  amount: number;
  reason: string;
  date: string;
};
export type AppState = {
  agents: Agent[];
  batches: Batch[];
  allocations: Allocation[];
  deliveries: Delivery[];
  adjustments: Adjustment[];
  settings: { collectCitizenId: boolean };
};

/** Business rule: remaining = received − approved deliveries + documented adjustments */
export function computeRemaining(received: number, approvedDelivered: number, adjustments: number) {
  return received - approvedDelivered + adjustments;
}

export function canDeleteBatch(batch: Batch, confirmation: string | null) {
  return batch.status === 'archived' && confirmation === batch.code;
}

export function agentSummary(s: AppState, agentId: string, batchId?: string) {
  const match = (x: { agentId: string; batchId: string }) =>
    x.agentId === agentId && (!batchId || x.batchId === batchId);
  const received = s.allocations.filter(match).reduce((a, x) => a + x.quantity, 0);
  const distributed = s.deliveries
    .filter((d) => match(d) && d.status === "approved")
    .reduce((a, x) => a + x.quantity, 0);
  const adjustments = s.adjustments.filter(match).reduce((a, x) => a + x.amount, 0);
  return { received, distributed, adjustments, remaining: computeRemaining(received, distributed, adjustments) };
}

export function totals(s: AppState) {
  return s.agents.reduce(
    (acc, a) => {
      const x = agentSummary(s, a.id);
      acc.allocated += x.received;
      acc.distributed += x.distributed;
      acc.remaining += x.remaining;
      return acc;
    },
    { allocated: 0, distributed: 0, remaining: 0 },
  );
}

export type PublicDelivery = { id: string; recipientName: string; quantity: number; date: string };
/** Strips private fields (citizen ID etc.) before showing anything publicly. */
export function toPublicDelivery(d: Delivery): PublicDelivery {
  return { id: d.id, recipientName: d.recipientName, quantity: d.quantity, date: d.date };
}

export const fmt = (n: number) => n.toLocaleString("ar-EG");

export const initialState: AppState = {
  settings: { collectCitizenId: false },
  agents: [
    { id: "a1", name: "وكالة الأمل للغاز", area: "زنجبار - حي الطميسي", district: "زنجبار", active: true },
    { id: "a2", name: "وكالة النور", area: "جعار - السوق", district: "خنفر", active: true },
    { id: "a3", name: "وكالة الوادي", area: "لودر - المركز", district: "لودر", active: true },
    { id: "a4", name: "وكالة الساحل", area: "أحور - الحصن", district: "أحور", active: true },
    { id: "a5", name: "وكالة الهضبة", area: "مودية - الشرقية", district: "مودية", active: true },
  ],
  batches: [
    { id: "b1", code: "دفعة-2026-08", createdAt: "2026-08-03", totalCylinders: 1500, status: "archived", closedAt: "2026-08-30" },
    { id: "b2", code: "دفعة-2026-10", createdAt: "2026-10-01", totalCylinders: 1800, status: "open" },
  ],
  allocations: [
    { id: "al1", batchId: "b1", agentId: "a1", quantity: 400 },
    { id: "al2", batchId: "b1", agentId: "a2", quantity: 350 },
    { id: "al3", batchId: "b1", agentId: "a3", quantity: 300 },
    { id: "al4", batchId: "b1", agentId: "a4", quantity: 250 },
    { id: "al5", batchId: "b1", agentId: "a5", quantity: 200 },
    { id: "al6", batchId: "b2", agentId: "a1", quantity: 450 },
    { id: "al7", batchId: "b2", agentId: "a2", quantity: 400 },
    { id: "al8", batchId: "b2", agentId: "a3", quantity: 350 },
    { id: "al9", batchId: "b2", agentId: "a4", quantity: 300 },
    { id: "al10", batchId: "b2", agentId: "a5", quantity: 300 },
  ],
  deliveries: [
    ...[
      ["a1", "b1", "صالح أحمد ناصر", 395],
      ["a2", "b1", "محمد علي حسين", 350],
      ["a3", "b1", "عبدالله سالم", 296],
      ["a4", "b1", "فاطمة عوض", 250],
      ["a5", "b1", "خالد مهدي", 198],
    ].map(([agentId, batchId, recipientName, quantity], i) => ({
      id: `old${i}`, agentId: agentId as string, batchId: batchId as string,
      recipientName: `${recipientName} (إجمالي الدفعة)`, quantity: quantity as number,
      date: "2026-08-25", time: "10:00", status: "approved" as const,
    })),
    { id: "d1", agentId: "a1", batchId: "b2", recipientName: "سالم عبدالله الفضلي", quantity: 2, date: "2026-10-10", time: "08:30", status: "approved" },
    { id: "d2", agentId: "a1", batchId: "b2", recipientName: "مريم حسن", quantity: 1, date: "2026-10-10", time: "09:15", status: "approved" },
    { id: "d3", agentId: "a1", batchId: "b2", recipientName: "ناصر محمد اليافعي", quantity: 120, date: "2026-10-11", time: "11:00", status: "approved" },
    { id: "d4", agentId: "a2", batchId: "b2", recipientName: "أحمد صالح", quantity: 150, date: "2026-10-12", time: "10:20", status: "approved" },
    { id: "d5", agentId: "a2", batchId: "b2", recipientName: "عائشة علي", quantity: 1, date: "2026-10-13", time: "13:40", status: "pending" },
    { id: "d6", agentId: "a3", batchId: "b2", recipientName: "حسين عوض", quantity: 200, date: "2026-10-12", time: "08:00", status: "approved" },
    { id: "d7", agentId: "a4", batchId: "b2", recipientName: "علي ناصر", quantity: 80, date: "2026-10-13", time: "09:00", status: "approved" },
    { id: "d8", agentId: "a5", batchId: "b2", recipientName: "سعيد محمد", quantity: 60, date: "2026-10-14", time: "12:10", status: "approved" },
  ],
  adjustments: [
    { id: "ad1", agentId: "a3", batchId: "b2", amount: -4, reason: "أسطوانات تالفة موثقة بمحضر", date: "2026-10-12" },
  ],
};

/** Strict Arabic name normalization (mirrors public.normalize_name in the database). */
export function normalizeName(n: string) {
  return n
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي")
    .replace(/[^\u0621-\u064Aa-zA-Z ]/g, " ")
    .replace(/(.)\1+/g, "$1")
    .replace(/\s+/g, " ").trim().toLowerCase();
}
export const hasInvalidNameChars = (n: string) => /[^\u0621-\u064A\u064B-\u065F\u0670\u0640a-zA-Z\s]/.test(n);
