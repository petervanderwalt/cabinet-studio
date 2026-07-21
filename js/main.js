// main.js - Application entry point
import { CabinetViewport } from './three-viewport.js';
import { CabinetForm } from './form-ui.js';
import { computePanels } from './cabinet-math.js';
import { downloadManufacturingZip, downloadPanelDxf, downloadProjectFile } from './dxf-writer.js';
import { buildNestingPlan } from './nesting.js';
import { applyGlobalMaterialSelections, CARCASS_STOCKS, FRONT_STOCKS, REAR_STOCKS } from './material-presets.js';
import {
  addCabinet,
  createProjectFromConfig,
  duplicateCabinet,
  getActiveCabinet,
  normalizeProject,
  removeCabinet,
  setActiveCabinet,
  updateActiveCabinetConfig,
  updateCabinetMeta,
} from './project-io.js';

let viewport = null;
let form = null;
let currentPanels = [];
let currentProjectPanels = [];
let currentConfig = null;
let currentNestingPlan = null;
let currentProject = null;
let projectTabMenuCabinetId = null;
let renamingCabinetId = null;
const LAYOUT_SEED_KEY = 'cabinet-studio-layout-seed';

function init() {
  const formContainer = document.getElementById('form-container');
  const viewportContainer = document.getElementById('viewport-container');

  viewport = new CabinetViewport(viewportContainer);
  initResultsTabs();
  initSheetModal();
  initProjectControls();
  initProjectTabMenu();

  const showEdgesToggle = document.getElementById('show-edges-toggle');
  if (showEdgesToggle) {
    viewport.setShowEdges(showEdgesToggle.checked);
    showEdgesToggle.addEventListener('change', () => {
      viewport.setShowEdges(showEdgesToggle.checked);
    });
  }

  form = new CabinetForm(formContainer, (config) => {
    currentConfig = config;
    currentProject = updateActiveCabinetConfig(currentProject, config);
    refreshDerivedState();
  });

  document.getElementById('save-project-btn').addEventListener('click', () => {
    if (currentProject) {
      downloadProjectFile(currentProject);
    }
  });

  document.getElementById('open-layout-btn')?.addEventListener('click', () => {
    if (currentProject) {
      try {
        window.localStorage.setItem(LAYOUT_SEED_KEY, JSON.stringify(normalizeProject(currentProject)));
      } catch {
        // Ignore local storage failures and still open the layout view.
      }
    }
    window.open('kitchen-layout.html', '_blank', 'noopener');
  });

  document.getElementById('export-zip-btn').addEventListener('click', () => {
    if (currentProjectPanels.length > 0 && currentConfig && currentProject) {
      downloadManufacturingZip({
        panels: currentProjectPanels,
        config: currentConfig,
        project: currentProject,
        nestingPlan: currentNestingPlan,
      });
    }
  });

  document.getElementById('import-btn').addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          const project = normalizeProject(data);
          loadProject(project);
        } catch (err) {
          alert('Invalid JSON file: ' + err.message);
        }
      };
      reader.readAsText(file);
    });
    fileInput.click();
  });

  window.addEventListener('focus', syncProjectFromLayoutSeed);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') syncProjectFromLayoutSeed();
  });

  const seededProject = readLayoutSeedProject();
  if (seededProject) {
    loadProject(seededProject);
    return;
  }

  const initialConfig = form.getConfig();
  currentProject = createProjectFromConfig(initialConfig);
  loadProject(currentProject);
}

function loadProject(project) {
  currentProject = normalizeProject(project);
  const activeCabinet = getActiveCabinet(currentProject);
  renamingCabinetId = null;
  renderProjectTabs();
  form.importConfig(activeCabinet.config);
  persistLayoutSeedProject();
}

