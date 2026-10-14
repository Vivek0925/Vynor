"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import "@excalidraw/excalidraw/index.css";

const Excalidraw = dynamic(
  async () => {
    const module = await import("@excalidraw/excalidraw");
    return module.Excalidraw;
  },
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-[#536657]">
        Loading whiteboard...
      </div>
    ),
  },
);

type ExcalidrawAPI = {
  getSceneElements: () => readonly unknown[];
  getAppState: () => Record<string, unknown>;
  getFiles: () => Record<string, unknown>;
};

const STORAGE_KEY_PREFIX = "vynor-whiteboard:";

export default function WhiteboardCanvas({
  workspaceSlug,
}: {
  workspaceSlug: string;
}) {
  const storageKey = `${STORAGE_KEY_PREFIX}${workspaceSlug}`;
  const [initialData, setInitialData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setInitialData(JSON.parse(saved));
      }
    } catch {
      // Start with a blank canvas if saved data cannot be read.
    } finally {
      setReady(true);
    }
  }, [storageKey]);

  const handleChange = useCallback(
    (
      elements: readonly ExcalidrawElement[],
      appState: AppState,
      files: BinaryFiles,
    ) => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            elements,
            appState: {
              viewBackgroundColor: appState.viewBackgroundColor,
              gridSize: appState.gridSize ?? 20,
              gridModeEnabled: true,
              zoom: appState.zoom,
              scrollX: appState.scrollX,
              scrollY: appState.scrollY,
            },
            files,
          }),
        );
      } catch {
        // Storage may be full or unavailable.
      }
    },
    [storageKey],
  );

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[#536657]">
        Preparing your whiteboard...
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-[360px] min-w-0 w-full flex-col overflow-hidden rounded-lg border border-[#DCE5DA] bg-white sm:min-h-0 sm:rounded-xl">
      <div className="absolute inset-0 min-h-0 min-w-0">
        <Excalidraw
          key={workspaceSlug}
          initialData={{
            ...initialData,
            appState: {
              gridModeEnabled: true,
              gridSize: 20,
              ...(initialData?.appState as Record<string, unknown> | undefined),
            },
          }}
          onChange={handleChange}
          theme="light"
          
        />
      </div>
    </div>
  );
}
