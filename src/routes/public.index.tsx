import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, Progress, SectionTitle } from "@/components/ui-kit";
import { agentSummary, fmt } from "@/lib/data";
import { useStore } from "@/lib/store";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/public/")({
  head: () => meta("الوكلاء والحصص", "قائمة وكلاء الغاز في أبين وحصصهم ونسبة التوزيع"),
  component: PublicList,
});

function PublicList() {
  const { state } = useStore();
  const batch = state.batches.find((b) => b.status === "open");
  return (
    <>
      <SectionTitle>{batch ? `الدفعة الحالية: ${batch.code}` : "لا توجد دفعة مفتوحة"}</SectionTitle>
      <div className="grid gap-2 md:grid-cols-2">
        {state.agents.map((a) => {
          const s = agentSummary(state, a.id, batch?.id ?? "none");
          return (
            <Link key={a.id} to="/public/agents/$id" params={{ id: a.id }}>
              <Card className="p-3 transition hover:border-gold">
                <div className="flex justify-between"><b>{a.name}</b><span className="text-xs text-muted-foreground">{a.district}</span></div>
                <div className="text-xs text-muted-foreground">{a.area}</div>
                <div className="my-2 flex justify-between text-xs"><span>الحصة {fmt(s.received)}</span><span>الموزع {fmt(s.distributed)}</span><span>المتبقي {fmt(s.remaining)}</span></div>
                <Progress value={s.distributed} max={s.received} />
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}