function refreshDerivedState() {
  if (!currentProject) return;
  const activeCabinet = getActiveCabinet(currentProject);
  currentConfig = activeCabinet.config;
  currentPanels = computePanels(activeCabinet.config);
  currentProjectPanels = buildProjectPanels(currentProject);
  currentNestingPlan = buildNestingPlan(currentProjectPanels, activeCabinet.config.nesting);

  renderProjectTabs();
  updatePanelList(currentPanels);
  updateNestingView(currentNestingPlan);
  viewport.update(currentPanels);
  persistLayoutSeedProject();
}

function readLayoutSeedProject() {
  try {
    const seed = window.localStorage.getItem(LAYOUT_SEED_KEY);
    if (!seed) return null;
    return normalizeProject(JSON.parse(seed));
  } catch {
    return null;
  }
}

function persistLayoutSeedProject() {
  if (!currentProject) return;
  try {
    window.localStorage.setItem(LAYOUT_SEED_KEY, JSON.stringify(normalizeProject(currentProject)));
  } catch {
    // Ignore local storage failures.
  }
}

function syncProjectFromLayoutSeed() {
  const seededProject = readLayoutSeedProject();
  if (!seededProject) return;
  if (!currentProject || JSON.stringify(seededProject) !== JSON.stringify(normalizeProject(currentProject))) {
    loadProject(seededProject);
  }
}

function buildProjectPanels(project) {
  const normalized = normalizeProject(project);
  const multiCabinet = normalized.cabinets.length > 1;
  const projectPanels = [];

  normalized.cabinets.forEach((cabinet) => {
    const basePanels = computePanels(cabinet.config);
    const copies = Math.max(1, Number(cabinet.qty) || 1);
    for (let copyIndex = 0; copyIndex < copies; copyIndex += 1) {
      for (const panel of basePanels) {
        const instanceSuffix = copies > 1 ? ` #${copyIndex + 1}` : '';
        const labelPrefix = multiCabinet ? `${cabinet.name} · ` : '';
        projectPanels.push({
          ...structuredClone(panel),
          id: `${cabinet.id}__${copyIndex + 1}__${panel.id}`,
          name: `${labelPrefix}${panel.name}${instanceSuffix}`,
          sourceCabinetId: cabinet.id,
          sourceCabinetName: cabinet.name,
          sourceCopyIndex: copyIndex + 1,
        });
      }
    }
  });

  return projectPanels;
}

function initProjectControls() {
  const addBtn = document.getElementById('project-add-cabinet-btn');
  const copiesInput = document.getElementById('project-copies-input');

  addBtn?.addEventListener('click', () => {
    renamingCabinetId = null;
    currentProject = addCabinet(currentProject);
    loadProject(currentProject);
  });

  copiesInput?.addEventListener('change', () => {
    const active = getActiveCabinet(currentProject);
    currentProject = updateCabinetMeta(currentProject, active.id, {
      qty: Math.max(1, Number.parseInt(copiesInput.value, 10) || 1),
    });
    refreshDerivedState();
  });
}

