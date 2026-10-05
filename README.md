# Cabinet Studio

Cabinet Studio is a browser-based cabinet design tool for quickly modelling cabinet carcasses, doors, drawers, shelves, hardware drilling, and exportable panel geometry.

It is focused on turning cabinet dimensions and construction choices into a visual 3D preview, panel previews, and DXF output for fabrication.

## Live App

https://petervanderwalt.github.io/cabinet-studio/

## Overview

Cabinet Studio gives you a single browser workspace for cabinet sizing, front configuration, drilling decisions, 3D review, and fabrication exports.

![Main application screen](docs/main_screen.png)

## Features

- Parametric cabinet dimensions for width, height, depth, materials, overlay, reveal, toe kick, and construction style.
- Door and drawer configurations with animated 3D preview.
- Shelf pin, hinge plate, drawer runner, and drawer slide reference hole generation.
- Panel preview sidebar with 2D previews for each generated part.
- Individual panel DXF export and full cabinet ZIP export.
- Local-only static app built with React 19, TypeScript, and Vite.

## Cabinet Layouts

You can switch between open shelving, door-based cabinets, and drawer stacks without leaving the same design flow.

![Doors and shelves configuration](docs/doors-and-shelves.png)
![Drawer configuration](docs/drawers.png)

## Nesting And Materials

Material-aware nesting helps separate parts by sheet stock so machining output stays organized when a project uses more than one board type or thickness.

![Per-material nesting configuration](docs/configuration1.png)
![Automatic nesting preview](docs/automatic-nesting.png)

## Hardware Configuration

Hardware settings are configurable at project level, including drawer sliders, handles, and hinges, so drilling and clearances track the construction method you plan to build.

![Hardware configuration](docs/configuration2.png)

## Multi-Cabinet Projects

Larger jobs can be assembled as multi-cabinet projects, with copy counts for repeated units so one design can drive a full run of matching cabinets.

![Multi-cabinet project setup](docs/multi-cabinet-projects.png)

## Upcoming: Kitchen Layout Planning

An upcoming layout-planning view will extend Cabinet Studio from single-cabinet configuration into room-level arrangement, making it possible to place cabinets in a broader kitchen layout and render the overall plan before fabrication.

![Kitchen layout planning preview](docs/kitchen-layout.png)

## Bedroom Cupboards And Wardrobes

Choose the **Wardrobe / bedroom cupboard** category for floor-to-ceiling units:

- **Layouts:** single run, corner (L-shape), or walk-in open frame with left and right returns.
- **Fronts:** hinged doors (up to 8), sliding doors on two staggered tracks (2 to 5, top-hung or bottom-rolling), or open.
- **Sections:** split the interior into sections with dividers; each has hanging rails (long or half-hang), shelves and internal drawers.
- **Presets:** 2-door, 4-door, 3-door sliding, corner and walk-in starting points.

## Materials And Considerations

Carcass, rear and front stocks drive everything; shelves, drawer boxes, drawer fronts, plinth, dividers and sliding doors can each use their own stock. Mirror type, edge-band colour and thickness are set per cabinet, and every stock/thickness nests on its own sheets. The Considerations section covers wall fixing, back ventilation slots and workshop notes.

## Lighting, Push-To-Open And Switches

- **Lighting:** routed LED channels (under the cabinet, inside the top, shelf edges, side strips, over the rail, toe kick, inside drawers) with cable holes. LED strips show in the 3D view.
- **Push-to-open:** magnetic or mechanical latches (with latch bores), tip-on, or electric servo drives instead of handles.
- **Switches:** reed or plunger switches that turn lights on when a drawer or door opens, with switch bores and magnet pockets drilled in the panels.
- **Hardware list:** the Hardware tab and `hardware.csv` in the ZIP total hinges, runners, rails, tracks, LED strip, drivers, switches, edge banding and fixings for the whole project.

## Manufacturer Fittings (Blum)

`src/fittings/` holds fitting data transcribed from the Blum "Catalogue and technical manual 2024/2025" (48 ranges, about 3,700 part numbers). Every part, dimension and drilling pattern cites its printed catalogue page. Values the catalogue doesn't state clearly are left out and flagged `unverified:` in the data's notes. The catalogue PDF is not in the repo; keep your copy in `data/source/` (git-ignored).

Choose fittings in **Catalogue Fittings** in the cabinet form (and Hardware → Hinges for the CLIP top 110° with exact cup and plate drilling):

- **Hinges and mounting plates:** CLIP top applications and angled hinges, MODUL, all plate types.
- **Drawer systems:** LEGRABOX, MERIVOBOX, TANDEMBOX, METABOX (metal boxes) and MOVENTO, TANDEM (runners for wooden drawers). The generator sizes the drawer from the catalogue formulas (for example base width `LW - 35`, wood-drawer width `LW - 42`) and warns when the nominal length needs more depth than the cabinet has. Metal sides are drawn but not cut; the wooden base and back are cut parts.
- **Motion:** BLUMOTION, TIP-ON and SERVO-DRIVE for doors, boxes and runners.
- **Lifts:** AVENTOS HKi, HF, HS, HL, HK, HK-S, HK-XS. A lift replaces the hinged doors with one lift-up front; the matching power band is pre-selected from an estimate of the front's weight.
- **Inner dividing and pocket systems:** AMBIA-LINE, ORGA-LINE, REVEGO.

Chosen options resolve to part numbers in the Hardware tab and `hardware.csv`. Optional accessories are listed only when you tick "Include optional accessories". Drilling is only generated from the catalogue where it is fully dimensioned (CLIP top cups, dowels and plates); other hole patterns are kept as planning data until their reference points are confirmed.

## Manufacturing Export

Cabinet Studio can export individual DXFs, nested DXFs, and a manufacturing ZIP bundle so the machining package is ready to hand off or archive as a single deliverable.

![Individual DXF exports](docs/dxfs.png)
![Nested DXF exports](docs/nested-dxfs.png)
![Manufacturing ZIP export](docs/Manufacturing_zip.png)

## Running Locally

```bash
npm install
npm run dev        # dev server with hot reload
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + production build into dist/
```

The build uses relative asset paths, so `dist/` can be hosted from any sub-path (e.g. GitHub Pages).

## Project Structure

- `index.html`, `kitchen-layout.html`: Vite entry pages (studio and kitchen layout).
- `public/assets/`: Cabinet Studio logo and favicon assets.
- `src/studio/`: Studio page (React): `App.tsx` plus `components/` (form, project tabs, 3D viewport host, parts list, nesting view).
- `src/layout/`: Kitchen layout page (React) and its three.js viewport and snapping logic.
- `src/engine/`: Geometry and fabrication engine (plain JS): `cabinet-math`, `nesting`, `dxf-writer`, `project-io`, `material-presets`, `three-viewport`. `index.ts` is a typed facade over them.
- `src/lib/`: Shared config normalisation, formatting, and project hand-off between the two pages.
- `src/types.ts`: Shared domain types.

## Notes

Cabinet geometry is still evolving. Verify generated DXF drilling and panel dimensions against the intended hardware before cutting real material.
