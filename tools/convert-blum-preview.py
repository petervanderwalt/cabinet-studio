"""Convert a verified local Blum configuration to a private preview file.

Use FreeCAD's Python: python.exe tools/convert-blum-preview.py source.step output.json
Keep the output outside the repository.
"""
import hashlib
import json
import math
import sys
from pathlib import Path

import FreeCAD
import Part


source, output = map(Path, sys.argv[1:])
source_hash = hashlib.sha256(source.read_bytes()).hexdigest()
hinge_hash = "ff0556711165fe0511f2b8925923f0bdbf28e45a7a783684f15cb8bbf371b9d9"
inset_hash = "a469c12f8aa023b31487ee1cf447ed8d1b572c1b2ee4b9595fa43ab7edc2c87b"
locks = {
    "90d7a46237f0fff4ef297e935b90f7352e6d1a1ceb3f12a506f260263dc04d5c": ("T51.7601R", -21),
    "275a727f96fd0f318ea1dd45757160ce6672264070e8947f8580b51b62a7d8ca": ("T51.7601L", 21),
}
if source_hash not in (hinge_hash, inset_hash) and source_hash not in locks:
    raise SystemExit("Expected the verified Blum hinge configuration or MOVENTO lock STEP")
if output.suffix.lower() != ".json" or output.resolve().is_relative_to(Path(__file__).resolve().parents[1]):
    raise SystemExit("Save the private preview as a JSON file outside the repository")

minimum_lock_stock = 15 * 25.4 / 32


def check_lock_clearance(solid, origin):
    """Check the registered lock against a nominal 130 mm inside drawer corner."""
    side_x, bottom_y, front_z = origin
    inside_x = side_x if side_x > 0 else side_x - 130
    for thickness in (minimum_lock_stock, 12, 13, 13.001, 16):
        side_start = side_x - thickness if side_x > 0 else side_x
        wood = (
            Part.makeBox(thickness, 60, 150, FreeCAD.Vector(side_start, bottom_y - 13, front_z - 150)),
            Part.makeBox(130, 60, thickness, FreeCAD.Vector(inside_x, bottom_y - 13, front_z)),
            # The underside stays fixed. A 10 mm bottom contains all thinner supported bottoms.
            Part.makeBox(130, 10, 150, FreeCAD.Vector(inside_x, bottom_y, front_z - 150)),
        )
        mounted = solid.copy()
        if thickness <= 13:
            # This checks wood clearance for the nominal spacer offset only.
            mounted.translate(FreeCAD.Vector(0, 0, -3.5))
        for panel in wood:
            assert mounted.common(panel).Volume < 0.001, f"Lock intersects {thickness} mm drawer stock"
    # A wrong vertical datum must hit the drawer bottom in this test.
    mounted = solid.copy()
    mounted.translate(FreeCAD.Vector(0, 0.2, 0))
    assert mounted.common(wood[2]).Volume > 1


def check_lock_drill_access(solid, origin):
    """Check tool access through the two front-facing screw reliefs."""
    side_x, bottom_y, front_z = origin
    reliefs = sorted({
        round(face.Surface.Center.x, 3)
        for face in solid.Faces
        if isinstance(face.Surface, Part.Cylinder)
        and abs(face.Surface.Radius - 2) < 0.001
        and abs(face.Surface.Axis.z) > 0.999
    })
    expected = (24.5, 47.5) if side_x > 0 else (24, 47)
    assert sorted(abs(x - side_x) for x in reliefs) == list(expected)
    tilt = math.radians(15)
    axis = FreeCAD.Vector(0, -math.sin(tilt), -math.cos(tilt))
    for x in reliefs:
        entry = FreeCAD.Vector(x, -17.075, front_z)
        angled = Part.makeCylinder(1.25, 10, entry, axis)
        straight = Part.makeCylinder(1.25, 10, entry, FreeCAD.Vector(0, 0, -1))
        assert solid.common(angled).Volume < 0.001
        assert solid.common(straight).Volume > 1
        standard_pilot = Part.makeCylinder(1.25, 10, entry, -axis)
        assert standard_pilot.BoundBox.ZMax < front_z + 13
        assert standard_pilot.BoundBox.YMax < bottom_y
        # Extend the relief axis back through the nominal spacer gap.
        # The spacer itself still needs a seating and tool-access check.
        wood_entry = entry + FreeCAD.Vector(0, 3.5 * math.tan(tilt), 0)
        thin_pilot = Part.makeCylinder(1.25, 10, wood_entry, -axis)
        assert thin_pilot.BoundBox.ZMax < front_z + minimum_lock_stock
        assert thin_pilot.BoundBox.YMin > bottom_y - 13
        assert thin_pilot.BoundBox.YMax < bottom_y


