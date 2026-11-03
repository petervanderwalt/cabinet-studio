"""Convert Hettich 9071205 and 9071575 STEP files to mounting-aligned meshes.

Requires OCP. Usage: python tools/convert-hinge-cad.py directory/with/stp/files
"""
import hashlib
import json
import sys
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

for sku in ['9071205', '9071575']:
    source = Path(sys.argv[1]) / (sku + '.stp')
    reader = STEPControl_Reader()
    reader.ReadFile(str(source))
    assert reader.TransferRoots() > 0
    shape = reader.OneShape()
    explorer = TopExp_Explorer(shape, TopAbs_FACE)
    faces, axes = [], set()
    while explorer.More():
        face = TopoDS.Face(explorer.Current())
        faces.append(face)
        surface = BRepAdaptor_Surface(face)
        if surface.GetType() == GeomAbs_Cylinder:
            cylinder = surface.Cylinder()
            point, direction = cylinder.Location(), cylinder.Axis().Direction()
            axes.add((round(cylinder.Radius(), 3),
                      tuple(round(v, 3) for v in (point.X(), point.Y(), point.Z())),
                      tuple(round(abs(v), 3) for v in (direction.X(), direction.Y(), direction.Z()))))
        explorer.Next()
    if sku == '9071205':
        assert all((2.6, (5.5, 5, z), (0, 1, 0)) in axes for z in [-26, 26])
        assert (17.5, (0, -12.8, 0), (0, 1, 0)) in axes
        transform = lambda p: [p.X(), p.Z(), p.Y()]
        mounts = [[5.5, -26, 0], [5.5, 26, 0]]
    else:
        assert all((2.85, (5, 0, z), (1, 0, 0)) in axes for z in [-16, 16])
        transform = lambda p: [p.X(), p.Z(), -p.Y()]
        mounts = [[0, -16, 0], [0, 16, 0]]
    BRepMesh_IncrementalMesh(shape, 0.1)
    positions = []
    for face in faces:
        location = TopLoc_Location()
        mesh = BRep_Tool.Triangulation_s(face, location)
        assert mesh is not None
        for index in range(1, mesh.NbTriangles() + 1):
            nodes = list(mesh.Triangle(index).Get())
            if (face.Orientation() == TopAbs_REVERSED) != (sku == '9071205'):
                nodes.reverse()
            for node in nodes:
                point = mesh.Node(node).Transformed(location.Transformation())
                positions.extend(round(v, 5) for v in transform(point))
    bounds = [[min(positions[a::3]), max(positions[a::3])] for a in range(3)]
    assert all(-100 < v < 100 for pair in bounds for v in pair)
    if sku == '9071205':
        assert abs(bounds[2][0] + 12.8) < 0.01
    else:
        assert abs(bounds[0][0]) < 0.01
    output = Path(__file__).resolve().parents[1] / f'assets/hardware/models/hettich-{sku}.js'
    output.write_text('export default ' + json.dumps({
        'manufacturer': 'Hettich', 'partNumber': sku, 'units': 'mm',
        'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
        'mountingCentres': mounts, 'bounds': bounds, 'positions': positions,
    }, separators=(',', ':')) + ';\n', encoding='utf-8')
    output.with_suffix('.stp').write_bytes(source.read_bytes())
    print(f'{sku}: {len(positions)//9} triangles; mounting axes checked; bounds {bounds}')