function renderProjectTabs() {
  const tabList = document.getElementById('project-cabinet-tabs');
  const meta = document.getElementById('project-cabinet-meta');
  const copiesInput = document.getElementById('project-copies-input');
  if (!tabList || !currentProject) return;

  const activeCabinet = getActiveCabinet(currentProject);
  tabList.classList.toggle('compact', currentProject.cabinets.length >= 5);
  tabList.classList.toggle('ultra-compact', currentProject.cabinets.length >= 8);
  tabList.innerHTML = currentProject.cabinets.map((cabinet) => `
    <div class="project-tab${cabinet.id === activeCabinet.id ? ' active' : ''}">
      <button
        type="button"
        class="project-tab-select"
        data-cabinet-tab="${escapeHtml(cabinet.id)}"
      >
        ${renamingCabinetId === cabinet.id
          ? `<input
              class="project-tab-rename"
              type="text"
              value="${escapeHtml(cabinet.name)}"
              data-cabinet-rename="${escapeHtml(cabinet.id)}"
              aria-label="Rename cabinet"
            >`
          : `<span class="project-tab-name">${escapeHtml(cabinet.name)}</span>`
        }
      </button>
    </div>
  `).join('');

  if (meta) {
    meta.textContent = `${currentProject.cabinets.length} ${currentProject.cabinets.length === 1 ? 'cabinet' : 'cabinets'} in project`;
  }
  if (copiesInput) {
    copiesInput.value = String(activeCabinet.qty || 1);
  }

  for (const tab of tabList.querySelectorAll('[data-cabinet-tab]')) {
    const cabinetId = tab.getAttribute('data-cabinet-tab');
    tab.addEventListener('click', () => {
      if (renamingCabinetId) return;
      closeProjectTabMenu();
      currentProject = setActiveCabinet(currentProject, cabinetId);
      loadProject(currentProject);
    });
    tab.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      openProjectTabMenu(cabinetId, event.clientX, event.clientY);
    });
  }

  const renameInput = tabList.querySelector('[data-cabinet-rename]');
  if (renameInput instanceof HTMLInputElement) {
    queueMicrotask(() => {
      renameInput.focus();
      renameInput.select();
    });
    const saveRename = () => {
      const cabinetId = renameInput.getAttribute('data-cabinet-rename');
      const trimmed = renameInput.value.trim();
      if (cabinetId && trimmed) {
        currentProject = updateCabinetMeta(currentProject, cabinetId, { name: trimmed });
      }
      renamingCabinetId = null;
      refreshDerivedState();
    };
    renameInput.addEventListener('click', (event) => event.stopPropagation());
    renameInput.addEventListener('keydown', (event) => {
      event.stopPropagation();
      if (event.key === 'Enter') {
        event.preventDefault();
        saveRename();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        renamingCabinetId = null;
        renderProjectTabs();
      }
    });
    renameInput.addEventListener('blur', saveRename);
  }

  const activeTab = tabList.querySelector('.project-tab.active');
  if (activeTab instanceof HTMLElement) {
    requestAnimationFrame(() => {
      activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    });
  }
}

function initProjectTabMenu() {
  const menu = document.getElementById('project-tab-menu');
  if (!menu) return;

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element) || !event.target.closest('#project-tab-menu')) {
      closeProjectTabMenu();
    }
  });

  window.addEventListener('blur', closeProjectTabMenu);
  window.addEventListener('resize', closeProjectTabMenu);

  for (const button of menu.querySelectorAll('[data-project-action]')) {
    button.addEventListener('click', () => {
      if (!projectTabMenuCabinetId) return;
      const action = button.getAttribute('data-project-action');
      if (action === 'duplicate') {
        renamingCabinetId = null;
        currentProject = duplicateCabinet(currentProject, projectTabMenuCabinetId);
        loadProject(currentProject);
      }
      if (action === 'rename') {
        renamingCabinetId = projectTabMenuCabinetId;
        renderProjectTabs();
      }
      if (action === 'delete') {
        if (currentProject.cabinets.length > 1) {
          const cabinet = currentProject.cabinets.find((entry) => entry.id === projectTabMenuCabinetId);
          const confirmed = window.confirm(`Delete "${cabinet?.name || 'this cabinet'}" from the project?`);
          if (!confirmed) {
            closeProjectTabMenu();
            return;
          }
          renamingCabinetId = null;
          currentProject = removeCabinet(currentProject, projectTabMenuCabinetId);
          loadProject(currentProject);
        }
      }
      closeProjectTabMenu();
    });
  }
}

function openProjectTabMenu(cabinetId, x, y) {
  const menu = document.getElementById('project-tab-menu');
  if (!menu) return;
  projectTabMenuCabinetId = cabinetId;
  const deleteBtn = menu.querySelector('[data-project-action="delete"]');
  if (deleteBtn) deleteBtn.disabled = currentProject.cabinets.length <= 1;
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  menu.classList.remove('hidden');
  menu.setAttribute('aria-hidden', 'false');
}

function closeProjectTabMenu() {
  const menu = document.getElementById('project-tab-menu');
  if (!menu) return;
  menu.classList.add('hidden');
  menu.setAttribute('aria-hidden', 'true');
  projectTabMenuCabinetId = null;
}

