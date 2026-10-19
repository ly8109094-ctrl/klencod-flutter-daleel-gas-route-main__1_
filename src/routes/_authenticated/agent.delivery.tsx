import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, Card, Field, SectionTitle } from "@/components/ui-kit";
import { agentSummary, fmt, hasInvalidNameChars, normalizeName } from "@/lib/data";
import { useStore } from "@/lib/store";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/agent/delivery")({
  head: () => meta("تسليم جديد", "نموذج تسجيل تسليم أسطوانات غاز لمستلم"),
  component: Delivery,
});

function Delivery() {
  const { state, session, addDelivery } = useStore();
  const go = useNavigate();
  const available = state.batches.filter(b => b.status === "open" && state.allocations.some(a => a.batchId === b.id && a.agentId === session.agentId));
  const [batchId, setBatchId] = useState("");
  const batch = available.find(b => b.id === batchId) ?? available[0];
  const s = agentSummary(state, session.agentId ?? "", batch?.id ?? "none");
  const now = new Date();
  const [f, setF] = useState({
    recipientName: "", quantity: 1, citizenId: "",
    date: now.toISOString().slice(0, 10), time: now.toTimeString().slice(0, 5),
  });
  const [err, setErr] = useState("");

  if (!batch) return <Card className="text-center">لا توجد دفعة مفتوحة حالياً</Card>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.recipientName.trim()) return setErr("أدخل اسم المستلم");
    if (hasInvalidNameChars(f.recipientName)) return setErr("الاسم يجب أن يحتوي على حروف فقط دون أرقام أو رموز");
    const key = normalizeName(f.recipientName);
    if (state.deliveries.some(d => d.batchId === batch.id && normalizeName(d.recipientName) === key))
      return setErr("هذا الاسم مسجل مسبقاً في هذه الدفعة وتم استلام حصته");
    if (f.quantity < 1) return setErr("الكمية يجب أن تكون ١ على الأقل");
    if (f.quantity > s.remaining) return setErr(`الكمية تتجاوز المتبقي (${fmt(s.remaining)})`);
    try { await addDelivery({
      agentId: session.agentId ?? "", batchId: batch.id, recipientName: f.recipientName.trim(),
      quantity: f.quantity, date: f.date, time: f.time,
      ...(state.settings.collectCitizenId && f.citizenId ? { citizenId: f.citizenId } : {}),
    });
    go({ to: "/agent" }); } catch(e) { setErr(e instanceof Error ? e.message : "تعذر حفظ التسليم"); }
  };

  return (
    <>
      <SectionTitle>تسجيل تسليم — المتبقي {fmt(s.remaining)}</SectionTitle>
      <Card>
        <form onSubmit={submit} className="space-y-3">
          <label className="block text-sm font-bold">الدفعة<select aria-label="الدفعة" className="mt-1 w-full rounded-lg border border-input bg-card p-3" value={batch.id} onChange={e=>setBatchId(e.target.value)}>{available.map(b=><option key={b.id} value={b.id}>{b.code}</option>)}</select></label>
          <Field label="اسم المستلم" value={f.recipientName} onChange={(e) => setF({ ...f, recipientName: e.target.value })} required />
          <Field label="الكمية (أسطوانة)" type="number" min={1} max={s.remaining} value={f.quantity} onChange={(e) => setF({ ...f, quantity: Number(e.target.value) })} />
          <div className="grid grid-cols-2 gap-2">
            <Field label="التاريخ" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
            <Field label="الوقت" type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} />
          </div>
          {state.settings.collectCitizenId && (
            <Field label="رقم الهوية (اختياري)" hint="لا يظهر في البوابة العامة" value={f.citizenId} onChange={(e) => setF({ ...f, citizenId: e.target.value })} />
          )}
          {err && <p className="text-sm font-bold text-destructive">{err}</p>}
          <Btn type="submit" className="w-full">حفظ التسليم</Btn>
        </form>
      </Card>
    </>
  );
}
