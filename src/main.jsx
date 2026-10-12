import React from "react";
import { createRoot } from "react-dom/client";
import "@excalidraw/excalidraw/index.css";
import "./styles.css";
import Board from "./Board.jsx";
import Overlay from "./Overlay.jsx";

// The Electron main process loads this page with ?mode=board or ?mode=overlay.
const mode = new URLSearchParams(window.location.search).get("mode") || "board";
document.body.dataset.mode = mode;

createRoot(document.getElementById("root")).render(
  mode === "overlay" ? <Overlay /> : <Board />
);
