import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addCabinet,
  buildNestingPlan,
  computeHardware,
  computePanels,
  createProjectFromConfig,
  downloadManufacturingZip,
  downloadProjectFile,
  duplicateCabinet,
  getActiveCabinet,
  mergeHardware,
  normalizeProject,
  removeCabinet,
  setActiveCabinet,
  updateActiveCabinetConfig,
  updateCabinetMeta,
} from '../engine';
import { normalizeConfig } from '../lib/config';
import { pickProjectFile, readSeedProject, writeSeedProject } from '../lib/seed';
import type { CabinetConfig, Panel, Project } from '../types';
import { CabinetForm } from './components/CabinetForm';
import { NumberInput } from './components/NumberInput';
import { ProjectTabs } from './components/ProjectTabs';
import { ResultsPanel } from './components/ResultsPanel';
import { Viewport } from './components/Viewport';
import { ThemeToggle } from '../theme/ThemeToggle';
import { useTheme } from '../theme/theme';

/** Normalize a project and make sure every cabinet's config carries all defaults. */
function prepareProject(project: Project): Project {
  const normalized = normalizeProject(project);
  return {
    ...normalized,
    cabinets: normalized.cabinets.map((cabinet) => ({ ...cabinet, config: { ...normalizeConfig(cabinet.config), id: cabinet.id } })),
  };
}

function buildProjectPanels(project: Project): Panel[] {
  const multiCabinet = project.cabinets.length > 1;
  const result: Panel[] = [];
  for (const cabinet of project.cabinets) {
    const basePanels = computePanels(normalizeConfig(cabinet.config)).filter((panel) => panel.fabricate !== false);
    const copies = Math.max(1, Number(cabinet.qty) || 1);
    for (let copy = 1; copy <= copies; copy += 1) {
      for (const panel of basePanels) {
        result.push({
          ...structuredClone(panel),
          id: `${cabinet.id}__${copy}__${panel.id}`,
          name: `${multiCabinet ? `${cabinet.name} · ` : ''}${panel.name}${copies > 1 ? ` #${copy}` : ''}`,
          sourceCabinetId: cabinet.id,
          sourceCabinetName: cabinet.name,
          sourceCopyIndex: copy,
        });
      }
    }
  }
  return result;
}

export function App() {
  const [project, setProject] = useState<Project>(() => prepareProject(readSeedProject() ?? createProjectFromConfig({})));
  const [showEdges, setShowEdges] = useState(true);
  const [hideFronts, setHideFronts] = useState(false);
  const [theme, toggleTheme] = useTheme();

  const activeCabinet = useMemo(() => getActiveCabinet(project), [project]);
  const config = activeCabinet.config;
  const scenePanels = useMemo(() => computePanels(config), [config]);
  const panels = useMemo(() => scenePanels.filter((panel) => panel.fabricate !== false), [scenePanels]);
  const projectPanels = useMemo(() => buildProjectPanels(project), [project]);
  const hardware = useMemo(
    () =>
      mergeHardware(
        project.cabinets.map((cabinet) => ({
          items: computeHardware(normalizeConfig(cabinet.config)),
          multiplier: Math.max(1, Number(cabinet.qty) || 1),
        })),
      ),
    [project],
  );
  const nestingPlan = useMemo(() => buildNestingPlan(projectPanels, config.nesting), [projectPanels, config.nesting]);

  // Share the project with the kitchen layout page.
  useEffect(() => {
    writeSeedProject(project);
  }, [project]);

  // Pick up edits made on the layout page when this tab regains focus.
  useEffect(() => {
    const sync = () => {
      const seeded = readSeedProject();
      if (!seeded) return;
      setProject((current) =>
        JSON.stringify(seeded) !== JSON.stringify(normalizeProject(current)) ? prepareProject(seeded) : current,
      );
    };
    const onVisibility = () => document.visibilityState === 'visible' && sync();
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const commit = useCallback((next: Project) => setProject(prepareProject(next)), []);
  const handleConfigChange = (next: CabinetConfig) => setProject((current) => updateActiveCabinetConfig(current, next));

  const openLayout = () => {
    writeSeedProject(project);
    window.open('kitchen-layout.html', '_blank', 'noopener');
  };

  const exportZip = () => {
    if (projectPanels.length > 0) {
      void downloadManufacturingZip({ panels: projectPanels, config, project, nestingPlan, hardware });
    }
  };

  return (
    <div id="app">
      <div className="topbar">
        <div className="topbar-brand">
          <div className="brand-logo-slot" aria-hidden="true">
            <img src="assets/logo.svg" alt="" />
          </div>
          <div className="brand-copy">
            <span className="company-name">Cabinet</span>
            <span className="product-name">Studio</span>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="topbar-btn" type="button" onClick={() => pickProjectFile(commit, (message) => window.alert(`Invalid JSON file: ${message}`))}>
            <i className="fa-solid fa-file-import" />
            <span>Import</span>
          </button>
          <button className="topbar-btn" type="button" onClick={() => downloadProjectFile(project)}>
            <i className="fa-solid fa-floppy-disk" />
            <span>Save Project</span>
          </button>
          <button className="topbar-btn" type="button" onClick={openLayout}>
            <i className="fa-solid fa-ruler-combined" />
            <span>Kitchen Layout</span>
          </button>
          <button className="topbar-btn" type="button" onClick={exportZip}>
            <i className="fa-solid fa-file-export" />
            <span>Manufacturing ZIP</span>
          </button>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </div>

      <aside className="sidebar-shell">
        <div className="sidebar-header">
          <div className="sidebar-header-row">
            <h1>Cabinet Settings</h1>
          </div>
        </div>
        <div id="form-container">
          <CabinetForm config={config} onChange={handleConfigChange} />
        </div>
      </aside>

      <div id="viewport-panel">
        <ProjectTabs
          project={project}
          onSelect={(id) => commit(setActiveCabinet(project, id))}
          onAdd={() => commit(addCabinet(project))}
          onDuplicate={(id) => commit(duplicateCabinet(project, id))}
          onDelete={(id) => commit(removeCabinet(project, id))}
          onRename={(id, name) => setProject((current) => updateCabinetMeta(current, id, { name }))}
        />
        <div className="viewport-stage">
          <div id="viewport-container">
            <Viewport panels={scenePanels} showEdges={showEdges} dark={theme === 'dark'} hideFronts={hideFronts} />
            <div className="viewport-top-tools">
              <label className="viewport-copies">
                <span>Copies</span>
                <NumberInput
                  value={activeCabinet.qty || 1}
                  commitOn="change"
                  min={1}
                  step={1}
                  onValue={(value) =>
                    setProject((current) =>
                      updateCabinetMeta(current, getActiveCabinet(current).id, {
                        qty: Math.max(1, Math.trunc(value) || 1),
                      }),
                    )
                  }
                />
              </label>
              <label className="viewport-toggle">
                <input type="checkbox" checked={showEdges} onChange={(event) => setShowEdges(event.target.checked)} />
                <span>Show Edges</span>
              </label>
              <label className="viewport-toggle">
                <input type="checkbox" checked={hideFronts} onChange={(event) => setHideFronts(event.target.checked)} />
                <span>Hide Fronts</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <ResultsPanel
        panels={panels}
        projectPanelCount={projectPanels.length}
        hardware={hardware}
        nestingPlan={nestingPlan}
        config={config}
        onConfigChange={handleConfigChange}
      />
    </div>
  );
}
