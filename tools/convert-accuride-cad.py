"""Convert an Accuride 3832E AP214 assembly (requires OCP and Node).

Usage: python tools/convert-accuride-cad.py path/to/Accuride_3832-E20.step
Checks the existing 3 mm pilot centres against holes in the supplier solids.
"""
import hashlib
import json
import math
import sys
import subprocess
import re
from pathlib import Path
from OCP.STEPControl import STEPControl_Reader
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_SOLID, TopAbs_FACE, TopAbs_REVERSED, TopAbs_OUT, TopAbs_IN
from OCP.TopoDS import TopoDS
from OCP.TopLoc import TopLoc_Location
from OCP.BRep import BRep_Tool
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.GeomAbs import GeomAbs_Cylinder, GeomAbs_Plane
from OCP.GProp import GProp_GProps
from OCP.BRepGProp import BRepGProp
from OCP.BRepClass3d import BRepClass3d_SolidClassifier
from OCP.gp import gp_Pnt

source=Path(sys.argv[1])
part_number=re.search(r'3832-E\d+', source.name).group()
length={10:250,12:300,14:350,16:400,18:450,20:500,22:550,24:600,26:650,28:700}[int(part_number.split('E')[1])]
root=Path(__file__).resolve().parents[1]
settings=json.loads(subprocess.check_output(['node','--experimental-default-type=module','--input-type=module','-e',
    f"import {{runnerPattern,runnerTravel}} from './js/runner-layout.js'; console.log(JSON.stringify({{pattern:runnerPattern({length}),travel:runnerTravel({length})}}))"],cwd=root,text=True))
reader=STEPControl_Reader();reader.ReadFile(str(source))
assert reader.TransferRoots()>0
solids=[]; explorer=TopExp_Explorer(reader.OneShape(),TopAbs_SOLID)
while explorer.More():
    solid=explorer.Current();BRepMesh_IncrementalMesh(solid,0.15)
    faces=[];points=[];axes=[];planes=[];fe=TopExp_Explorer(solid,TopAbs_FACE)
    while fe.More():
        face=TopoDS.Face(fe.Current());loc=TopLoc_Location();mesh=BRep_Tool.Triangulation_s(face,loc)
        assert mesh is not None
        nodes=[]
        for i in range(1,mesh.NbNodes()+1):
            p=mesh.Node(i).Transformed(loc.Transformation());nodes.append((p.X(),p.Y(),p.Z()))
        points.extend(nodes);faces.append((face,mesh,nodes))
        surface=BRepAdaptor_Surface(face)
        if surface.GetType()==GeomAbs_Cylinder and abs(surface.Cylinder().Axis().Direction().X())>0.999:
            c=surface.Cylinder();p=c.Location();axes.append((c.Radius(),p.Y(),p.Z()))
        if surface.GetType()==GeomAbs_Plane and abs(surface.Plane().Axis().Direction().X())>0.999:
            props=GProp_GProps();BRepGProp.SurfaceProperties_s(face,props)
            planes.append((props.Mass(),surface.Plane().Location().X()))
        fe.Next()
    bounds=[(min(p[a] for p in points),max(p[a] for p in points)) for a in range(3)]
    solids.append(dict(solid=solid,faces=faces,bounds=bounds,axes=axes,planes=planes))
    explorer.Next()
fragments=[s for s in solids if max(hi-lo for lo,hi in s['bounds'])<2]
solids=[s for s in solids if s not in fragments]
assert len(solids)==6, 'Expected three closed and three open rail solids'
solids.sort(key=lambda s:s['bounds'][1][0])
def stages(group):
    group.sort(key=lambda s:s['bounds'][1][1]-s['bounds'][1][0],reverse=True)
    return dict(zip(['fixed','intermediate','moving'],group))
closed,opened=stages(solids[:3]),stages(solids[3:])
fixed,moving=closed['fixed'],closed['moving']
axis=max((a for a in fixed['axes'] if abs(a[0]-3.175)<0.001),key=lambda a:a[2])
datum_y,datum_z=axis[1],axis[2]+35
case_x=max(fixed['planes'])[1]
drawer_x=max(x for area,x in moving['planes'] if area>length*18)
assert 12.5<drawer_x-case_x<12.9
assert abs(fixed['bounds'][2][1]-fixed['bounds'][2][0]-length)<0.2
mounts={'fixed':settings['pattern']['cabinet'],'moving':settings['pattern']['drawer']}
# Each rail mounts from its own front datum; some supplied closed poses leave a small front offset.
moving_datum_z=datum_z+moving['bounds'][2][1]-fixed['bounds'][2][1]
for stage in mounts:
    part=closed[stage]
    web_x=case_x+0.6 if stage=='fixed' else drawer_x-0.6
    for depth in mounts[stage]:
        for angle in range(0,360,45):
            dy=1.5*math.sin(math.radians(angle));dz=1.5*math.cos(math.radians(angle))
            front_datum=moving_datum_z if stage=='moving' else datum_z
            state=BRepClass3d_SolidClassifier(part['solid'],gp_Pnt(web_x,datum_y+dy,front_datum-depth+dz),1e-5).State()
            assert state==TopAbs_OUT, (stage,depth,angle,'pilot intersects rail metal')
    assert any(BRepClass3d_SolidClassifier(part['solid'],gp_Pnt(web_x,datum_y+5,datum_z-d),1e-5).State()==TopAbs_IN
               for d in [50,75,100,125,150,200,225,300,400]), (stage,'mounting web was not located')
travel=opened['moving']['bounds'][2][0]-moving['bounds'][2][0]
middle_travel=opened['intermediate']['bounds'][2][0]-closed['intermediate']['bounds'][2][0]
assert abs(travel-settings['travel'])<length*0.05 and 0<middle_travel<travel
result={'manufacturer':'Accuride','partNumber':part_number,'length':length,'units':'mm',
    'nominalTravel':settings['travel'],'travel':round(travel,5),'intermediateTravel':round(middle_travel,5),
    'omittedSmallFragments':len(fragments),
    'movingFrontOffset':round(moving_datum_z-datum_z,5),
    'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'stages':{}}
for stage,part in closed.items():
    origin_x={'fixed':case_x,'moving':drawer_x,'intermediate':(case_x+drawer_x)/2-1.2}[stage]
    sign=-1 if stage=='moving' else 1
    positions=[]
    for face,mesh,nodes in part['faces']:
        for i in range(1,mesh.NbTriangles()+1):
            indices=list(mesh.Triangle(i).Get())
            if (face.Orientation()==TopAbs_REVERSED)!=(stage!='moving'):indices.reverse()
            for index in indices:
                x,y,z=nodes[index-1]
                front_datum=moving_datum_z if stage=='moving' else datum_z
                positions.extend(round(v,5) for v in (sign*(x-origin_x),y-datum_y,front_datum-z-length/2))
    bounds=[[min(positions[a::3]),max(positions[a::3])] for a in range(3)]
    result['stages'][stage]={'manufacturer':'Accuride','partNumber':f'{part_number} {stage}',
        'positions':positions,'bounds':bounds,'mountingCentres':[[0,0,d-length/2] for d in mounts.get(stage,[])]}
    print(stage,len(positions)//9,'triangles',bounds)
output=root/f'assets/hardware/models/accuride-{part_number.lower()}.js'
output.write_text('export default '+json.dumps(result,separators=(',',':'))+';\n',encoding='utf-8')
output.with_suffix('.step').write_bytes(source.read_bytes())
print('Pilot clearance checked; CAD travel',result['travel'],'middle travel',result['intermediateTravel'])
