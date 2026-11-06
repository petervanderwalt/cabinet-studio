"""Check the original Blum DQDELA STEP with FreeCAD's Python.

Optional second argument: 70T3553 STEP converted from the distributor DXF.
"""
import hashlib
import math
import sys
from pathlib import Path

import FreeCAD
import Part


source = Path(sys.argv[1])
assert hashlib.sha256(source.read_bytes()).hexdigest() == (
    "ff0556711165fe0511f2b8925923f0bdbf28e45a7a783684f15cb8bbf371b9d9"
), "Expected the documented 701 × 450 mm Blum configuration"
assembly = Part.read(str(source))
assert assembly.isValid()
solids = assembly.Solids
assert len(solids) == 17

# Check whether the repeated hinge can independently establish an open pose.
for first, second in zip((*solids[:5], solids[12]), (*solids[5:10], solids[15])):
    aligned = second.copy()
    aligned.translate(FreeCAD.Vector(0, -541, 0))
    assert abs(aligned.Volume - first.Volume) < 0.001
    assert abs(first.common(aligned).Volume - first.Volume) < 0.01

# The STEP has two copies of the hinge and plate, plus CAM pilot volumes.
door = solids[16]
assert abs(door.BoundBox.ZMin - 1.5) < 0.001
assert abs(door.BoundBox.ZLength - 18) < 0.001
bores = {
    (
        round(face.Surface.Radius, 3),
        round(face.Surface.Center.x, 3),
        round(face.Surface.Center.y, 3),
        round(face.BoundBox.ZLength, 3),
    )
    for face in door.Faces
    if isinstance(face.Surface, Part.Cylinder)
}
side = Part.makeBox(18, 701, 100, FreeCAD.Vector(-435, 0, -100))
# The 19 mm variant retains the mounting planes and adds wood outward.
wider_side = Part.makeBox(19, 701, 100, FreeCAD.Vector(-436, 0, -100))
thicker_front = Part.makeBox(450, 701, 1, FreeCAD.Vector(door.BoundBox.XMin, 0, door.BoundBox.ZMax))
thick_door = door.fuse(thicker_front).removeSplitter()
assert thick_door.isValid() and len(thick_door.Solids) == 1

for center_y, hinge, pilots, plate in (
    (80, solids[:5], solids[10:12], solids[12]),
    (621, solids[5:10], solids[13:15], solids[15]),
):
    assert (17.5, -410.5, center_y, 13) in bores
    for offset in (-22.5, 22.5):
        assert (1.25, -401, center_y + offset, 3) in bores
    assert abs(plate.BoundBox.XMin - side.BoundBox.XMax) < 0.001
    for pilot, offset in zip(pilots, (-16, 16)):
        bounds = pilot.BoundBox
        assert abs(bounds.Center.z + 37) < 0.001
        assert abs(bounds.Center.y - center_y - offset) < 0.001
        assert abs(bounds.XMax - side.BoundBox.XMax) < 0.001
        assert abs(bounds.XLength - 3) < 0.001
        assert abs(bounds.YLength - 2.5) < 0.001
        assert abs(bounds.ZLength - 2.5) < 0.001
    assert all(part.common(side).Volume < 0.001 for part in (*hinge, plate))
    assert sum(part.common(door).Volume for part in hinge) < 0.02
    assert all(part.common(wider_side).Volume < 0.001 for part in (*hinge, plate))
    assert all(part.common(thicker_front).Volume < 0.001 for part in (*hinge, plate))
    arm_overlap = hinge[0].fuse(hinge[1]).common(plate).Volume
    assert abs(arm_overlap - 711.250) < 0.01
    axes = [
        {
            complex(round(face.Surface.Center.x, 3), round(face.Surface.Center.z, 3))
            for face in part.Faces
            if isinstance(face.Surface, Part.Cylinder) and abs(face.Surface.Axis.y) > 0.999
        }
        for part in hinge
    ]
    arm1, cup1 = complex(-399.005, 5.573), complex(-419.06, 8.4)
    arm2, cup2 = complex(-408.572, -2.709), complex(-423.86, 3.8)
    assert axes[1] & axes[2] == {arm1}
    assert axes[1] & axes[3] == {arm2}
    assert axes[2] & axes[4] == {cup1}
    assert axes[3] & axes[4] == {cup2}
    assert not axes[0] & (axes[2] | axes[3])