function initSheetModal() {
  const modal = document.getElementById('sheet-zoom-modal');
  const closeBtn = document.getElementById('sheet-zoom-close');
  if (!modal || !closeBtn) return;

  closeBtn.addEventListener('click', closeSheetModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeSheetModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeSheetModal();
    }
  });
}

function initResultsTabs() {
  const partsTab = document.getElementById('results-parts-tab');
  const nestingTab = document.getElementById('results-nesting-tab');
  const partsView = document.getElementById('panel-list-view');
  const nestingView = document.getElementById('nesting-view');
  if (!partsTab || !nestingTab || !partsView || !nestingView) return;

  const activate = (mode) => {
    const showParts = mode === 'parts';
    partsTab.classList.toggle('active', showParts);
    nestingTab.classList.toggle('active', !showParts);
    partsView.classList.toggle('hidden', !showParts);
    nestingView.classList.toggle('hidden', showParts);
  };

  partsTab.addEventListener('click', () => activate('parts'));
  nestingTab.addEventListener('click', () => activate('nesting'));
  activate('parts');
}

function updatePanelList(panels) {
  const list = document.getElementById('panel-list');
  const countLabel = document.getElementById('panel-count-label');
  if (!list) return;
  if (countLabel) {
    countLabel.textContent = `${panels.length} ${panels.length === 1 ? 'part' : 'parts'}`;
  }
  if (panels.length === 0) {
    list.innerHTML = '<div class="panel-info-empty">No panels computed</div>';
    return;
  }

  list.innerHTML = '';
  for (const panel of panels) {
    const dims = `${panel.cutWidth.toFixed(0)} x ${panel.cutHeight.toFixed(0)} x ${panel.cutThickness.toFixed(0)}`;
    const holes = (panel.holes || []).length;
    const notches = (panel.notches || []).length;
    const grooves = (panel.grooves || []).length;
    const eb = panel.edgeBanding || {};
    const edgeParts = [eb.top ? 'top' : '', eb.bottom ? 'bottom' : '', eb.left ? 'left' : '', eb.right ? 'right' : ''].filter(Boolean);
    const metaParts = [];
    if (holes > 0) metaParts.push(`${holes} holes`);
    if (notches > 0) metaParts.push(`${notches} notches`);
    if (grooves > 0) metaParts.push(`${grooves} grooves`);
    if (edgeParts.length > 0) metaParts.push(`Edge banding: ${edgeParts.join('/')}`);

    const row = document.createElement('div');
    row.className = 'panel-info-row';
    const main = document.createElement('div');
    main.className = 'panel-row-main';
    main.append(
      makePanelRowSpan('panel-name', panel.name),
      makePanelRowSpan('panel-dims', `${dims}mm`),
      makePanelRowSpan('panel-meta', metaParts.join(', '))
    );

    const actions = document.createElement('div');
    actions.className = 'panel-row-actions';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'export-row-btn';
    btn.innerHTML = '<i class="fa-solid fa-file-arrow-down" aria-hidden="true"></i><span>DXF</span>';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      downloadPanelDxf(panel);
    });
    actions.appendChild(btn);
    main.appendChild(actions);

    const preview = document.createElement('div');
    preview.className = 'panel-row-preview';
    preview.innerHTML = buildPanelPreviewSvg(panel);

    row.append(main, preview);
    list.appendChild(row);
  }
}

