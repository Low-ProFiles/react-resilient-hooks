/// <reference lib="webworker" />
import { SWMessage, createSWMessage } from './types';

declare const self: ServiceWorkerGlobalScope;

const FLUSH_SUCCESS = 'FLUSH_SUCCESS';
const FLUSH_FAILURE = 'FLUSH_FAILURE';

self.addEventListener("message", (event: ExtendableMessageEvent) => {
  const { type, payload } = event.data as SWMessage;

  if (type === 'FLUSH_QUEUE') {
    handleFlush(payload);
  }
});

async function handleFlush(queue: Array<{ url: string; options?: RequestInit }>) {
  let allSucceeded = true;
  for (const item of queue) {
    try {
      const resp = await fetch(item.url, item.options);
      if (!resp.ok) {
        allSucceeded = false;
        break;
      }
    } catch {
      allSucceeded = false;
      break;
    }
  }

  const clients = await self.clients.matchAll();
  const message = createSWMessage(allSucceeded ? FLUSH_SUCCESS : FLUSH_FAILURE);
  clients.forEach((client) => {
    client.postMessage(message);
  });
}

self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(self.clients.claim());
});

