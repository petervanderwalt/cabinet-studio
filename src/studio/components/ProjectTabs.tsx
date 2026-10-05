import { useEffect, useRef, useState } from 'react';
import type { Project } from '../../types';

interface Props {
  project: Project;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

export function ProjectTabs({ project, onSelect, onAdd, onDuplicate, onDelete, onRename }: Props) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const count = project.cabinets.length;

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [project.activeCabinetId, count]);

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    document.addEventListener('click', close);
    window.addEventListener('blur', close);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('click', close);
      window.removeEventListener('blur', close);
      window.removeEventListener('resize', close);
    };
  }, [menu]);

  const finishRename = (id: string, value: string) => {
    const trimmed = value.trim();
    if (trimmed) onRename(id, trimmed);
    setRenamingId(null);
  };

  const runMenuAction = (action: 'duplicate' | 'rename' | 'delete') => {
    if (!menu) return;
    const { id } = menu;
    setMenu(null);
    if (action === 'duplicate') {
      setRenamingId(null);
      onDuplicate(id);
    } else if (action === 'rename') {
      setRenamingId(id);
    } else if (count > 1) {
      const name = project.cabinets.find((cabinet) => cabinet.id === id)?.name || 'this cabinet';
      if (window.confirm(`Delete "${name}" from the project?`)) {
        setRenamingId(null);
        onDelete(id);
      }
    }
  };

  return (
    <>
      <div className="viewport-project-shell">
        <div className="project-tabs-rail">
          <div className={`project-tabs${count >= 8 ? ' ultra-compact' : count >= 5 ? ' compact' : ''}`}>
            {project.cabinets.map((cabinet) => {
              const active = cabinet.id === project.activeCabinetId;
              return (
                <div className={`project-tab${active ? ' active' : ''}`} key={cabinet.id} ref={active ? activeRef : undefined}>
                  <button
                    type="button"
                    className="project-tab-select"
                    onClick={() => {
                      if (renamingId) return;
                      setMenu(null);
                      onSelect(cabinet.id);
                    }}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      setMenu({ id: cabinet.id, x: event.clientX, y: event.clientY });
                    }}
                  >
                    {renamingId === cabinet.id ? (
                      <input
                        className="project-tab-rename"
                        type="text"
                        defaultValue={cabinet.name}
                        aria-label="Rename cabinet"
                        autoFocus
                        onFocus={(event) => event.currentTarget.select()}
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => {
                          event.stopPropagation();
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            finishRename(cabinet.id, event.currentTarget.value);
                          } else if (event.key === 'Escape') {
                            event.preventDefault();
                            setRenamingId(null);
                          }
                        }}
                        onBlur={(event) => finishRename(cabinet.id, event.currentTarget.value)}
                      />
                    ) : (
                      <span className="project-tab-name">{cabinet.name}</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div className="project-tabs-side">
          <button
            className="project-tab-add"
            type="button"
            aria-label="Add cabinet"
            onClick={() => {
              setRenamingId(null);
              onAdd();
            }}
          >
            <i className="fa-solid fa-plus" aria-hidden="true" />
          </button>
          <span className="sidebar-header-meta">
            {count} {count === 1 ? 'cabinet' : 'cabinets'} in project
          </span>
        </div>
      </div>

      {menu && (
        <div className="project-context-menu" style={{ left: menu.x, top: menu.y }}>
          <button className="project-context-btn" type="button" onClick={() => runMenuAction('duplicate')}>
            <i className="fa-solid fa-copy" aria-hidden="true" />
            <span>Duplicate</span>
          </button>
          <button className="project-context-btn" type="button" onClick={() => runMenuAction('rename')}>
            <i className="fa-solid fa-pen" aria-hidden="true" />
            <span>Rename</span>
          </button>
          <button className="project-context-btn" type="button" disabled={count <= 1} onClick={() => runMenuAction('delete')}>
            <i className="fa-solid fa-trash" aria-hidden="true" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </>
  );
}
