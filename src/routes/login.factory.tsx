import {createFileRoute} from '@tanstack/react-router';
import {AuthForm} from '@/components/auth-form';
import {meta} from '@/lib/meta';
export const Route=createFileRoute('/login/factory')({head:()=>meta('دخول المدير','تسجيل الدخول إلى دليل الغاز الحصن'),component:()=> <AuthForm admin={true} />});
