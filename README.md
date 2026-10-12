# Screen Board

An Excalidraw whiteboard that can also draw over your whole screen.

- **Board window**: a normal Excalidraw whiteboard. Your drawing is saved automatically.
- **Overlay**: a transparent, always-on-top layer for annotating anything on your screen while recording.

## Run it

```bash
npm install
npm run dev
```

`npm run dev` starts Vite and opens the Electron app with hot reload. `npm start` builds and runs the production version.

## Shortcuts (work from any app)

| Shortcut | What it does |
| --- | --- |
| Cmd/Ctrl + Shift + D | Show / hide the overlay |
| Cmd/Ctrl + Shift + E | Switch overlay between drawing and click-through |
| Cmd/Ctrl + Shift + X | Clear the overlay |

In **click-through** mode your drawings stay on screen, the toolbar hides, and clicks go to the apps underneath.

## How it works

- `electron/main.cjs` creates two windows. The overlay uses `transparent: true`, `frame: false` and `alwaysOnTop`, and `setIgnoreMouseEvents()` makes clicks pass through.
- `src/Overlay.jsx` renders Excalidraw with `viewBackgroundColor: "transparent"` and the pen tool selected.
- The overlay uses Excalidraw's light theme on purpose: dark theme inverts the canvas, which shifts your stroke colors.

## macOS notes

- The first time a global shortcut is used, macOS may ask for Accessibility permission.
- The overlay covers the display your mouse is on when the app starts.

## License

Built on [Excalidraw](https://github.com/excalidraw/excalidraw) (MIT). Keep its license notice if you distribute this app, and don't use the Excalidraw name or logo as your product's branding.
