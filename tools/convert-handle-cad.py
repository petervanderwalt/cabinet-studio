"""Convert the Hettich 1160018 STEP to a small viewer mesh (requires OCP).

Usage: python tools/convert-handle-cad.py path/to/1160018.stp
The original mounting axes are checked before conversion; dimensions are mm.
"""
import hashlib
import json
import sys
import re
from pathlib import Path

from OCP.BRep import BRep_Tool
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.GeomAbs import GeomAbs_Cylinder
from OCP.STEPControl import STEPControl_Reader
from OCP.TopAbs import TopAbs_FACE, TopAbs_REVERSED
from OCP.TopExp import TopExp_Explorer
from OCP.TopLoc import TopLoc_Location
from OCP.TopoDS import TopoDS

source = Path(sys.argv[1])
part_number=re.search(r'\d{7}',source.name).group()
spacing={'1160018':128,'1160019':160,'1160020':224,'1160021':288,
         '1160022':352,'1160023':480,'1160024':608,'1160025':736}[part_number]
reader = STEPControl_Reader()
reader.ReadFile(str(source))
assert reader.TransferRoots() > 0, 'STEP transfer failed'
shape = reader.OneShape()
faces = []
mounts = set()
explorer = TopExp_Explorer(shape, TopAbs_FACE)
while explorer.More():
    face = TopoDS.Face(explorer.Current())
    faces.append(face)
    surface = BRepAdaptor_Surface(face)
    if surface.GetType() == GeomAbs_Cylinder:
        cylinder = surface.Cylinder()
        point, direction = cylinder.Location(), cylinder.Axis().Direction()
        assert abs(cylinder.Radius() - 2) < 1e-6
        assert abs(direction.Y()) > 0.999999
        mounts.add(tuple(round(v, 6) for v in (point.X(), point.Y(), point.Z())))
    explorer.Next()
assert mounts == {(0, 0, 0), (spacing, 0, 0)}, mounts

BRepMesh_IncrementalMesh(shape, 0.08)
positions = []
for face in faces:
    location = TopLoc_Location()
    mesh = BRep_Tool.Triangulation_s(face, location)
    assert mesh is not None
    for index in range(1, mesh.NbTriangles() + 1):
        nodes = list(mesh.Triangle(index).Get())
        # Swapping the source Y/Z axes reverses winding.
        if face.Orientation() != TopAbs_REVERSED:
            nodes.reverse()
        for node in nodes:
            point = mesh.Node(node).Transformed(location.Transformation())
            positions.extend(round(v, 5) for v in (point.X() - spacing/2, point.Z(), point.Y()))
bounds = [[min(positions[a::3]), max(positions[a::3])] for a in range(3)]
for actual, expected in zip(bounds, [[-spacing/2-5, spacing/2+5], [-5, 5], [-32, 0]]):
    assert all(abs(a - b) < 0.01 for a, b in zip(actual, expected)), bounds
output = Path(__file__).resolve().parents[1] / f'assets/hardware/models/hettich-{part_number}.js'
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text('export default ' + json.dumps({
    'manufacturer': 'Hettich', 'partNumber': part_number, 'units': 'mm',
    'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
    'mountingCentres': [[-spacing/2, 0, 0], [spacing/2, 0, 0]],
    'bounds': bounds, 'positions': positions,
}, separators=(',', ':')) + ';\n', encoding='utf-8')
print(f'{output.name}: {len(positions) // 9} triangles; mounting centres and bounds checked')
output.with_suffix('.step').write_bytes(source.read_bytes())
