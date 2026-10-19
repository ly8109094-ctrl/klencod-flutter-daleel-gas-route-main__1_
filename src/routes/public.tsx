import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PortalShell } from "@/components/ui-kit";
import {meta} from '@/lib/meta';

export const Route = createFileRoute("/public")({ head:()=>meta('البوابة العامة','سجلات توزيع الغاز في أبين الحصن'), component: PublicLayout });

const nav = [
  { to: "/public", label: "الوكلاء", icon: "🏪" },
  { to: "/public/search", label: "بحث", icon: "🔍" },
  { to: "/", label: "البوابات", icon: "🏠" },
];

function PublicLayout() {
  return (
    <PortalShell title="البوابة العامة" subtitle="شفافية توزيع الغاز في أبين" nav={nav}>
      <Outlet />
    </PortalShell>
  );
}
