/// <reference lib="webworker" />
import { SWMessage, createSWMessage } from './types';

const FLUSH_SUCCESS = 'FLUSH_SUCCESS';
const FLUSH_FAILURE = 'FLUSH_FAILURE';

self.addEventListener("message", (event: MessageEvent<SWMessage>) => {
  const { type, payload } = event.data;

  if (type === 'FLUSH_QUEUE') {
    handleFlush(payload);
  }
});

async function handleFlush(queue: any[]) {
  let allSucceeded = true;
  for (const item of queue) {
    try {
      const resp = await fetch(item.url, item.options);
      if (!resp.ok) {
        allSucceeded = false;
        break;
      }
    } catch (error) {
      allSucceeded = false;
      break;
    }
  }

  if (allSucceeded) {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage(createSWMessage(FLUSH_SUCCESS));
      });
    });
  } else {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage(createSWMessage(FLUSH_FAILURE));
      });
    });
  }
}

self.addEventListener("install", (event: any) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event: any) => {
  event.waitUntil(self.clients.claim());
});

