import initOC from '../lib/cad/opencascade.js';
import { setOC, exportSTEP } from '../lib/cad/replicad.js?v=20261103c';
import { buildCadPanel, placeStepPart } from './cad-solids.js?v=20261103d';

const ready = initOC({ print:()=>{}, locateFile: () => new URL('../lib/cad/replicad_single.wasm',import.meta.url).href }).then(setOC);
let cache = new Map();
self.onmessage = async ({data:{id,type,panels}}) => {
  const next = new Map();
  try {
    self.postMessage({id,progress:{phase:'Starting modeller',done:0,total:panels.length}});
    await ready;
    const solids = panels.map((p,index) => {
      const key = JSON.stringify([p.id,p.sizeX,p.sizeY,p.sizeZ,p.cutWidth,p.cutHeight,p.cutThickness,p.grooves,p.notches,p.holes,p.edgeBores,p.detailMachining,p.detailPaths,p.detailPathsClosed]);
      const solid = cache.get(key) || next.get(key) || buildCadPanel(p);
      next.set(key,solid);
      self.postMessage({id,progress:{phase:'Machining panels',done:index+1,total:panels.length}});
      return {solid,p};
    });
    for (const [key,solid] of cache) if (!next.has(key)) solid.delete();
    cache = next;
    if (type === 'step') {
      const parts = solids.map(({solid,p})=>({shape:placeStepPart(solid,p),name:p.name,color:'#'+p.color.toString(16).padStart(6,'0')}));
      try { self.postMessage({id,result:exportSTEP(parts,{unit:'MM',modelUnit:'MM'})}); }
      finally { for (const part of parts) part.shape.delete(); }
    } else {
      const result=solids.map(({solid,p},index)=>{
        const mesh=solid.mesh({tolerance:0.08,angularTolerance:0.15});
        if (!mesh.triangles.length || !mesh.vertices.length || !mesh.vertices.every(Number.isFinite)) {
          throw new Error(`Could not mesh ${p.name}; the basic panel is retained.`);
        }
        self.postMessage({id,progress:{phase:'Meshing panels',done:index+1,total:panels.length}});
        return {id:p.id,...mesh};
      });
      self.postMessage({id,result});
    }
  } catch(error) {
    for (const [key,solid] of next) if (!cache.has(key)) solid.delete();
    self.postMessage({id,error:String(error.message || error)});
  }
};
