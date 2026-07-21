# Cabinet Studio

Cabinet Studio is a browser-based cabinet design tool for quickly modelling cabinet carcasses, doors, drawers, shelves, hardware drilling, and exportable panel geometry.

It is focused on turning cabinet dimensions and construction choices into a visual 3D preview, panel previews, and DXF output for fabrication.

## Features

- Parametric cabinet dimensions for width, height, depth, materials, overlay, reveal, toe kick, and construction style.
- Door and drawer configurations with animated 3D preview.
- Shelf pin, hinge plate, drawer runner, and drawer slide reference hole generation.
- Panel preview sidebar with 2D previews for each generated part.
- Individual panel DXF export and full cabinet ZIP export.
- Local-only static app: no build step required.

## Running Locally

Because the app uses ES modules, open it through a local web server rather than directly from the filesystem.

From this folder:

```powershell
python -m http.server 8080
```

Then open:

```text
http://127.0.0.1:8080/
```

The app loads Three.js from the import map in `index.html`, so an internet connection is currently required for the 3D viewer dependency.

## Project Structure

- `index.html`: App shell, styles, import map, and main layout.
- `assets/`: Cabinet Studio logo and favicon assets.
- `js/main.js`: App entry point, panel list rendering, import/export wiring.
- `js/cabinet-math.js`: Pure cabinet geometry and panel generation.
- `js/form-ui.js`: Cabinet settings form and configuration state.
- `js/three-viewport.js`: 3D preview rendering and animations.
- `js/dxf-writer.js`: DXF and ZIP export generation.
- `lib/jszip.min.js`: Local JSZip dependency for ZIP exports.

## Notes

Cabinet geometry is still evolving. Verify generated DXF drilling and panel dimensions against the intended hardware before cutting real material.
