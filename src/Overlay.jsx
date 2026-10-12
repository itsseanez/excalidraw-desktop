import { useEffect, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";

const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

// Follow the system light/dark setting, and switch live when it changes.
function useSystemTheme() {
  const [theme, setTheme] = useState(darkQuery.matches ? "dark" : "light");
  useEffect(() => {
    const onChange = (e) => setTheme(e.matches ? "dark" : "light");
    darkQuery.addEventListener("change", onChange);
    return () => darkQuery.removeEventListener("change", onChange);
  }, []);
  return theme;
}

// Transparent, full-screen drawing layer that sits on top of every app.
// Theme follows the system. In dark mode, like excalidraw.com, Excalidraw shifts
// stroke colors so they read well on dark backgrounds (black strokes show as white).
export default function Overlay() {
  const [api, setApi] = useState(null);
  const [mode, setMode] = useState("draw");
  const theme = useSystemTheme();

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
        theme={theme}
        initialData={{
          appState: {
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
