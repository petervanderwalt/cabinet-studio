# Manufacturer hardware models

## Hettich models

Source: [Hettich public CAD packages](https://www.hettich.com/en-no/services/hettich-cad/cad-downloads), retrieved 2026-11-03. Anzio 1160018 comes from STEP_Griffe.zip; Sensys 9071205 and plate 9071575 come from STEP_Scharniere.zip. Original STEP files and converted meshes are retained, with source SHA-256 recorded in each mesh.

Anzio: 128 mm fixing centres, 138 x 10 x 32 mm envelope; 236 triangles. Convert using tools/convert-handle-cad.py. Its mounting axes follow the generated front bores.

The same `STEP_Griffe.zip` package supplies seven further Anzio models, extracted from `Griffe/New_Modern/<part>.stp`: 1160019 (160 mm), 1160020 (224 mm), 1160021 (288 mm), 1160022 (352 mm), 1160023 (480 mm), 1160024 (608 mm) and 1160025 (736 mm). Each original STEP is retained alongside its 236-triangle mesh. The converter verifies both radius-2 mm fixing axes, centre spacing and the full envelope: length = centres + 10 mm, width 10 mm, projection 32 mm. Product dimensions are also listed in the [manufacturer ProDecor data sheet](https://www.hettich.com/fileadmin/Hettich_International/Planning/imos/Informationsblatt_Hettich_ProDecor_Griffkollektion.pdf). Oversized or edited drilling removes the manufacturer mesh instead of scaling it. Physical fit remains untested.

Rossa 9071096 (`Griffe/Classic`) uses two Ø5 mm fixing axes at the published 96 mm centres. The two flat mounting feet lie on STEP Y=0. The loose CAD bounds extend 5.572 mm beyond that plane, but a FreeCAD solid intersection against an 18 mm flat panel returned zero volume. The tessellated envelope is 140 × 9 × 28 mm. The preset uses a starting Ø5.5 mm panel clearance and places the exact mesh in cabinet and kitchen views. Verify physical screw engagement before production. [Hettich ProDecor data sheet](https://www1.hettich.com/downloads/imos/Infosheet_Hettich_Prodecor_Handle_collection_200125_V1.pdf)

Pesaro 9071080 (`Griffe/Modern`) imports as a 15 × 15 × 23 mm solid with a centred Ø4 mm fixing axis and 5 mm blind fixing depth. Hettich's older connector sheet identifies 9071080 as 15 × 15 mm and 9071077 as the 20 × 20 mm version. The newer ProDecor data sheet lists 9071080 as 20 × 20 mm. The preset follows the exact STEP and older article listing, with a starting Ø5 mm panel clearance. Verify the supplied knob and screw before machining. [Hettich connector sheet](https://www-isc.imos3d.com/uploads/tx_dco/Information_sheet_Hettich_connector_data_EN.pdf) · [Newer ProDecor data sheet](https://www1.hettich.com/downloads/imos/Infosheet_Hettich_Prodecor_Handle_collection_200125_V1.pdf)

The V40 connector sheet reverses the two Pesaro assignments. The archive contains the 9071080 STEP and no 9071077 STEP. The second variant needs its own model or a physical sample. [Hettich V40 connector sheet](https://www-isc.imos3d.com/uploads/tx_dco/Information_sheet_Hettich_data_V40_EN_01.pdf)

Sala 9071109 (`Griffe/Organic`) matches the published Ø25 × 20 mm size. The original solid seats on STEP Y=0 without penetrating an 18 mm panel. Its centred Ø5 mm blind fixing is 9 mm deep. The preset uses a starting Ø5.5 mm panel clearance. [Hettich ProDecor data sheet](https://www1.hettich.com/downloads/imos/Infosheet_Hettich_Prodecor_Handle_collection_200125_V1.pdf)

Oka 9080852 (`Griffe/Folk`) matches the published 40 × 20 × 26 mm dimensions. The original solid seats flat on STEP Y=0 and has one centred Ø4 × 8 mm blind fixing. The preset uses a starting Ø5 mm panel clearance and checks the horizontal 40 × 20 mm envelope on doors and drawers. [Hettich ProDecor data sheet](https://www1.hettich.com/downloads/imos/Infosheet_Hettich_Prodecor_Handle_collection_200125_V1.pdf)

Padova 9071857 (`Griffe/Modern`) measures approximately 24 × 19.78 mm at the front, projects 29.98 mm, and seats on STEP Y=0 without penetrating an 18 mm panel. Its Ø4 × 8 mm blind fixing is centred on the mounting foot. The front silhouette extends 7.78 mm below and 12 mm above the fixing, so the fit check uses the actual asymmetric bounds. The preset uses a starting Ø5 mm panel clearance. [Hettich connector sheet](https://www-isc.imos3d.com/uploads/tx_dco/Information_sheet_Hettich_data_V40_EN_01.pdf)

Sensys: 35 mm cup, 12.8 mm depth, 52 x 5.5 mm fixing axes; plate uses 32 mm slot spacing. Converter tools/convert-hinge-cad.py checks these axes; hinge has 1,722 triangles and plate 1,180. Hinge X points away from the left hinge edge, Y up, Z into the cabinet, with origin on the rear door face at the cup centre. Plate origin is at the fixing-pair centre on its mounting face. Right-hand instances reflect X without resizing. See [supported assembly and drilling](../../../docs/hardware-library.md#first-matched-hinge-and-plate). The rigid hinge mesh hides during opening; the plate stays fixed. Articulated motion and physical fitting remain pending.

Copyright remains with Hettich. Manufacturer files are not covered by the application's license; confirm redistribution terms before publishing. Hardware meshes are preview geometry and do not enter panel nesting or panel-solid STEP exports.

### Quadro 2D V6 IW21 cabinet rails

The Hettich runner STEP archive supplies the left/right rails `9304255/9304256`, `9304258/9304259`, `9304261/9304262`, `9304271/9304272` `9304280/9304281` and `9304283/9304284`. Run `python tools/convert-quadro-cad.py STEP_Auszugfuehrungen.zip` with Open Cascade. The converter checks the four January 2025 mounting axes on the fixed solid and retains both original hands. Viewer coordinates are STEP `(X, Z, Y + 28)` in millimetres. The cabinet face is X=0, the screw row is Y=0, and the cabinet front is Z=0. The fixed cabinet rail remains in place during drawer opening. The other two solids retain their exact closed coordinates and hide while the drawer opens. Travel and clip geometry are still pending.

### Quadro 5D V6 IW21 cabinet rails

The same runner archive provides both hands of all six 5D Silent System pairs. The converter uses STEP `(X, Z, Y + 37)` for 5D, with the 37 mm mounting axis at STEP Y=0. It checks the four 5D mounting axes and retains the three solids in their closed position. The moving solids hide during opening while the cabinet rail stays visible.

### Salvia wide pulls

The same `STEP_Griffe.zip` archive supplies 9071020, 9071021, 9071023, 9071024, 9071026, 9071027, 9071030 and 9071038 in `Griffe/Classic`. The converter checks 288, 320, 352, 384, 448, 480, 640 and 736 mm fixing centres. Each pull is 60 mm longer than its fixing spacing, 12 mm wide and projects 35 mm. Cabinet Studio checks the whole pull against the front before adding the matching Ø5 mm bores and CAD.

### Spalatum 9070580 knob

Original `Griffe/Classic/9070580.stp` from the same public `STEP_Griffe.zip` package; converted 2026-11-05. The original is retained as `hettich-9070580.step`. `tools/convert-handle-cad.py` checks the central nominal Ø5 mm cylindrical fixing axis, Ø30 mm envelope and 23 mm projection, and produces 1,556 triangles. The source Y axis becomes viewer Z; the mounting face is at Z=0 and the knob projects to Z=-23. Its single mounting centre follows the generated front bore, including left/right doors and drawers. Oversized/overhanging placement omits the mesh without resizing it.

[Manufacturer product data](https://shop.hettich.com/de_EN/ProDecor-handle-collection/NEW-MODERN-style-world/Knob-Spalatum,-H-23-mm,-%C3%B8-30-mm,-brushed-stainless-steel/p/9070580) confirms Ø30 mm, 23 mm height and 8 mm thread depth. The preset uses Ø5.5 mm panel clearance as a workshop starting value; verify the supplied fixing screw and length for the selected front thickness. CAD bore diameter is not a thread specification. Physical fitting remains untested.

### Sensys inset 9071207 / 9071576

Originals from `STEP_Scharniere.zip`: `Scharniere/Sensys/Oeffnungswinkel_110/einliegend/9071207.stp` and `Scharniere/Montageplatten/System_8099/Zum_Anschrauben/9071576.stp`, converted 2026-11-05 with `python tools/convert-hinge-cad.py <extracted-directory> 9071207 9071576`. The converter checks the same TH52 cup/fixing axes and 32 mm plate slots against these exact files. It emits 1,812 hinge triangles and 1,176 plate triangles, retaining every source face, source hashes and originals. D1.5 plate physical projection is 6.5 mm, versus the D0 model's 5 mm.

Origins/orientation follow the overlay models above. The inset preset uses its own B−4 hinge, D1.5 plate and setback; see [inset construction and source drawings](../../../docs/hardware-library.md#sensys-9071207--9071576-inset-set). Every mounting centre coincides with its generated bore in left/right instances. The hinge is displayed closed only and hides during opening; physical fitting and articulated motion remain unverified.

## Accuride 3832-E20 manufacturer CAD

Source: [Accuride North American 3DX catalogue](https://ws.3dexchange.net/ACCURIDE/catalog/65989/57832), exact 3832-E20, STEP AP214 download retrieved 2026-11-03 after sign-in. The original `accuride-3832-e20.step` includes closed and open assemblies, each with three rail solids. The converted mesh keeps the closed rail geometry at its original size.

Regenerate with `python tools/convert-accuride-cad.py tmp/hardware/Accuride_3832-E20.step` using OCP. The converter checks the selected wood pilot circles against the steel openings and records the original SHA-256. Fixed, intermediate and moving meshes have 6,338, 4,982 and 6,944 triangles respectively. Mounting faces and the drawing's front datum define placement; no geometry is resized to fit the cabinet.

The supplied open pose gives 505.912 mm moving travel and 216.733 mm intermediate travel. The 500 mm preview uses those values; the published nominal travel is 508 mm. Animation interpolates the two poses and is not a bearing, collision or load simulation.

All supported 250–700 mm lengths now use their own original STEP and converted meshes. Reference drawing: [3700-9464 R10-0616](https://www.accuride.com/media/amasty/amfile/attach/516dd0135bf3d6a5f7d76cafd3f74da0.pdf). Nominal side space is 12.7 mm, +0.8/−0. Custom or invalid patterns receive no branded preview.

Copyright remains with Accuride. Manufacturer files are not covered by the application's license; confirm redistribution terms before publishing. Physical fit and clone compatibility remain unverified. European DZ3832 is a separate catalogue variant until compared against its exact drawing.

Recheck the bundled models without rewriting them. Run from the repository root with OCP and Node available.

```powershell
Get-ChildItem assets/hardware/models/accuride-*.step | ForEach-Object {
  python tools/convert-accuride-cad.py $_.FullName --check
  if ($LASTEXITCODE) { throw "CAD check failed for $_" }
}
node --experimental-default-type=module tests/runner-preview.mjs
```


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

### Hettich Sensys 9099540

The original STEP came from Hettich’s Sensys hinge archive. The preview mesh was tessellated in FreeCAD at 0.1 mm deflection with its cup axis at the origin. The fixed 9071575 plate uses the E1 registration. The hinge shows only in the closed pose. See the [hardware notes](../../../docs/hardware-library.md) for the recorded clip overlap and clearance checks.

### Hettich Salona 1170155

Original STEP from Hettich’s ProDecor archive, `Griffe/Organic/1170155.stp`. FreeCAD verified two Ø4 mm fixing axes 160 mm apart and produced the viewer mesh at 0.08 mm deflection. The mesh envelope is 179 × 19 × 27 mm, versus the catalogue’s rounded 180 mm length. The saved preset uses Ø5 mm panel clearance and checks front fit against the mesh.
### Hettich Sensys opening limiters

The original STEP files came from the [Hettich hinge archive](https://www.hettich.com/en-us/services/hettich-cad/cad-downloads), under `Scharniere/Zubehoer/`. FreeCAD imports each as one valid solid. Both are 21 mm along the snap axis and share a Ø3.8 mm central recess and two Ø1.8 mm reliefs. The [installation sheet](https://web2.hettich.com/hbh/addon/montage/300201_Montage_OEWB_Sensys_8657.pdf) shows the alternative clip orientations. An installed CAD datum is still needed before these parts can be placed in the viewer.

| Article | Positions | SHA-256 |
| --- | --- | --- |
| 9090756 | 105° or 120° | `167d3f385dfd4635f5f81fd7e519352e3fd091b737424427f9174f19915bfbdc` |
| 9090864 | 90° or 135° | `2e8b80512d447cafdf1ca24580558c756deee9dedb7ebea88bd202c4b295e29b` |
