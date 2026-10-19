import { createFileRoute } from "@tanstack/react-router";
import { Btn, Card, SectionTitle } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { meta } from "@/lib/meta";
import {useState} from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/factory/settings")({
  head: () => meta("الإعدادات", "إعدادات جمع البيانات في نماذج التسليم"),
  component: Settings,
});

function Settings() {
  const { state, setCollectCitizenId } = useStore();
  const [err,setErr]=useState("");
  const on = state.settings.collectCitizenId;
  return (
    <>
      <SectionTitle>الإعدادات</SectionTitle>
      <Card className="flex items-center justify-between gap-4">
        <div>
          <div className="font-bold">جمع رقم الهوية للمستلم</div>
          <div className="text-xs text-muted-foreground">حقل اختياري في نموذج الوكيل. لا يُعرض للعامة أبداً.</div>
        </div>
        <Btn role="switch" aria-checked={on} aria-label="جمع رقم الهوية" onClick={async () => {try{await setCollectCitizenId(!on);}catch(e){setErr(e instanceof Error?e.message:"تعذر الحفظ");}}}
          className={cn("relative h-7 w-12 shrink-0 rounded-full transition", on ? "bg-primary" : "bg-muted")}>
          <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-card shadow-soft transition-all", on ? "right-6" : "right-1")} />
        </Btn>
      </Card>
      <Card className="mt-3 text-xs text-muted-foreground">
        {err || "رقم الهوية لا يظهر للعامة، وإدارته محصورة بالحسابات المخولة."}
      </Card>
    </>
  );
}
