"use client";

import { useConnectionAwarePolling, useOnline } from "@resilient/utils";
import { useState } from "react";

export function UseConnectionAwarePollingDemo() {
  const isOnline = useOnline();
  const [data, setData] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // Simulate an API call
      const response = await fetch(
        "https://www.random.org/integers/?num=1&min=1&max=100&col=1&base=10&format=plain&rnd=new"
      );
      const result = await response.text();
      setData(parseInt(result, 10));
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Polling fetch failed:", error);
      // Optionally handle error state in UI
    }
  };

  // Poll every 5 seconds when online
  useConnectionAwarePolling(fetchData, { baseInterval: 5000 });

  return (
    <div>
      <p className="mb-2">
        Polling Status:{" "}
        <strong>{isOnline ? "Active" : "Paused (Offline)"}</strong>
      </p>
      <p className="mb-2">
        Last Fetched Data: <strong>{data !== null ? data : "N/A"}</strong>
      </p>
      <p className="mb-4">
        Last Updated: <strong>{lastUpdated || "Never"}</strong>
      </p>

      <p className="text-sm text-gray-500 mt-4">
        <strong>How to test:</strong> Go offline in your browser&apos;s DevTools
        (Network tab), observe polling pause, then go back online to see it
        resume.
      </p>
    </div>
  );
}
