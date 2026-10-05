import { useEffect, useRef } from 'react';
import type { CabinetInstance, Project, SnapPreview } from '../types';
import { KitchenLayoutViewport, type ViewportCallbacks } from './KitchenLayoutViewport';

interface Props extends ViewportCallbacks {
  project: Project;
  instances: CabinetInstance[];
  selectedId: string | null;
  snapPreview: SnapPreview | null;
  dark: boolean;
  overlayTitle: string;
  overlayCopy: string;
}

export function LayoutViewport({ project, instances, selectedId, snapPreview, dark, overlayTitle, overlayCopy, ...callbacks }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<KitchenLayoutViewport | null>(null);
  const callbacksRef = useRef<ViewportCallbacks>(callbacks);
  callbacksRef.current = callbacks;
  const latest = useRef({ project, instances, selectedId, snapPreview, dark });
  latest.current = { project, instances, selectedId, snapPreview, dark };

  useEffect(() => {
    const viewport = new KitchenLayoutViewport(hostRef.current!, {
      onSelect: (id) => callbacksRef.current.onSelect(id),
      onMove: (id, position) => callbacksRef.current.onMove(id, position),
      onRotate: (id) => callbacksRef.current.onRotate(id),
      onDragEnd: () => callbacksRef.current.onDragEnd(),
    });
    viewportRef.current = viewport;
    const { project, instances, selectedId, snapPreview, dark } = latest.current;
    viewport.setDark(dark);
    viewport.update(project, instances, selectedId, snapPreview);
    return () => {
      viewport.dispose();
      viewportRef.current = null;
    };
  }, []);

  useEffect(() => {
    viewportRef.current?.update(project, instances, latest.current.selectedId, latest.current.snapPreview);
  }, [project, instances]);

  useEffect(() => {
    viewportRef.current?.setDark(dark);
  }, [dark]);

  useEffect(() => {
    viewportRef.current?.setSelection(selectedId, snapPreview);
  }, [selectedId, snapPreview]);

  return (
    <div id="layout-viewport">
      <div ref={hostRef} style={{ position: 'absolute', inset: 0 }} />
      <div className="viewport-overlay">
        <strong>{overlayTitle}</strong>
        <span>{overlayCopy}</span>
      </div>
    </div>
  );
}
