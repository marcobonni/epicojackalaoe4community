"use client";

import { useState } from "react";

export default function TestLoader() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleClick}
        className="rounded bg-amber-500 px-4 py-2 text-black"
      >
        Test loader
      </button>

      {loading && <div className="loader" />}
    </div>
  );
}