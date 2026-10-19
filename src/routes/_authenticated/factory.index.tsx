import { createFileRoute } from "@tanstack/react-router";
import { Card, Progress, SectionTitle, StatCard } from "@/components/ui-kit";
import { agentSummary, fmt, totals } from "@/lib/data";
import { useStore } from "@/lib/store";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/factory/")({
  head: () => meta("لوحة المصنع", "ملخص الحصص الموزعة والمتبقية لدى الوكلاء"),
  component: FactoryDash,
});

function FactoryDash() {
  const { state } = useStore();
  const t = totals(state);
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="عدد الوكلاء" value={state.agents.length} tone="muted" />
        <StatCard label="المخصص" value={t.allocated} />
        <StatCard label="الموزع" value={t.distributed} tone="gold" />
        <StatCard label="المتبقي" value={t.remaining} />
      </div>
      <SectionTitle>تقدم الوكلاء (كل الدفعات)</SectionTitle>
      <div className="space-y-2">
        {state.agents.map((a) => {
          const s = agentSummary(state, a.id);
          return (
            <Card key={a.id} className="p-3">
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-bold">{a.name}</span>
                <span className="text-muted-foreground">متبقي {fmt(s.remaining)}</span>
              </div>
              <Progress value={s.distributed} max={s.received} />
            </Card>
          );
        })}
      </div>
    </>
  );
}
