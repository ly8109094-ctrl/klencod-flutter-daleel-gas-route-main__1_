import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Field, SectionTitle } from "@/components/ui-kit";
import { fmt, toPublicDelivery } from "@/lib/data";
import { useStore } from "@/lib/store";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/public/search")({
  head: () => meta("بحث عن مستلم", "ابحث باسم المستلم في سجلات توزيع الغاز"),
  component: Search,
});

function Search() {
  const { state } = useStore();
  const [q, setQ] = useState("");
  const term = q.trim();
  const results = term.length < 2 ? [] : state.deliveries
    .filter((d) => d.status === "approved" && d.recipientName.includes(term))
    .map((d) => ({ ...toPublicDelivery(d), agent: state.agents.find((a) => a.id === d.agentId) }));
  return (
    <>
      <SectionTitle>بحث عن مستلم</SectionTitle>
      <Field label="اسم المستلم" placeholder="اكتب حرفين على الأقل" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="mt-4 space-y-2">
        {results.map((r) => (
          <Card key={r.id} className="flex justify-between p-3 text-sm">
            <div><b>{r.recipientName}</b>
              {r.agent && <Link to="/public/agents/$id" params={{ id: r.agent.id }} className="block text-xs text-primary">{r.agent.name}</Link>}
            </div>
            <span className="text-muted-foreground">{r.date} · <b className="text-foreground">{fmt(r.quantity)}</b></span>
          </Card>
        ))}
        {term.length >= 2 && !results.length && <Card className="text-center text-muted-foreground">لا توجد نتائج</Card>}
      </div>
    </>
  );
}
