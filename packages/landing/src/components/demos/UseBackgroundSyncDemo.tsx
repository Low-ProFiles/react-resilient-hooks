"use client";

import { useState, useEffect } from "react";
import { ResilientResult, QueueStore, MemoryQueueStore } from "@resilient/core";
import { requestBackgroundSync } from "@resilient/utils";

export type QueuedReq = { id: string; url: string; options?: RequestInit; meta?: Record<string, unknown> };

interface Message {
  id: number;
  content: string;
  status: "pending" | "synced" | "failed";
}

const queueStore = new MemoryQueueStore<QueuedReq>();

export function UseBackgroundSyncDemo() {
  const [status, setStatus] = useState<ResilientResult>({ status: "idle" });
  const [messageContent, setMessageContent] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextId, setNextId] = useState(1);

  const enqueue = async (url: string, options?: RequestInit, meta?: Record<string, unknown>) => {
    const item: QueuedReq = { id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`, url, options, meta };
    await queueStore.enqueue(item);
    try {
      await requestBackgroundSync("rrh-background-sync");
    } catch (err) {
      console.error("Background sync request failed:", err);
    }
    return item.id;
  };

  const flush = async () => {
    setStatus({ status: "loading" });
    while (!(await queueStore.isEmpty())) {
      const req = await queueStore.dequeue();
      if (req) {
        try {
          const res = await fetch(req.url, req.options);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        } catch (err) {
          setStatus({ status: "error", error: new Error("flush failed") });
          await queueStore.enqueue(req); // Re-enqueue failed request
          return;
        }
      }
    }
    setStatus({ status: "success" });
  };

  useEffect(() => {
    const onOnline = () => flush();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flush]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!messageContent.trim()) return;

    const newMessage: Message = {
      id: nextId,
      content: messageContent,
      status: "pending",
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setNextId((prevId) => prevId + 1);
    setMessageContent("");

    try {
      const enqueuedId = await enqueue(
        `https://httpbin.org/post?id=${newMessage.id}`,
        {
          method: "POST",
          body: JSON.stringify({
            message: newMessage.content,
            id: newMessage.id,
          }),
        },
        { tag: newMessage.id.toString() } // Use message ID as unique tag for the sync
      );
      // Update message status when enqueued successfully
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "pending" } : msg
        )
      );
    } catch (error) {
      console.error("Background sync enqueue failed:", error);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "failed" } : msg
        )
      );
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          placeholder="Enter message to sync"
          className="border p-2 mr-2 rounded-md w-64"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
        >
          Submit (will sync offline)
        </button>
      </form>

      <div className="border p-4 rounded-md bg-gray-50 min-h-[100px]">
        <h3 className="text-lg font-semibold mb-2">Submitted Messages:</h3>
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages submitted yet.</p>
        ) : (
          <ul>
            {messages.map((msg) => (
              <li
                key={msg.id}
                className="flex justify-between items-center py-1"
              >
                <span>{msg.content}</span>
                <span
                  className={`text-sm font-medium ${
                    msg.status === "pending"
                      ? "text-yellow-600"
                      : msg.status === "synced"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-sm text-gray-500 mt-4">
        <strong>How to test:</strong> Go offline in your browser&apos;s DevTools
        (Network tab), submit messages, then go back online to see them sync.
      </p>
    </div>
  );
}