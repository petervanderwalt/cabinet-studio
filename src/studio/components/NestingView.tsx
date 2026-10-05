import type { CabinetConfig, NestingPlan, Sheet } from '../../types';
import { applyGlobalMaterialSelections, CARCASS_STOCKS, FRONT_STOCKS, REAR_STOCKS } from '../../engine';
import { formatPanelNumber } from '../../lib/format';
import { NumberInput } from './NumberInput';
import { SheetSvg } from './SheetSvg';

interface Props {
  plan: NestingPlan | null;
  config: CabinetConfig;
  partCount: number;
  onConfigChange: (config: CabinetConfig) => void;
  onOpenSheet: (sheet: Sheet) => void;
}

type StockType = 'carcass' | 'rear' | 'front';

export function NestingView({ plan, config, partCount, onConfigChange, onOpenSheet }: Props) {
  if (!plan || plan.groups.length === 0) {
    return <div className="panel-info-empty">No nesting layout available</div>;
  }

  const materials = config.materials;
  const nesting = config.nesting;

  const setStock = (type: StockType, value: string) => {
    const next = { ...materials };
    if (type === 'carcass') next.caseMaterial = value;
    if (type === 'rear') next.backMaterial = value;
    if (type === 'front') next.frontMaterial = value;
    onConfigChange({ ...config, materials: applyGlobalMaterialSelections(next) });
  };

  const setNesting = (key: keyof CabinetConfig['nesting'], value: number | boolean) => {
    onConfigChange({ ...config, nesting: { ...nesting, [key]: value } });
  };

  return (
    <>
      <section className="nesting-controls-card">
        <div className="nesting-controls-head">
          <h4>Global Stock Setup</h4>
          <p>Carcass also drives shelves, drawer sides, and kickboard. Rear and fronts are tracked separately.</p>
        </div>
        <div className="nesting-controls-grid">
          <StockSelect label="Carcass Stock" value={materials.caseMaterial} options={CARCASS_STOCKS} onChange={(v) => setStock('carcass', v)} />
          <StockSelect label="Rear Stock" value={materials.backMaterial} options={REAR_STOCKS} onChange={(v) => setStock('rear', v)} />
          <StockSelect
            label="Front Stock"
            value={materials.frontMaterial || materials.doorMaterial}
            options={FRONT_STOCKS}
            onChange={(v) => setStock('front', v)}
          />
        </div>
        <div className="nesting-controls-head">
          <h4>Nesting Settings</h4>
          <p>Control the stock sheet size, machining gap, and whether parts may rotate during nesting.</p>
        </div>
        <div className="nesting-controls-grid nesting-settings-grid">
          <NumberField label="Sheet length" value={nesting.sheetWidth ?? 2440} min={100} step={1} onValue={(v) => setNesting('sheetWidth', v)} />
          <NumberField label="Sheet width" value={nesting.sheetHeight ?? 1220} min={100} step={1} onValue={(v) => setNesting('sheetHeight', v)} />
          <NumberField label="Nesting gap" value={nesting.gap ?? 20} min={0} step={0.1} onValue={(v) => setNesting('gap', v)} />
          <label className="nesting-check-field">
            <input type="checkbox" checked={nesting.allowRotation !== false} onChange={(event) => setNesting('allowRotation', event.target.checked)} />
            <span>Allow part rotation</span>
          </label>
        </div>
      </section>

      {plan.unplaced.length > 0 && (
        <div className="warn">
          Some parts could not be nested: {plan.unplaced.map((item) => `${item.panel.name} (${item.reason})`).join(', ')}
        </div>
      )}

      <div className="nesting-summary">
        <Metric label="Sheets" value={String(plan.totalSheets)} />
        <Metric label="Parts" value={String(partCount)} />
        <Metric label="Utilization" value={`${(plan.utilization * 100).toFixed(1)}%`} />
      </div>

      {plan.groups.map((group) => (
        <section className="nesting-group" key={group.key}>
          <div className="nesting-group-head">
            <div>
              <h4>{group.title}</h4>
              <p>
                {group.sheets.length} {group.sheets.length === 1 ? 'sheet' : 'sheets'} · {group.partCount} parts ·{' '}
                {(group.utilization * 100).toFixed(1)}% utilization
              </p>
            </div>
          </div>
          <div className="nesting-sheet-list">
            {group.sheets.map((sheet) => (
              <article className="nesting-sheet-card" key={sheet.id}>
                <div className="nesting-sheet-head">
                  <div>
                    <h5>Sheet {sheet.index + 1}</h5>
                    <p>
                      {sheet.materialLabel || 'Sheet Stock'} · {formatPanelNumber(sheet.thickness)}mm
                    </p>
                    <p>
                      {formatPanelNumber(sheet.sheetWidth)} x {formatPanelNumber(sheet.sheetHeight)} mm · {sheet.placements.length} parts
                    </p>
                  </div>
                  <span className="nesting-badge">{((sheet.usedArea / (sheet.sheetWidth * sheet.sheetHeight)) * 100).toFixed(1)}%</span>
                </div>
                <button
                  className="nesting-sheet-canvas nesting-sheet-canvas-btn"
                  type="button"
                  aria-label={`Open larger review for sheet ${sheet.index + 1}`}
                  onClick={() => onOpenSheet(sheet)}
                >
                  <SheetSvg sheet={sheet} options={plan.options} />
                </button>
              </article>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="nesting-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StockSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; thickness: number }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="nesting-stock-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.label} value={option.label}>
            {option.label} · {formatPanelNumber(option.thickness)}mm
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberField({
  label,
  value,
  min,
  step,
  onValue,
}: {
  label: string;
  value: number;
  min: number;
  step: number;
  onValue: (value: number) => void;
}) {
  return (
    <label className="nesting-stock-field">
      <span>{label}</span>
      <div className="nesting-inline-input">
        <NumberInput value={value} onValue={onValue} commitOn="change" min={min} step={step} />
        <em>mm</em>
      </div>
    </label>
  );
}