assembly = Part.read(str(source))
assert assembly.isValid()
if source_hash == hinge_hash:
    assert len(assembly.Solids) == 17
    cup_origin = (-410.5, 80, 1.5)
    plate_origin = (-417, 80, -37)
    cup_axes = {
        (round(face.Surface.Center.x - cup_origin[0], 3), round(face.Surface.Center.y - cup_origin[1], 3))
        for face in assembly.Solids[4].Faces
        if isinstance(face.Surface, Part.Cylinder) and abs(face.Surface.Axis.z) > 0.999
        and abs(face.Surface.Radius - 1.9) < 0.001
    }
    plate_axes = {
        (round(face.Surface.Center.y - plate_origin[1], 3), round(face.Surface.Center.z - plate_origin[2], 3))
        for face in assembly.Solids[12].Faces
        if isinstance(face.Surface, Part.Cylinder) and abs(face.Surface.Axis.x) > 0.999
        and abs(face.Surface.Radius - 2.15) < 0.001
    }
    assert cup_axes == {(9.5, -22.5), (9.5, 22.5)}
    assert plate_axes == {(-16, 0), (16, 0)}
    # The legacy 71B3550 key holds only the links. The cup and arm render in both poses.
    parts = (
        ("71B3550", assembly.Solids[2:4], cup_origin),
        ("71B3550-cup", [assembly.Solids[4]], cup_origin),
        ("71B3550-arm", assembly.Solids[:2], plate_origin),
        ("173H7100", [assembly.Solids[12]], plate_origin),
    )
elif source_hash == inset_hash:
    assert len(assembly.Solids) == 17
    solids = assembly.Solids
    cup_origin = (-431.5, 80, -18)
    plate_origin = (-454, 80, -56.5)
    door, plate = solids[16], solids[2]
    assert abs(door.BoundBox.ZMin + 18) < 0.001 and abs(door.BoundBox.ZMax) < 0.001
    assert abs(plate.BoundBox.XMin - plate_origin[0]) < 0.001
    for index, offset in enumerate((-16, 16)):
        assert (solids[index].BoundBox.Center - FreeCAD.Vector(-455.5, 80 + offset, -56.5)).Length < 0.001
    side = Part.makeBox(18, 701, 100, FreeCAD.Vector(-472, 0, -100))
    assert all(part.common(side).Volume < 0.001 for part in [plate, *solids[6:11]])
    assert sum(part.common(door).Volume for part in [plate, *solids[6:11]]) < 0.05
    parts = (
        ("71B3750", solids[8:10], cup_origin),
        ("71B3750-cup", [solids[10]], cup_origin),
        ("71B3750-arm", solids[6:8], plate_origin),
        ("173H7100-inset", [plate], plate_origin),
    )
else:
    assert len(assembly.Solids) == 1
    sku, x = locks[source_hash]
    origin = (x, -9.575, 37)
    check_lock_clearance(assembly.Solids[0], origin)
    check_lock_drill_access(assembly.Solids[0], origin)
    parts = ((sku, assembly.Solids, origin),)

models = {}
for sku, solids, origin in parts:
    positions = []
    for solid in solids:
        points, triangles = solid.tessellate(0.1)
        for a, b, c in triangles:
            # Viewer Z is positive toward the cabinet back.
            for index in (a, c, b):
                point = points[index]
                positions.extend(round(value, 5) for value in (
                    point.x - origin[0], point.y - origin[1], origin[2] - point.z,
                ))
    assert positions and len(positions) % 9 == 0
    models[sku] = positions

output.write_text(json.dumps({"sourceSha256": source_hash, "models": models}, separators=(",", ":")), encoding="utf-8")
print("Saved local Blum preview")
