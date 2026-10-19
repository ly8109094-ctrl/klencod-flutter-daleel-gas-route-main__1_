import {createFileRoute} from '@tanstack/react-router';
import {AuthForm} from '@/components/auth-form';
import {meta} from '@/lib/meta';
export const Route=createFileRoute('/login/agent')({head:()=>meta('دخول الوكيل','تسجيل الدخول إلى دليل الغاز الحصن'),component:()=> <AuthForm admin={false} />});
