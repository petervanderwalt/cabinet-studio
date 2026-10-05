import { useEffect, useRef } from 'react';
import { CabinetViewport } from '../../engine/three-viewport.js';
import type { Panel } from '../../types';

interface Props {
  panels: Panel[];
  showEdges: boolean;
  dark: boolean;
  hideFronts: boolean;
}

/** Hosts the imperative three.js cabinet viewport and keeps it in sync with React state. */
export function Viewport({ panels, showEdges, dark, hideFronts }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<InstanceType<typeof CabinetViewport> | null>(null);
  const latest = useRef({ panels, showEdges, dark, hideFronts });
  latest.current = { panels, showEdges, dark, hideFronts };

  useEffect(() => {
    const viewport = new CabinetViewport(containerRef.current);
    viewportRef.current = viewport;
    viewport.setDark(latest.current.dark);
    viewport.setHideFronts(latest.current.hideFronts);
    viewport.setShowEdges(latest.current.showEdges);
    viewport.update(latest.current.panels);
    return () => {
      viewport.dispose();
      viewportRef.current = null;
    };
  }, []);

  useEffect(() => {
    viewportRef.current?.update(panels);
    viewportRef.current?.setHideFronts(latest.current.hideFronts);
  }, [panels]);

  useEffect(() => {
    viewportRef.current?.setHideFronts(hideFronts);
  }, [hideFronts]);

  useEffect(() => {
    viewportRef.current?.setDark(dark);
  }, [dark]);

  useEffect(() => {
    viewportRef.current?.setShowEdges(showEdges);
  }, [showEdges]);

  return <div ref={containerRef} className="viewport-canvas-host" style={{ position: 'absolute', inset: 0 }} />;
}
