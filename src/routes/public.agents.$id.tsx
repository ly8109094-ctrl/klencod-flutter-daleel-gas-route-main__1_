import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, Progress, SectionTitle, StatCard } from "@/components/ui-kit";
import { agentSummary, fmt, toPublicDelivery } from "@/lib/data";
import { useStore } from "@/lib/store";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/public/agents/$id")({
  head: () => meta("تفاصيل الوكيل", "أسماء المستلمين وتواريخ وكميات التسليم لدى الوكيل"),
  component: AgentPublic,
});

function AgentPublic() {
  const { id } = Route.useParams();
  const { state } = useStore();
  const agent = state.agents.find((a) => a.id === id);
  if (!agent) return <Card>الوكيل غير موجود. <Link to="/public" className="text-primary underline">رجوع</Link></Card>;
  const batch = state.batches.find((b) => b.status === "open");
  const s = agentSummary(state, id, batch?.id ?? "none");
  // Only public-safe fields are rendered.
  const list = state.deliveries
    .filter((d) => d.agentId === id && d.batchId === batch?.id && d.status === "approved")
    .map(toPublicDelivery);
  return (
    <>
      <Link to="/public" className="text-sm text-primary">→ كل الوكلاء</Link>
      <h2 className="mt-2 text-xl font-extrabold">{agent.name}</h2>
      <p className="text-sm text-muted-foreground">{agent.district} · {agent.area}</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <StatCard label="الحصة" value={s.received} />
        <StatCard label="الموزع" value={s.distributed} tone="gold" />
        <StatCard label="المتبقي" value={s.remaining} tone="muted" />
      </div>
      <Card className="mt-2 p-3"><Progress value={s.distributed} max={s.received} /></Card>
      <SectionTitle>المستلمون ({fmt(list.length)})</SectionTitle>
      <Card className="divide-y divide-border p-0">
        {list.map((d) => (
          <div key={d.id} className="flex justify-between px-4 py-3 text-sm">
            <span className="font-bold">{d.recipientName}</span>
            <span className="text-muted-foreground">{d.date} · <b className="text-foreground">{fmt(d.quantity)}</b></span>
          </div>
        ))}
        {!list.length && <div className="p-4 text-center text-muted-foreground">لا توجد عمليات</div>}
      </Card>
    </>
  );
}
