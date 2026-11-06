"""Convert verified Quadro 2D V6 handed STEP rails in their closed position."""
import hashlib
import json
import sys
from pathlib import Path
from zipfile import ZipFile
from OCP.BRep import BRep_Tool
from OCP.BRepAlgoAPI import BRepAlgoAPI_Common
from OCP.BRepClass3d import BRepClass3d_SolidClassifier
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.BRepPrimAPI import BRepPrimAPI_MakeCylinder
from OCP.GeomAbs import GeomAbs_Cylinder
from OCP.STEPControl import STEPControl_Reader
from OCP.TopAbs import TopAbs_FACE, TopAbs_IN, TopAbs_REVERSED, TopAbs_SOLID
from OCP.TopExp import TopExp_Explorer
from OCP.TopLoc import TopLoc_Location
from OCP.TopoDS import TopoDS
from OCP.gp import gp_Ax2, gp_Dir, gp_Pnt

rows = {9304255: (133, 229), 9304258: (165, 261), 9304261: (165, 357), 9304271: (261, 453), 9304280: (261, 517), 9304283: (261, 453)}
rows_5d = {
    (9374861, 9374862): (165, 229), (9374863, 9374866): (197, 261),
    (9374867, 9374898): (197, 357), (9374899, 9374900): (293, 453),
    (9374901, 9374902): (293, 517), (9374903, 9374904): (293, 453),
}
out = Path(__file__).resolve().parents[1] / 'assets/hardware/models'


def intersects_pilot(solid, depth, origin, hand_sign):
    axis = gp_Ax2(gp_Pnt(0, depth-origin, 0), gp_Dir(hand_sign, 0, 0))
    pilot = BRepPrimAPI_MakeCylinder(axis, 1.5, 100).Shape()
    overlap = BRepAlgoAPI_Common(solid, pilot)
    assert overlap.IsDone(), (depth, "pilot intersection failed")
    return TopExp_Explorer(overlap.Shape(), TopAbs_SOLID).More()


with ZipFile(sys.argv[1]) as archive:
    for hands, (middle, rear) in {**{(left, left + 1): depths for left, depths in rows.items()}, **rows_5d}.items():
        origin = 37 if hands in rows_5d else 28
        for sku in hands:
            member, = (name for name in archive.namelist() if name.endswith(f'/{sku}.stp'))
            raw = archive.read(member)
            source = out / f'hettich-{sku}.stp'
            source.write_bytes(raw)
            reader = STEPControl_Reader()
            reader.ReadFile(str(source))
            assert reader.TransferRoots() > 0
            solids = TopExp_Explorer(reader.OneShape(), TopAbs_SOLID)
            stages, axes = [], set()
            mounts = [10, 37, middle, rear]
            hand_sign = 1 if sku == hands[0] else -1
            while solids.More():
                solid = solids.Current()
                solids.Next()
                stage = len(stages)
                if stage == 0:
                    check = BRepClass3d_SolidClassifier(solid)
                    metal_seen = False
                    for depth in (16, 20, 23.5, 27, 31):
                        check.Perform(gp_Pnt(hand_sign, depth-origin, 0), 1e-5)
                        metal_seen |= check.State() == TopAbs_IN
                    assert metal_seen, (sku, "fixed web control")
                    for depth in mounts:
                        assert not intersects_pilot(solid, depth, origin, hand_sign), (sku, depth, "pilot intersects fixed rail")
                    if hands not in rows_5d:
                        assert intersects_pilot(solid, middle+32, origin, hand_sign), (sku, "drawing middle pilot changed")
                else:
                    blocked = [depth for depth in mounts if intersects_pilot(solid, depth, origin, hand_sign)]
                    expected = [rear] if stage == 1 and hands[0] in (9304255, 9304271, 9374861, 9374899) else []
                    assert blocked == expected, (sku, stage, blocked, expected)
                positions = []
                BRepMesh_IncrementalMesh(solid, 0.15)
                faces = TopExp_Explorer(solid, TopAbs_FACE)
                while faces.More():
                    face = TopoDS.Face(faces.Current())
                    faces.Next()
                    surface = BRepAdaptor_Surface(face)
                    if stage == 0 and surface.GetType() == GeomAbs_Cylinder:
                        cylinder = surface.Cylinder()
                        p = cylinder.Location()
                        if abs(cylinder.Axis().Direction().X()) > 0.999 and abs(cylinder.Radius() - 3.2) < 0.02 and abs(p.Z()) < 0.01:
                            axes.add(round(p.Y() + origin, 3))
                    location = TopLoc_Location()
                    mesh = BRep_Tool.Triangulation_s(face, location)
                    assert mesh is not None
                    for index in range(1, mesh.NbTriangles() + 1):
                        nodes = list(mesh.Triangle(index).Get())
                        if face.Orientation() != TopAbs_REVERSED:
                            nodes.reverse()
                        for node in nodes:
                            p = mesh.Node(node).Transformed(location.Transformation())
                            positions.extend(round(v, 4) for v in (p.X(), p.Z(), p.Y() + origin))
                assert positions
                stages.append(positions)
            assert len(stages) == 3
            assert set(mounts) <= axes
            data = {'manufacturer': 'Hettich', 'partNumber': str(sku), 'units': 'mm',
                    'sourceSha256': hashlib.sha256(raw).hexdigest(),
                    'mountingCentres': [[0, 0, d] for d in mounts], 'positions': stages[0],
                    'movingPositions': stages[1], 'closedPositions': stages[2]}
            source.with_suffix('.js').write_text('export default ' + json.dumps(data, separators=(',', ':')) + ';\n', encoding='utf-8')
            print(sku, [len(stage) // 9 for stage in stages], mounts)