function updateNestingView(plan) {
  const root = document.getElementById('nesting-view');
  if (!root) return;

  if (!plan || plan.groups.length === 0) {
    root.innerHTML = '<div class="panel-info-empty">No nesting layout available</div>';
    return;
  }

  const summary = `
    ${buildNestingControls(currentConfig)}
    ${buildNestingWarning(plan)}
    <div class="nesting-summary">
      ${buildMetricCard('Sheets', String(plan.totalSheets))}
      ${buildMetricCard('Parts', String(currentProjectPanels.length))}
      ${buildMetricCard('Utilization', `${(plan.utilization * 100).toFixed(1)}%`)}
    </div>
  `;

  const groups = plan.groups.map((group) => {
    const sheets = group.sheets.map((sheet) => buildSheetCard(sheet, plan.options)).join('');
    return `
      <section class="nesting-group">
        <div class="nesting-group-head">
          <div>
            <h4>${escapeHtml(group.title)}</h4>
            <p>${group.sheets.length} ${group.sheets.length === 1 ? 'sheet' : 'sheets'} · ${group.partCount} parts · ${(group.utilization * 100).toFixed(1)}% utilization</p>
          </div>
        </div>
        <div class="nesting-sheet-list">${sheets}</div>
      </section>
    `;
  }).join('');

  root.innerHTML = summary + groups;
  bindNestingViewEvents(root, plan);
}

function buildNestingWarning(plan) {
  if (!plan?.unplaced?.length) return '';
  const message = plan.unplaced.map((item) => `${item.panel.name} (${item.reason})`).join(', ');
  return `<div class="warn">Some parts could not be nested: ${escapeHtml(message)}</div>`;
}

function buildNestingControls(config) {
  const materials = config?.materials || {};
  const nesting = config?.nesting || {};
  return `
    <section class="nesting-controls-card">
      <div class="nesting-controls-head">
        <h4>Global Stock Setup</h4>
        <p>Carcass also drives shelves, drawer sides, and kickboard. Rear and fronts are tracked separately.</p>
      </div>
      <div class="nesting-controls-grid">
        ${buildStockSelect('Carcass Stock', 'carcass', materials.caseMaterial, CARCASS_STOCKS)}
        ${buildStockSelect('Rear Stock', 'rear', materials.backMaterial, REAR_STOCKS)}
        ${buildStockSelect('Front Stock', 'front', materials.frontMaterial || materials.doorMaterial, FRONT_STOCKS)}
      </div>
      <div class="nesting-controls-head">
        <h4>Nesting Settings</h4>
        <p>Control the stock sheet size, machining gap, and whether parts may rotate during nesting.</p>
      </div>
      <div class="nesting-controls-grid nesting-settings-grid">
        ${buildNestingNumberField('Sheet length', 'sheetWidth', nesting.sheetWidth ?? 2440, 'mm', 100, 1)}
        ${buildNestingNumberField('Sheet width', 'sheetHeight', nesting.sheetHeight ?? 1220, 'mm', 100, 1)}
        ${buildNestingNumberField('Nesting gap', 'gap', nesting.gap ?? 3.2, 'mm', 0, 0.1)}
        ${buildNestingCheckboxField('Allow part rotation', 'allowRotation', nesting.allowRotation !== false)}
      </div>
    </section>
  `;
}

function buildStockSelect(label, stockType, currentValue, options) {
  const optionMarkup = options.map((option) => {
    const selected = option.label === currentValue ? ' selected' : '';
    return `<option value="${escapeHtml(option.label)}"${selected}>${escapeHtml(option.label)} · ${formatPanelNumber(option.thickness)}mm</option>`;
  }).join('');

  return `
    <label class="nesting-stock-field">
      <span>${escapeHtml(label)}</span>
      <select data-stock-type="${stockType}">${optionMarkup}</select>
    </label>
  `;
}

function buildNestingNumberField(label, nestingKey, value, unit, min, step) {
  return `
    <label class="nesting-stock-field">
      <span>${escapeHtml(label)}</span>
      <div class="nesting-inline-input">
        <input
          type="number"
          data-nesting-key="${escapeHtml(nestingKey)}"
          value="${escapeHtml(formatPanelNumber(value))}"
          min="${escapeHtml(String(min))}"
          step="${escapeHtml(String(step))}"
        />
        <em>${escapeHtml(unit)}</em>
      </div>
    </label>
  `;
}

