import assert from 'node:assert/strict';
import { CabinetForm } from '../js/form-ui.js';
import { defaultCabinet } from '../js/cabinet-math.js';
import { applyHardwarePreset } from '../js/hardware-library.js';
const originalDocument = globalThis.document;
const node = () => ({children:[],dataset:{},classList:{add(){},toggle(){}},append(...children){this.children.push(...children);},prepend(...children){this.children.unshift(...children);},appendChild(child){this.children.push(child);},addEventListener(){}});
globalThis.document = {createElement:node,createTextNode:node};
try {
  const base = defaultCabinet(); base.front.mode='drawers';
  const preset = applyHardwarePreset(base,'runner-3832e');
  for (const [config,custom] of [[base,true],[preset,false],[{...preset,hardware:{...preset.hardware,runnerPilotDiameter:4}},true],
    ...['2d','5d'].map(family=>[applyHardwarePreset(base,`runner-hettich-quadro-${family}`),false])]) {
    const form=Object.create(CabinetForm.prototype);form.config=config;
    const fields=[];
    form._createInput=(type,attrs)=>Object.assign(node(),{type,...attrs});
    form._createSelect=(options,attrs)=>Object.assign(node(),{options,...attrs});
    form._makeTabButton=(icon,label)=>Object.assign(node(),{label});
    form._makeField=(label,input)=>{const field=Object.assign(node(),{label,input});fields.push(field);return field;};
    form._makeBlurb=node;form._handleTypeFields=()=>[];
    form._drawerHardwareFields();
    assert.equal(fields.some(field=>field.label==='Runner output'),custom);
    assert.equal(fields.some(field=>field.label==='Pilot diameter'),custom && config.hardware.runnerMode==='side-mount');
    fields.length=0;
    form._hardwareLibraryFields();
    const length=fields.find(field=>field.label==='Slide length');
    assert.equal(Boolean(length),!custom);
    if(length){assert.equal(length.input.value,String(config.hardware.runnerLength));assert.equal(length.input['data-number'],'true');}
    const gap=fields.find(field=>field.label==='Front gap');
    assert.equal(Boolean(gap),Boolean(config.hardware.runnerMode?.startsWith('hettich-quadro')));
    if(gap) assert.deepEqual(gap.input.options.map(o=>o.value),[2,0]);
    assert.equal(fields.some(field=>field.label==='Hand-fit middle fixing'),config.hardware.runnerMode==='hettich-quadro-2d');
  }
} finally { globalThis.document=originalDocument; }
console.log('PASS: presets hide runner overrides, keep slide length; custom and edited presets expose overrides');
