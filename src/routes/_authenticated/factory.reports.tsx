import { createFileRoute } from "@tanstack/react-router";
import { Badge, Btn, Card, SectionTitle } from "@/components/ui-kit";
import { agentSummary, fmt, canDeleteBatch } from "@/lib/data";
import { useStore } from "@/lib/store";
import {useState} from "react";
import {Download,Trash2} from "lucide-react";
import {appTitle,developerHeader,logoUrl} from "@/lib/brand";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/_authenticated/factory/reports")({
  head: () => meta("التقارير والأرشيف", "تقارير التوزيع والدفعات المؤرشفة"),
  component: Reports,
});

function Reports() {
  const { state,deleteBatch } = useStore();
  const [err,setErr]=useState("");
  const sorted = [...state.batches].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <>
      <div className="print-brand"><img src={logoUrl} alt="دليل الغاز"/><h1>{appTitle}</h1><p>{developerHeader}</p></div>
      {err&&<p role="alert" className="text-destructive">{err}</p>}
      <SectionTitle action={<Btn className="no-print" onClick={()=>window.print()}><Download size={16}/>تصدير PDF</Btn>}>تقرير الدفعات</SectionTitle>
      <div className="space-y-3">
        {sorted.map((b) => {
          const rows = state.agents.map((a) => ({ a, s: agentSummary(state, a.id, b.id) })).filter((r) => r.s.received);
          const dist = rows.reduce((x, r) => x + r.s.distributed, 0);
          const rem = rows.reduce((x, r) => x + r.s.remaining, 0);
          return (
            <Card key={b.id} className="print-record">
              <div className="flex items-center justify-between">
                <div className="font-extrabold">{b.code}</div>
                {b.status === "archived" ? <Badge tone="muted">مؤرشفة {b.closedAt}</Badge> : <Badge>مفتوحة</Badge>}
              </div>
              <table className="mt-3 w-full text-right text-sm"><thead><tr><th>الوكيل</th><th>الحصة</th><th>الموزع</th><th>المتبقي</th></tr></thead><tbody>{rows.map(r=><tr key={r.a.id}><td>{r.a.name}</td><td>{fmt(r.s.received)}</td><td>{fmt(r.s.distributed)}</td><td>{fmt(r.s.remaining)}</td></tr>)}</tbody></table>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-sm">
                <div><div className="text-muted-foreground">المخصص</div><b>{fmt(b.totalCylinders)}</b></div>
                <div><div className="text-muted-foreground">الموزع</div><b className="text-gold-deep">{fmt(dist)}</b></div>
                <div><div className="text-muted-foreground">المتبقي</div><b>{fmt(rem)}</b></div>
              </div>
              {b.status==="archived"&&<Btn variant="outline" className="no-print mt-3 text-destructive" onClick={async()=>{const confirmation=prompt(`حذف نهائي لجميع سجلات الدفعة. اكتب ${b.code} للتأكيد:`);if(!confirmation || !canDeleteBatch(b,confirmation))return;try{await deleteBatch(b.id,confirmation);}catch(e){setErr(e instanceof Error?e.message:"تعذر حذف الدفعة");}}}><Trash2 size={16}/>حذف نهائي</Btn>}
            </Card>
          );
        })}
      </div>
      <SectionTitle>سجل التسليمات</SectionTitle>
      <div className="overflow-x-auto"><table className="w-full text-right text-sm"><thead><tr><th>المستلم</th><th>الوكيل</th><th>الدفعة</th><th>الكمية</th><th>التاريخ</th></tr></thead><tbody>{state.deliveries.map(d=><tr key={d.id} className="border-b border-border"><td className="py-2">{d.recipientName}</td><td>{state.agents.find(a=>a.id===d.agentId)?.name}</td><td>{state.batches.find(b=>b.id===d.batchId)?.code}</td><td>{fmt(d.quantity)}</td><td>{d.date}</td></tr>)}</tbody></table></div>
      <SectionTitle>سجل التسويات</SectionTitle>
      <Card className="space-y-2 text-sm">
        {state.adjustments.map((x) => (
          <div key={x.id} className="flex justify-between border-b border-border pb-2 last:border-0">
            <span>{state.agents.find((a) => a.id === x.agentId)?.name} — {x.reason}</span>
            <b className={x.amount < 0 ? "text-destructive" : "text-primary"}>{fmt(x.amount)}</b>
          </div>
        ))}
        {!state.adjustments.length && <div className="text-muted-foreground">لا توجد تسويات</div>}
      </Card>
    </>
  );
}