function buildNestingCheckboxField(label, nestingKey, checked) {
  return `
    <label class="nesting-check-field">
      <input type="checkbox" data-nesting-key="${escapeHtml(nestingKey)}"${checked ? ' checked' : ''}>
      <span>${escapeHtml(label)}</span>
    </label>
  `;
}

function bindNestingViewEvents(root, plan) {
  for (const select of root.querySelectorAll('[data-stock-type]')) {
    select.addEventListener('change', () => {
      const stockType = select.getAttribute('data-stock-type');
      const materials = { ...(currentConfig?.materials || {}) };
      if (stockType === 'carcass') materials.caseMaterial = select.value;
      if (stockType === 'rear') materials.backMaterial = select.value;
      if (stockType === 'front') materials.frontMaterial = select.value;
      const nextConfig = {
        ...currentConfig,
        materials: applyGlobalMaterialSelections(materials),
      };
      form.importConfig(nextConfig);
    });
  }

  for (const button of root.querySelectorAll('[data-sheet-id]')) {
    button.addEventListener('click', () => {
      const sheetId = button.getAttribute('data-sheet-id');
      const sheet = plan.groups.flatMap(group => group.sheets).find(entry => entry.id === sheetId);
      if (sheet) openSheetModal(sheet, plan.options);
    });
  }

  for (const input of root.querySelectorAll('[data-nesting-key]')) {
    input.addEventListener('change', () => {
      const nestingKey = input.getAttribute('data-nesting-key');
      const nesting = { ...(currentConfig?.nesting || {}) };
      nesting[nestingKey] = input.type === 'checkbox'
        ? input.checked
        : (Number.parseFloat(input.value) || 0);
      form.importConfig({
        ...currentConfig,
        nesting,
      });
    });
  }
}

