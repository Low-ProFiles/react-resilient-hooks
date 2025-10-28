import { useEffect, useState } from "react"
import { ResilientResult, QueueStore, MemoryQueueStore, EventBus } from "@resilient/core"
import { requestBackgroundSync } from "../utils/registerServiceWorker"

export type QueuedReq = { id: string; url: string; options?: RequestInit; meta?: Record<string, unknown> }

export function useBackgroundSync(
  queueStore: QueueStore<QueuedReq> = new MemoryQueueStore<QueuedReq>(),
  eventBus?: EventBus<ResilientResult>
) {
  const [status,setStatus] = useState<ResilientResult>({status:"idle"})

  const updateStatus = (newStatus: ResilientResult) => {
    setStatus(newStatus);
    eventBus?.publish(newStatus);
  };

  const enqueue = async(url:string, options?:RequestInit, meta?:Record<string,unknown>)=>{
    const item:QueuedReq={id:`${Date.now()}_${Math.random().toString(36).slice(2,9)}`,url,options,meta}
    await queueStore.enqueue(item)
    try{ await requestBackgroundSync("rrh-background-sync") }catch{}
    return item.id
  }

  const flush = async()=>{
    updateStatus({status:"loading"})
    while(!(await queueStore.isEmpty())){
      const req = await queueStore.dequeue()
      if(req){
        try{ 
          const res = await fetch(req.url, req.options); 
          if(!res.ok) throw new Error(`HTTP ${res.status}`);
        }catch(err){ 
          updateStatus({status:"error",error:new Error("flush failed")}); 
          await queueStore.enqueue(req); // Re-enqueue failed request
          return 
        }
      }
    }
    updateStatus({status:"success"})
  }

  useEffect(()=>{
    const onOnline = ()=>flush()
    window.addEventListener("online",onOnline)
    return ()=>window.removeEventListener("online",onOnline)
  },[flush])

  return {status,enqueue,flush}
}
