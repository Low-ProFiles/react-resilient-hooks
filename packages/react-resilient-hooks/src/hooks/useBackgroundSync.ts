import { useEffect, useState } from "react"
import { ResilientResult } from "../core/types"
import { redactSensitiveFields } from "../core/security"
import { requestBackgroundSync } from "../utils/registerServiceWorker"
import { useResilientContext } from "../core/ResilientProvider";

export type QueuedReq = { id: string; url: string; options?: RequestInit; meta?: Record<string, unknown> }
const QUEUE_KEY = "rrh_background_sync_queue_v2"

export function useBackgroundSync(
  opts?: { redactKeys?: string[]; storeBody?: boolean }
) {
  const { redactKeys=[], storeBody=false } = opts||{}
  const [queue,setQueue] = useState<QueuedReq[]>([])
  const [status,setStatus] = useState<ResilientResult>({status:"idle"})
  const { storageProvider, fetcher } = useResilientContext();

  const load = async()=>{ const saved = await storageProvider.getItem<QueuedReq[]>(QUEUE_KEY); if(saved&&Array.isArray(saved)) setQueue(saved)}
  const persist = async(q:QueuedReq[])=>{ setQueue(q); await storageProvider.setItem(QUEUE_KEY,q) }

  const sanitizeOptions = (options?: RequestInit)=>{
    if(!options) return undefined
    const cloned:any = {...options}
    if(cloned.headers){
      try{
        const hObj:Record<string,string>={}
        if(cloned.headers instanceof Headers) cloned.headers.forEach((v: any, k: any) => (hObj[k] = v));
        else if(Array.isArray(cloned.headers)) for(const [k,v] of cloned.headers) hObj[k]=v
        else if(typeof cloned.headers==="object") Object.assign(hObj,cloned.headers)
        for(const key of Object.keys(hObj)) if(key.toLowerCase().includes("authorization")) hObj[key]="[REDACTED]"
        cloned.headers = hObj
      }catch{ delete cloned.headers }
    }
    if(cloned.body){
      if(!storeBody) delete cloned.body
      else{
        try{ const parsed=typeof cloned.body==="string"?JSON.parse(cloned.body):cloned.body; cloned.body=JSON.stringify(redactSensitiveFields(parsed,redactKeys)) }catch{ delete cloned.body }
      }
    }
    return cloned as RequestInit
  }

  const enqueue = async(url:string, options?:RequestInit, meta?:Record<string,unknown>)=>{
    const item:QueuedReq={id:`${Date.now()}_${Math.random().toString(36).slice(2,9)}`,url,options:sanitizeOptions(options),meta}
    const next=[...queue,item]
    await persist(next)
    try{ await requestBackgroundSync("rrh-background-sync") }catch{}
    return item.id
  }

  const dequeue = async(id:string)=>{ const next=queue.filter(i=>i.id!==id); await persist(next) }

  const flush = async()=>{
    setStatus({status:"loading"})
    const snapshot=[...queue]
    for(const req of snapshot){
      try{ const res = await fetcher(req.url, req.options); if(!res.ok) throw new Error(`HTTP ${res.status}`); await dequeue(req.id) }catch{ setStatus({status:"error",error:new Error("flush failed")}); return }
    }
    setStatus({status:"success"})
  }

  useEffect(()=>{
    load()
    const onOnline = ()=>flush()
    window.addEventListener("online",onOnline)
    return ()=>window.removeEventListener("online",onOnline)
  },[])

  return {queue,status,enqueue,dequeue,flush}
}
