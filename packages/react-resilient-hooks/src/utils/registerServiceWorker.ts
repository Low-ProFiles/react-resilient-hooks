export async function registerServiceWorker(swUrl="/service-worker.js"){
  if("serviceWorker" in navigator){
    try{ const reg = await navigator.serviceWorker.register(swUrl); return reg }catch{ return null }
  }
  return null
}

export async function requestBackgroundSync(tag="rrh-background-sync"){
  if(!("serviceWorker" in navigator)) return false
  const reg = await navigator.serviceWorker.ready
  if(!("sync" in reg)) return false
  try{ await (reg as any).sync.register(tag); return true }catch{ return false }
}
