# Cabinet Studio TODO

Planning backlog; unchecked items are proposed work, not available features.

## Hardware library progress

- [x] Shared preset library for hinge cups/plates, shelf supports, pulls/knobs, runner fit and carcass joinery, with persisted custom dimensions and source references.
- [x] Matched dowel bores for carcass bottom/top/stretchers, including full-width tops, separate edge-boring schedules, depth/face DXF layers, preview markers and hardware counts.
- [x] Manual pocket-hole assembly selection; no angled CNC bores implied.
- [x] Hettich Rastex 15 / Twister 18 mm set: circular cam pockets, bolt pilots, edge passages, set counts and supplier pictures/datasheets.
- [x] Fit larger pulls within panel bounds with a notice; enlarge part thumbnails in a modal.
- [x] Dowel and pocket-screw supplier pictures, dado joint illustration, through dados with an extended carcass bottom and adjustable shelves on pins.
- [x] Cabineo 8 / 12 surface-mounted corner-joint patterns, mating pilots, connector counts and nesting clearance for open-edge bores.
- [ ] Physically validate dowel fits; add per-joint controls and additional mating assemblies.
- [ ] Add complete undermount drawer construction and preparation: Blum TANDEM 563H/563F and MOVENTO first, then Grass Dynapro / Hettich Quadro / Salice Progressa.
- [ ] Add exact connector presets: Cabineo, Confirmat, Minifix/Rafix, Clamex and Domino, including their mating parts and required setups.

See [hardware standards research and implementation status](docs/hardware-library.md) for the USA/Canada library scope and remaining model-specific work.

## First: assembly alignment and joinery

Beta feedback: add **Features → Joinery** to help line up mating parts during assembly. Pocket-hole assembly was the tester's intended starting point; requested alternatives are dowels and Lamello connectors.

- [ ] **Dowels:** generate matched face and edge bores for carcass side-to-bottom/top joints first. Configure diameter, depth on each mating part, end offsets and spacing. Allow alignment dowels alongside manually drilled pocket holes; selecting dowels must not imply a fastening method.
- [ ] **Machining setup:** identify the mating parts, reference edge, machining face, bore axis and depth for every joint. Separate face operations from edge drilling and show the required secondary setup for a flatbed router. Do not export edge bores as ordinary face-drill circles.
- [ ] **Joinery controls:** default to None for existing projects; save the choice with each cabinet. Show matching joint locations in panel and 3D previews, individual/nested exports and the manufacturing manifest. Permit disabling individual joints where hardware or access interferes.
- [ ] **Validation:** reject breakthrough, insufficient remaining material, invalid spacing and collisions with rebates or hardware. Verify mating alignment after dimension changes, mirroring, unit changes, save/load and nesting rotation. Confirm the first pattern with a physical test joint before release.
- [ ] **Lamello Cabineo:** evaluate Cabineo 8/12 as the first connector presets. Use current manufacturer machining drawings for pockets, mating holes, thickness limits and tool requirements; include connector quantities in the hardware list. Microvellum describes Cabineo as requiring surface machining, making it a candidate for the flatbed workflow.
- [ ] **Lamello Clamex / P-System:** evaluate separately after Cabineo. Record the required P-System groove tooling or separate joiner operation and access-hole setup. Enable only supported machining workflows; a generic pocket is not a P-System groove.
- [ ] **Pocket holes:** establish whether users need assembly instructions only or generated machining. Keep manual jig operations explicit; CNC output would need its own angled-drilling capability and validation.

Suggested delivery order: matched dowel joints and setup reporting → Cabineo → Clamex. Confirm connector models and workshop equipment before implementing connector geometry.

## Next: production workflow candidates

These are proposals informed by Microvellum's published workflows, not a commitment to feature parity. Check existing behaviour before scoping each item; Cabinet Studio already has parametric cabinets, hardware drilling, material-aware nesting, DXFs and manufacturing ZIP exports.

- [ ] **Shop and assembly drawings:** dimensioned part sheets and cabinet elevations/sections, matching part IDs, joint callouts and assembly references.
- [ ] **Hardware BOM:** connector, hinge, runner and handle quantities tied to selected hardware and cabinet copy counts; include purchase references and machining drawing revisions.
- [ ] **Reusable cabinet presets:** save proven construction and hardware settings as named templates, retaining project-specific overrides.
- [ ] **Production reporting:** printable cut lists, edge-banding totals, stock summaries and assembly labels using consistent part IDs across drawings, nesting and exports.
- [ ] **Basic costing:** optional user-entered sheet, hardware and edge-banding prices; distinguish material estimates from later labour/machine-time costing.
- [ ] **Machine-specific output:** assess CAM handoff and operation/setup metadata before considering toolpaths or post-processors for particular machines.

## Research references

Reviewed 2026-10-22. Competitor pages describe advertised capabilities; manufacturer drawings and workshop trials are still required for machining presets.

- [Microvellum Lamello integration: Cabineo and Clamex families](https://www.microvellum.com/resources/news/lamello-furniture-connectors-now-available-in-the-foundation-library)
- [Microvellum product overview: configurable libraries, drawings, estimates and manufacturing](https://www.microvellum.com/solutions/products)
- [Microvellum design-to-manufacturing processes: detailing, costing, libraries and reporting](https://www.microvellum.com/solutions/processes)
- [Microvellum overview](https://www.microvellum.com/)