function buildMetricCard(label, value) {
  return `
    <div class="nesting-metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function buildSheetCard(sheet, options) {
  const utilization = (sheet.usedArea / (sheet.sheetWidth * sheet.sheetHeight)) * 100;
  return `
    <article class="nesting-sheet-card">
      <div class="nesting-sheet-head">
        <div>
          <h5>Sheet ${sheet.index + 1}</h5>
          <p>${escapeHtml(sheet.materialLabel || 'Sheet Stock')} · ${formatPanelNumber(sheet.thickness)}mm</p>
          <p>${formatPanelNumber(sheet.sheetWidth)} x ${formatPanelNumber(sheet.sheetHeight)} mm · ${sheet.placements.length} parts</p>
        </div>
        <span class="nesting-badge">${utilization.toFixed(1)}%</span>
      </div>
      <button class="nesting-sheet-canvas nesting-sheet-canvas-btn" type="button" data-sheet-id="${escapeHtml(sheet.id)}" aria-label="Open larger review for sheet ${sheet.index + 1}">
        ${buildSheetSvg(sheet, options)}
      </button>
    </article>
  `;
}

function buildSheetSvg(sheet, options) {
  const width = Math.max(1, sheet.sheetWidth);
  const height = Math.max(1, sheet.sheetHeight);
  const pad = Math.max(width, height) * 0.08;
  const labelSize = Math.max(12, Math.min(width, height) * 0.038);
  const gap = Math.max(0, options.gap ?? options.kerf);
  const viewBox = `${-pad} ${-pad} ${width + (pad * 2)} ${height + (pad * 2)}`;

  const placements = sheet.placements.map((placement, index) => {
    const panel = placement.panel;
    const cx = placement.x + placement.width / 2;
    const cy = placement.y + placement.height / 2;
    const textAngle = placement.height > placement.width ? -90 : 0;
    const gapInset = gap > 0 ? gap / 2 : 0;
    const gapX = Math.max(0, placement.x - gapInset);
    const gapY = Math.max(0, placement.y - gapInset);
    const gapWidth = Math.min(width, placement.x + placement.width + gapInset) - gapX;
    const gapHeight = Math.min(height, placement.y + placement.height + gapInset) - gapY;
    const dims = placement.rotated
      ? `${formatPanelNumber(panel.cutHeight)} x ${formatPanelNumber(panel.cutWidth)}`
      : `${formatPanelNumber(panel.cutWidth)} x ${formatPanelNumber(panel.cutHeight)}`;
    const notchCutouts = buildPlacementNotchSvg(placement, width);

    return `
      <g>
        ${gap > 0 ? `<rect x="${gapX}" y="${gapY}" width="${gapWidth}" height="${gapHeight}" fill="rgba(255, 196, 82, 0.14)" stroke="rgba(214, 144, 24, 0.35)" stroke-dasharray="${Math.max(5, width / 180)} ${Math.max(3, width / 260)}" stroke-width="${Math.max(1, width / 1100)}" />` : ''}
        <rect x="${placement.x}" y="${placement.y}" width="${placement.width}" height="${placement.height}" fill="#f5f7fb" stroke="#71819a" stroke-width="${Math.max(1.5, width / 500)}" />
        ${notchCutouts}
        <g transform="translate(${cx} ${cy}) scale(1 -1) rotate(${textAngle})">
          <text x="0" y="${labelSize * 0.2}" text-anchor="middle" font-size="${labelSize}" font-weight="700" fill="#243247">${escapeHtml(`${index + 1}. ${panel.name}`)}</text>
          <text x="0" y="${labelSize * 1.2}" text-anchor="middle" font-size="${labelSize * 0.75}" fill="#5d6d85">${escapeHtml(dims)}</text>
        </g>
      </g>
    `;
  }).join('');

  const offcuts = sheet.freeRects.map((rect) => `
    <rect x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" fill="rgba(111, 141, 189, 0.06)" stroke="rgba(111, 141, 189, 0.18)" stroke-dasharray="${Math.max(6, width / 120)} ${Math.max(4, width / 180)}" stroke-width="${Math.max(1, width / 900)}" />
  `).join('');

  return `
    <svg class="nesting-sheet-svg" viewBox="${viewBox}" role="img" aria-label="Nested layout for sheet ${sheet.index + 1}">
      <g transform="translate(0 ${height}) scale(1 -1)">
        <rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" stroke="#7b8aa3" stroke-width="${Math.max(2, width / 360)}" />
        ${offcuts}
        ${placements}
        ${gap > 0 ? `
          <g transform="translate(${width - pad * 0.15} ${height - pad * 0.25}) scale(1 -1)">
            <text x="0" y="0" text-anchor="end" font-size="${labelSize * 0.7}" fill="#5d6d85">Gap ${escapeHtml(formatPanelNumber(gap))}mm</text>
          </g>
        ` : ''}
      </g>
      <text x="${width / 2}" y="${-pad * 0.18}" text-anchor="middle" font-size="${labelSize * 0.72}" fill="#5d6d85">${formatPanelNumber(width)} mm</text>
      <text x="${-pad * 0.35}" y="${height / 2}" text-anchor="middle" font-size="${labelSize * 0.72}" fill="#5d6d85" transform="rotate(-90 ${-pad * 0.35} ${height / 2})">${formatPanelNumber(height)} mm</text>
    </svg>
  `;
}

function buildPlacementNotchSvg(placement, sheetWidth) {
  const notches = placement.panel?.notches || [];
  if (!notches.length) return '';

  const strokeWidth = Math.max(1.2, sheetWidth / 700);
  return notches.map((notch) => {
    const rect = transformPlacementFeatureRect(placement, notch);
    return `
      <rect
        x="${rect.x}"
        y="${rect.y}"
        width="${rect.width}"
        height="${rect.height}"
        fill="#ffffff"
        stroke="#71819a"
        stroke-width="${strokeWidth}"
      />
    `;
  }).join('');
}

function transformPlacementFeatureRect(placement, rect) {
  if (!placement.rotated) {
    return {
      x: placement.x + rect.x,
      y: placement.y + rect.y,
      width: rect.width,
      height: rect.height,
    };
  }

  const sourceHeight = Math.max(0, placement.panel?.cutHeight || 0);
  return {
    x: placement.x + (sourceHeight - rect.y - rect.height),
    y: placement.y + rect.x,
    width: rect.height,
    height: rect.width,
  };
}

function openSheetModal(sheet, options) {
  const modal = document.getElementById('sheet-zoom-modal');
  const title = document.getElementById('sheet-zoom-title');
  const meta = document.getElementById('sheet-zoom-meta');
  const body = document.getElementById('sheet-zoom-body');
  if (!modal || !title || !meta || !body) return;

  title.textContent = `Sheet ${sheet.index + 1}`;
  meta.textContent = `${sheet.materialLabel || 'Sheet Stock'} · ${formatPanelNumber(sheet.thickness)}mm · ${formatPanelNumber(sheet.sheetWidth)} x ${formatPanelNumber(sheet.sheetHeight)} mm · ${sheet.placements.length} parts`;
  body.innerHTML = buildSheetSvg(sheet, options);
  modal.classList.remove('hidden');
}

function closeSheetModal() {
  const modal = document.getElementById('sheet-zoom-modal');
  const body = document.getElementById('sheet-zoom-body');
  if (!modal || !body) return;
  modal.classList.add('hidden');
  body.innerHTML = '';
}

function makePanelRowSpan(className, text) {
  const span = document.createElement('span');
  span.className = className;
  span.textContent = text;
  return span;
}

function buildPanelPreviewSvg(panel) {
  const width = Math.max(1, panel.cutWidth || panel.sizeX || 1);
  const height = Math.max(1, panel.cutHeight || panel.sizeY || 1);
  const pad = Math.max(width, height) * 0.06;
  const viewBox = `${-pad} ${-pad} ${width + pad * 2} ${height + pad * 2}`;
  const strokeWidth = Math.max(1, Math.max(width, height) / 280);
  const holes = (panel.holes || []).map(hole => {
    const r = Math.max(1.5, (hole.diameter || 5) / 2);
    return `<circle cx="${hole.x}" cy="${hole.y}" r="${r}" fill="none" stroke="#2f7d78" stroke-width="${strokeWidth}" />`;
  }).join('');
  const notches = (panel.notches || []).map(notch => (
    `<rect x="${notch.x}" y="${notch.y}" width="${notch.width}" height="${notch.height}" fill="#f9fbff" stroke="#d18a68" stroke-width="${strokeWidth}" />`
  )).join('');
  const grooves = (panel.grooves || []).map(groove => (
    `<rect x="${groove.x}" y="${groove.y}" width="${groove.width}" height="${groove.height}" fill="none" stroke="#3a6df0" stroke-width="${strokeWidth}" stroke-dasharray="${strokeWidth * 3} ${strokeWidth * 2}" />`
  )).join('');
  const edgeLines = buildEdgeBandingLines(panel, width, height);

  return `<svg class="panel-preview-svg" viewBox="${viewBox}" role="img" aria-label="${escapeHtml(panel.name)} preview">
    <g transform="translate(0 ${height}) scale(1 -1)">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${Math.min(width, height) * 0.015}" fill="#edf3ff" stroke="#7f91b1" stroke-width="${strokeWidth}" />
      ${notches}
      ${grooves}
      ${holes}
      ${edgeLines}
    </g>
  </svg>`;
}

function buildEdgeBandingLines(panel, width, height) {
  const eb = panel.edgeBanding || {};
  const stroke = '#f07f2f';
  const sw = Math.max(2, Math.min(width, height) / 42);
  const lines = [];
  if (eb.top) lines.push(`<line x1="0" y1="${height}" x2="${width}" y2="${height}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" />`);
  if (eb.bottom) lines.push(`<line x1="0" y1="0" x2="${width}" y2="0" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" />`);
  if (eb.left) lines.push(`<line x1="0" y1="0" x2="0" y2="${height}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" />`);
  if (eb.right) lines.push(`<line x1="${width}" y1="0" x2="${width}" y2="${height}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" />`);
  return lines.join('');
}

function formatPanelNumber(value) {
  const n = Number(value) || 0;
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
