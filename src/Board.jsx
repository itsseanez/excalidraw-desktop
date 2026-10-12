import { useMemo, useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";

const STORAGE_KEY = "screen-board:scene";

function loadScene() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) return { elements: saved.elements, appState: saved.appState, files: saved.files };
  } catch {
    // nothing saved yet, or storage unavailable
  }
  return { appState: { theme: "dark" } };
}

// Normal whiteboard window. Saves your drawing so it's still there next time.
export default function Board() {
  const initialData = useMemo(loadScene, []);
  const saveTimer = useRef(null);

  const handleChange = (elements, appState, files) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            elements,
            appState: { theme: appState.theme, viewBackgroundColor: appState.viewBackgroundColor },
            files,
          })
        );
      } catch {
        // storage full or unavailable; skip saving
      }
    }, 500);
  };

  return (
    <div className="board">
      <Excalidraw initialData={initialData} onChange={handleChange} />
    </div>
  );
}
