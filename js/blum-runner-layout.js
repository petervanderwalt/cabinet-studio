import { frontLayout, rearInset } from './front-layout.js?v=20261105j';

// Blum 563H installation instructions, pages 2–4; angled locking-device pilots use the manufacturer's template.
export const TANDEM_563H = {
  229:{part:'563H2290B10',minimumDepth:266,runnerLength:259,extensionLoss:24,mounts:[10,37,133,229]},
  305:{part:'563H3050B',minimumDepth:328,runnerLength:319,extensionLoss:29,mounts:[10,37,69,165,261]},
  381:{part:'563H3810B',minimumDepth:404,runnerLength:395,extensionLoss:19,mounts:[10,37,69,165,357]},
  457:{part:'563H4570B',minimumDepth:480,runnerLength:471,extensionLoss:6,mounts:[10,37,69,261,453]},
  533:{part:'563H5330B',minimumDepth:557,runnerLength:548,extensionLoss:3,mounts:[10,37,69,261,517]},
};
// Blum 563F installation instructions, pages 2–5. Same longitudinal hole rows as 563H.
const tandemFShortLoss = {229:16,305:24}; // Blum 2012 563F table, pending individual article sheets.
export const TANDEM_563F = Object.fromEntries(Object.entries(TANDEM_563H).map(
  ([length,spec]) => [length,{...spec,part:spec.part.replace('563H','563F'),extensionLoss:tandemFShortLoss[length] ?? spec.extensionLoss}]
));
// MOVENTO brochure (2026), pages 11–13. These are 763H sizes, not 763. or European 760H.
export const MOVENTO_763H = {
  305:{part:'763H3050S',minimumDepth:328,runnerLength:319,extensionLoss:17,mounts:[10,37,69,165,261]},
  381:{part:'763H3810S',minimumDepth:404,runnerLength:395,extensionLoss:6.7,mounts:[10,37,69,165,357]},
  457:{part:'763H4570S',minimumDepth:480,runnerLength:471,mounts:[10,37,69,261,453]},
  533:{part:'763H5330S',minimumDepth:557,runnerLength:548,extensionLoss:0,mounts:[10,37,69,261,517]},
};

// Hettich January 2025 IW21 catalogue, page 23. Depths are from the cabinet front.
export const QUADRO_2D = {
  229:{part:'9304257',left:9304255,minimumDepth:242.5,boxLength:228.6,mounts:[10,37,133,229]},
  305:{part:'9304260',left:9304258,minimumDepth:318.5,mounts:[10,37,165,261]},
  381:{part:'9304266',left:9304261,minimumDepth:395,mounts:[10,37,165,357]},
  457:{part:'9304274',left:9304271,minimumDepth:471,mounts:[10,37,261,453]},
  533:{part:'9304282',left:9304280,minimumDepth:547,mounts:[10,37,261,517]},
  610:{part:'9304286',left:9304283,minimumDepth:623.5,boxLength:609.6,mounts:[10,37,261,453]},
};

// Exact 5D Silent System STEP, with the 2 mm overlay gap and inch-size boxes.
export const QUADRO_5D = {
  229:{part:'9375480',left:9374861,right:9374862,minimumDepth:242.5,boxLength:228.6,mounts:[10,37,165,229]},
  305:{part:'9375481',left:9374863,right:9374866,minimumDepth:318.5,boxLength:304.8,mounts:[10,37,197,261]},
  381:{part:'9375482',left:9374867,right:9374898,minimumDepth:395,boxLength:381,mounts:[10,37,197,357]},
  457:{part:'9375483',left:9374899,right:9374900,minimumDepth:471,boxLength:457.2,mounts:[10,37,293,453]},
  533:{part:'9375484',left:9374901,right:9374902,minimumDepth:547.1,boxLength:533.4,mounts:[10,37,293,517]},
  610:{part:'9375485',left:9374903,right:9374904,minimumDepth:623.5,boxLength:609.6,mounts:[10,37,293,453]},
};

