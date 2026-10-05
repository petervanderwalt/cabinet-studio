import { useEffect, useState } from 'react';
import { downloadPanelDxf, hardwareToCsv, type HardwareItem } from '../../engine';
import { formatPanelNumber } from '../../lib/format';
import type { CabinetConfig, NestingPlan, Panel, Sheet } from '../../types';
import { NestingView } from './NestingView';
import { PanelPreview } from './PanelPreview';
import { SheetSvg } from './SheetSvg';

interface Props {
  panels: Panel[];
  projectPanelCount: number;
  nestingPlan: NestingPlan | null;
  hardware: HardwareItem[];
  config: CabinetConfig;
  onConfigChange: (config: CabinetConfig) => void;
}

export function ResultsPanel({ panels, projectPanelCount, nestingPlan, hardware, config, onConfigChange }: Props) {
  const [tab, setTab] = useState<'parts' | 'nesting' | 'hardware'>('parts');
  const [zoomed, setZoomed] = useState<Sheet | null>(null);

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setZoomed(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [zoomed]);

  return (
    <aside id="panel-info">
      <div className="panel-info-head">
        <h3>
          <i className="fa-solid fa-table-cells" aria-hidden="true" />
          Panel Preview
        </h3>
        <span>
          {panels.length} {panels.length === 1 ? 'part' : 'parts'}
        </span>
      </div>
      <div className="tab-bar results-tabs">
        <button className={`tab${tab === 'parts' ? ' active' : ''}`} type="button" onClick={() => setTab('parts')}>
          <i className="fa-solid fa-table-cells" aria-hidden="true" />
          <span>Parts</span>
        </button>
        <button className={`tab${tab === 'nesting' ? ' active' : ''}`} type="button" onClick={() => setTab('nesting')}>
          <i className="fa-solid fa-object-group" aria-hidden="true" />
          <span>Nesting</span>
        </button>
        <button className={`tab${tab === 'hardware' ? ' active' : ''}`} type="button" onClick={() => setTab('hardware')}>
          <i className="fa-solid fa-screwdriver-wrench" aria-hidden="true" />
          <span>Hardware</span>
        </button>
      </div>

      {tab === 'parts' ? (
        <div id="panel-list-view">
          <div id="panel-list">
            {panels.length === 0 ? (
              <div className="panel-info-empty">No panels computed</div>
            ) : (
              panels.map((panel) => <PanelRow key={panel.id} panel={panel} />)
            )}
          </div>
        </div>
      ) : tab === 'hardware' ? (
        <HardwareList hardware={hardware} />
      ) : (
        <div id="nesting-view">
          <NestingView
            plan={nestingPlan}
            config={config}
            partCount={projectPanelCount}
            onConfigChange={onConfigChange}
            onOpenSheet={setZoomed}
          />
        </div>
      )}

      {zoomed && nestingPlan && (
        <div className="modal-backdrop" onClick={(event) => event.target === event.currentTarget && setZoomed(null)}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="sheet-zoom-title">
            <div className="modal-head">
              <div>
                <h4 id="sheet-zoom-title">Sheet {zoomed.index + 1}</h4>
                <p>
                  {zoomed.materialLabel || 'Sheet Stock'} · {formatPanelNumber(zoomed.thickness)}mm · {formatPanelNumber(zoomed.sheetWidth)} x{' '}
                  {formatPanelNumber(zoomed.sheetHeight)} mm · {zoomed.placements.length} parts
                </p>
              </div>
              <button className="modal-close" type="button" aria-label="Close sheet review" onClick={() => setZoomed(null)}>
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>
            <div className="modal-body">
              <SheetSvg sheet={zoomed} options={nestingPlan.options} />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function PanelRow({ panel }: { panel: Panel }) {
  const dims = `${panel.cutWidth.toFixed(0)} x ${panel.cutHeight.toFixed(0)} x ${panel.cutThickness.toFixed(0)}`;
  const eb = panel.edgeBanding || {};
  const edges = (['top', 'bottom', 'left', 'right'] as const).filter((side) => eb[side]);
  const meta: string[] = [];
  const holes = (panel.holes || []).length;
  const notches = (panel.notches || []).length;
  const grooves = (panel.grooves || []).length;
  if (holes > 0) meta.push(`${holes} holes`);
  if (notches > 0) meta.push(`${notches} notches`);
  if (grooves > 0) meta.push(`${grooves} grooves`);
  if (edges.length > 0) meta.push(`Edge banding: ${edges.join('/')}`);

  return (
    <div className="panel-info-row">
      <div className="panel-row-main">
        <span className="panel-name">{panel.name}</span>
        <span className="panel-dims">{dims}mm</span>
        <span className="panel-meta">{meta.join(', ')}</span>
        <div className="panel-row-actions">
          <button
            type="button"
            className="export-row-btn"
            onClick={(event) => {
              event.stopPropagation();
              downloadPanelDxf(panel);
            }}
          >
            <i className="fa-solid fa-file-arrow-down" aria-hidden="true" />
            <span>DXF</span>
          </button>
        </div>
      </div>
      <div className="panel-row-preview">
        <PanelPreview panel={panel} />
      </div>
    </div>
  );
}

function HardwareList({ hardware }: { hardware: HardwareItem[] }) {
  if (hardware.length === 0) return <div className="panel-info-empty">No hardware calculated</div>;
  const groups = [...new Set(hardware.map((item) => item.group))];
  const download = () => {
    const url = URL.createObjectURL(new Blob([hardwareToCsv(hardware)], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hardware.csv';
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="hardware-list">
      {groups.map((group) => (
        <section className="hardware-group" key={group}>
          <h4>{group}</h4>
          {hardware
            .filter((item) => item.group === group)
            .map((item) => (
              <div className="hardware-row" key={`${item.item}-${item.unit}-${item.partNo ?? ''}`}>
                <span>
                  {item.partNo && <strong className="hardware-partno">{item.partNo} </strong>}
                  {item.item}
                </span>
                <span className="hardware-qty">
                  {item.qty} {item.unit}
                </span>
                {item.note && <span className="hardware-note">{item.note}</span>}
              </div>
            ))}
        </section>
      ))}
      <button type="button" className="export-row-btn" onClick={download}>
        <i className="fa-solid fa-file-arrow-down" aria-hidden="true" />
        <span>Hardware CSV</span>
      </button>
    </div>
  );
}
