import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export function makeTempPassword() {
  const n = new Uint32Array(1);
  crypto.getRandomValues(n);
  return `Gas#${(1000 + ((n[0] ?? 0) % 9000)).toString()}${Math.floor(Math.random() * 90 + 10)}`;
}

export const setAgentTempPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { agentId: string }) => {
    if (!input?.agentId || typeof input.agentId !== "string") throw new Error("وكيل غير صالح");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("هذه العملية لمدير المصنع فقط");
    const { data: agent } = await context.supabase.from("agents").select("user_id").eq("id", data.agentId).maybeSingle();
    if (!agent?.user_id) throw new Error("اربط حساباً بهذا الوكيل أولاً");
    const password = makeTempPassword();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(agent.user_id);
    const { error } = await supabaseAdmin.auth.admin.updateUserById(agent.user_id, {
      password,
      user_metadata: { ...(u?.user?.user_metadata ?? {}), must_change_password: true },
    });
    if (error) throw new Error("تعذر تعيين كلمة السر المؤقتة");
    return { password };
  });

/** Agent signed in with a temporary password sets a private new one (no temp password re-entry). */
export const setOwnNewPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { password: string }) => {
    const p = input?.password;
    if (typeof p !== "string" || p.length < 8) throw new Error("يجب ألا تقل كلمة السر عن 8 خانات");
    return { password: p };
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    const meta = u?.user?.user_metadata ?? {};
    if (!meta["must_change_password"]) throw new Error("استخدم شاشة تغيير كلمة السر العادية");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(context.userId, {
      password: data.password,
      user_metadata: { ...meta, must_change_password: false },
    });
    if (error) {
      if (error.code === "weak_password") throw new Error("كلمة السر ضعيفة أو شائعة، اختر كلمة أقوى");
      if (error.code === "same_password") throw new Error("اختر كلمة سر مختلفة عن المؤقتة");
      throw new Error("تعذر حفظ كلمة السر");
    }
    return { ok: true };
  });
