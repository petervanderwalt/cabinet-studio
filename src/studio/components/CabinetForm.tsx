import { validateCabinet } from '../../engine';
import type { CabinetConfig } from '../../types';
import { ConsiderationsSection, ConstructionSection, OverlaySection, ToeKickSection } from './form/BuildSections';
import { FittingsSection } from './form/FittingsSection';
import { FrontsSection } from './form/FrontsSection';
import { HardwareSection } from './form/HardwareSection';
import { InteriorSection } from './form/InteriorSection';
import { LightingSection } from './form/LightingSection';
import { MaterialsSection } from './form/MaterialsSection';
import { makeFormApi } from './form/shared';
import { TypeSection } from './form/TypeSection';

interface Props {
  config: CabinetConfig;
  onChange: (config: CabinetConfig) => void;
}

export function CabinetForm({ config, onChange }: Props) {
  const api = makeFormApi(config, onChange);
  const warnings = validateCabinet(config);

  return (
    <form className="cabinet-form" onSubmit={(event) => event.preventDefault()}>
      <TypeSection api={api} />
      <FrontsSection api={api} />
      <InteriorSection api={api} />
      <MaterialsSection api={api} />
      <ConstructionSection api={api} />
      <ToeKickSection api={api} />
      <OverlaySection api={api} />
      <HardwareSection api={api} />
      <FittingsSection api={api} />
      <LightingSection api={api} />
      <ConsiderationsSection api={api} />

      <div className="validation-msgs">
        {warnings.map((warning) => (
          <div className="warn" key={warning}>Warning: {warning}</div>
        ))}
      </div>
    </form>
  );
}
