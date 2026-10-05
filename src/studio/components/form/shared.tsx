import { useState, type ReactNode } from 'react';
import { normalizeConfig } from '../../../lib/config';
import type { CabinetConfig } from '../../../types';
import { NumberInput } from '../NumberInput';

export type NumAttrs = { min?: number; max?: number; step?: number };

/** What every form section needs to read and edit the cabinet. */
export interface FormApi {
  config: CabinetConfig;
  emit: (config: CabinetConfig) => void;
  set: (path: string, value: unknown) => void;
  num: (path: string, fallback?: number, attrs?: NumAttrs) => ReactNode;
}

export function getPath(config: CabinetConfig, path: string): unknown {
  return path.split('.').reduce<unknown>((cur, part) => (cur as Record<string, unknown> | undefined)?.[part], config);
}

export function setPath(config: CabinetConfig, path: string, value: unknown): CabinetConfig {
  const next = structuredClone(config);
  const parts = path.split('.');
  let cur = next as unknown as Record<string, unknown>;
  for (const part of parts.slice(0, -1)) {
    if (!cur[part] || typeof cur[part] !== 'object') cur[part] = {};
    cur = cur[part] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
  return next;
}

export function makeFormApi(config: CabinetConfig, onChange: (config: CabinetConfig) => void): FormApi {
  const emit = (next: CabinetConfig) => onChange(normalizeConfig(next));
  const set = (path: string, value: unknown) => emit(setPath(config, path, value));
  const num: FormApi['num'] = (path, fallback = 0, attrs = {}) => (
    <NumberInput value={(getPath(config, path) as number | null | undefined) ?? fallback} onValue={(value) => set(path, value)} {...attrs} />
  );
  return { config, emit, set, num };
}

export function Section({ title, icon, children }: { title: string; icon: string; children: ReactNode }) {
  return (
    <div className="form-section">
      <div className="form-section-title">
        <span className="form-section-icon" aria-hidden="true">
          <i className={`fa-solid ${icon}`} />
        </span>
        <h3>{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function Field({ label, unit, children }: { label: string; unit?: string; children: ReactNode }) {
  return (
    <div className="field">
      <label>{label}</label>
      {unit ? (
        <div className="input-wrap">
          {children}
          <span className="unit">{unit}</span>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export function Blurb({ children }: { children: ReactNode }) {
  return <p className="section-blurb">{children}</p>;
}

export function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="helper-card">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

export function ModeButton({ icon, title, active, onClick }: { icon: string; title: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`mode-card${active ? ' active' : ''}`} onClick={onClick}>
      <span className="mode-card-head">
        <i className={`fa-solid ${icon}`} aria-hidden="true" />
        <span>{title}</span>
      </span>
    </button>
  );
}

export function TabButton({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`tab${active ? ' active' : ''}`} onClick={onClick}>
      <i className={`fa-solid ${icon}`} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <Field label={label}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </Field>
  );
}

export function Select<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <select
      value={String(value)}
      onChange={(event) => {
        const raw = event.target.value;
        const match = options.find((option) => String(option.value) === raw);
        if (match) onChange(match.value);
      }}
    >
      {options.map((option) => (
        <option key={String(option.value)} value={String(option.value)}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/** Small helper for tab groups with local state. */
export function useTab<T extends string>(initial: T) {
  return useState<T>(initial);
}
