"use client";

import { useCallback, useEffect, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

export default function WhiteboardPageClient() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(async () => {
    const button = document.getElementById("whiteboard-fullscreen-button");
    const section = button?.closest("section");

    if (!section) return;

    try {
      if (document.fullscreenElement === section) {
        await document.exitFullscreen();
      } else if (!document.fullscreenElement) {
        await section.requestFullscreen();
      }
    } catch (error) {
      console.error("Failed to toggle whiteboard fullscreen:", error);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const button = document.getElementById("whiteboard-fullscreen-button");
      const section = button?.closest("section");

      setIsFullscreen(document.fullscreenElement === section);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <button
      id="whiteboard-fullscreen-button"
      type="button"
      onClick={toggleFullscreen}
      title={isFullscreen ? "Exit fullscreen (Esc)" : "Enter fullscreen"}
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#DCE5DA] bg-white px-3 text-sm text-[#26382C] transition hover:bg-[#E8EFE6]"
    >
      {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      <span>{isFullscreen ? "Exit fullscreen" : "Fullscreen"}</span>
    </button>
  );
}