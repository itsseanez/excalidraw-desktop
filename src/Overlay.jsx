import { useEffect, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";

// Transparent, full-screen drawing layer that sits on top of every app.
// Light theme on purpose: dark theme inverts canvas colors, which would
// change your stroke colors on screen.
export default function Overlay() {
  const [api, setApi] = useState(null);
  const [mode, setMode] = useState("draw");

  // Start with the pen tool selected.
  useEffect(() => {
    if (api) api.setActiveTool({ type: "freedraw" });
  }, [api]);

  // Listen for the global shortcuts from the main process.
  useEffect(() => {
    if (!window.screenBoard || !api) return;
    window.screenBoard.onOverlayMode((m) => {
      setMode(m);
      if (m === "draw") api.setActiveTool({ type: "freedraw" });
    });
    window.screenBoard.onOverlayClear(() => api.updateScene({ elements: [] }));
  }, [api]);

  useEffect(() => {
    document.body.dataset.overlayMode = mode;
  }, [mode]);

  return (
    <div className="overlay">
      <Excalidraw
        excalidrawAPI={setApi}
        initialData={{
          appState: {
            theme: "light",
            viewBackgroundColor: "transparent",
            currentItemStrokeColor: "#e03131",
            currentItemStrokeWidth: 2,
          },
        }}
      />
      <div className="overlay-badge">
        {mode === "draw" ? "✏️ Drawing" : "🖱 Click-through"} · ⌘/Ctrl+Shift+E toggle · ⌘/Ctrl+Shift+X clear · ⌘/Ctrl+Shift+D hide
      </div>
    </div>
  );
}
