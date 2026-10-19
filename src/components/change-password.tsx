import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { setOwnNewPassword } from "@/lib/agent-password.functions";
import { Btn, Card, Field } from "./ui-kit";

export function ChangePasswordCard({ forced = false, onDone }: { forced?: boolean; onDone?: () => void }) {
  const [current, setCurrent] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const p = pw.trim();
    if (p.length < 8) return setMsg("يجب ألا تقل كلمة السر عن 8 خانات");
    if (p !== pw2.trim()) return setMsg("كلمتا السر غير متطابقتين");
    setBusy(true);
    try {
      if (forced) {
        await setOwnNewPassword({ data: { password: p } });
        await supabase.auth.refreshSession();
      } else {
        const { error } = await supabase.auth.updateUser({ password: p, current_password: current.trim() } as Parameters<typeof supabase.auth.updateUser>[0]);
        if (error) {
          const code = (error as { code?: string }).code;
          throw new Error(code === "weak_password" ? "كلمة السر ضعيفة أو شائعة، اختر كلمة أقوى"
            : code === "same_password" ? "اختر كلمة سر مختلفة"
            : "كلمة السر الحالية غير صحيحة");
        }
      }
    } catch (err) {
      setBusy(false);
      return setMsg(err instanceof Error ? err.message : "تعذر حفظ كلمة السر");
    }
    setBusy(false);
    setCurrent(""); setPw(""); setPw2("");
    setMsg("تم حفظ كلمة السر الجديدة");
    onDone?.();
  }
  const t = show ? "text" : "password";
  return (
    <Card className="mb-4 border-2 border-accent">
      <h2 className="mb-2 font-bold">{forced ? "أنشئ كلمة سر جديدة خاصة بك" : "تغيير كلمة السر"}</h2>
      {forced && <p className="mb-3 text-sm text-muted-foreground">لن يعرف أحد كلمة السر الجديدة، ولا حتى مدير المصنع.</p>}
      <form onSubmit={submit} className="space-y-3">
        {!forced && <Field label="كلمة السر الحالية" type={t} value={current} onChange={(e) => setCurrent(e.target.value)} required />}
        <Field label="كلمة السر الجديدة" type={t} minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} required />
        <Field label="تأكيد كلمة السر الجديدة" type={t} minLength={8} value={pw2} onChange={(e) => setPw2(e.target.value)} required />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> إظهار كلمة السر</label>
        <Btn type="submit" disabled={busy} className="w-full">{busy ? "جارٍ الحفظ…" : "حفظ كلمة السر"}</Btn>
      </form>
      {msg && <p role="status" className="mt-2 text-sm">{msg}</p>}
    </Card>
  );
}

export function useMustChangePassword() {
  const [must, setMust] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMust(Boolean(data.user?.user_metadata?.['must_change_password'])));
  }, []);
  return [must, setMust] as const;
}
