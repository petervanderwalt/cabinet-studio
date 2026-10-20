import { additionalDrawerHeight, distributeDrawerHeights } from './drawer-heights.js';
import { dimension, formatLength, getUnits, lengthInput, readLength, setUnits, unitLabel } from './units.js?v=20261020h';
// form-ui.js - Build and manage the cabinet config form
import { defaultCabinet, inferFrontMode, validateCabinet } from './cabinet-math.js?v=20261020h';
import { applyGlobalMaterialSelections, defaultStockMaterials } from './material-presets.js?v=20261020f';

const SECTION_ICONS = {
  'Cabinet Type': 'fa-cube',
  'Door Configuration': 'fa-door-open',
  'Drawer Configuration': 'fa-box-open',
  'Interior': 'fa-grip-lines-vertical',
  'Dimensions': 'fa-ruler-combined',
  'Construction': 'fa-hammer',
  'Toe Kick': 'fa-shoe-prints',
  'Overlay & Reveal': 'fa-border-top-left',
  'Hardware': 'fa-screwdriver-wrench',
};

const CATEGORY_DIMENSIONS = {
  base: { width: 800, height: 720, depth: 560 },
  wall: { width: 800, height: 720, depth: 320 },
};

function normalizeCategory(category) {
  return category === 'wall' ? 'wall' : 'base';
}

export class CabinetForm {
  constructor(container, onChange) {
    this.container = container;
    this.onChange = onChange;
    const initial = defaultCabinet();
    Object.assign(initial.materials, defaultStockMaterials(getUnits()));
    initial.units = getUnits();
    if (getUnits() === 'imperial') {
      initial.nesting.sheetWidth = 2438.4;
      initial.nesting.sheetHeight = 1219.2;
      initial.drawers.sideThickness = 12.7;
      initial.drawers.bottomThickness = 6.35;
    }
    this.config = this._normalizeConfig(initial);
    this._render();
  }

  _render() {
    clearTimeout(this._drawerAutoTimer);
    this._drawerHeightsDiv = null;
    this.container.innerHTML = '';
    const form = document.createElement('form');
    form.className = 'cabinet-form';
    form.addEventListener('submit', e => e.preventDefault());
    const handleInput = event => {
      if (!event.target.matches('.drawer-height-input')) this._emitChange();
    };
    form.addEventListener('input', handleInput);
    form.addEventListener('change', handleInput);

    this._buildSection(form, 'Cabinet Type', this._typeFields());
    this._buildSection(form, this._frontDetailsTitle(), this._frontDetailsFields());
    if (this._frontMode() === 'doors') {
      this._buildSection(form, 'Interior', this._interiorFields());
    }
    this._buildSection(form, 'Construction', this._constructionFields());
    this._buildSection(form, 'Toe Kick', this._toeKickFields());
    this._buildSection(form, 'Overlay & Reveal', this._overlayFields());
    this._buildSection(form, 'Hardware', this._hardwareFields());

    this._validationEl = document.createElement('div');
    this._validationEl.className = 'validation-msgs';
    form.appendChild(this._validationEl);

    this.form = form;
    this.container.appendChild(form);
  }

  _buildSection(form, title, fields) {
    if (!fields.length) return;
    const section = document.createElement('div');
    section.className = 'form-section';
    const titleRow = document.createElement('div');
    titleRow.className = 'form-section-title';

    const iconWrap = document.createElement('span');
    iconWrap.className = 'form-section-icon';
    iconWrap.setAttribute('aria-hidden', 'true');
    const icon = document.createElement('i');
    icon.className = `fa-solid ${SECTION_ICONS[title] || 'fa-square'}`;
    iconWrap.appendChild(icon);

    const h3 = document.createElement('h3');
    h3.textContent = title;
    titleRow.append(iconWrap, h3);
    section.appendChild(titleRow);

    for (const field of fields) {
      section.appendChild(field);
    }

    form.appendChild(section);
  }

  _makeField(labelText, input, opts = {}) {
    const div = document.createElement('div');
    div.className = 'field' + (opts.hidden ? ' hidden' : '');
    const label = document.createElement('label');
    label.textContent = labelText;
    div.appendChild(label);

    if (opts.unit === 'mm') lengthInput(input);
    if (opts.unit) {
      const wrap = document.createElement('div');
      wrap.className = 'input-wrap';
      wrap.appendChild(input);
      const unitSpan = document.createElement('span');
      unitSpan.className = 'unit';
      unitSpan.textContent = opts.unit === 'mm' ? unitLabel() : opts.unit;
      wrap.appendChild(unitSpan);
      div.appendChild(wrap);
    } else {
      div.appendChild(input);
    }

    return div;
  }

  _makeBlurb(text) {
    const el = document.createElement('p');
    el.className = 'section-blurb';
    el.textContent = text;
    return el;
  }

  _makeInfoCard(title, text) {
    const el = document.createElement('div');
    el.className = 'helper-card';
    el.innerHTML = `<strong>${title}</strong><span>${text}</span>`;
    return el;
  }

