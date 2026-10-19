import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, Btn, Card, Field, SectionTitle } from "@/components/ui-kit";
import { agentSummary, fmt } from "@/lib/data";
import { useStore } from "@/lib/store";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/factory/batches")({
  head: () => meta("الدفعات والحصص", "إنشاء دفعات الغاز وتوزيع الحصص على الوكلاء"),
  component: Batches,
});

function Batches() {
  const { state, createBatch, closeBatch, addAdjustment } = useStore();
  const [err,setErr]=useState("");
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [q, setQ] = useState<Record<string, number>>({});
  const [adj, setAdj] = useState({ batchId: "", agentId: "", amount: 0, reason: "" });
  const total = Object.values(q).reduce((a, x) => a + (x || 0), 0);
  const openBatches = state.batches.filter((b) => b.status === "open");

  return (
    <>
      {err && <p role="alert" className="text-destructive">{err}</p>}
      <SectionTitle action={<Btn onClick={() => setOpen(!open)}>+ دفعة جديدة</Btn>}>الدفعات المفتوحة</SectionTitle>
      {open && (
        <Card className="mb-4">
          <form className="space-y-3" onSubmit={async (e) => {
            e.preventDefault();
            if (!code.trim() || total <= 0) return;
            try { await createBatch(code, q); setCode(""); setQ({}); setOpen(false); } catch(e) { setErr(e instanceof Error?e.message:"تعذر إنشاء الدفعة"); }
          }}>
            <Field label="رمز الدفعة" placeholder="مثال: دفعة-2026-11" value={code} onChange={(e) => setCode(e.target.value)} required />
            <div className="text-sm font-bold">حصص الوكلاء (أسطوانة)</div>
            {state.agents.map((a) => (
              <div key={a.id} className="flex items-center gap-2">
                <span className="flex-1 text-sm">{a.name}</span>
                <input type="number" min={0} className="w-28 rounded-xl border border-input bg-card px-3 py-2"
                  value={q[a.id] ?? ""} onChange={(e) => setQ({ ...q, [a.id]: Math.max(0, Number(e.target.value)) })} />
              </div>
            ))}
            <div className="font-bold text-primary">الإجمالي: {fmt(total)}</div>
            <Btn type="submit" disabled={total <= 0}>إنشاء الدفعة</Btn>
          </form>
        </Card>
      )}
      <div className="space-y-3">
        {openBatches.map((b) => (
          <Card key={b.id}>
            <div className="mb-2 flex items-center justify-between">
              <div><div className="font-extrabold">{b.code}</div><div className="text-xs text-muted-foreground">أنشئت {b.createdAt} · {fmt(b.totalCylinders)} أسطوانة</div></div>
              <Badge>مفتوحة</Badge>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="text-muted-foreground"><th className="text-right">الوكيل</th><th>الحصة</th><th>الموزع</th><th>المتبقي</th></tr></thead>
              <tbody>
                {state.agents.map((a) => {
                  const s = agentSummary(state, a.id, b.id);
                  if (!s.received) return null;
                  return <tr key={a.id} className="border-t border-border text-center"><td className="py-1.5 text-right">{a.name}</td><td>{fmt(s.received)}</td><td>{fmt(s.distributed)}</td><td className="font-bold">{fmt(s.remaining)}</td></tr>;
                })}
              </tbody>
            </table>
            <Btn variant="outline" className="mt-3" onClick={async () => { if (confirm("إغلاق الدفعة وأرشفتها؟")) { try {await closeBatch(b.id);}catch(e){setErr(e instanceof Error?e.message:"تعذر الإغلاق");} } }}>إغلاق وأرشفة</Btn>
          </Card>
        ))}
        {!openBatches.length && <Card className="text-center text-muted-foreground">لا توجد دفعات مفتوحة</Card>}
      </div>

      <SectionTitle>تسوية موثقة</SectionTitle>
      <Card>
        <form className="space-y-3" onSubmit={async (e) => {
          e.preventDefault();
          if (!adj.batchId || !adj.agentId || !adj.amount || !adj.reason.trim()) return;
          try {await addAdjustment(adj); setAdj({ batchId: "", agentId: "", amount: 0, reason: "" });}catch(e){setErr(e instanceof Error?e.message:"تعذر حفظ التسوية");}
        }}>
          <div className="grid grid-cols-2 gap-2">
            <select className="rounded-xl border border-input bg-card px-3 py-2.5" value={adj.batchId} onChange={(e) => setAdj({ ...adj, batchId: e.target.value })}>
              <option value="">الدفعة</option>{openBatches.map((b) => <option key={b.id} value={b.id}>{b.code}</option>)}
            </select>
            <select className="rounded-xl border border-input bg-card px-3 py-2.5" value={adj.agentId} onChange={(e) => setAdj({ ...adj, agentId: e.target.value })}>
              <option value="">الوكيل</option>{state.agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <Field label="الكمية (+ أو −)" type="number" value={adj.amount || ""} onChange={(e) => setAdj({ ...adj, amount: Number(e.target.value) })} />
          <Field label="السبب / رقم المحضر" value={adj.reason} onChange={(e) => setAdj({ ...adj, reason: e.target.value })} />
          <Btn type="submit" variant="gold">تسجيل التسوية</Btn>
        </form>
      </Card>
    </>
  );
}
