"use client";

import { useBackgroundSync } from "react-resilient-hooks";
import { useState, useEffect } from "react";

interface Message {
  id: number;
  content: string;
  status: "pending" | "synced" | "failed";
}

export function UseBackgroundSyncDemo() {
  const { enqueue, queue } = useBackgroundSync({ storeBody: true });
  const [messageContent, setMessageContent] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextId, setNextId] = useState(1);

  // Update message status when queue changes (items are processed)
  useEffect(() => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => {
        if (
          msg.status === "pending" &&
          !queue.some((qItem) => Number(qItem.id) === msg.id)
        ) {
          // Assuming item is no longer in queue means it was synced or failed
          // For a real app, `enqueue` would return a promise or callback for more precise status
          return { ...msg, status: "synced" }; // Optimistically mark as synced
        }
        return msg;
      })
    );
  }, [queue]);

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
      // `enqueue` returns a promise that resolves when the sync is complete
      await enqueue(
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
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "synced" } : msg
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

      <p className="text-sm text-gray-600 mb-2">
        Pending in queue: <strong>{queue.length}</strong>
      </p>

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