  _createInput(type, attrs = {}) {
    const el = document.createElement('input');
    el.type = type;
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'className') el.className = v;
      else el.setAttribute(k, v);
    }
    return el;
  }

  _createSelect(options, attrs = {}) {
    const el = document.createElement('select');
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'className') el.className = v;
      else el.setAttribute(k, v);
    }
    for (const opt of options) {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      if (opt.selected) option.selected = true;
      el.appendChild(option);
    }
    return el;
  }

  _frontMode() {
    return inferFrontMode(this.config);
  }

  _frontDetailsTitle() {
    return this._frontMode() === 'drawers' ? 'Drawer Configuration' : 'Door Configuration';
  }

  _setFrontMode(mode) {
    if (mode !== 'doors' && mode !== 'drawers') return;
    this.config.front = { ...(this.config.front || {}), mode };
    if (mode === 'doors') {
      if ((this.config.doors?.count ?? 0) <= 0) this.config.doors.count = 2;
      if ((this.config.shelves?.count ?? 0) < 0) this.config.shelves.count = 0;
      if (this.config.shelves?.count == null) this.config.shelves.count = 2;
    } else {
      if ((this.config.drawers?.count ?? 0) <= 0) this.config.drawers.count = 3;
      if ((this.config.drawers?.heights?.length ?? 0) !== this.config.drawers.count) {
        this._autoDrawerHeights(this.config.drawers.count);
      }
    }
    this._render();
    this._emitChange();
  }

  _normalizeConfig(data) {
    const defaults = defaultCabinet();
    const merged = this._deepMerge(defaults, data || {});
    merged.category = normalizeCategory(merged.category);
    merged.front = { ...(merged.front || {}), mode: inferFrontMode(merged) };
    merged.doors = { ...defaults.doors, ...(merged.doors || {}) };
    merged.drawers = { ...defaults.drawers, ...(merged.drawers || {}) };
    merged.shelves = { ...defaults.shelves, ...(merged.shelves || {}) };
    merged.hardware = { ...defaults.hardware, ...(merged.hardware || {}) };
    merged.materials = { ...defaults.materials, ...(merged.materials || {}) };
    merged.nesting = { ...defaults.nesting, ...(merged.nesting || {}) };
    merged.overlay = { ...defaults.overlay, ...(merged.overlay || {}) };
    merged.toeKick = { ...defaults.toeKick, ...(merged.toeKick || {}) };
    merged.drawers.heights = Array.isArray(merged.drawers.heights) ? [...merged.drawers.heights] : [];
    merged.drawers.manualHeights = Array.from({ length: merged.drawers.count }, (_, i) => merged.drawers.manualHeights?.[i] === true);
    merged.materials = applyGlobalMaterialSelections(merged.materials, merged.drawers);
    merged.drawers.sideThickness = merged.materials.drawerSideThickness;
    merged.drawers.bottomThickness = merged.materials.drawerBottomThickness;

    if (merged.front.mode === 'drawers' && merged.drawers.count > 0 && merged.drawers.heights.length !== merged.drawers.count) {
      merged.drawers.heights = this._buildAutoDrawerHeights(merged, merged.drawers.count);
    }

    return merged;
  }

  _cloneConfig(config = this.config) {
    return JSON.parse(JSON.stringify(config));
  }

  _applyCategoryDimensions(nextCategory) {
    const nextPreset = CATEGORY_DIMENSIONS[nextCategory];
    if (!nextPreset) return;

    const matchedPreset = Object.values(CATEGORY_DIMENSIONS).find((preset) => (
      this.config.width === preset.width
      && this.config.height === preset.height
      && this.config.depth === preset.depth
    ));

    if (!matchedPreset) return;
    if (matchedPreset.width === nextPreset.width
      && matchedPreset.height === nextPreset.height
      && matchedPreset.depth === nextPreset.depth) return;

    this.config.width = nextPreset.width;
    this.config.height = nextPreset.height;
    this.config.depth = nextPreset.depth;
  }

  _syncDimensionInputs() {
    if (!this.form) return;
    const widthInput = this.form.querySelector('[data-key="width"]');
    const heightInput = this.form.querySelector('[data-key="height"]');
    const depthInput = this.form.querySelector('[data-key="depth"]');
    if (widthInput) { widthInput.value = String(this.config.width); lengthInput(widthInput); }
    if (heightInput) { heightInput.value = String(this.config.height); lengthInput(heightInput); }
    if (depthInput) { depthInput.value = String(this.config.depth); lengthInput(depthInput); }
  }

  // ---- Field groups ----

  _typeFields() {
    const cat = this._createSelect([
      { value: 'base', label: 'Base' },
      { value: 'wall', label: 'Wall' },
    ], { 'data-key': 'category' });
    cat.value = this.config.category;

    cat.addEventListener('change', () => {
      const hasTopChk = this.form?.querySelector('[data-key="hasTop"]');
      if (hasTopChk) {
        hasTopChk.checked = cat.value !== 'base';
      }
      this.config.category = cat.value;
      this._applyCategoryDimensions(cat.value);
      this._syncDimensionInputs();
      if (this._frontMode() === 'drawers') {
        const drawerCountInput = this.form?.querySelector('[data-key="drawers.count"]');
        const drawerCount = Math.max(1, parseInt(drawerCountInput?.value ?? this.config.drawers.count, 10) || 1);
        this.config.drawers.count = drawerCount;
        this._autoDrawerHeights(drawerCount);
        if (this._drawerHeightsDiv) {
          this._renderDrawerHeights(this._drawerHeightsDiv);
        }
      }
    });
    const wrap = document.createElement('div');
    wrap.className = 'mode-grid';
    const mode = this._frontMode();

    const doorsBtn = this._makeModeButton(
      'fa-door-closed',
      'Doors',
      mode === 'doors'
    );
    doorsBtn.addEventListener('click', () => this._setFrontMode('doors'));

    const drawersBtn = this._makeModeButton(
      'fa-box-open',
      'Drawers',
      mode === 'drawers'
    );
    drawersBtn.addEventListener('click', () => this._setFrontMode('drawers'));

    wrap.append(doorsBtn, drawersBtn);

    const w = this._createInput('number', { 'data-key': 'width', value: this.config.width, min: 50, step: 1 });
    const h = this._createInput('number', { 'data-key': 'height', value: this.config.height, min: 50, step: 1 });
    const d = this._createInput('number', { 'data-key': 'depth', value: this.config.depth, min: 50, step: 1 });

    return [
      this._makeField('Category', cat),
      this._makeField('Width', w, { unit: 'mm' }),
      this._makeField('Height', h, { unit: 'mm' }),
      this._makeField('Depth', d, { unit: 'mm' }),
      wrap,
    ];
  }

  _frontDetailsFields() {
    if (this._frontMode() === 'drawers') {
      return this._drawerDetailFields();
    }
    return this._doorDetailFields();
  }

  _doorDetailFields() {
    const doorCount = this._createSelect([
      { value: '1', label: '1 door' },
      { value: '2', label: '2 doors' },
    ], { 'data-key': 'doors.count' });
    doorCount.value = String(Math.max(1, this.config.doors.count || 2));

    const hingeSide = this._createSelect([
      { value: 'left', label: 'Left' },
      { value: 'right', label: 'Right' },
      { value: 'both', label: 'Both (one each)' },
    ], { 'data-key': 'doors.hingeSide' });
    hingeSide.value = this.config.doors.hingeSide;

    return [
      this._makeBlurb('Choose the door layout that suits this cabinet.'),
      this._makeField('Door layout', doorCount),
      this._makeField('Hinge side', hingeSide),
    ];
  }

  _drawerDetailFields() {
    const drawerCount = this._createInput('number', {
      'data-key': 'drawers.count',
      value: this.config.drawers.count,
      min: 1,
      max: 10,
      step: 1,
    });

    const drawerHeightsDiv = document.createElement('div');
    drawerHeightsDiv.className = 'drawer-heights';
    this._drawerHeightsDiv = drawerHeightsDiv;
    this._renderDrawerHeights(drawerHeightsDiv);

    drawerCount.addEventListener('input', () => {
      const val = Math.max(1, parseInt(drawerCount.value, 10) || 1);
      this.config.drawers.count = val;
      if (this.config.drawers.heights.length !== val) {
        this._autoDrawerHeights(val);
      }
      this._renderDrawerHeights(drawerHeightsDiv);
      this._emitChange();
    });

    const drawerSideClr = this._createInput('number', {
      'data-key': 'drawers.sideClearance',
      value: this.config.drawers.sideClearance ?? 10,
      min: 3,
      max: 30,
      step: 0.5,
    });

    return [
      this._makeField('Drawer count', drawerCount),
      this._makeField('Drawer front heights', drawerHeightsDiv),
      this._makeField('Drawer slide thickness', drawerSideClr, { unit: 'mm' }),
    ];
  }

  _interiorFields() {
    const count = this._createInput('number', {
      'data-key': 'shelves.count',
      value: this.config.shelves?.count ?? 1,
      min: 0,
      max: 20,
      step: 1,
    });
    return [
      this._makeBlurb('Choose how much shelf storage you want inside the cabinet.'),
      this._makeField('Number of shelves', count),
    ];
  }

  _constructionFields() {
    const cons = this._createSelect([
      { value: 'frameless', label: 'Frameless (32mm system)' },
      { value: 'face-frame', label: 'Face-frame' },
    ], { 'data-key': 'construction' });
    cons.value = this.config.construction;
    cons.addEventListener('change', () => {
      this.config.construction = cons.value;
      this._render();
      this._emitChange();
    });

    const hasTop = this._createInput('checkbox', { 'data-key': 'hasTop' });
    hasTop.checked = this.config.category !== 'base' || this.config.hasTop;

    const backMount = this._createSelect([
      { value: 'grooved-in', label: 'Grooved-in (thin back)' },
      { value: 'applied-rear', label: 'Applied rear (structural)' },
    ], { 'data-key': 'backMount' });
    backMount.value = this.config.backMount;
    const ffw = this._createInput('number', { 'data-key': 'materials.faceFrameWidth', value: this.config.materials.faceFrameWidth, min: 10, step: 1 });
    const topRailW = this._createInput('number', { 'data-key': 'materials.topRailWidth', value: this.config.materials.topRailWidth ?? 38, min: 10, step: 1 });
    const bottomRailW = this._createInput('number', { 'data-key': 'materials.bottomRailWidth', value: this.config.materials.bottomRailWidth ?? 38, min: 10, step: 1 });
    ffw.addEventListener('input', () => {
      const next = readLength(ffw);
      if (next <= 0) return;
      topRailW.value = ffw.value;
      bottomRailW.value = ffw.value;
    });

    const fields = [
      this._makeField('Construction', cons),
      this._makeField('Full top panel (instead of stretchers)', hasTop),
      this._makeField('Back mount', backMount),
    ];

    if (this.config.construction === 'face-frame') {
      fields.push(
        this._makeField('Face frame width (stile/rail)', ffw, { unit: 'mm' }),
        this._makeField('Top rail width', topRailW, { unit: 'mm' }),
        this._makeField('Bottom rail width', bottomRailW, { unit: 'mm' }),
      );
    }

    return fields;
  }

  _toeKickFields() {
    const tkHeight = this._createInput('number', { 'data-key': 'toeKick.height', value: this.config.toeKick?.height ?? 100, min: 0, step: 1 });
    const tkSetback = this._createInput('number', { 'data-key': 'toeKick.setback', value: this.config.toeKick?.setback ?? 75, min: 0, step: 1 });
    return [
      this._makeField('Toe kick height', tkHeight, { unit: 'mm' }),
      this._makeField('Toe kick setback', tkSetback, { unit: 'mm' }),
    ];
  }

  _openingHeight(config = this.config) {
    const tkH = (config.category === 'base' && config.toeKick) ? config.toeKick.height : 0;
    const topClr = 3;
    return config.height - tkH - topClr - topClr;
  }

  _buildAutoDrawerHeights(config, count) {
    const openingH = this._openingHeight(config);
    const reveal = config.reveal ?? 3;
    const gaps = count > 0 ? (count - 1) * reveal : 0;
    const result = distributeDrawerHeights(config.drawers.heights || [], config.drawers.manualHeights || [], count, openingH - gaps);
    return result.heights || Array.from({ length: count }, (_, i) => config.drawers.heights[i] ?? 100);
  }

  _autoDrawerHeights(count) {
    this.config.drawers.heights = this._buildAutoDrawerHeights(this.config, count);
  }

  _setDrawerCountdown(active) {
    this._drawerCountdownActive = active;
    const summaryTimer = this._drawerHeightsDiv?.querySelector?.('.drawer-summary-countdown');
    if (summaryTimer) {
      summaryTimer.hidden = !active;
      summaryTimer.classList.remove('is-counting');
      if (active) {
        void summaryTimer.offsetWidth;
        summaryTimer.classList.add('is-counting');
      }
      summaryTimer.parentElement.setAttribute('aria-busy', String(active));
    }
    const locks = this._drawerHeightsDiv?.querySelectorAll?.('.drawer-height-lock[data-drawer-index]') || [];
    for (const lock of locks) {
      lock.classList.remove('is-counting');
      const idx = Number(lock.dataset.drawerIndex);
      const locked = this.config.drawers.manualHeights?.[idx] === true;
      lock.title = locked ? 'Entered height — click to unlock and size automatically' : 'Automatic height — click to lock this value';
      lock.setAttribute('aria-label', `Drawer ${idx + 1}: ${locked ? 'unlock height' : 'lock height'}`);
      if (active && !this.config.drawers.manualHeights?.[Number(lock.dataset.drawerIndex)]) {
        // Restart the countdown on every keystroke.
        void lock.offsetWidth;
        lock.classList.add('is-counting');
        lock.title = 'Calculate automatic heights now';
        lock.setAttribute('aria-label', `Drawer ${idx + 1}: calculate now`);
      }
    }
  }

  _scheduleDrawerAuto() {
    clearTimeout(this._drawerAutoTimer);
    this._setDrawerCountdown(false);
    if (this._frontMode() !== 'drawers' || !this._drawerHeightsDiv) return;
    this._setDrawerCountdown(true);
    this._drawerAutoTimer = setTimeout(() => this._runDrawerAuto(), 2000);
  }

  _runDrawerAuto() {
    clearTimeout(this._drawerAutoTimer);
    this._drawerAutoTimer = null;
    if (this._frontMode() !== 'drawers' || !this._drawerHeightsDiv) return;
    this._setDrawerCountdown(false);
    const inputs = [...this.form.querySelectorAll('.drawer-height-input')];
    if (inputs.some(input => input.value.trim() && !Number.isFinite(readLength(input)))) return;
    this.config = this.getConfig();
    const { count, heights, manualHeights = [] } = this.config.drawers;
    const target = this._openingHeight() - Math.max(0, count - 1) * (this.config.reveal ?? 3);
    const result = distributeDrawerHeights(heights, manualHeights, count, target);
    this._drawerAutoError = result.error || '';
    if (manualHeights.every(Boolean) && Math.abs(heights.reduce((a, b) => a + b, 0) - target) < 0.001) this._drawerAutoError = '';
    if (result.heights) {
      this.config.drawers.heights = result.heights;
      for (const input of inputs) {
        const idx = Number(input.dataset.drawerIndex);
        if (!manualHeights[idx]) {
          input.value = String(result.heights[idx]);
          lengthInput(input);
          input.setCustomValidity('');
        }
      }
    }
    this._emitChange(false);

  }

  _renderDrawerHeights(container) {
    container.innerHTML = '';
    const count = this.config.drawers.count || 0;
    const heights = this.config.drawers.heights;
    const indices = [];
    for (let i = 0; i < count; i++) indices.push(i);
    indices.reverse();

    for (const idx of indices) {
      const input = this._createInput('number', {
        value: heights[idx] ?? 100,
        min: 30,
        step: 1,
        'data-drawer-index': idx,
        'aria-label': `Drawer ${idx + 1} front height`,
        className: 'drawer-height-input',
      });
      lengthInput(input);
      input.addEventListener('input', () => {
        this.config.drawers.manualHeights ||= [];
        this.config.drawers.manualHeights[idx] = input.value.trim() !== '';
        if (Number.isFinite(readLength(input))) this.config.drawers.heights[idx] = readLength(input);
        updateLock();
        this._scheduleDrawerAuto();
      });

      const wrap = document.createElement('div');
      wrap.className = 'drawer-height-row';
      const label = document.createElement('span');
      label.textContent = `#${idx + 1}: `;
      wrap.appendChild(label);
      wrap.appendChild(input);

      const unit = document.createElement('span');
      unit.className = 'unit';
      unit.textContent = unitLabel();
      wrap.appendChild(unit);
      const lock = document.createElement('button');
      lock.type = 'button';
      lock.className = 'drawer-height-lock';
      lock.dataset.drawerIndex = String(idx);
      const updateLock = () => {
        const locked = this.config.drawers.manualHeights?.[idx] === true;
        lock.innerHTML = `<i class="fa-solid ${locked ? 'fa-lock' : 'fa-wand-magic-sparkles'}" aria-hidden="true"></i>`;
        lock.classList.toggle('locked', locked);
        lock.title = locked ? 'Entered height — click to unlock and size automatically' : 'Automatic height — click to lock this value';
        lock.setAttribute('aria-label', `Drawer ${idx + 1}: ${locked ? 'unlock height' : 'lock height'}`);
        lock.setAttribute('aria-pressed', String(locked));
      };
      updateLock();
      lock.addEventListener('click', () => {
        if (lock.classList.contains('is-counting')) {
          this._runDrawerAuto();
          return;
        }
        this.config.drawers.manualHeights ||= [];
        this.config.drawers.manualHeights[idx] = !this.config.drawers.manualHeights[idx];
        updateLock();
        this._scheduleDrawerAuto();
      });
      wrap.appendChild(lock);
      container.appendChild(wrap);
    }

    if (count > 0) {
      const row = document.createElement('div');
      row.className = 'drawer-summary-row';
      container.appendChild(row);
      this._updateDrawerSummary(container);
    }
  }

  _updateDrawerSummary(container) {
    const el = container.querySelector('.drawer-summary-row');
    if (!el) return;

    const count = this.config.drawers.count || 0;
    if (count === 0) {
      el.style.display = 'none';
      return;
    }
    el.style.display = 'flex';

    const openingH = this._openingHeight();
    const sumHeights = this.config.drawers.heights.reduce((a, b) => a + b, 0);
    const reveal = this.config.reveal ?? 3;
    const gapTotal = count > 0 ? (count - 1) * reveal : 0;
    const targetFrontTotal = Math.max(0, openingH - gapTotal);
    const diff = targetFrontTotal - sumHeights;

    el.innerHTML = '';
    const msg = document.createElement('span');
    msg.className = 'drawer-summary';
    if (Math.abs(diff) < 1) {
      msg.textContent = `Drawer fronts fit. Target total: ${dimension(targetFrontTotal)}`;
      msg.style.color = '#487a57';
    } else if (diff > 0) {
      msg.textContent = `Add ${dimension(diff)} more across the drawer fronts. Target total: ${dimension(targetFrontTotal)}`;
      msg.style.color = '#b16a07';
    } else {
      msg.textContent = `Reduce drawer fronts by ${dimension(Math.abs(diff))} total. Target total: ${dimension(targetFrontTotal)}`;
      msg.style.color = '#b16a07';
    }
    const messageRow = document.createElement('div');
    messageRow.className = 'drawer-summary-message';
    messageRow.setAttribute('aria-busy', String(!!this._drawerCountdownActive));
    const summaryTimer = document.createElement('button');
    summaryTimer.type = 'button';
    summaryTimer.className = 'drawer-height-lock drawer-summary-countdown' + (this._drawerCountdownActive ? ' is-counting' : '');
    summaryTimer.hidden = !this._drawerCountdownActive;
    summaryTimer.title = 'Update drawer sizes and message now';
    summaryTimer.setAttribute('aria-label', 'Update drawer sizes and message now');
    summaryTimer.addEventListener('click', () => this._runDrawerAuto());
    messageRow.append(summaryTimer, msg);
    el.appendChild(messageRow);

    if (this._drawerAutoError) {
      msg.textContent = this._drawerAutoError.replace('30 mm', dimension(30));
      msg.style.color = '#b16a07';
    }
    const extraHeight = additionalDrawerHeight(this.config.drawers.heights, this.config.drawers.manualHeights || [], count, targetFrontTotal, reveal);
    if (extraHeight !== null) {
      msg.textContent = `${dimension(diff)} remaining. Add another drawer?`;
      const add = document.createElement('button');
      add.type = 'button';
      add.className = 'drawer-auto-btn';
      add.textContent = 'Add another drawer';
      add.addEventListener('click', () => {
        this.config = this.getConfig();
        const drawers = this.config.drawers;
        const target = this._openingHeight() - Math.max(0, drawers.count - 1) * this.config.reveal;
        const height = additionalDrawerHeight(drawers.heights, drawers.manualHeights || [], drawers.count, target, this.config.reveal);
        if (height === null) return;
        clearTimeout(this._drawerAutoTimer);
        drawers.heights.push(height);
        drawers.manualHeights.push(false);
        drawers.count++;
        this._drawerAutoError = '';
        this.form.querySelector('[data-key="drawers.count"]').value = String(drawers.count);
        this._renderDrawerHeights(container);
        this._emitChange(false);
      });
      el.appendChild(add);
    }

  }

  _overlayFields() {
    const overlayType = this._createSelect([
      { value: 'full-overlay', label: 'Full overlay' },
      { value: 'partial-overlay', label: 'Partial overlay' },
      { value: 'inset', label: 'Inset' },
    ], { 'data-key': 'overlay.type' });
    overlayType.value = this.config.overlay.type;

    const reveal = this._createInput('number', { 'data-key': 'reveal', value: this.config.reveal, min: 0, step: 0.5 });

    return [
      this._makeField('Overlay type', overlayType),
      this._makeField('Reveal / gap', reveal, { unit: 'mm' }),
    ];
  }

  _hardwareFields() {
    if (this._frontMode() === 'drawers') {
      return this._drawerHardwareFields();
    }
    return this._doorHardwareFields();
  }

  _doorHardwareFields() {
    const container = document.createElement('div');
    container.className = 'tab-container hardware-tabs';

    const tabBar = document.createElement('div');
    tabBar.className = 'tab-bar';
    const coreTab = this._makeTabButton('fa-bullseye', 'Hinge Cup', true);
    const plateTab = this._makeTabButton('fa-grip', 'Hinge Plate');
    const shelfTab = this._makeTabButton('fa-ellipsis-vertical', 'Shelf Pins');
    const handleTab = this._makeTabButton('fa-grip-lines', 'Handles');
    tabBar.append(coreTab, plateTab, shelfTab, handleTab);

    const coreContent = document.createElement('div');
    coreContent.className = 'tab-content';
    const plateContent = document.createElement('div');
    plateContent.className = 'tab-content hidden';
    const shelfContent = document.createElement('div');
    shelfContent.className = 'tab-content hidden';
    const handleContent = document.createElement('div');
    handleContent.className = 'tab-content hidden';

    const hbd = this._createInput('number', { 'data-key': 'hardware.hingeBoreDiameter', value: this.config.hardware.hingeBoreDiameter, min: 10, step: 1 });
    const hbi = this._createInput('number', { 'data-key': 'hardware.hingeBoreInset', value: this.config.hardware.hingeBoreInset, min: 5, step: 1 });
    const hpFront = this._createInput('number', { 'data-key': 'hardware.hingePlateFrontHoleOffset', value: this.config.hardware.hingePlateFrontHoleOffset ?? 20, min: 0, step: 1 });
    const hpRear = this._createInput('number', { 'data-key': 'hardware.hingePlateRearHoleOffset', value: this.config.hardware.hingePlateRearHoleOffset ?? 32, min: 0, step: 1 });
    const hpSpacing = this._createInput('number', { 'data-key': 'hardware.hingePlateHoleSpacing', value: this.config.hardware.hingePlateHoleSpacing ?? 32, min: 0, step: 1 });
    const sps = this._createInput('number', { 'data-key': 'hardware.shelfPinSpacing', value: this.config.hardware.shelfPinSpacing, min: 10, step: 1 });
    const spsb = this._createInput('number', { 'data-key': 'hardware.shelfPinSetback', value: this.config.hardware.shelfPinSetback, min: 10, step: 1 });
    const handleSpacing = this._createInput('number', { 'data-key': 'hardware.handleHoleSpacing', value: this.config.hardware.handleHoleSpacing ?? 96, min: 0, step: 1 });
    const handleEdge = this._createInput('number', { 'data-key': 'hardware.handleEdgeOffset', value: this.config.hardware.handleEdgeOffset ?? 40, min: 0, step: 1 });
    const doorHandleHeight = this._createInput('number', { 'data-key': 'hardware.doorHandleHeight', value: this.config.hardware.doorHandleHeight ?? 100, min: 0, step: 1 });

    coreContent.append(
      this._makeField('Hinge bore diameter', hbd, { unit: 'mm' }),
      this._makeField('Hinge bore inset (from door edge)', hbi, { unit: 'mm' }),
    );
    const secondRow = this._createInput('checkbox', { 'data-key': 'hardware.hingePlateSecondRow' });
    secondRow.checked = this.config.hardware.hingePlateSecondRow !== false;
    hpRear.disabled = !secondRow.checked;
    const patterns = {
      'south-africa': { front: 20, rear: 32, spacing: 32, second: true },
      blum: { front: 37, rear: 32, spacing: 32, second: false },
    };
    const hw = this.config.hardware;
    const matchingPattern = Object.entries(patterns).find(([, p]) => (
      (hw.hingePlateFrontHoleOffset ?? 20) === p.front
      && (hw.hingePlateHoleSpacing ?? 32) === p.spacing
      && (hw.hingePlateSecondRow !== false) === p.second
      && (!p.second || (hw.hingePlateRearHoleOffset ?? 32) === p.rear)
    ));
    const pattern = this._createSelect([
      { value: 'south-africa', label: 'South Africa (2 × 2)' },
      { value: 'blum', label: 'Blum frameless (2 × 1)' },
      { value: 'custom', label: 'Other / Custom' },
    ], { 'data-key': 'hardware.hingePlatePattern', 'aria-label': 'Hinge plate pattern' });
    pattern.value = hw.hingePlatePattern === 'custom' ? 'custom' : (matchingPattern?.[0] || 'custom');
    pattern.addEventListener('change', () => {
      const preset = patterns[pattern.value];
      if (!preset) return;
      for (const [input, mm] of [[hpFront, preset.front], [hpRear, preset.rear], [hpSpacing, preset.spacing]]) {
        input.value = String(mm);
        lengthInput(input);
      }
      secondRow.checked = preset.second;
      hpRear.disabled = !preset.second;
    });
    const markCustom = () => { pattern.value = 'custom'; };
    for (const input of [hpFront, hpRear, hpSpacing]) input.addEventListener('input', markCustom);
    secondRow.addEventListener('change', () => {
      hpRear.disabled = !secondRow.checked;
      markCustom();
    });
    plateContent.append(
      this._makeBlurb('Two holes per row. Blum frameless 37/32 uses one row, 37 mm from the front, with 32 mm vertical spacing. Verify your plate; face-frame and other plates differ.'),
      this._makeField('Hinge plate pattern', pattern),
      this._makeField('Include second row (four holes per plate)', secondRow),
      this._makeField('Hinge plate front hole offset', hpFront, { unit: 'mm' }),
      this._makeField('Hinge plate rear hole offset', hpRear, { unit: 'mm' }),
      this._makeField('Hinge plate hole spacing', hpSpacing, { unit: 'mm' }),
    );
    shelfContent.append(
      this._makeInfoCard('Shelf pins', 'Adjust these only if you want to change the shelf pin pattern.'),
      this._makeField('Shelf pin spacing', sps, { unit: 'mm' }),
      this._makeField('Shelf pin setback', spsb, { unit: 'mm' }),
    );
    handleContent.append(
      this._makeField('Handle hole spacing', handleSpacing, { unit: 'mm' }),
      this._makeField('Door handle edge offset', handleEdge, { unit: 'mm' }),
      this._makeField('Door handle centre height from bottom', doorHandleHeight, { unit: 'mm' }),
    );

    const switchTab = (active) => {
      coreTab.classList.toggle('active', active === 'core');
      plateTab.classList.toggle('active', active === 'plate');
      shelfTab.classList.toggle('active', active === 'shelf');
      handleTab.classList.toggle('active', active === 'handle');
      coreContent.classList.toggle('hidden', active !== 'core');
      plateContent.classList.toggle('hidden', active !== 'plate');
      shelfContent.classList.toggle('hidden', active !== 'shelf');
      handleContent.classList.toggle('hidden', active !== 'handle');
    };

    coreTab.addEventListener('click', () => switchTab('core'));
    plateTab.addEventListener('click', () => switchTab('plate'));
    shelfTab.addEventListener('click', () => switchTab('shelf'));
    handleTab.addEventListener('click', () => switchTab('handle'));

    container.append(tabBar, coreContent, plateContent, shelfContent, handleContent);
    return [
      this._makeBlurb('Set hinge, shelf pin, and handle positions for this cabinet.'),
      container,
    ];
  }

  _drawerHardwareFields() {
    const container = document.createElement('div');
    container.className = 'tab-container hardware-tabs';

    const tabBar = document.createElement('div');
    tabBar.className = 'tab-bar';
    const handleTab = this._makeTabButton('fa-grip-lines', 'Handles', true);
    const runnerTab = this._makeTabButton('fa-arrows-left-right', 'Runners');
    tabBar.append(handleTab, runnerTab);

    const handleContent = document.createElement('div');
    handleContent.className = 'tab-content';
    const runnerContent = document.createElement('div');
    runnerContent.className = 'tab-content hidden';

    const handleSpacing = this._createInput('number', { 'data-key': 'hardware.handleHoleSpacing', value: this.config.hardware.handleHoleSpacing ?? 96, min: 0, step: 1 });
    const drawerHandleTop = this._createInput('number', { 'data-key': 'hardware.drawerHandleTopOffset', value: this.config.hardware.drawerHandleTopOffset ?? 50, min: 0, step: 1 });
    const sideClearance = this._createInput('number', { 'data-key': 'drawers.sideClearance', value: this.config.drawers.sideClearance ?? 10, min: 0, step: 1 });

    handleContent.append(
      this._makeField('Handle hole spacing', handleSpacing, { unit: 'mm' }),
      this._makeField('Drawer handle centre offset down from top', drawerHandleTop, { unit: 'mm' }),
    );
    runnerContent.append(
      this._makeField('Runner side clearance', sideClearance, { unit: 'mm' }),
      this._makeInfoCard('Runner reference', 'Drawer runner hole layout follows the side clearance set here.'),
    );

    const switchTab = (active) => {
      handleTab.classList.toggle('active', active === 'handle');
      runnerTab.classList.toggle('active', active === 'runner');
      handleContent.classList.toggle('hidden', active !== 'handle');
      runnerContent.classList.toggle('hidden', active !== 'runner');
    };

    handleTab.addEventListener('click', () => switchTab('handle'));
    runnerTab.addEventListener('click', () => switchTab('runner'));

    container.append(tabBar, handleContent, runnerContent);

    return [container];
  }

  _makeTabButton(iconClass, label, active = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tab' + (active ? ' active' : '');
    button.innerHTML = `<i class="fa-solid ${iconClass}" aria-hidden="true"></i><span>${label}</span>`;
    return button;
  }

  _makeModeButton(iconClass, title, active = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mode-card' + (active ? ' active' : '');
    button.innerHTML = `
      <span class="mode-card-head">
        <i class="fa-solid ${iconClass}" aria-hidden="true"></i>
        <span>${title}</span>
      </span>
    `;
    return button;
  }

  getConfig() {
    if (!this.form) {
      return this._normalizeConfig(this._cloneConfig());
    }
    const form = this.form;
    const config = this._cloneConfig();

    const inputs = form.querySelectorAll('[data-key]');
    for (const input of inputs) {
      const key = input.getAttribute('data-key');
      const parts = key.split('.');
      let val;
      if (input.type === 'checkbox') {
        val = input.checked;
      } else if (input.dataset.length) {
        val = readLength(input);
        if (!Number.isFinite(val)) continue;
      } else if (input.type === 'number') {
        val = parseFloat(input.value);
        if (Number.isNaN(val)) val = 0;
      } else {
        val = input.value;
      }
      this._setNested(config, parts, val);
    }

    config.units = getUnits();
    config.front = { ...(config.front || {}), mode: this._frontMode() };
    config.doors.count = parseInt(form.querySelector('[data-key="doors.count"]')?.value ?? config.doors.count, 10) || config.doors.count || 0;
    config.drawers.count = parseInt(form.querySelector('[data-key="drawers.count"]')?.value ?? config.drawers.count, 10) || config.drawers.count || 0;
    config.shelves.count = parseInt(form.querySelector('[data-key="shelves.count"]')?.value ?? config.shelves.count, 10) || 0;

    const heightInputs = form.querySelectorAll('.drawer-height-input');
    if (heightInputs.length > 0) {
      config.drawers.heights = Array.from({ length: config.drawers.count }, () => 0);
      for (const input of heightInputs) {
        const idx = parseInt(input.getAttribute('data-drawer-index'), 10);
        if (!Number.isNaN(idx) && idx >= 0 && idx < config.drawers.count) {
          config.drawers.heights[idx] = Number.isFinite(readLength(input)) ? readLength(input) : this.config.drawers.heights[idx];
        }
      }
    }

    return this._normalizeConfig(config);
  }

  _setNested(obj, parts, val) {
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!cur[parts[i]]) cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = val;
  }

  _emitChange(autoSize = true) {
    const config = this.getConfig();
    this.config = config;
    const warnings = validateCabinet(config);
    this._validationEl.innerHTML = warnings.map(w => w.replace(/([0-9]+(?:\.[0-9]+)?)mm/g, (_, n) => dimension(Number(n)))).map(w => `<div class="warn">Warning: ${w}</div>`).join('');
    if (this._drawerHeightsDiv) {
      this._updateDrawerSummary(this._drawerHeightsDiv);
    }
    if (this.onChange) this.onChange(config);
    if (autoSize) this._scheduleDrawerAuto();
  }

  setDisplayUnits(value) {
    this.config = this.getConfig();
    setUnits(value);
    this.config.units = getUnits();
    this._render();
    this._emitChange();
  }

  importConfig(data) {
    if (data.units) setUnits(data.units);
    this.config = this._normalizeConfig(data);
    this._render();
    this._emitChange();
  }

  _deepMerge(target, source) {
    const result = Array.isArray(target) ? [...target] : { ...target };
    for (const key of Object.keys(source || {})) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this._deepMerge(target[key] || {}, source[key]);
      } else if (Array.isArray(source[key])) {
        result[key] = [...source[key]];
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }
}
