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
      <div className="min-h-0 flex-1">
        <WhiteboardCanvas workspaceSlug={workspaceSlug} />
      </div>
    </div>
  );
}
