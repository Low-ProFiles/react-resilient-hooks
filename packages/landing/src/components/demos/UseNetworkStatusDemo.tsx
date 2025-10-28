"use client";

import { useNetworkStatus } from "@resilient/utils";

export function UseNetworkStatusDemo() {
  const { data: value } = useNetworkStatus();
  const online = value?.online;
  const effectiveType = value?.effectiveType;
  const downlink = value?.downlink;

  return (
    <div>
      <p>
        Online:{" "}
        <strong>
          {online === undefined ? "Unknown" : online ? "Yes" : "No"}
        </strong>
      </p>
      <p>
        Effective Type: <strong>{effectiveType ?? "Unknown"}</strong>
      </p>
      <p>
        Downlink: <strong>{downlink ?? "Unknown"} Mbps</strong>
      </p>
    </div>
  );
}
