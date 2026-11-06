"""Convert supported Hettich handle/knob STEP files to viewer meshes (requires OCP).

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
from OCP.BRepBndLib import BRepBndLib
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.Bnd import Bnd_Box
from OCP.GeomAbs import GeomAbs_Cylinder
from OCP.STEPControl import STEPControl_Reader
from OCP.TopAbs import TopAbs_FACE, TopAbs_REVERSED
from OCP.TopExp import TopExp_Explorer
from OCP.TopLoc import TopLoc_Location
from OCP.TopoDS import TopoDS

source = Path(sys.argv[1])
part_number=re.search(r'\d{6,7}',source.name).group()
knob_dimensions={'9070556':(41,5),'9071857':(24,30),'9080852':(40,26),'9071109':(25,20),'9071080':(15,23),'9070537':(28,24),'9070581':(30,27),'9070580':(30,23),'9070740':(25,22),'9070520':(30,41),'9070568':(25,22),'9070562':(25.5431,28),'9070575':(30,23)}
knob_dimensions['9070510'] = (77.4,39.1)
knob_dimensions['9071860'] = (25,23)
knob_dimensions['9071869'] = (25,35)
knob_dimensions['9113635'] = (21,21)
knob_dimensions.update({'9070735':(30,26), '9070744':(20,18)})
knob_dimensions.update({'9070263':(14,22), '9070264':(18,26.0868)})
knob_dimensions['9069816'] = (35,39)
knob_dimensions['9113698'] = (25,23)
knob_dimensions['9113224'] = (25,23.6)
knob=part_number in knob_dimensions
borgoa = part_number == "9070556"
touch_in = part_number == '9086690'
seating_offset = 16 if touch_in else 8 if borgoa else 0
salvia_lengths={'9069799':744,'9071003':157,'9071005':188,'9071008':220,'9071009':252,'9071012':284,'9071017':316,'9071020':348,'9071021':380,'9071023':412,'9071024':444,'9071026':508,'9071027':540,'9071030':700,'9071038':796}
salvia_thick = {
    '9071045':(96,158),'9071046':(128,188),'9071048':(160,220),
    '9071050':(192,252),'9071051':(224,284),'9071052':(256,316),'9071053':(288,348),
    '9071054':(320,380),'9071055':(352,412),'9071056':(384,444),'9071058':(448,508),
    '9071111':(480,540),'9071112':(640,700),'9071115':(736,796),
    '9071116':(960,1020),'9071118':(1280,1340),'9071120':(1440,1500),
}.get(part_number)
if salvia_thick:
    salvia_lengths[part_number] = salvia_thick[1]
salvia_slim = {
    '9070967':96,'9070972':128,'9070978':160,'9070982':192,'9070984':224,'9070988':256,'9070991':288,
    '9070993':320,'9070996':352,'9070999':384,
}.get(part_number)
if salvia_slim:
    salvia_lengths[part_number] = salvia_slim + 60
salvia = part_number in salvia_lengths
albona = part_number in {'9069799', '9070269'}
two_fixing_albona = 684 if part_number == '9069799' else None
three_fixing_span = {'9070269':1080,'9071041':960,'9071042':1280,'9071043':1440,'9071116':960,'9071118':1280,'9071120':1440}.get(part_number)
if three_fixing_span:
    salvia_lengths[part_number] = three_fixing_span + 60
    salvia = True
asopus_slim = {'9069815':96,'9069818':128,'9069821':224,'9069865':320,'9070124':160,'9070420':192,'9070421':352}
asopus = asopus_slim.get(part_number) or {'9070096':64,'9069942':96,'9070101':128,'9070102':96,'9070103':128,'9070117':160,'9070105':192,'9070118':224,'9070111':352,
          '9070119':320,'9070120':480,'9070122':704}.get(part_number)
asopus64 = part_number == '9070096'
salona = part_number == '1170155'
regina = part_number == '9080833'
vada_sizes = {
    '9070440': (64, 78, 30),
    '9070446': (96, 115, 30),
    '9070451': (160, 190, 32),
    '9070457': (192, 228, 32),
    '9070466': (256, 300, 32),
    '9070481': (320, 376, 34),
    '9070494': (352, 394, 41),
    '9070501': (128, 152, 30), '9070504': (224, 263, 32), '9070509': (288, 339, 32),
}
vada = vada_sizes.get(part_number)
tolosa = part_number == '115203'
ticinum = {'9070583':(32, 50), '9070588':(50, 70), '9070593':(70, 90)}.get(part_number)
avenio = part_number in {'9070552', '9070572', '9070605'}
rossa = part_number == '9071096'
brema = {'9118858':96,'9069890':128,'9069893':160,'9070104':192,'9070106':224,'9070107':256,'9070108':288,'9070109':352,
         '9070110':416,'9070112':448,'9070113':640}.get(part_number)
lipsia = {'9071737': 128, '9071742': 232, '9071751': 448, '9071752': 482, '9071753': 532, '9071755': 640}.get(part_number)
bathia = {'9070487':(96,11,28), '9070485':(128,11.5,28)}.get(part_number)
castra = {'9069953':192, '9069959':352}.get(part_number)
capua = part_number == '9064670'
torino = {'9071926':192,'9071929':256,'9064670':360}.get(part_number)
spacing=0 if knob else 84 if touch_in else 96 if tolosa else salvia_thick[0] if salvia_thick else salvia_slim or three_fixing_span or two_fixing_albona or asopus or brema or castra or lipsia or (bathia[0] if bathia else None) or torino or (vada[0] if vada else ticinum[0] if ticinum else {'9070552':160,'9070572':192,'9070605':64,'9071096':96,'1170155':160,'9071003':96,'9071005':128,'9071008':160,'9071009':192,'9071012':224,'9071017':256,'9071020':288,'9071021':320,'9071023':352,'9071024':384,'9071026':448,'9071027':480,'9071030':640,'9071038':736,'1160018':128,'1160019':160,'1160020':224,'1160021':288,
         '1160022':352,'1160023':480,'1160024':608,'1160025':736,'9080833':128}[part_number])
fixing_radius = 17.5 if borgoa else 2.5 if rossa or ticinum or castra or bathia or albona or (knob and part_number not in {'9070510','9070537','9070575','9071080','9080852','9071857','9071860','9071869','9113635','9113698','9113224'}) else 2
reader = STEPControl_Reader()
reader.ReadFile(str(source))
assert reader.TransferRoots() > 0, 'STEP transfer failed'
shape = reader.OneShape()
faces = []
mounts = set()
fixing_depths = set()
explorer = TopExp_Explorer(shape, TopAbs_FACE)
while explorer.More():
    face = TopoDS.Face(explorer.Current())
    faces.append(face)
    surface = BRepAdaptor_Surface(face)
    if surface.GetType() == GeomAbs_Cylinder:
        cylinder = surface.Cylinder()
        point, direction = cylinder.Location(), cylinder.Axis().Direction()
        if (knob or salvia or asopus or salona or avenio or vada or ticinum or brema or castra or bathia or lipsia or torino or regina or tolosa or touch_in) and abs(cylinder.Radius()-fixing_radius)>1e-6:
            explorer.Next()
            continue
        assert abs(cylinder.Radius() - fixing_radius) < 1e-6
        assert abs(direction.Z() if asopus64 else direction.Y()) > 0.999999
        mounts.add(tuple(round(v, 6) for v in (point.X(), 0 if knob else point.Y(), point.Z())))
        if brema or part_number in {'9070263', '9070264', '9071869'}:
            bore_bounds = Bnd_Box()
            BRepBndLib.AddOptimal_s(face, bore_bounds)
            fixing_depths.add((round(bore_bounds.CornerMin().Y(), 3), round(bore_bounds.CornerMax().Y(), 3)))
    explorer.Next()
axis_y = -8 if torino else -10 if brema else 5 if ticinum else -3 if bathia else -6 if albona else 0
mount_x = [0] if knob else [0, spacing / 2, spacing] if three_fixing_span else [0, spacing]
expected_mounts = [0, 320, 360] if capua else [0, 16, spacing-16, spacing] if torino else mount_x
assert mounts == {(x, axis_y, 0) for x in expected_mounts}, mounts
if part_number in {'9070263', '9070264', '9071869'}:
    assert fixing_depths == {(-8, 0)}, fixing_depths
if brema:
    assert fixing_depths == {(-10, 0)}, fixing_depths
    solid_bounds = Bnd_Box()
    BRepBndLib.AddOptimal_s(shape, solid_bounds)
    low, high = solid_bounds.CornerMin(), solid_bounds.CornerMax()
    for actual, expected in zip((low.X(), high.X(), low.Y(), high.Y(), low.Z(), high.Z()),
                                (-6, spacing+6, -35, 0, -7, 7)):
        assert abs(actual - expected) < 0.01

if knob:
    diameter, projection = knob_dimensions[part_number]
    solid_bounds = Bnd_Box()
    BRepBndLib.AddOptimal_s(shape, solid_bounds)
    low, high = solid_bounds.CornerMin(), solid_bounds.CornerMax()
    assert abs(low.Y() + seating_offset + projection) < 0.02 and abs(high.Y()) < 0.01
if part_number == '9113698':
    # Keep linear deflection while avoiding excess triangles on the curved knob.
    BRepMesh_IncrementalMesh(shape, 0.08, False, 1.0)
else:
    BRepMesh_IncrementalMesh(shape, 0.08)
positions = []
for face in faces:
    location = TopLoc_Location()
    mesh = BRep_Tool.Triangulation_s(face, location)
    assert mesh is not None
    for index in range(1, mesh.NbTriangles() + 1):
        nodes = list(mesh.Triangle(index).Get())
        # Swapping the source Y/Z axes reverses winding.
        if (face.Orientation() != TopAbs_REVERSED) != asopus64:
            nodes.reverse()
        for node in nodes:
            point = mesh.Node(node).Transformed(location.Transformation())
            coordinates = (point.X() - spacing/2, -point.Y(), -point.Z()) if asopus64 else (
                point.X() - spacing/2, point.Z(), point.Y() + seating_offset)
            positions.extend(round(v, 5) for v in coordinates)
bounds = [[min(positions[a::3]), max(positions[a::3])] for a in range(3)]
if knob:
    width = {'9080852':20, '9070510':25.1, '9069816':18}.get(part_number, diameter)
    expected_bounds = [[-diameter/2, diameter/2], [-width/2, width/2], [-projection, seating_offset]]
    if part_number == '9071857':
        expected_bounds[1] = [-7.778,12]
elif vada:
    _, length, projection = vada
    expected_bounds = [[-length/2, length/2], [-5, 5], [-projection, 0]]
elif tolosa:
    expected_bounds = [[-63, 63], [-5, 5], [-28, 0]]
elif touch_in:
    expected_bounds = [[-46, 46], [-46, 46], [-2, 16]]
elif lipsia:
    expected_bounds = [[-spacing/2-4, spacing/2+4], [-7,7], [-35,0]]
elif bathia:
    _, overhang, projection = bathia
    expected_bounds = [[-spacing/2-overhang, spacing/2+overhang], [-4,4], [-projection,0]]
elif castra:
    expected_bounds = [[-spacing/2-4, spacing/2+4], [-6, 6], [-30, 0]]
elif brema:
    expected_bounds = [[-spacing/2-6, spacing/2+6], [-7, 7], [-35, 0]]
elif torino:
    overhang = 6 if capua else 20
    expected_bounds = [[-spacing/2-overhang, spacing/2+overhang], [-3.5, 3.5], [-34, 0]]
elif ticinum:
    expected_bounds = [[-ticinum[1]/2, ticinum[1]/2], [-5, 20], [-42, 0]]
elif salvia:
    half_length = salvia_lengths[part_number]/2
    radius = 7 if salvia_thick else 5 if salvia_slim else 6
    expected_bounds = [[-half_length,half_length],[-radius,radius],[-35,0]]
elif part_number == '9070102':
    # The archived bar is asymmetric about its two fixing axes.
    expected_bounds = [[-53,55],[-5,5],[-40,0]]
elif asopus:
    radius, projection = (5,32) if part_number in asopus_slim else {'9070096':(4,27),'9069942':(4,32),'9070101':(4,32)}.get(part_number,(6,40))
    expected_bounds = [[-spacing/2-radius,spacing/2+radius],[-radius,radius],[-projection,0]]
elif salona:
    expected_bounds = [[-89.5,89.5],[-9.5,9.5],[-27,0]]
elif regina:
    expected_bounds = [[-69,69],[-12,12],[-30,0]]
elif rossa:
    expected_bounds = [[-70,70],[-4.5,4.5],[-28,0]]
elif part_number == '9070605':
    expected_bounds = [[-36,36],[-4,4],[-32,0]]
else:
    expected_bounds = [[-spacing/2-5, spacing/2+5], [-5, 5], [-32, 0]]
for actual, expected in zip(bounds, expected_bounds):
    assert all(abs(a - b) < (0.08 if knob or salvia or asopus or salona or rossa or avenio or vada or brema or castra or bathia or lipsia or regina else 0.01) for a, b in zip(actual, expected)), bounds
output = Path(__file__).resolve().parents[1] / f'assets/hardware/models/hettich-{part_number}.js'
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text('export default ' + json.dumps({
    'manufacturer': 'Hettich', 'partNumber': part_number, 'units': 'mm',
    'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
    'mountingCentres': [[x-spacing/2, 0, seating_offset if touch_in else 0] for x in mount_x],
    **({'innerMountingCentres': [[x-spacing/2, 0, 0] for x in (expected_mounts[:2] if capua else expected_mounts[1:-1])]} if torino else {}),
    'bounds': bounds, 'positions': positions,
}, separators=(',', ':')) + ';\n', encoding='utf-8')
print(f'{output.name}: {len(positions) // 9} triangles; mounting centres and bounds checked')
output.with_suffix('.step').write_bytes(source.read_bytes())
