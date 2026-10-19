import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { fmt } from "@/lib/data";
import { appTitle, developerHeader, logoUrl } from '@/lib/brand';
import {Users,Store,Factory,ChartNoAxesCombined,Plus,Package,FileText,Settings,Search,House} from 'lucide-react';
export function PortalIcon({icon,className}:{icon:string;className?:string}) {
  const Icon=({'👥':Users,'🏪':Store,'🏭':Factory,'📊':ChartNoAxesCombined,'➕':Plus,'📦':Package,'📑':FileText,'⚙️':Settings,'🔍':Search,'🏠':House}[icon]) ?? House;
  return <Icon aria-hidden="true" className={className ?? 'inline h-4 w-4 shrink-0'} />;
}

export function DemoBanner({ text = developerHeader }: { text?: string }) {
  return <div className="developer-banner bg-gold text-gold-foreground px-4 py-2 text-center text-sm font-bold">{text}</div>;
}

export function Btn({ variant = "primary", className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "gold" | "outline" | "ghost" }) {
  const v = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    gold: "bg-gold text-gold-foreground hover:opacity-90",
    outline: "border border-primary text-primary bg-card hover:bg-secondary",
    ghost: "text-primary hover:bg-secondary",
  }[variant];
  return <button {...p} className={cn("inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-50", v, className)} />;
}

export function Field({ label, hint, ...p }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-foreground">{label}</span>
      <input {...p} className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring" />
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-border bg-card p-4 shadow-soft", className)}>{children}</div>;
}

export function StatCard({ label, value, tone = "primary" }: { label: string; value: number; tone?: "primary" | "gold" | "muted" }) {
  const t = { primary: "text-primary", gold: "text-gold-deep", muted: "text-foreground" }[tone];
  return (
    <Card className="p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-2xl font-extrabold", t)}>{fmt(value)}</div>
    </Card>
  );
}

export function Progress({ value, max }: { value: number; max: number }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-gradient-gold" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 text-xs font-bold text-muted-foreground">{fmt(pct)}٪</span>
    </div>
  );
}

export function Badge({ children, tone = "primary" }: { children: ReactNode; tone?: "primary" | "gold" | "muted" }) {
  const t = { primary: "bg-secondary text-primary", gold: "bg-gold/20 text-gold-deep", muted: "bg-muted text-muted-foreground" }[tone];
  return <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", t)}>{children}</span>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 mt-6 flex items-center justify-between">
      <h2 className="text-lg font-extrabold text-foreground">{children}</h2>
      {action}
    </div>
  );
}

export type NavItem = { to: string; label: string; icon: string };

export function PortalShell({ title, subtitle, nav, children, right }: { title: string; subtitle?: string; nav: NavItem[]; children: ReactNode; right?: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <DemoBanner />
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 pt-4"><img src={logoUrl} alt="دليل الغاز الحصن" className="h-16 w-16 shrink-0 rounded-lg object-contain"/><p className="text-base font-bold">{appTitle}</p></div>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <Link to="/" className="text-xs text-gold">دليل الغاز · أبين</Link>
            <h1 className="text-xl font-extrabold">{title}</h1>
            {subtitle && <p className="text-xs opacity-80">{subtitle}</p>}
          </div>
          {right}
        </div>
        <nav className="mx-auto hidden max-w-5xl gap-1 px-4 pb-2 md:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className={cn("rounded-lg px-3 py-1.5 text-sm font-bold", path === n.to ? "bg-gold text-gold-foreground" : "hover:bg-primary-foreground/10")}>
              <PortalIcon icon={n.icon} /> {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-4">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-border bg-card md:hidden">
        {nav.map((n) => (
          <Link key={n.to} to={n.to} className={cn("flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-bold", path === n.to ? "text-primary" : "text-muted-foreground")}>
            <span className={cn("text-lg", path === n.to && "rounded-full bg-secondary px-3")}><PortalIcon icon={n.icon} /></span>
            {n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function LoginGate({ to, label }: { to: string; label: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DemoBanner />
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="max-w-sm text-center">
          <p className="mb-4 text-muted-foreground">يلزم حساب مفعل وصلاحية مناسبة لدخول هذه البوابة</p>
          <Link to={to}><Btn>{label}</Btn></Link>
        </Card>
      </div>
    </div>
  );
}