print("PASS: two installed Blum hinge sets, bores, seating, closed clearance and four pivot axes")

def round_front_edges(front):
    vertical_edges = [
        edge for edge in front.Edges
        if edge.BoundBox.YLength > 700 and edge.BoundBox.XLength < 0.001 and edge.BoundBox.ZLength < 0.001
    ]
    assert len(vertical_edges) == 4
    rounded = front.makeFillet(1, vertical_edges)
    assert rounded.isValid()
    return rounded


rounded_door = round_front_edges(door)
rounded_thick_door = round_front_edges(thick_door)
stop = None
if len(sys.argv) > 2:
    stop = Part.read(sys.argv[2])
    assert stop.isValid() and len(stop.Solids) == 1 and len(stop.Faces) == 40
    assert abs(stop.Volume - 154.88236) < 0.001
    stop.rotate(FreeCAD.Vector(), FreeCAD.Vector(0, 0, 1), 180)
    stop.translate(FreeCAD.Vector(-417, 80, -37))
    stop_axes = {
        (round(face.Surface.Radius, 3), round(face.Surface.Center.x, 3), round(face.Surface.Center.z, 3))
        for face in stop.Faces
        if isinstance(face.Surface, Part.Cylinder) and abs(face.Surface.Axis.y) > 0.999
    }
    assert (1.25, -423.86, 3.8) in stop_axes
    assert any(
        isinstance(face.Surface, Part.Cylinder)
        and abs(face.Surface.Axis.z) > 0.999
        and abs(face.Surface.Radius - 17.4) < 0.001
        and abs(face.Surface.Center.x + 410.5) < 0.001
        and abs(face.Surface.Center.y - 80) < 0.001
        for face in stop.Faces
    )
    assert abs(stop.distToShape(door)[0] - 0.1) < 0.001
    assert abs(stop.common(solids[4]).Volume - 86.71147) < 0.001


def moved(part, pivot, rotation, shift):
    shape = part.copy()
    shape.rotate(FreeCAD.Vector(pivot.real, 0, pivot.imag), FreeCAD.Vector(0, -1, 0), rotation)
    shape.translate(FreeCAD.Vector(shift.real, 0, shift.imag))
    return shape

