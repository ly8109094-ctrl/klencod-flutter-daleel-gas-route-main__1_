import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Btn, Card, Field, SectionTitle } from "@/components/ui-kit";
import { agentSummary, fmt } from "@/lib/data";
import { useStore } from "@/lib/store";
import {supabase} from "@/integrations/supabase/client";
import { meta } from "@/lib/meta";
import { useServerFn } from "@tanstack/react-start";
import { setAgentTempPassword } from "@/lib/agent-password.functions";

export const Route = createFileRoute("/_authenticated/factory/agents")({
  head: () => meta("إدارة الوكلاء", "إضافة وتعديل الوكلاء ومناطقهم"),
  component: Agents,
});

const empty = { name: "", area: "", district: "" };

function Agents() {
  const { state, addAgent, updateAgent, assignAgent } = useStore();
  const [profiles,setProfiles]=useState<{id:string;display_name:string}[]>([]);
  const [err,setErr]=useState("");
  useEffect(()=>{supabase.from("profiles").select("id,display_name").then(({data})=>setProfiles(data??[]));},[]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.area.trim()) return;
    try { await (editing ? updateAgent(editing, form) : addAgent(form));
    setForm(empty); setEditing(null); setOpen(false); }catch(e){setErr(e instanceof Error?e.message:"تعذر الحفظ");}
  };

  const tempFn = useServerFn(setAgentTempPassword);
  const [temp, setTemp] = useState<{ id: string; pw: string } | null>(null);
  return (
    <>
      {err&&<p role="alert" className="text-destructive">{err}</p>}
      <SectionTitle action={<Btn onClick={() => { setForm(empty); setEditing(null); setOpen(!open); }}>+ وكيل جديد</Btn>}>الوكلاء والمناطق</SectionTitle>
      {open && (
        <Card className="mb-4">
          <form onSubmit={submit} className="space-y-3">
            <Field label="اسم الوكالة" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Field label="المديرية" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            <Field label="المنطقة / الحي" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} required />
            <div className="flex gap-2">
              <Btn type="submit">{editing ? "حفظ التعديل" : "إضافة"}</Btn>
              <Btn type="button" variant="ghost" onClick={() => setOpen(false)}>إلغاء</Btn>
            </div>
          </form>
        </Card>
      )}
      <div className="space-y-2">
        {state.agents.map((a) => {
          const s = agentSummary(state, a.id);
          return (
            <Card key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
              <div>
                <div className="font-bold">{a.name}</div>
                <div className="text-xs text-muted-foreground">{a.district} · {a.area}</div>
                <div className="mt-1 text-xs">مخصص {fmt(s.received)} · متبقي {fmt(s.remaining)}</div>
              </div>
              <label className="text-xs">ربط حساب الوكيل<select aria-label={`حساب ${a.name}`} className="mt-1 block max-w-52 rounded-lg border border-input bg-card p-2" defaultValue="" onChange={async e=>{if(!e.target.value)return;try{await assignAgent(a.id,e.target.value);setErr("تم ربط الحساب");}catch(error){setErr(error instanceof Error?error.message:"تعذر الربط");}}}><option value="">اختر الحساب</option>{profiles.map(p=><option key={p.id} value={p.id}>{p.display_name} · {p.id.slice(0,8)}</option>)}</select></label>
              <Btn variant="outline" onClick={() => { setForm({ name: a.name, area: a.area, district: a.district }); setEditing(a.id); setOpen(true); window.scrollTo({ top: 0 }); }}>تعديل</Btn>
              <Btn variant="gold" onClick={async () => { if (!confirm(`توليد كلمة سر مؤقتة للوكيل ${a.name}؟ ستتوقف كلمة السر الحالية.`)) return; try { const r = await tempFn({ data: { agentId: a.id } }); setTemp({ id: a.id, pw: r.password }); } catch (error) { setErr(error instanceof Error ? error.message : "تعذر التوليد"); } }}>توليد كلمة سر مؤقتة</Btn>
              {temp?.id === a.id && <div className="w-full rounded-lg bg-accent/20 p-2 text-sm">كلمة السر المؤقتة: <b dir="ltr" className="select-all">{temp.pw}</b> — أعطها للوكيل، وسيُطلب منه تغييرها فور الدخول.</div>}
            </Card>
          );
        })}
      </div>
    </>
  );
}
