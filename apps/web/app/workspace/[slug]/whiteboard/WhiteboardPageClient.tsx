"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import WhiteboardCanvas from "./WhiteboardCanvas";

export default function WhiteboardPageClient({
  workspaceSlug,
}: {
  workspaceSlug: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (document.fullscreenElement === container) {
        await document.exitFullscreen();
      } else if (!document.fullscreenElement) {
        await container.requestFullscreen();
      }
    } catch (error) {
      console.error("Failed to toggle whiteboard fullscreen:", error);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`flex w-full flex-col overflow-hidden bg-white ${
        isFullscreen
          ? "fixed inset-0 z-[9999] h-screen rounded-none border-0"
          : "h-full min-h-0 rounded-xl border border-[#DCE5DA]"
      }`}
    >
      <div className="flex h-12 shrink-0 items-center justify-end border-b border-[#DCE5DA] bg-[#FAFCF9] px-3">
        <button
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit fullscreen (Esc)" : "Enter fullscreen"}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#DCE5DA] bg-white px-3 text-sm text-[#26382C] transition hover:bg-[#E8EFE6]"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          <span>{isFullscreen ? "Exit fullscreen" : "Fullscreen"}</span>
        </button>
      </div>

      <div className="min-h-0 flex-1">
        <WhiteboardCanvas
          workspaceSlug={workspaceSlug}
          containerRef={containerRef}
        />
      </div>
    </div>
  );
}