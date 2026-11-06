import assert from 'node:assert/strict';
import { CabinetForm } from '../js/form-ui.js';
import { defaultCabinet } from '../js/cabinet-math.js';
import { applyHardwarePreset } from '../js/hardware-library.js';
const oldDocument=globalThis.document;
const node=()=>({children:[],dataset:{},classList:{add(){},toggle(){}},append(...c){this.children.push(...c);},prepend(...c){this.children.unshift(...c);},appendChild(c){this.children.push(c);},querySelector(){return {};},querySelectorAll(){return [];},addEventListener(){}});
globalThis.document={createElement:node,createTextNode:node};
try {
  for(const mode of ['doors','drawers']) for(const preset of [false,true]) {
    const form=Object.create(CabinetForm.prototype);
    form.config=defaultCabinet();form.config.front.mode=mode;
    if(preset)form.config=applyHardwarePreset(form.config,'pull-128');
    const fields=[];
    form._createInput=(type,attrs)=>Object.assign(node(),{type,...attrs});
    form._createSelect=(options,attrs)=>Object.assign(node(),{options,...attrs});
    form._makeTabButton=(icon,label)=>Object.assign(node(),{label});
    form._makeField=(label,input)=>{const f=Object.assign(node(),{label,input});fields.push(f);return f;};
    form._makeBlurb=node;
    form._hardwareFields();
    assert.equal(fields.some(f=>f.label==='Handle drilling'),!preset);
    assert.equal(fields.some(f=>f.label==='Handle hole spacing'),!preset);
    assert.equal(fields.some(f=>f.label==='Carcass joinery'),false);
    assert.ok(fields.some(f=>f.label===(mode==='drawers'?'Drawer pull position':'Door handle edge offset')),'position controls remain available');
    fields.length=0;form._constructionFields();
    const joinery=fields.find(f=>f.label==='Carcass joinery');
    assert.ok(joinery);
    assert.equal(joinery.input.value,'joinery-none');
    assert.ok(joinery.input.options.every(option=>!option.label.includes('Custom / existing dimensions')));
    form.config.hardware.joineryType='dowel';
    form.config.hardware.dowelDiameter=10;
    fields.length=0;form._hardwareLibraryFields(['joinery']);
    const edited=fields.find(f=>f.label==='Carcass joinery');
    assert.ok(edited.input.options.some(option=>option.label==='Dowels — edited dimensions'));
    assert.equal(form.config.hardware.dowelDiameter,10,'existing joint dimensions remain unchanged');
    assert.equal(fields.filter(f=>f.label==='Handles / knobs').length,0);
    if (mode === 'doors') {
      form.config=applyHardwarePreset(form.config,'hinge-blum-71b3550');
      fields.length=0;form._hardwareFields();
      assert.equal(fields.find(f=>f.label==='Hinge').input.value,'hinge-blum-71b3550');
      assert.ok(!fields.some(f=>f.label==='Hinge plate'));
      form.config=applyHardwarePreset(form.config,'plate-hettich-9071575');
      fields.length=0;form._hardwareFields();
      assert.equal(fields.find(f=>f.label==='Hinge plate').input.value,'plate-hettich-9071575');
    }
  }
}finally{globalThis.document=oldDocument;}
console.log('PASS: joinery belongs to Construction; preset handles hide drilling overrides and retain positioning for doors/drawers');
