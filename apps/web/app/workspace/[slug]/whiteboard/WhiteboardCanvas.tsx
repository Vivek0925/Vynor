"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import "@excalidraw/excalidraw/index.css";

import { socket } from "@/lib/socket";

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

const STORAGE_KEY_PREFIX = "vynor-whiteboard:";

type Scene = {
  elements?: readonly ExcalidrawElement[];
  appState?: Record<string, unknown>;
  files?: Record<string, unknown>;
};

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
  const [syncStatus, setSyncStatus] = useState<
    "connecting" | "connected" | "error"
  >("connecting");

  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const syncReadyRef = useRef(false);
  const applyingRemoteRef = useRef(false);
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pendingSceneRef = useRef<Scene | null>(null);
  const localSceneRef = useRef<Scene | null>(null);

  useEffect(() => {
    syncReadyRef.current = false;
    localSceneRef.current = null;

    try {
      const saved = localStorage.getItem(storageKey);

      if (saved) {
        const scene = JSON.parse(saved) as Scene;
        localSceneRef.current = scene;
        setInitialData(scene as Record<string, unknown>);
      } else {
        setInitialData(null);
      }
    } catch {
      setInitialData(null);
    } finally {
      setReady(true);
    }

    return () => {
      syncReadyRef.current = false;

      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
        updateTimerRef.current = null;
      }
    };
  }, [storageKey]);

  const saveLocally = useCallback(
    (scene: Scene) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(scene));
      } catch {
        // Local storage may be full or unavailable.
      }
    },
    [storageKey],
  );

  const emitScene = useCallback(
    (scene: Scene) => {
      socket.emit("whiteboard:update", {
        workspaceSlug,
        scene,
      });
    },
    [workspaceSlug],
  );

  const applyScene = useCallback((scene: Scene) => {
    const api = apiRef.current;
    if (!api) return;

    applyingRemoteRef.current = true;

    try {
      if (scene.files && typeof scene.files === "object") {
        api.addFiles(
          Object.values(scene.files) as Parameters<typeof api.addFiles>[0],
        );
      }

      api.updateScene({
        elements: [...(scene.elements ?? [])],

        appState: {
          ...(scene.appState ?? {}),
          gridModeEnabled: true,
          gridSize: 20,
        } as AppState,
      });
    } finally {
      // Excalidraw may notify onChange immediately after updateScene.
      queueMicrotask(() => {
        applyingRemoteRef.current = false;
      });
    }
  }, []);

  useEffect(() => {
    if (!ready) return;

    const handleLoad = (payload: { scene?: Scene }) => {
      const serverScene = payload?.scene ?? {};
      const serverElements = serverScene.elements ?? [];
      const localScene = localSceneRef.current;

      if (serverElements.length === 0 && localScene) {
        // Preserve a locally saved board when the database board is empty.
        applyScene(localScene);
        saveLocally(localScene);
        syncReadyRef.current = true;
        setSyncStatus("connected");
        emitScene(localScene);
        return;
      }

      applyScene(serverScene);
      saveLocally(serverScene);
      syncReadyRef.current = true;
      setSyncStatus("connected");
    };

    const handleRemoteUpdate = (payload: {
      scene?: Scene;
      userId?: string;
    }) => {
      if (!payload?.scene || !apiRef.current) return;

      const incoming = payload.scene;
      const currentElements =
        apiRef.current.getSceneElements() as readonly ExcalidrawElement[];

      const byId = new Map(
        currentElements.map((element) => [element.id, element]),
      );

      // Keep the newest version of each element by ID.
      for (const element of incoming.elements ?? []) {
        const existing = byId.get(element.id);

        if (!existing || element.version >= existing.version) {
          byId.set(element.id, element);
        }
      }

      const mergedScene: Scene = {
        elements: [...byId.values()],
        appState: incoming.appState,
        files: {
          ...apiRef.current.getFiles(),
          ...(incoming.files ?? {}),
        },
      };

      pendingSceneRef.current = mergedScene;
      applyScene(mergedScene);
      saveLocally(mergedScene);
    };

    const handleError = () => {
      setSyncStatus("error");
    };

    const handleConnect = () => {
      setSyncStatus("connecting");
      socket.emit("whiteboard:join", { workspaceSlug });
    };

    socket.on("whiteboard:load", handleLoad);
    socket.on("whiteboard:update", handleRemoteUpdate);
    socket.on("whiteboard:error", handleError);
    socket.on("connect", handleConnect);

    if (!socket.connected) {
      socket.connect();
    } else {
      handleConnect();
    }

    return () => {
      socket.off("whiteboard:load", handleLoad);
      socket.off("whiteboard:update", handleRemoteUpdate);
      socket.off("whiteboard:error", handleError);
      socket.off("connect", handleConnect);

      if (socket.connected) {
        socket.emit("whiteboard:leave", { workspaceSlug });
      }
    };
  }, [ready, workspaceSlug, applyScene, saveLocally, emitScene]);

  const handleChange = useCallback(
    (
      elements: readonly ExcalidrawElement[],
      appState: AppState,
      files: BinaryFiles,
    ) => {
      const scene: Scene = {
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
      };

      saveLocally(scene);

      if (!syncReadyRef.current || applyingRemoteRef.current) {
        return;
      }

      pendingSceneRef.current = scene;

      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }

      updateTimerRef.current = setTimeout(() => {
        const pendingScene = pendingSceneRef.current;

        if (pendingScene && socket.connected) {
          emitScene(pendingScene);
        }

        updateTimerRef.current = null;
      }, 350);
    },
    [saveLocally, emitScene],
  );

  useEffect(() => {
    const handleOutsideClick = (event: PointerEvent) => {
      if (!excalidrawAPI) return;

      const appState = excalidrawAPI.getAppState();

      if (appState.openMenu !== "canvas") return;

      const target = event.target;

      if (!(target instanceof Element)) return;

      if (
        target.closest(".dropdown-menu") ||
        target.closest('[data-testid="main-menu-trigger"]')
      ) {
        return;
      }

      excalidrawAPI.updateScene({
        appState: { openMenu: null },
      });
    };

    document.addEventListener("pointerdown", handleOutsideClick, true);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick, true);
    };
  }, [excalidrawAPI]);

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[#536657]">
        Preparing your whiteboard...
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-[360px] min-w-0 w-full flex-col overflow-hidden rounded-lg border border-[#DCE5DA] bg-white sm:min-h-0 sm:rounded-xl">
      <div className="absolute right-3 top-3 z-10 rounded-md bg-white/90 px-2 py-1 text-xs text-[#536657]">
        {syncStatus === "connected"
          ? "Live sync"
          : syncStatus === "error"
            ? "Sync error"
            : "Connecting..."}
      </div>

      <div className="absolute inset-0 min-h-0 min-w-0">
        <Excalidraw
          key={workspaceSlug}
          excalidrawAPI={(api) => {
            apiRef.current = api;
            setExcalidrawAPI(api);
          }}
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
