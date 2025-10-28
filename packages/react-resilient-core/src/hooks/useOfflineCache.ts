import { useEffect, useState } from "react"
import { ResilientState } from "../core/types"
import { redactSensitiveFields } from "../core/security"
import { useResilientContext } from "../core/ResilientProvider";

export function useOfflineCache<T=unknown>(
  key:string, 
  fetcherFn:()=>Promise<T>, 
  opts?:{ttlMs?:number;shouldCache?:(value:T)=>boolean;redactKeys?:string[]}
): ResilientState<T> {
  const ttlMs=opts?.ttlMs??1000*60*60
  const shouldCache=opts?.shouldCache
  const redactKeys=opts?.redactKeys??[]
  const [state,setState]=useState<ResilientState<T>>({data: null, error: null, loading: false })
  const { storageProvider } = useResilientContext();

  useEffect(()=>{
    let cancelled=false
    const run=async()=>{
      setState({ data: null, error: null, loading: true })
      try{
        const cached=await storageProvider.getItem<{ts:number;value:T}>(key)
        const now=Date.now()
        if(cached && now-cached.ts<ttlMs){ if(!cancelled) setState({ data: cached.value, error: null, loading: false }); return }
        const fresh=await fetcherFn()
        if(shouldCache && !shouldCache(fresh)){ if(!cancelled) setState({ data: fresh, error: null, loading: false }); return }
        const maybeSanitized:any=redactSensitiveFields(fresh,redactKeys)
        await storageProvider.setItem(key,{ts:now,value:maybeSanitized})
        if(!cancelled) setState({ data: fresh, error: null, loading: false })
      }catch(err){ if(!cancelled) setState({ data: null, error: err as Error, loading: false }) }
    }
    run()
    return ()=>{ cancelled=true }
  },[key])

  return state
}
