// Typed facade over the plain-JS engine modules (geometry, nesting, DXF, project model).
import * as math from './cabinet-math.js';
import * as nesting from './nesting.js';
import * as dxf from './dxf-writer.js';
import * as io from './project-io.js';
import * as presets from './material-presets.js';
import type {
  CabinetConfig,
  CabinetEntry,
  CabinetInstance,
  FrontMode,
  NestingPlan,
  NestingSettings,
  Panel,
  Project,
  Room,
  StockOption,
  WorldPosition,
  Placement,
  MaterialGroup,
} from '../types';

const as = <T>(value: unknown) => value as T;

export const defaultCabinet = as<() => CabinetConfig>(math.defaultCabinet);
export { computePanels, computeHardware, validateCabinet } from './compute';
export { buildHardwareList, mergeHardware, type HardwareItem } from './accessories';
export const resolveToeKick = as<(config: Partial<CabinetConfig>) => { height: number; setback: number }>(math.resolveToeKick);
export const resolveReveals = as<(config: Partial<CabinetConfig>) => { gap: number; top: number; bottom: number; side: number }>(math.resolveReveals);
export const inferFrontMode = as<(config: Partial<CabinetConfig>) => FrontMode>(math.inferFrontMode);

export const buildNestingPlan = as<(panels: Panel[], options?: Partial<NestingSettings>) => NestingPlan>(
  nesting.buildNestingPlan,
);

export const downloadPanelDxf = as<(panel: Panel) => void>(dxf.downloadPanelDxf);
export const downloadProjectFile = as<(project: Project) => void>(dxf.downloadProjectFile);
export const downloadManufacturingZip = as<
  (args: {
    panels: Panel[];
    config: CabinetConfig;
    project: Project;
    nestingPlan: NestingPlan | null;
    hardware?: import('./accessories').HardwareItem[];
  }) => Promise<void>
>(dxf.downloadManufacturingZip);
export const hardwareToCsv = as<(hardware: import('./accessories').HardwareItem[]) => string>(dxf.hardwareToCsv);

export const createProjectFromConfig = as<(config?: Partial<CabinetConfig>) => Project>(io.createProjectFromConfig);
export const normalizeProject = as<(data: unknown) => Project>(io.normalizeProject);
export const getActiveCabinet = as<(project: Project) => CabinetEntry>(io.getActiveCabinet);
export const setActiveCabinet = as<(project: Project, id: string) => Project>(io.setActiveCabinet);
export const updateActiveCabinetConfig = as<(project: Project, config: CabinetConfig) => Project>(
  io.updateActiveCabinetConfig,
);
export const updateCabinetMeta = as<(project: Project, id: string, updates: { name?: string; qty?: number }) => Project>(
  io.updateCabinetMeta,
);
export const addCabinet = as<(project: Project, seed?: CabinetConfig | null) => Project>(io.addCabinet);
export const duplicateCabinet = as<(project: Project, id: string) => Project>(io.duplicateCabinet);
export const removeCabinet = as<(project: Project, id: string) => Project>(io.removeCabinet);
export const getProjectInstances = as<(project: Project) => CabinetInstance[]>(io.getProjectInstances);
export const updateRoom = as<(project: Project, updates: Partial<Room>) => Project>(io.updateRoom);
export const updatePlacement = as<(project: Project, instanceId: string, updates: Partial<Placement>) => Project>(
  io.updatePlacement,
);
export const autoArrangeProject = as<(project: Project) => Project>(io.autoArrangeProject);
export const getPlacementWorldPosition = as<(project: Project, instance: CabinetInstance) => WorldPosition>(
  io.getPlacementWorldPosition,
);

export const MATERIAL_GROUPS = as<Record<MaterialGroup, { label: string; parent: 'carcass' | 'front'; stocks: StockOption[] }>>(presets.MATERIAL_GROUPS);
export const MIRROR_TYPES = as<StockOption[]>(presets.MIRROR_TYPES);
export const EDGE_BAND_COLOURS = as<{ label: string; name: string }[]>(presets.EDGE_BAND_COLOURS);
export const EDGE_BAND_THICKNESSES = as<number[]>(presets.EDGE_BAND_THICKNESSES);
export const CARCASS_STOCKS = as<StockOption[]>(presets.CARCASS_STOCKS);
export const REAR_STOCKS = as<StockOption[]>(presets.REAR_STOCKS);
export const FRONT_STOCKS = as<StockOption[]>(presets.FRONT_STOCKS);
export const applyGlobalMaterialSelections = as<(materials: Partial<CabinetConfig['materials']>) => CabinetConfig['materials']>(
  presets.applyGlobalMaterialSelections,
);

export const layoutFootprint = as<(config: Partial<CabinetConfig>) => { width: number; depth: number; height: number }>(io.layoutFootprint);
