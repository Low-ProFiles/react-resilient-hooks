/**
 * Background Sync API type definitions
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API
 */
interface SyncManager {
  register(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
  readonly sync: SyncManager;
}

function hasSyncSupport(reg: ServiceWorkerRegistration): reg is ServiceWorkerRegistrationWithSync {
  return 'sync' in reg;
}

/**
 * Register a service worker at the given URL
 * @param swUrl - Path to the service worker file (default: "/service-worker.js")
 * @returns The service worker registration or null if registration fails
 */
export async function registerServiceWorker(
  swUrl = "/service-worker.js"
): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.register(swUrl);
    return reg;
  } catch {
    return null;
  }
}

/**
 * Request a background sync with the given tag
 * @param tag - The sync tag name (default: "rrh-background-sync")
 * @returns True if sync was successfully registered, false otherwise
 */
export async function requestBackgroundSync(
  tag = "rrh-background-sync"
): Promise<boolean> {
  if (!("serviceWorker" in navigator)) {
    return false;
  }

  const reg = await navigator.serviceWorker.ready;

  if (!hasSyncSupport(reg)) {
    return false;
  }

  try {
    await reg.sync.register(tag);
    return true;
  } catch {
    return false;
  }
}
