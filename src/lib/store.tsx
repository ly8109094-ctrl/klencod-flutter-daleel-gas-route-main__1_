import { createContext, useContext, useState, type ReactNode } from 'react';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { gasQuery } from './gas-query';
import type { AppState, Delivery } from './data';
type Session = { factory: boolean; agentId: string | null; userId: string | null };
type AgentForm = { name: string; area: string; district: string };
type Ctx = {
 state: AppState; session: Session; refresh: () => Promise<void>; logout: () => Promise<void>;
 addAgent: (a: AgentForm) => Promise<void>; updateAgent: (id: string,a: AgentForm) => Promise<void>;
 createBatch: (code:string,allocations:Record<string,number>) => Promise<void>; closeBatch:(id:string)=>Promise<void>;
 deleteBatch:(id:string,confirmation:string)=>Promise<void>; assignAgent:(id:string,userId:string)=>Promise<void>;
 addAdjustment:(a:{agentId:string;batchId:string;amount:number;reason:string})=>Promise<void>;
 addDelivery:(d:Omit<Delivery,'id'|'status'>)=>Promise<void>; setCollectCitizenId:(v:boolean)=>Promise<void>;
};
const StoreCtx=createContext<Ctx|null>(null);
export function StoreProvider({children}:{children:ReactNode}) {
 const queryClient=useQueryClient();
 const {data:state}=useSuspenseQuery(gasQuery);
 const [session,setSession]=useState<Session>({factory:false,agentId:null,userId:null});
 async function refresh(){
  const {data:{user}}=await supabase.auth.getUser();
  if(user){
   const [{data:roles},{data:agent}]=await Promise.all([supabase.from('user_roles').select('role').eq('user_id',user.id),supabase.from('agents').select('id').eq('user_id',user.id).maybeSingle()]);
   setSession({factory:roles?.some(r=>r.role==='admin')??false,agentId:agent?.id??null,userId:user.id});
  }else setSession({factory:false,agentId:null,userId:null});
  const {data,error}=await supabase.rpc('gas_state'); if(error) throw error;
  queryClient.setQueryData(gasQuery.queryKey,data as unknown as AppState);
 }
 async function mutate(task:PromiseLike<{error:{message:string}|null}>){const {error}=await task;if(error)throw new Error(error.message);await refresh();}
 const value:Ctx={state,session,refresh,
  logout:async()=>{await queryClient.cancelQueries();queryClient.clear();await supabase.auth.signOut();setSession({factory:false,agentId:null,userId:null});},
  addAgent:a=>mutate(supabase.from('agents').insert(a)), updateAgent:(id,a)=>mutate(supabase.from('agents').update(a).eq('id',id)),
  createBatch:(code,allocations)=>mutate(supabase.rpc('create_gas_batch',{batch_code:code,allocations})),
  closeBatch:id=>mutate(supabase.from('batches').update({status:'archived',closed_at:new Date().toISOString().slice(0,10)}).eq('id',id)),
  deleteBatch:(id,confirmation)=>mutate(supabase.rpc('delete_old_batch',{batch_id:id,confirmation})),
  assignAgent:(id,userId)=>mutate(supabase.rpc('assign_gas_agent',{agent_id:id,account_id:userId})),
  addAdjustment:a=>mutate(supabase.from('adjustments').insert({agent_id:a.agentId,batch_id:a.batchId,amount:a.amount,reason:a.reason})),
  addDelivery:d=>mutate(supabase.from('distributions').insert({agent_id:d.agentId,batch_id:d.batchId,recipient_name:d.recipientName,quantity:d.quantity,date:d.date,time:d.time,citizen_id:d.citizenId??null})),
  setCollectCitizenId:v=>mutate(supabase.from('app_settings').upsert({id:true,collect_citizen_id:v})),
 };
 return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}
export function useStore(){const c=useContext(StoreCtx);if(!c)throw new Error('useStore outside provider');return c;}
