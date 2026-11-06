"""Convert supported Hettich Sensys hinge/plate STEP files to aligned meshes.

Requires OCP. Usage: python tools/convert-hinge-cad.py directory [9071207 9071576]
With no part numbers, converts the original 9071205/9071575 overlay pair.
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

for sku in sys.argv[2:] or ['9071205', '9071575']:
    thin_sources = {'9094270':'9094000', '9094280':'9094010', '9094290':'9094020'}
    thick95 = sku in ['9090260','9090270','9090280']
    assert sku in thin_sources or thick95 or sku in ['9071205','9071206','9071207','9071570','9071575','9071576','9099540','9099550','9099590']
    source_sku = thin_sources.get(sku, sku)
    matches=list(Path(sys.argv[1]).rglob(source_sku+'.stp'))
    assert len(matches)==1, f'Expected one original STEP for {sku}'
    source = matches[0]
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
    hinge=sku not in ['9071570','9071575','9071576']
    cup_depth = 7.8 if sku in thin_sources else 11.5 if sku in ['9099540','9099550','9099590'] else 12.8
    fixing_y = 0 if thick95 else 4 if sku in thin_sources else 3 if sku in ['9099540','9099590'] else 5
    fixing_x, fixing_half_pitch = (6, 24) if sku == '9099590' else (5.5, 26)
    if hinge:
        assert all((2.6, (fixing_x, fixing_y, z), (0, 1, 0)) in axes for z in [-fixing_half_pitch, fixing_half_pitch])
        axis_y = -6.4 if thick95 else -cup_depth
        assert (17.5, (0, axis_y, 0), (0, 1, 0)) in axes
        mounts = [[fixing_x, -fixing_half_pitch, 0], [fixing_x, fixing_half_pitch, 0]]
    else:
        assert all((2.85, (5, 0, z), (1, 0, 0)) in axes for z in [-16, 16])
        # Sections E1 and A5 put the cabinet front along negative STEP Y.
        mounts = [[0, -16, 0], [0, 16, 0]]
    BRepMesh_IncrementalMesh(shape, 0.1)
    positions = []
    for face in faces:
        location = TopLoc_Location()
        mesh = BRep_Tool.Triangulation_s(face, location)
        assert mesh is not None
        for index in range(1, mesh.NbTriangles() + 1):
            nodes = list(mesh.Triangle(index).Get())
            if face.Orientation() != TopAbs_REVERSED:
                nodes.reverse()
            for node in nodes:
                point = mesh.Node(node).Transformed(location.Transformation())
                positions.extend(round(v, 5) for v in (point.X(), point.Z(), point.Y()))
    bounds = [[min(positions[a::3]), max(positions[a::3])] for a in range(3)]
    assert all(-100 < v < 100 for pair in bounds for v in pair)
    if hinge:
        assert abs(bounds[2][0] + cup_depth) < 0.01
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
