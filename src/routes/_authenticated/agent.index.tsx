import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge, Btn, Card, Progress, SectionTitle, StatCard } from "@/components/ui-kit";
import { agentSummary, fmt } from "@/lib/data";
import { useStore } from "@/lib/store";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/agent/")({
  head: () => meta("لوحة الوكيل", "الحصة المستلمة والموزعة والمتبقية للوكيل"),
  component: AgentDash,
});

function AgentDash() {
  const { state, session } = useStore();
  const id = session.agentId ?? "";
  const batch = state.batches.find((b) => b.status === "open");
  const s = agentSummary(state, id, batch?.id ?? "none");
  const list = state.deliveries.filter((d) => d.agentId === id && d.batchId === batch?.id).reverse();
  return (
    <>
      <div className="mb-2 text-sm text-muted-foreground">الدفعة الحالية: <b>{batch?.code ?? "لا توجد"}</b></div>
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="المستلم" value={s.received} />
        <StatCard label="الموزع" value={s.distributed} tone="gold" />
        <StatCard label="المتبقي" value={s.remaining} tone="muted" />
      </div>
      <Card className="mt-3 p-3"><Progress value={s.distributed} max={s.received} /></Card>
      {s.adjustments !== 0 && <p className="mt-2 text-xs text-muted-foreground">تسويات موثقة من المصنع: {fmt(s.adjustments)}</p>}
      <p className="mt-2 text-xs text-muted-foreground">🔒 الحصة يحددها المصنع ولا يمكن للوكيل تعديلها.</p>
      <Link to="/agent/delivery"><Btn className="mt-4 w-full" variant="gold">+ تسجيل تسليم</Btn></Link>
      <SectionTitle>عمليات التسليم</SectionTitle>
      <div className="space-y-2">
        {list.map((d) => (
          <Card key={d.id} className="flex items-center justify-between p-3">
            <div><div className="font-bold">{d.recipientName}</div><div className="text-xs text-muted-foreground">{d.date} · {d.time}</div></div>
            <div className="flex items-center gap-2"><b>{fmt(d.quantity)}</b>{d.status === "pending" ? <Badge tone="gold">قيد الاعتماد</Badge> : <Badge>معتمد</Badge>}</div>
          </Card>
        ))}
        {!list.length && <Card className="text-center text-muted-foreground">لا توجد عمليات بعد</Card>}
      </div>
    </>
  );
}
