import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Btn, LoginGate, PortalShell } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { ChangePasswordCard, useMustChangePassword } from "@/components/change-password";
import { useState } from "react";

import {meta} from "@/lib/meta";
export const Route = createFileRoute("/_authenticated/agent")({ head:()=>meta("بوابة الوكيل","تسجيل تسليم أسطوانات الغاز"), component: AgentLayout });

const nav = [
  { to: "/agent", label: "الرئيسية", icon: "📊" },
  { to: "/agent/delivery", label: "تسليم جديد", icon: "➕" },
  { to: "/public", label: "العامة", icon: "👥" },
];

function AgentLayout() {
  const { state, session, logout } = useStore();
  const go = useNavigate();
  const [must, setMust] = useMustChangePassword();
  const [showPw, setShowPw] = useState(false);
  const agent = state.agents.find((a) => a.id === session.agentId);
  if (!agent) return <LoginGate to="/login/agent" label="دخول الوكيل" />;
  return (
    <PortalShell title={agent.name} subtitle={agent.area} nav={nav}
      right={<><Btn variant="outline" onClick={() => setShowPw(!showPw)}>كلمة السر</Btn><Btn variant="gold" onClick={async () => { await logout(); go({ to: "/auth", replace: true }); }}>خروج</Btn></>}>
      {(must || showPw) && <ChangePasswordCard forced={must} onDone={() => { setMust(false); setShowPw(false); }} />}
      {!must && <Outlet />}
    </PortalShell>
  );
}