export function quadroSetback(config) {
  const {runnerMode,quadroFrontGap}=config.hardware;
  return (runnerMode==='hettich-quadro-2d' || runnerMode==='hettich-quadro-5d') && quadroFrontGap===0 ? 2 : 0;
}

export function quadroMountDepths(config, spec) {
  return config.hardware.runnerMode === 'hettich-quadro-2d' && config.hardware.quadroManualMiddle === true
    ? spec.mounts.filter((_,index) => index !== 2) : spec.mounts;
}

// Richelieu 828 installation dimensions, 2020-07-22. The 270 mm drawer is the exception.
export const RICHELIEU_828 = Object.fromEntries([270,300,350,400,450,500,550,600,650].map(nominal => {
  const boxLength = nominal === 270 ? nominal : nominal - 10;
  // These Planit upper-row stations are references for transferring holes from the actual rail.
  const mountReferences = nominal <= 300 ? [37,69,165,197] : nominal <= 500 ? [37,69,165,261] : [37,69,165,293,357];
  return [nominal, {part:`828${nominal}`,boxLength,minimumDepth:boxLength+18,mountReferences}];
}));

export function addUndermountRunnerPreparation(panels,c,makePanel) {
  const richelieu=c.hardware.runnerMode==='richelieu-828';
  const quadro5d=c.hardware.runnerMode==='hettich-quadro-5d';
  const quadro=quadro5d || c.hardware.runnerMode==='hettich-quadro-2d';
  const movento=c.hardware.runnerMode==='blum-movento-763h';
  const thickTandem=c.hardware.runnerMode==='blum-tandem-563f';
  if(!richelieu && !quadro && !movento && !thickTandem && c.hardware.runnerMode!=='blum-tandem-563h') return [];
  const family=richelieu?'Richelieu 828':quadro5d?'Quadro 5D V6':quadro?'Quadro 2D V6':movento?'MOVENTO 763H':thickTandem?'TANDEM 563F':'TANDEM 563H',prefix=quadro?'quadro':movento?'movento':'tandem';
  const bottomClearance=movento||richelieu?16:14,topClearance=quadro?12:movento||richelieu?7:6,mountingHeight=movento?38:37;
  const recess=quadro||richelieu?12.7:13;
  const backRelief=quadro5d?0.1:0;
  const backRecess=recess+backRelief;
  const locks=movento?'T51.7601L/R':'T51.1901L/R';
  const fronts=panels.filter(p=>p.type==='drawer');
  if(!fronts.length) return [];
  for(let i=panels.length-1;i>=0;i--) if(panels[i].type==='drawer-box') panels.splice(i,1);
  for(const panel of panels) panel.holes=panel.holes.filter(h=>!h.purpose?.startsWith('drawer-runner-'));
  const layout=frontLayout(c),t=c.drawers.sideThickness,b=c.drawers.bottomThickness;
  const nominalLength=c.hardware.runnerLength,table=richelieu?RICHELIEU_828:quadro5d?QUADRO_5D:quadro?QUADRO_2D:movento?MOVENTO_763H:thickTandem?TANDEM_563F:TANDEM_563H,spec=table[nominalLength];
  const length=spec?.boxLength ?? nominalLength;
  const pilotDiameter=c.hardware.runnerPilotDiameter??3,pilotDepth=c.hardware.runnerPilotDepth??8;
  const insideDepth=c.depth-(c.overlay.type==='inset'?0:c.materials.doorThickness)
    -rearInset(c)-layout.boxFront;
  const widthDeduction=thickTandem?49:42;
  const minSide=thickTandem?15.875:quadro?12.7:richelieu?12:15*25.4/32,maxSide=thickTandem?19.05:16;
  // Compare the inset setback with the drawing's standard 3 mm overlay setback.
  const inset=c.overlay.type==='inset';
  const insetAdjustment=inset?t-(movento?16:thickTandem?17.5:14.5):0;
  const setback=quadroSetback(c);
  const requiredDepth=runner=>inset?runner.runnerLength+9+insetAdjustment:runner.minimumDepth+setback;
  if(richelieu && inset) return ['Richelieu 828 boxes omitted: use overlay fronts.'];
  if(quadro && (inset || ![12.7,13,15.875,16].includes(t) || pilotDiameter>3)) {
    return [`${family} boxes omitted: use overlay fronts, 12.7, 13, 15.875 or 16 mm drawer sides and cabinet pilots up to 3 mm.`];
  }
  const minimumWidth=richelieu?180:quadro?130:170;
  if(c.construction!=='frameless' || !spec || !(t>=minSide && t<=maxSide && b>0 && b<=10)
    || (!richelieu && !(pilotDiameter>0 && pilotDiameter<14 && pilotDepth>0 && pilotDepth<=c.materials.caseThickness-2))
    || insideDepth<requiredDepth(spec) || c.width-2*c.materials.caseThickness-widthDeduction<minimumWidth) {
    const sideRange = thickTandem ? '5/8 to 3/4 inch'
      : movento || c.hardware.runnerMode==='blum-tandem-563h' ? '15/32 inch to 16 mm' : `${minSide}–${maxSide} mm`;
    return [`${family} boxes omitted: use frameless construction, at least ${minimumWidth} mm inside drawer width, ${sideRange} sides, a positive bottom up to 10 mm, ${richelieu?'':'valid cabinet pilots leaving 2 mm stock, '}a supported length and sufficient inside depth (${Object.entries(table).map(([l,s])=>`${l}→${requiredDepth(s)}`).join(', ')} mm).`];
  }
  const opening=c.width-2*c.materials.caseThickness,innerWidth=opening-widthDeduction;
  const tandemOverlay=!richelieu && !quadro && !movento && !inset;
  const frontGap=quadro?2-setback:tandemOverlay?1.5:0;
  const clearance=widthDeduction/2-t,start=layout.boxFront-frontGap,grooveDepth=3;
  const sideMaterial=c.materials.drawerSideMaterial || c.materials.drawerBoxMaterial;
  const bottomMaterial=c.materials.drawerBottomMaterial || sideMaterial;
  const cabinetBottom=panels.find(panel=>panel.id==='bottom');
  // The thin 5D bottom clears the rear rail rise at the same height as the relieved back.
  const bottomRecess=quadro5d && t<=13?backRecess:recess;
  const runnerRowHeight=quadro?recess+9.5:mountingHeight-bottomClearance;
  const minimumBoxBottom=(quadro||richelieu) && cabinetBottom
    ? cabinetBottom.posY+cabinetBottom.sizeY/2+(richelieu?28-recess:38-runnerRowHeight)
    : -Infinity;
  const warnings=[];
  const lockSetup = `${family}: use Blum T65.1600.01 at both front corners of the assembled drawer box. Drill two Ø2.5 × 10 mm pilots per ${locks} lock at 75°. Manual jig operation outside the CNC face bores.`;
  const spacerSetup = 'MOVENTO thin inner front: install a T59.K010M spacer and two Blum 6064N #6 × 19 mm screws at each locking device. Seat each lock flush with the drawer bottom. Use the exported rail pilots with spacers fitted. If omitting the spacers, reduce the runner setback and screw positions by 3 mm per Blum before drilling.';
  for(const front of fronts) {
    const lower=Math.max(front.posY-front.sizeY/2+bottomClearance,layout.boxBottom+bottomClearance-3,minimumBoxBottom);
    const upper=Math.min(front.posY+front.sizeY/2-topClearance,layout.boxTop-topClearance+3);
    const height=upper-lower;
    if(height<Math.max(30,recess+b+6)) {
      warnings.push(`${front.name}: insufficient ${family} box height; box preparation omitted.`);
      continue;
    }
    const common={type:'drawer-box',color:0xE4ECF8,materialLabel:sideMaterial,
      edgeBanding:{top:false,bottom:false,left:false,right:false}};
    const centreY=(lower+upper)/2,centreZ=start+length/2;
    for(const side of ['left','right']) {
      const x=c.materials.caseThickness+clearance+t/2;
      panels.push(makePanel({...common,id:`${front.id}-side-${side}`,name:`${front.name} ${side} box side`,
        cutWidth:length,cutHeight:height,cutThickness:t,
        posX:side==='left'?x:c.width-x,posY:centreY,posZ:centreZ,sizeX:t,sizeY:height,sizeZ:length,
        grooves:[{x:t,y:bottomRecess,width:length-2*t,height:b,depth:grooveDepth,purpose:'drawer-bottom-groove'}]}));
    }
    // Raising the whole back clears both rear runner corners.
    const backRaise=richelieu?0:backRecess;
    const back=makePanel({...common,id:`${front.id}-back`,name:`${front.name} ${richelieu?'notched':'raised'} box back`,
      cutWidth:innerWidth,cutHeight:height-backRaise,cutThickness:t,
      posX:c.width/2,posY:lower+backRaise+(height-backRaise)/2,posZ:start+length-t/2,
      sizeX:innerWidth,sizeY:height-backRaise,sizeZ:t,
      notches:richelieu?[0,innerWidth-37].map(x=>({x,y:0,width:37,height:recess})):[],
      holes:richelieu?[]:[7,innerWidth-7].map(x=>({x,y:11-backRelief,diameter:6,depth:10,face:'back',purpose:`${prefix}-rear-hook`}))});
    panels.push(back);
    const innerFront = makePanel({...common,id:`${front.id}-inner-front`,name:`${front.name} inner box front`,
      cutWidth:innerWidth,cutHeight:height,cutThickness:t,
      posX:c.width/2,posY:centreY,posZ:start+t/2,sizeX:innerWidth,sizeY:height,sizeZ:t});
    if (richelieu) {
      const widthCheck = `Richelieu 828: nominal inside drawer width is ${Number(innerWidth.toFixed(3))} mm (cabinet opening minus 42 mm). The drawing and its width note disagree on the tolerance direction. Check fit with the supplied rails before trimming.`;
      back.hardwareWarnings = [
        'Richelieu 828: hand-fit the rear hooks. The catalogue locates each bore centre 7 mm inboard of the inner drawer-side face and 11 mm above the top of the notch.',
        `Rear-face layout from the lower-left corner of this panel: X=7 and ${Number((innerWidth-7).toFixed(3))} mm, Y=${recess+11} mm. The Richelieu drawing shows Ø7 mm. The Planit package specifies Ø8 × 12 mm. Confirm bore diameter and depth on the supplied runners before drilling.`,
        `On the assembled box, each centre is ${Number((t+7).toFixed(3))} mm in from its outside side face. The Planit 23 mm offset corresponds to 16 mm sides.`,
        t === 12
          ? 'A 12 mm bore would go through this 12 mm drawer back. Measure the hook insertion before choosing a blind depth.'
          : `A 12 mm bore leaves ${Number((t-12).toFixed(3))} mm of this drawer back. Measure the hook insertion before choosing a blind depth.`,
        widthCheck,
      ];
      innerFront.hardwareWarnings = ['Richelieu 828: fit 8284102 (right) and 8284103 (left) by hand using page 22 of the Richelieu 828 catalogue. The fixing centres are 23 mm apart. Use the 6.7 mm front reference and the separate 16 and 24 mm corner references shown in the drawing. Transfer the holes from each supplied lock.'];
      innerFront.hardwareWarnings.push(widthCheck);
      for (const side of panels.filter(p=>['side-left','side-right'].includes(p.id))) {
        const row = Number((lower+21.5-side.posY+side.cutHeight/2).toFixed(3));
        (side.hardwareWarnings ||= []).push(`${front.name}: the Planit upper-row reference is Y=${row} mm from the bottom edge of this side panel. Transfer the screw positions from the supplied rail.`);
      }
    } else if (quadro) {
      const clip = t <= 13 ? '9306539' : '9306540';
      const screwLength = t <= 13 ? '3/4' : '5/8';
      const straightRow = t <= 13 ? 6.4 : 8;
      innerFront.hardwareWarnings = [
        `${family}: fit Hettich ${clip} clips by hand at both front corners of the assembled drawer. Use the matching stock-thickness installation detail and two #6 × ${screwLength}-inch flat-head screws per clip. Check that both latches engage the rails before use.`,
        `Straight screw option, Hettich drawing page 4. On the bottom edge of the inner front, the two centres for each clip are 31 and 55 mm inboard of the adjacent drawer side's inside face and ${straightRow} mm from the inner front's rear face. Verify against the seated clips before drilling.`,
        `From the left end of this inner front, mark ${[31,55,innerWidth-55,innerWidth-31].map(x=>Number(x.toFixed(3))).join(', ')} mm along the bottom edge for the straight screw option.`,
      ];
      if (t <= 13) {
        innerFront.hardwareWarnings.push('Hettich 9306539: the alternate angled screw row in the STEP is about 3.1 mm farther back than the drawing after aligning the straight row. Transfer any angled screw positions from the supplied clips.');
      }
    } else {
      innerFront.hardwareWarnings = [lockSetup];
      innerFront.hardwareWarnings.push(movento && t<=13 ? spacerSetup :
        `Seat each ${family} lock flush against the drawer bottom. Fasten each lock with two Blum 606N or 606P screws.`);
      if (movento && t>13) {
        innerFront.hardwareModels = [
          {model:'blum-t51.7601l',x:-innerWidth/2,y:recess-height/2,z:t/2,rotation:0},
          {model:'blum-t51.7601r',x:innerWidth/2,y:recess-height/2,z:t/2,rotation:0},
        ];
      }
    }
    panels.push(innerFront);
    panels.push(makePanel({...common,id:`${front.id}-bottom`,name:`${front.name} recessed box bottom`,materialLabel:bottomMaterial,
      cutWidth:innerWidth+2*grooveDepth,cutHeight:length-2*t,cutThickness:b,
      posX:c.width/2,posY:lower+bottomRecess+b/2,posZ:centreZ,
      sizeX:innerWidth+2*grooveDepth,sizeY:b,sizeZ:length-2*t}));
    front.drawDepth=length;
    front.runnerTravel=length-(spec.extensionLoss ?? 0);
    // Keep the applied front seated against the box when adding the cabinet gap.
    front.posZ-=frontGap;
    if(richelieu) continue;
    for(const side of panels.filter(p=>['side-left','side-right'].includes(p.id))) {
      for(const depth of (quadro?quadroMountDepths(c,spec):spec.mounts)) {
        const x=layout.boxFront+insetAdjustment+depth+setback;
        side.holes.push({x:side.id==='side-right'?side.cutWidth-x:x,
          y:lower+runnerRowHeight-side.posY+side.cutHeight/2,diameter:pilotDiameter,depth:pilotDepth,
          face:'inside',purpose:`${prefix}-runner-mount`});
      }
    }
  }
  if(richelieu) {
    if (panels.some(p=>p.type==='drawer-box')) {
      for (const side of panels.filter(p=>['side-left','side-right'].includes(p.id))) {
        (side.hardwareWarnings ||= []).push(`Richelieu ${spec.part}: transfer the cabinet screw positions from the supplied rail and drill by hand. The 2020-07-22 Richelieu drawing shows the Planit upper-row references: ${spec.mountReferences.join(', ')} mm from the cabinet front, at 21.5 mm above the drawer-side bottom. Verify which positions and screw count the supplied rail requires.`);
        if (spec.mountReferences.includes(357)) {
          side.hardwareWarnings.push(`Richelieu ${spec.part}: verify the 357 mm reference on the supplied rail before drilling. The Planit rail mesh shows no opening at that position, and a Ø5 mm probe hit solid material in the comparable Grass CAD on both hands.`);
        }
      }
    }
    return warnings;
  }
  if (quadro) {
    const setupWarnings = [];
    if (setback) setupWarnings.push(`${family}: the 0 mm front gap uses the 12 mm first fixing and shifts the full rail pattern 2 mm rearward. Verify all fixing centres against the supplied rails.`);
    if (nominalLength === 229 || nominalLength === 457) {
      setupWarnings.push(`${family} ${spec.part}: the closed drawer rail blocks access to the rear cabinet fixing in the manufacturer CAD. Move the sliding rail clear before fitting that screw.`);
    }
    for (const side of panels.filter(p => p.holes.some(h => h.purpose === 'quadro-runner-mount'))) {
      if (setupWarnings.length) (side.hardwareWarnings ||= []).push(...setupWarnings);
    }
    warnings.push(...setupWarnings);
  }
  if(quadro) {
    warnings.push(`${family} ${spec.part}: drawer preview uses the nominal ${Number(length.toFixed(3))} mm box length as travel. Actual drawer and intermediate rail travel are unverified.`);
  }
  if(quadro5d) {
    warnings.push(`Quadro 5D V6: the rear edge${t<=13?' and drawer bottom have':' has'} a 0.1 mm clearance allowance for the moving rail. Verify physical fit and rear adjustment. Fit ${t<=13?'9306539':'9306540'} clips by hand. Installed clip placement and intermediate carriage travel remain unverified.`);
    return warnings;
  }
  if(quadro) {
    const middle = spec.mounts[2]+setback;
    const middleSetup = c.hardware.quadroManualMiddle === true
      ? ' Middle pilot omitted. Transfer the fixing from the supplied rail after fitting it to the other pilot centres.'
      : '';
    const warning = `Quadro 2D V6 ${spec.part}: with a ${2-setback} mm front gap, the middle fixing is ${middle} mm from the cabinet front in the January 2025 pattern and ${middle + 32} mm using the later installation sheet.${middleSetup} Check the supplied rails before drilling. Fit ${t<=13?'9306539':'9306540'} clips by hand. Installed clip placement, intermediate carriage travel and physical fit remain unverified.`;
    for (const panel of panels) {
      if (panel.holes.some(h => h.purpose === 'quadro-runner-mount')) (panel.hardwareWarnings ||= []).push(warning);
    }
    warnings.push(warning);
    return warnings;
  }
  for (const side of panels.filter(p => p.holes.some(h => h.purpose === `${prefix}-runner-mount`))) {
    const fixingCount = spec.mounts.length === 4 ? 'four' : 'five';
    (side.hardwareWarnings ||= []).push(`Blum ${spec.part}: secure each rail at the ${fixingCount} specified fixing centres per drawer. Use elongated slots only for ±4.5 mm depth adjustment. Verify the supplied rail and screw fit before drilling.`);
  }
  const pendingCad=movento ? t<=13 ? 'Runner, spacer and thin-front lock placement' : 'Runner CAD and lock-to-runner engagement' : 'Runner and locking-device CAD';
  warnings.push(`${family}: 75° locking-device pilots are not exported as face bores. See the inner-front setup notes. Verify pilot sizes and supplied hardware. ${pendingCad} and physical fitting remain pending.`);
  const articleDepth = movento ? {305:323,381:399,533:551}[length]
    : thickTandem ? {457:479,533:555}[length]
    : table === TANDEM_563H && length === 533 ? 555 : undefined;
  if (articleDepth && !inset && panels.some(p=>p.type==='drawer-box')) {
    const warning=`Blum ${spec.part}: the article sheet gives ${articleDepth} mm minimum internal depth. The overlay installation layout uses ${spec.minimumDepth} mm. Verify clearance against the supplied runners.`;
    warnings.push(warning);
    for (const panel of panels) {
      if (panel.holes.some(hole=>hole.purpose===`${prefix}-runner-mount`)) {
        (panel.hardwareWarnings ||= []).push(warning);
      }
    }
  }
  if (movento && spec.extensionLoss === undefined && panels.some(p=>p.type==='drawer-box')) {
    warnings.push(`Blum ${spec.part}: drawer preview uses the nominal ${length} mm travel. Actual stroke is unverified.`);
  }
  if (thickTandem && length <= 305 && panels.some(p=>p.type==='drawer-box')) {
    warnings.push(`Blum ${spec.part}: the preview uses ${length-spec.extensionLoss} mm of travel from Blum’s 2012 table. Verify the stroke on the supplied runners.`);
  }
  return warnings;
}
