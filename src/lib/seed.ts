import { normalizeProject } from '../engine';
import type { Project } from '../types';

/** The studio and layout pages share the active project through localStorage. */
export const LAYOUT_SEED_KEY = 'cabinet-studio-layout-seed';

export function readSeedProject(): Project | null {
  try {
    const seed = window.localStorage.getItem(LAYOUT_SEED_KEY);
    if (!seed) return null;
    return normalizeProject(JSON.parse(seed));
  } catch {
    return null;
  }
}

export function writeSeedProject(project: Project): void {
  try {
    window.localStorage.setItem(LAYOUT_SEED_KEY, JSON.stringify(normalizeProject(project)));
  } catch {
    // Ignore local storage failures.
  }
}

export function pickProjectFile(onProject: (project: Project) => void, onError: (message: string) => void): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        onProject(normalizeProject(JSON.parse(String(reader.result || '{}'))));
      } catch (err) {
        onError(err instanceof Error ? err.message : String(err));
      }
    };
    reader.readAsText(file);
  });
  input.click();
}
