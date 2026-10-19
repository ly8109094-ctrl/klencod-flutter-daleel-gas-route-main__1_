import {createFileRoute} from '@tanstack/react-router';
import {AuthForm} from '@/components/auth-form';
import {meta} from '@/lib/meta';
export const Route=createFileRoute('/auth')({head:()=>meta('تسجيل الدخول','حسابات دليل الغاز الحصن'),component:AuthForm});