# Solve the two link circles for the closed branch as the door turns outward.
previous = cup1
length1, length2 = abs(cup1-arm1), abs(cup2-arm2)
fixed_hardware = solids[0].fuse(solids[1]).fuse(solids[12])
closed_marks = [complex(door.BoundBox.XMin + offset, door.BoundBox.ZMax) for offset in (10, 100)]
trial_marks = []
for angle in range(111):
    rotation = complex(math.cos(math.radians(angle)), math.sin(math.radians(angle)))
    pitch = (cup2-cup1)*rotation
    centre = arm2-pitch-arm1
    distance = abs(centre)
    along = (length1**2-length2**2+distance**2)/(2*distance)
    across = math.sqrt(length1**2-along**2)
    candidates = [arm1+centre/distance*complex(along, sign*across) for sign in (-1, 1)]
    current = min(candidates, key=lambda point: abs(point-previous))
    previous = current
    if angle in (0, 30, 60, 86, 110):
        marks = [current + (mark - cup1) * rotation - side.BoundBox.XMax for mark in closed_marks]
        trial_marks.append((angle, marks))
    check_stop = stop is not None and angle in (75, 84, 85, 86, 87)
    angles = [math.degrees(math.atan2(change.imag, change.real)) for change in (
        (current-arm1)/(cup1-arm1), (current+pitch-arm2)/(cup2-arm2),
    )]
    link1 = moved(solids[2], arm1, angles[0], 0j)
    link2 = moved(solids[3], arm2, angles[1], 0j)
    cup_pose = moved(solids[4], cup1, angle, current-cup1)
    for piece in (link1, link2, cup_pose):
        assert piece.common(side).Volume < 0.001
        assert piece.common(wider_side).Volume < 0.001
        assert piece.common(solids[12]).Volume < 0.001
    if check_stop:
        installed_stop = moved(stop, cup1, angle, current-cup1)
        overlap1 = installed_stop.common(link1).Volume
        overlap2 = installed_stop.common(link2).Volume
        if angle == 75:
            assert overlap1 < 0.001
        if angle in (84, 86):
            assert overlap1 > 7
        print(f"{angle:3}°: 70T3553 overlap with links {overlap1:.3f} / {overlap2:.3f} mm³")
    door_pose = moved(door, cup1, angle, current-cup1)
    fixed_door_overlap = fixed_hardware.common(door_pose).Volume
    link_door_overlap = [link.common(door_pose).Volume for link in (link1, link2)]
    if angle <= 100:
        assert max(link_door_overlap) < 0.001
    if angle == 101:
        assert link_door_overlap[0] > 0.001
    rounded_pose = moved(rounded_door, cup1, angle, current-cup1)
    link_overlap = link1.common(link2).Volume
    if angle == 0:
        assert abs(link_overlap - 54.656) < 0.01
    if 10 <= angle <= 32:
        assert link_overlap < 0.001
    elif angle in (9, 33):
        assert link_overlap > 0.001
    if angle == 110:
        assert abs(link_overlap - 283.933) < 0.01
        rounded_link_overlap = [link.common(rounded_pose).Volume for link in (link1, link2)]
        assert abs(link_door_overlap[0] - 21.853) < 0.01
        assert abs(link_door_overlap[1] - 19.319) < 0.01
        assert abs(rounded_link_overlap[0] - 21.853) < 0.01
        assert abs(rounded_link_overlap[1] - 17.792) < 0.01
        print(f"110°: rounded link/door overlap {rounded_link_overlap[0]:.3f} / {rounded_link_overlap[1]:.3f} mm³")
    rounded_overlap = rounded_pose.common(side).Volume
    thick_pose = moved(thick_door, cup1, angle, current-cup1)
    thick_overlap = thick_pose.common(wider_side).Volume
    fixed_thick_overlap = fixed_hardware.common(thick_pose).Volume
    assert max(fixed_door_overlap, fixed_thick_overlap) < 0.001
    rounded_thick_overlap = moved(rounded_thick_door, cup1, angle, current-cup1).common(wider_side).Volume
    if angle <= 107:
        assert rounded_thick_overlap < 0.001
    if angle == 108:
        assert abs(rounded_thick_overlap - 133.942) < 0.01
    if angle == 110:
        assert abs(rounded_thick_overlap - 766.328) < 0.01
    if angle <= 108:
        assert rounded_overlap < 0.001
    elif angle == 110:
        assert abs(rounded_overlap - 217.866) < 0.01
    print(f"{angle:3}°: link overlap {link_overlap:.3f} mm³, "
          f"link/door overlap {link_door_overlap[0]:.3f} / {link_door_overlap[1]:.3f} mm³, "
          f"fixed hardware/door overlap {fixed_door_overlap:.3f} / {fixed_thick_overlap:.3f} mm³, "
          f"square door/side overlap {door_pose.common(side).Volume:.3f} mm³, "
          f"rounded 18 mm overlap {rounded_overlap:.3f} mm³, "
          f"19 mm square / rounded overlap {thick_overlap:.3f} / {rounded_thick_overlap:.3f} mm³")
print("PASS: moving links and cup clear the cabinet sides and plate, and both doors clear the fixed hardware at sampled angles")
print("Candidate door marks from the cabinet inside side and front planes (X, Z), mm:")
for angle, marks in trial_marks:
    print(f"{angle:3}°: " + " / ".join(f"({mark.real:.2f}, {mark.imag:.2f})" for mark in marks))
