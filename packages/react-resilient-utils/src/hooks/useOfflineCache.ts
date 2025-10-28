import { useEffect, useState } from "react"
import { ResilientState, CacheStore, MemoryCacheStore } from "@resilient/core"

export function useOfflineCache<T=unknown>(
  key:string, 
  fetcherFn:()=>Promise<T>, 
  cacheStore: CacheStore<T> = new MemoryCacheStore<T>()
): ResilientState<T> {
  const [state,setState]=useState<ResilientState<T>>({data: null, error: null, loading: false })

  useEffect(()=>{
    let cancelled=false
    const run=async()=>{
      setState({ data: null, error: null, loading: true })
      try{
        const cached=await cacheStore.get(key)
        if(cached){ if(!cancelled) setState({ data: cached, error: null, loading: false }); return }
        const fresh=await fetcherFn()
        await cacheStore.set(key,fresh)
        if(!cancelled) setState({ data: fresh, error: null, loading: false })
      }catch(err){ if(!cancelled) setState({ data: null, error: err as Error, loading: false }) }
    }
    run()
    return ()=>{ cancelled=true }
  },[key, fetcherFn, cacheStore])

  return state
}
