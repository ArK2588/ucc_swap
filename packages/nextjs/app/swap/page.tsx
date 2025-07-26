"use client";

import dynamic from "next/dynamic";

// Dynamically import the SwapBox component with SSR disabled to avoid window is not defined errors
const SwapBox = dynamic(() => import("./swap-box"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="loading loading-spinner loading-lg"></div>
    </div>
  ),
});

export default function SwapPage() {
  return (
    <div className="min-h-screen bg-base-200">
      <SwapBox />
    </div>
  );
}
