# Manufacturer hardware models

## Hettich models

Source: [Hettich public CAD packages](https://www.hettich.com/en-no/services/hettich-cad/cad-downloads), retrieved 2026-11-03. Anzio 1160018 comes from STEP_Griffe.zip; Sensys 9071205 and plate 9071575 come from STEP_Scharniere.zip. Original STEP files and converted meshes are retained, with source SHA-256 recorded in each mesh.

Anzio: 128 mm fixing centres, 138 x 10 x 32 mm envelope; 236 triangles. Convert using tools/convert-handle-cad.py. Its mounting axes follow the generated front bores.

The same `STEP_Griffe.zip` package supplies seven further Anzio models, extracted from `Griffe/New_Modern/<part>.stp`: 1160019 (160 mm), 1160020 (224 mm), 1160021 (288 mm), 1160022 (352 mm), 1160023 (480 mm), 1160024 (608 mm) and 1160025 (736 mm). Each original STEP is retained alongside its 236-triangle mesh. The converter verifies both radius-2 mm fixing axes, centre spacing and the full envelope: length = centres + 10 mm, width 10 mm, projection 32 mm. Product dimensions are also listed in the [manufacturer ProDecor data sheet](https://www.hettich.com/fileadmin/Hettich_International/Planning/imos/Informationsblatt_Hettich_ProDecor_Griffkollektion.pdf). Oversized or edited drilling removes the manufacturer mesh instead of scaling it. Physical fit remains untested.

Sensys: 35 mm cup, 12.8 mm depth, 52 x 5.5 mm fixing axes; plate uses 32 mm slot spacing. Converter tools/convert-hinge-cad.py checks these axes; hinge has 1,722 triangles and plate 1,180. Hinge X points away from the left hinge edge, Y up, Z into the cabinet, with origin on the rear door face at the cup centre. Plate origin is at the fixing-pair centre on its mounting face. Right-hand instances reflect X without resizing. See [supported assembly and drilling](../../../docs/hardware-library.md#first-matched-hinge-and-plate). The rigid hinge mesh hides during opening; the plate stays fixed. Articulated motion and physical fitting remain pending.

Copyright remains with Hettich. Manufacturer files are not covered by the application's license; confirm redistribution terms before publishing. Hardware meshes are preview geometry and do not enter panel nesting or panel-solid STEP exports.

## Accuride 3832-E20 manufacturer CAD

Source: [Accuride North American 3DX catalogue](https://ws.3dexchange.net/ACCURIDE/catalog/65989/57832), exact 3832-E20, STEP AP214 download retrieved 2026-11-03 after sign-in. The original `accuride-3832-e20.step` includes closed and open assemblies, each with three rail solids. The converted mesh keeps the closed rail geometry at its original size.

Regenerate with `python tools/convert-accuride-cad.py tmp/hardware/Accuride_3832-E20.step` using OCP. The converter checks the selected wood pilot circles against the steel openings and records the original SHA-256. Fixed, intermediate and moving meshes have 6,338, 4,982 and 6,944 triangles respectively. Mounting faces and the drawing's front datum define placement; no geometry is resized to fit the cabinet.

The supplied open pose gives 505.912 mm moving travel and 216.733 mm intermediate travel. The 500 mm preview uses those values; the published nominal travel is 508 mm. Animation interpolates the two poses and is not a bearing, collision or load simulation.

All supported 250–700 mm lengths now use their own original STEP and converted meshes. Reference drawing: [3700-9464 R10-0616](https://www.accuride.com/media/amasty/amfile/attach/516dd0135bf3d6a5f7d76cafd3f74da0.pdf). Nominal side space is 12.7 mm, +0.8/−0. Custom or invalid patterns receive no branded preview.

Copyright remains with Accuride. Manufacturer files are not covered by the application's license; confirm redistribution terms before publishing. Physical fit and clone compatibility remain unverified. European DZ3832 is a separate catalogue variant until compared against its exact drawing.


### Additional verified lengths

The same catalogue now supplies exact 3832-E16 (400 mm), E18 (450 mm), E22 (550 mm) and E24 (600 mm) STEP originals and three-stage meshes. The converter reads the app's drilling table and tests every selected 3 mm pilot perimeter against the supplier solid. Travel is taken separately from each supplied pair of poses:

| Model | Nominal length | Moving travel | Intermediate travel |
| --- | --- | --- | --- |
| 3832-E16 | 400 mm | 406.959 mm | 169.520 mm |
| 3832-E18 | 450 mm | 457.683 mm | 219.507 mm |
| 3832-E20 | 500 mm | 505.912 mm | 216.733 mm |
| 3832-E22 | 550 mm | 559.892 mm | 268.707 mm |
| 3832-E24 | 600 mm | 609.879 mm | 318.719 mm |

The E18/E22 fixed rail CAD has no opening at 259 mm, although the drawing's F=224 mm column implies that location. The preset therefore uses the shared subset: [35,163,387] for 450 mm and [35,163,483] for 550 mm. No new hole is inferred from appearance. Existing saved projects using this preset regenerate these pilot subsets; inspect regenerated manufacturing output before machining.

Each moving rail registers from its own front datum. The E22 supplied closed pose has a 0.762 mm front offset; registration removes that pose offset without resizing the part. One detached E22 CAD fragment smaller than 2 mm on every axis is omitted from the preview, recorded as `omittedSmallFragments`; the original STEP remains intact. Actual screws, physical fit and redistribution permission remain unchecked.


### Remaining lengths completed 2026-11-04

Exact catalogue downloads 3832-E10/E12/E14/E26/E28 complete all ten supported sizes. The converter checks every selected 3 mm wood pilot perimeter against steel at the mounting web. The E10/E12 mounting holes differ from the older family drawing: E10 cabinet [35,195], drawer [17.8,35,131,227]; E12 cabinet [35,259], drawer [17.8,35,131,277] mm. Match the supplied physical slide before machining. Original STEP, mounting references, source SHA-256 and measured travel are retained per model.

| Model | Nominal length | Moving travel | Intermediate travel |
| --- | --- | --- | --- |
| 3832-E10 | 250 mm | 243.586 mm | 96.557 mm |
| 3832-E12 | 300 mm | 304.627 mm | 145.618 mm |
| 3832-E14 | 350 mm | 355.905 mm | 144.602 mm |
| 3832-E26 | 650 mm | 660.324 mm | 343.306 mm |
| 3832-E28 | 700 mm | 711.021 mm | 342.493 mm |

The E10 supplied open pose is 10.414 mm short of nominal published 254 mm travel. This is a property of the downloaded pose, not a measured physical stroke; animation preserves that pose without stretching. The converter permits a discrepancy below 5% of nominal length and requires intermediate travel between zero and moving travel. Physical travel remains untested.
