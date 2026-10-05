import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  autoArrangeProject,
  createProjectFromConfig,
  downloadProjectFile,
  getPlacementWorldPosition,
  getProjectInstances,
  normalizeProject,
  updatePlacement,
  updateRoom,
} from '../engine';
import { capitalize, formatMm } from '../lib/format';
import { pickProjectFile, readSeedProject, writeSeedProject } from '../lib/seed';
import type { Project, Room, SnapPreview } from '../types';
import { NumberInput } from '../studio/components/NumberInput';
import { LayoutViewport } from './LayoutViewport';
import { ThemeToggle } from '../theme/ThemeToggle';
import { useTheme } from '../theme/theme';

const DEFAULT_OVERLAY_COPY =
  'Base and tall cabinets auto-start on the floor. Wall cabinets auto-start on the wall row at the configured wall height.';

export function App() {
  const [project, setProject] = useState<Project>(() => readSeedProject() ?? normalizeProject(createProjectFromConfig({})));
  const [requestedId, setRequestedId] = useState<string | null>(null);
  const [snapPreview, setSnapPreview] = useState<SnapPreview | null>(null);
  const [theme, toggleTheme] = useTheme();

  const instances = useMemo(() => getProjectInstances(project), [project]);
  const selected = instances.find((instance) => instance.instanceId === requestedId) ?? instances[0] ?? null;
  const selectedId = selected?.instanceId ?? null;
  const room = project.layout.room;

  useEffect(() => {
    writeSeedProject(project);
  }, [project]);

  const apply = useCallback((update: (current: Project) => Project) => setProject((current) => normalizeProject(update(current))), []);

  const handleSelect = useCallback((id: string) => {
    setRequestedId(id);
    setSnapPreview(null);
  }, []);

  const handleMove = useCallback(
    (id: string, position: { x: number; z: number; preview: SnapPreview | null }) => {
      apply((current) => updatePlacement(current, id, position));
      setSnapPreview(position.preview);
      setRequestedId(id);
    },
    [apply],
  );

  const handleRotate = useCallback(
    (id: string) => {
      apply((current) => {
        const instance = getProjectInstances(current).find((entry) => entry.instanceId === id);
        if (!instance) return current;
        return updatePlacement(current, id, { rotation: ((instance.placement.rotation || 0) + 90) % 360 });
      });
      setSnapPreview(null);
    },
    [apply],
  );

  const handleDragEnd = useCallback(() => setSnapPreview(null), []);

  const setRoom = (key: keyof Room, value: number) => apply((current) => updateRoom(current, { [key]: value }));
  const setPlacement = (updates: { x?: number; z?: number; rotation?: number }) => {
    if (selectedId) apply((current) => updatePlacement(current, selectedId, updates));
  };

  const loadProject = (next: Project) => {
    setProject(next);
    setRequestedId(null);
    setSnapPreview(null);
  };

  const world = selected ? getPlacementWorldPosition(project, selected) : null;
  const projectName = project.name || 'Kitchen Project';

  return (
    <div id="app">
      <div className="topbar">
        <div className="topbar-brand">
          <div className="brand-logo-slot" aria-hidden="true">
            <img src="assets/logo.svg" alt="" />
          </div>
          <div className="brand-copy">
            <span className="company-name">Cabinet</span>
            <span className="product-name">Kitchen Layout</span>
          </div>
        </div>
        <div className="topbar-actions">
          <button
            className="topbar-btn"
            type="button"
            onClick={() => pickProjectFile(loadProject, (message) => window.alert(`Invalid project JSON: ${message}`))}
          >
            <i className="fa-solid fa-file-import" aria-hidden="true" />
            <span>Import Project</span>
          </button>
          <button className="topbar-btn" type="button" onClick={() => downloadProjectFile(normalizeProject(project))}>
            <i className="fa-solid fa-floppy-disk" aria-hidden="true" />
            <span>Save Project</span>
          </button>
          <button className="topbar-btn" type="button" onClick={() => apply(autoArrangeProject)}>
            <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />
            <span>Auto Arrange</span>
          </button>
          <button
            className="topbar-btn"
            type="button"
            onClick={() => {
              writeSeedProject(project);
              window.location.href = 'index.html';
            }}
          >
            <i className="fa-solid fa-cubes" aria-hidden="true" />
            <span>Cabinet Studio</span>
          </button>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </div>

      <aside className="panel-shell">
        <div className="panel-head">
          <h1>Room Setup</h1>
          <span className="panel-meta">{projectName}</span>
        </div>
        <div className="panel-scroll">
          <div className="card">
            <h4>Kitchen Envelope</h4>
            <p>
              Set the room size and the standard underside height for wall cabinets. Base and tall cabinets sit on the floor; wall
              cabinets mount to the wall row above.
            </p>
            <div className="field-grid">
              <div className="field">
                <label>Room Width</label>
                <NumberInput value={room.width} onValue={(v) => setRoom('width', v)} commitOn="change" min={1000} step={10} />
              </div>
              <div className="field">
                <label>Room Depth</label>
                <NumberInput value={room.depth} onValue={(v) => setRoom('depth', v)} commitOn="change" min={1000} step={10} />
              </div>
              <div className="field">
                <label>Room Height</label>
                <NumberInput value={room.height} onValue={(v) => setRoom('height', v)} commitOn="change" min={1800} step={10} />
              </div>
              <div className="field">
                <label>Wall Cabinet Bottom</label>
                <NumberInput
                  value={room.wallCabinetBottom}
                  onValue={(v) => setRoom('wallCabinetBottom', v)}
                  commitOn="change"
                  min={600}
                  step={10}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h4>Project Summary</h4>
            <div className="metric-row">
              <div className="metric">
                <span>Cabinets</span>
                <strong>{project.cabinets.length}</strong>
              </div>
              <div className="metric">
                <span>Placed Units</span>
                <strong>{instances.length}</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <h4>Selected Cabinet</h4>
            {selected && world ? (
              <div className="field-grid">
                <div className="field">
                  <span>Name</span>
                  <input type="text" readOnly value={selected.label} />
                </div>
                <div className="field">
                  <span>Category</span>
                  <input type="text" readOnly value={selected.config.category} />
                </div>
                <div className="field">
                  <label>Position X</label>
                  <NumberInput value={selected.placement.x} onValue={(v) => setPlacement({ x: v })} commitOn="change" step={10} />
                </div>
                <div className="field">
                  <label>Position Z</label>
                  <NumberInput value={selected.placement.z} onValue={(v) => setPlacement({ z: v })} commitOn="change" step={10} />
                </div>
                <div className="field">
                  <label>Rotation</label>
                  <select
                    value={String(selected.placement.rotation || 0)}
                    onChange={(event) => setPlacement({ rotation: Number.parseInt(event.target.value, 10) || 0 })}
                  >
                    {[0, 90, 180, 270].map((deg) => (
                      <option key={deg} value={deg}>
                        {deg}°
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <span>Size</span>
                  <input type="text" readOnly value={`${formatMm(world.width)} x ${formatMm(world.depth)} x ${formatMm(world.height)} mm`} />
                </div>
              </div>
            ) : (
              <div className="helper">
                Select a cabinet in the scene or list to adjust its placement. Right click a cabinet in the viewport to rotate it 90°.
              </div>
            )}
            <div className="inline-actions">
              <button className="mini-btn" type="button" onClick={() => selectedId && handleRotate(selectedId)}>
                <i className="fa-solid fa-rotate-right" aria-hidden="true" />
                <span>Rotate 90°</span>
              </button>
            </div>
          </div>

          <div className="warn">
            Drag cabinets to rearrange them. Rotation swaps the footprint so corner planning is easier, but collision checking is not
            enforced yet.
          </div>
        </div>
      </aside>

      <section id="viewport-panel">
        <div className="viewport-toolbar">
          <div>
            <h2>Kitchen Layout View</h2>
            <p>{`${projectName} · drag cabinets to rearrange the room.`}</p>
          </div>
          <div className="viewport-tools">
            <div className="chip">
              <i className="fa-solid fa-up-right-and-down-left-from-center" aria-hidden="true" />
              <span>Drag to place</span>
            </div>
            <div className="chip">
              <i className="fa-solid fa-arrow-rotate-right" aria-hidden="true" />
              <span>Right click to rotate</span>
            </div>
          </div>
        </div>
        <LayoutViewport
          project={project}
          instances={instances}
          selectedId={selectedId}
          snapPreview={snapPreview}
          dark={theme === 'dark'}
          overlayTitle={selected ? selected.label : 'No cabinet selected'}
          overlayCopy={
            selected
              ? `${capitalize(selected.config.category)} cabinet · X ${formatMm(selected.placement.x)} mm · Z ${formatMm(selected.placement.z)} mm · rotation ${formatMm(selected.placement.rotation || 0)}°${snapPreview?.label ? ` · snap: ${snapPreview.label}` : ''}`
              : DEFAULT_OVERLAY_COPY
          }
          onSelect={handleSelect}
          onMove={handleMove}
          onRotate={handleRotate}
          onDragEnd={handleDragEnd}
        />
      </section>

      <aside id="layout-list">
        <div className="panel-head">
          <h3>Cabinet Instances</h3>
          <span className="panel-meta">
            {instances.length} {instances.length === 1 ? 'unit' : 'units'}
          </span>
        </div>
        <div id="layout-list-body">
          {instances.length === 0 ? (
            <div className="empty-state">Import a project JSON or start with a saved project from Cabinet Studio.</div>
          ) : (
            instances.map((instance) => {
              const pos = getPlacementWorldPosition(project, instance);
              return (
                <button
                  key={instance.instanceId}
                  className={`cabinet-row${instance.instanceId === selectedId ? ' active' : ''}`}
                  type="button"
                  onClick={() => handleSelect(instance.instanceId)}
                >
                  <div className="cabinet-row-top">
                    <span className="cabinet-row-name">{instance.label}</span>
                    <span className="cabinet-badge">{instance.config.category}</span>
                  </div>
                  <div className="cabinet-row-meta">
                    <span>
                      {formatMm(pos.width)} × {formatMm(pos.depth)} × {formatMm(pos.height)} mm
                    </span>
                    <span>Rot {formatMm(instance.placement.rotation || 0)}°</span>
                    <span>X {formatMm(instance.placement.x)}</span>
                    <span>Z {formatMm(instance.placement.z)}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}
