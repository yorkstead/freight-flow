"use client";

import { useEffect } from "react";

export function Pwa() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch((error: unknown) => console.error("FreightFlow offline setup failed", error));
    }
  }, []);
  return null;
}
