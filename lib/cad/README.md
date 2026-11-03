# Browser CAD runtime

Used by the standard 3D view and STEP export. The 23 MB kernel loads in a module worker and is cached by the browser; normal editing remains available during loading.

- `replicad.js`: selected exports bundled from [replicad 1.2.0](https://github.com/sgenoud/replicad), MIT, using esbuild 0.28.2.
- `opencascade.js` and `replicad_single.wasm`: unmodified [replicad-opencascadejs 1.1.0](https://www.npmjs.com/package/replicad-opencascadejs), LGPL 2.1. Source/build instructions: [replicad custom kernel](https://github.com/sgenoud/replicad/tree/main/packages/replicad-opencascadejs) and [OpenCascade.js](https://github.com/donalffons/opencascade.js). Underlying [OCCT sources and licence exception](https://github.com/Open-Cascade-SAS/OCCT).

Licence texts are included alongside the runtime. Keep the kernel JavaScript and WASM together when replacing them.

To rebuild the selected replicad exports, install `replicad@1.2.0`, `replicad-opencascadejs@1.1.0` and `esbuild@0.28.2` in a temporary directory. Bundle an entry containing:

```js
export { setOC, makeBox, makeCylinder, makeCompound, exportSTEP, measureVolume, makePolygon, addHolesInFace, basicFaceExtrusion, Vector, revolution, genericSweep, assembleWire, makeLine, makeBSplineApproximation, makeThreePointArc } from 'replicad';
```

Use esbuild with `--bundle --format=esm --minify`, then copy the two `replicad_single` runtime files from `replicad-opencascadejs/dist`. No npm install is needed to run the app.

`clipper.js` bundles clipper-lib 6.4.2 for flat-bottom cutter footprints. Rebuild it by bundling `export { default } from 'clipper-lib';` with the same esbuild flags. Original project: https://github.com/junmer/clipper-lib (Angus Johnson / Javascript translation by Timo). Boost and bundled JSBN licence notices are included. Rounded offsets use 0.005 mm chord tolerance; V-bit CAD curves use exact circular arcs where recognised and 0.01 mm spline fitting elsewhere.
