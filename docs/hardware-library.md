# Hardware library: research and support

Reviewed 2026-10-22, with USA/Canada as the first additional market. Priorities below are product decisions based on manufacturer documentation, not market-share rankings.

## What is actually standardized?

- **System 32 is a layout convention:** 32 mm hole pitch and a common 37 mm front reference line. It does not make every hinge, runner or connector interchangeable. Kreg documents both the pitch and front reference; Hettich publishes System 32 layouts. The rear row, vertical starting datum, hole diameter and depth still need an explicit choice. Cabinet Studio's 37 mm shelf preset uses the same setback at both ends; it is not a complete System 32 cabinet-design certification. [Kreg](https://www.kregtool.com/en/products/cabinet-solutions/cabinet-drawer-and-shelf-jigs/shelf-pin-jig-5-mm/KMA3232.html), [Hettich](https://hta-diy.hettich.com/fileadmin/HTA-DIY/Files/MA_922067700_0000351_web.pdf)
- **35 mm concealed hinge cups are a useful family, not a full hinge specification.** Cup depth, edge distance, screw/dowel fixing, plate height and overlay must come from the actual hinge/plate combination. The existing Blum cruciform preset describes its 37/32 plate holes only. A face-frame hinge needs its own mounting arrangement. [Blum CLIP top assembly](https://www.blum.com/us/en/products/hingesystems/clip-top/assembly/), [mounting plate catalogue](https://publications.blum.com/2024/catalogue/en/150/), [Blum COMPACT](https://www.blum.com/us/en/products/hingesystems/compact/assembly/)
- **Metric and imperial parts coexist:** 5 mm shelf pins and ¼-inch shelf pins are distinct. Preserve ¼ inch as exactly 6.35 mm. Preserve a true 3-inch handle pattern as 76.2 mm, rather than treating every catalogue's nominal 76 mm pull as identical. Common metric handle-centre choices are patterns, not guaranteed SKU compatibility. [Kreg ¼-inch jig](https://www.kregtool.com/shop/cabinet-solutions/cabinet-drawer-shelf-jigs/shelf-pin-jig-14/KMA3225.html), [Amerock pull catalogue](https://www.amerock.com/pulls/)
- **Slide families have different fit rules.** Accuride 3832E specifies 12.7 mm side space with +0.8 / −0 tolerance. Blum TANDEM 563H specifies inside drawer width as opening width minus 42 mm: outside width therefore depends on side thickness. It also needs bottom recess, rear preparation and locking devices. Applying a generic side clearance to every undermount is wrong. [Accuride specification](https://www.accuride.com/media/amasty/amfile/attach/516dd0135bf3d6a5f7d76cafd3f74da0.pdf), [Blum 563H installation](https://d2.blum.com/services/BEC003/tdm563h_ma_dok_bus_%24sen-us_%24aof_%24v4.pdf)
- **Performance standards are separate from machining patterns.** ANSI/BHMA A156.9 covers cabinet hardware; AWI references it for drawer-slide capacity requirements. Those references do not establish one universal drilling template. No strength, load or standards-compliance certification is implied by a Cabinet Studio preset. [ANSI scope](https://webstore.ansi.org/standards/bhma/ANSIBHMAA1562020-2429223), [AWI drawer hardware requirements](https://awinet.org/standards/requirements-architectural-wood-casework/3-3-structural-4/)

## Must-have families and implementation status

| Family | Initial coverage | Remaining work |
| --- | --- | --- |
| Concealed hinges / plates | Editable 35 mm cup starting pattern; existing South African four-hole plate; Blum 37/32 two-hole plate | Exact hinge/plate SKUs, fixing holes and overlay/plate-height calculations; face-frame COMPACT models |
| Adjustable shelf supports | 5 mm and exact ¼-inch bores, 32 mm pitch / 37 mm setback presets, editable bore depth | Sleeved supports and locking/special shelf supports |
| Pulls and knobs | None, single-hole knobs; exact 3-inch and 4-inch centre patterns, plus 96/128/160/192/224/256/320 mm pulls; editable screw clearance | SKU/finish purchasing data, edge pulls and recessed pulls |
| Side-mount slides | Accuride 3832E **fit only**: side clearance and actual 250–700 mm lengths in 50 mm steps | Length-specific mounting templates, face-frame blocking/rear brackets; other model families |
| Undermount slides | Researched, not selectable | Prioritize Blum TANDEM 563H / 563F and MOVENTO, then Grass Dynapro, Hettich Quadro and Salice Progressa; each needs its own drawer construction and preparation |
| Alignment dowels | 8 × 30 mm and ¼ × 1 inch shop starting patterns, matched carcass face/edge bores | Physical trial; per-joint enable/disable; shelf and face-frame joints |
| Pocket screws | Manual jig assembly note, persisted and exported; no angled face-DXF drilling | Joint placement, screw selection and counts for specific jig/stock combinations |
| Confirmat assembly screws | Researched, not selectable | Exact screw variant, stepped clearance/pilot/countersink and edge-bore schedule |
| Knock-down connectors | Hettich Rastex 15 cam 13957 + Twister 9047861 for 18 mm stock; Lamello Cabineo 8/12 surface-mounted corner joints | Cabineo flush/cover-cap/M6 variants, specific Minifix/Rafix sets and Clamex P-System |
| Dados | Through dados for the carcass bottom, matching panel extensions, adjustable engagement and fit clearance | Stopped dados, top/stretcher joints and combined joinery selections |
| Biscuits / loose tenons | Researched, not selectable | Separate joiner setup/registration, specific Domino connector or tenon geometry |
| Lift stays / catches / wall suspension / feet | Research queue | Door-weight and mounting-dependent product selection; carcass/room models do not yet describe these assemblies |

The library currently exposes usable operations, a clearly labelled fit-only runner, and manual pocket-hole instructions. Unimplemented families stay out of the preset selector.

See [pocketed connector research, supplier pictures and machining drawings](pocket-connectors.md) for the Rastex preset and the other connector families.

## Why the next families need individual models

**Undermounts are the next major functional gap.** The current drawer model has an applied front, sides, back and bottom; it does not represent all the recessed-bottom, inner-front, rear-notch and locking-device features those systems require. Blum's 563H instructions give inside-width deductions, maximum side thickness, a 13 mm bottom recess and jig-dependent locking-device preparation. 563F cannot be treated as another label on 563H. Grass offers separate Dynapro versions for 16 mm and 19 mm drawer material; Salice publishes separate preparation and locking instructions. [Blum downloads](https://www.blum.com/us/en/products/runnersystems/tandem/downloads-videos/), [Grass Dynapro](https://www.grassusa.com/products/dynapro/), [Hettich Quadro specification](https://web.hettich.com/fileadmin/media/RES/Quadro_IW21_4D_HUS_0317_16397_9225592_en.pdf), [Salice USA/Canada instructions](https://www.salice.com/us/en/download/assembly-instructions)

**Connectors need a complete mating set.** Minifix and Rafix are product families with different housings, bolts, drilling offsets and panel thickness limits. A generic cam hole is insufficient. Confirmat also needs clearance and pilot operations appropriate to its exact variant. [Häfele connectors](https://www.hafele.com/us/en/products/furniture-fittings-living-solutions/connectors-shelf-supports/connectors/50/), [Häfele Confirmat example](https://www.hafele.si/en/product/one-piece-connector-confirmat-cylindrical-head-for-drill-hole-5-mm/P-00861436/)

**Cabineo suits surface machining; Clamex needs P-System grooves.** Preserve the distinction between a conventional router/drill workflow and special cutter/joiner operations. Loose tenons and detachable Domino connectors are also different products. [Lamello drilling system](https://lamello.com/products/drilling-system), [Lamello catalogue](https://lamello.com/fileadmin/Downloads/Katalog/Catalogue_EN_2024_2025.pdf), [Festool joining systems](https://www.festoolusa.com/accessories/joining)

## Using the implemented library

Under **Hardware**, choose a preset for each category, then adjust its dimensions in the existing hardware tabs. Editing pattern dimensions changes that category to Custom; positioning changes such as handle height retain the pattern. Selecting another category does not replace unrelated dimensions. Sources and support limitations appear with the chosen preset. Values are stored in millimetres and retained when switching display units, saving, importing or copying cabinets. Existing projects start with their existing dimensions.

Larger pulls automatically move to the nearest centre that leaves 2 mm of stock beyond the hole radii. The requested offsets remain saved; warnings and the machining schedule report the actual location. A pattern too large for the panel is omitted with a warning. Click a part thumbnail for an enlarged preview; Escape, the close button or the backdrop closes it.

Side-mount fit uses a selected physical slide length rather than a proportion of cabinet depth. The fit preset omits the old generic runner-reference holes, since those are not an Accuride mounting template. Too little depth, unsupported face-frame construction or invalid side clearance suppresses drawer-box output with a warning. Drawer fronts remain available. Choose Custom clearance / reference holes to restore the original reference workflow.

Dowel presets cover bottom-to-side and top/stretcher-to-side joints. A full-width base top has underside face bores mating with bores into the side-panel top edges. A between-sides top instead has end bores mating with side face bores. Patterns leave the existing part sizes unchanged. Offsets/spacing are shop starting values; they are not an industry-mandated dowel layout.

**Through dados** fix the carcass bottom into both side panels. The mating width is `clear opening + 2 × engagement`: an 800 mm carcass with 18 mm sides and 6 mm engagement produces a 776 mm bottom, rather than 764 mm. Slot width follows each mating panel's actual thickness plus fit clearance, with clearance above the panel. Shelves keep their original sizes and assembled heights, remain adjustable on pins, and retain all shelf-pin holes. Top/cap/stretcher joints are unchanged. Rear rebates remain continuous across the extended bottom. Side solids, previews, nesting and DXFs use the same extended dimensions. Dados run out through front/rear edges; they are not stopped pockets. Depth is limited to half the carcass thickness with at least 3 mm remaining. A failed pattern leaves the original part dimensions intact and reports a warning.

**Cabineo 8 / 12** use Lamello's surface-mounted drilling option 1: three overlapping Ø15 mm blind bores at 3.6, 14.8 and 26 mm from the joining edge, 11 mm deep. The mating Ø5 mm pilot is 8 or 12 mm deep and its axis is 5 mm from the housing's mounting face. Corner-joint presets require at least 12 / 13 mm stock respectively; they do not model opposing connectors on a centre panel. Face/depth drilling is exported without edge bores. The first housing bore deliberately runs 3.9 mm through the joining edge; nesting automatically enforces at least 7.8 mm between part outlines and reports any increase. These are overlapping boring operations, not separate profile cuts. Flush, cover-cap and M6 variants are excluded. [Lamello machining instructions, page 2](https://lamello.com/fileadmin/products/Operating_instructions_Cabineo.pdf#page=2).

Patterns with invalid depth, insufficient stock, inadequate glue allowance, or conflicts with existing drilling/rebates/notches are omitted with warnings. No subset of a failed dowel pattern is emitted. Defaults require 2 mm of surrounding stock and at least 1 mm combined glue allowance. Drill a physical trial joint before production.

## Manufacturing handoff

- Face holes with an explicit setup/depth use `DRILL_INSIDE_D12MM`, `DRILL_UNDERSIDE_D12MM`, `DRILL_BACK_D13MM`, etc. Layer depths always state millimetres, including inch DXFs. Unspecified legacy drilling stays on `DRILL`.
- Different faces need separate machining setups. Nesting rotates face geometry but does not automatically generate a flipped-sheet registration or CAM toolpaths. Do not machine opposite faces in one setup.
- Dados use `DADO_INSIDE_D6MM` (with the selected depth). Their rectangles specify the routing footprint. The schedule and manifest record engagement and the extended mating dimensions.
- Edge bores are crosses in part previews and separate entries in `machining-schedule.json`; they never appear as face-drill circles. Individual part DXFs include edge-bore text callouts on `LABEL`.
- The schedule uses original panel-local DXF x/y coordinates before nesting rotation, edge names `x-min` / `x-max` / `y-max`, and an offset across stock thickness. Joint IDs identify matching operations; project copies receive separate IDs and mating part references.
- Cabinet/project manifests include selected presets, support status, source links, warnings and hardware counts. Quantities include generated hinge/plate sets, handles, four supports per shelf, runner pairs and one dowel per paired joint. Assembly screws and unmodelled accessories are not counted.

Run checks with:

```powershell
node --experimental-default-type=module tests/hardware-library.mjs
node --experimental-default-type=module tests/hardware-export.mjs
```
