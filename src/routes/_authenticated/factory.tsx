import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Btn, LoginGate, PortalShell } from "@/components/ui-kit";
import { useStore } from "@/lib/store";

import {meta} from "@/lib/meta";
export const Route = createFileRoute("/_authenticated/factory")({ head:()=>meta("بوابة المدير","إدارة توزيع الغاز في الحصن"), component: FactoryLayout });

const nav = [
  { to: "/factory", label: "الرئيسية", icon: "📊" },
  { to: "/factory/agents", label: "الوكلاء", icon: "🏪" },
  { to: "/factory/batches", label: "الدفعات", icon: "📦" },
  { to: "/factory/reports", label: "التقارير", icon: "📑" },
  { to: "/factory/settings", label: "الإعدادات", icon: "⚙️" },
];

function FactoryLayout() {
  const { session, logout } = useStore();
  const go = useNavigate();
  if (!session.factory) return <LoginGate to="/login/factory" label="دخول المصنع" />;
  return (
    <PortalShell title="بوابة المصنع" subtitle="مصنع غاز أبين" nav={nav}
      right={<Btn variant="gold" onClick={async () => { await logout(); go({ to: "/auth", replace: true }); }}>خروج</Btn>}>
      <Outlet />
    </PortalShell>
  );
}
