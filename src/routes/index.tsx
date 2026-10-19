import { createFileRoute, Link } from "@tanstack/react-router";
import { DemoBanner, PortalIcon } from "@/components/ui-kit";
import { meta } from "@/lib/meta";
import { appTitle, logoUrl } from '@/lib/brand';
import { useStore } from '@/lib/store';

export const Route = createFileRoute("/")({
  head: () => meta("الرئيسية", "دليل الغاز: منصة متابعة توزيع أسطوانات الغاز المنزلي في محافظة أبين"),
  component: Index,
});

const portals = [
  { to: "/public", icon: "👥", title: "البوابة العامة", desc: "تابع الوكلاء والحصص وأسماء المستلمين" },
  { to: "/login/agent", icon: "🏪", title: "بوابة الوكيل", desc: "سجّل عمليات التسليم وتابع حصتك" },
  { to: "/login/factory", icon: "🏭", title: "بوابة المصنع", desc: "إدارة الوكلاء والدفعات والحصص" },
];

function Index() {
  const { session } = useStore();
  return (
    <div className="min-h-screen bg-background">
      <DemoBanner />
      <section className="bg-primary px-6 pb-14 pt-6 text-center text-primary-foreground">
        <img src={logoUrl} alt="دليل الغاز الحصن" className="mx-auto mb-4 h-44 w-44 rounded-lg object-contain" />
        <h1 className="mx-auto max-w-3xl text-2xl font-extrabold">{appTitle}</h1>
        {session.userId && <Link to={session.factory ? '/factory' : session.agentId ? '/agent' : '/auth'} className="mt-4 inline-block text-gold">حسابي</Link>}
      </section>
      <div className="mx-auto -mt-8 grid max-w-3xl gap-3 px-4 pb-10 md:grid-cols-3">
        {portals.map((p) => (
           <Link key={p.to} to={p.to} className="rounded-lg border border-border bg-card p-5 shadow-soft transition hover:border-gold">
            <PortalIcon icon={p.icon} className="h-8 w-8 text-primary" />
            <div className="mt-2 text-lg font-extrabold text-primary">{p.title}</div>
            <div className="text-sm text-muted-foreground">{p.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
