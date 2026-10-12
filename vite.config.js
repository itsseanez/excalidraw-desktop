import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // so the built app loads from file:// inside Electron
  define: {
    "process.env.IS_PREACT": JSON.stringify("false"), // required by Excalidraw
  },
  server: { port: 5173, strictPort: true },
});
