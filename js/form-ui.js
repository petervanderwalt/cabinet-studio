// form-ui.js - Build and manage the cabinet config form
import { defaultCabinet, inferFrontMode, validateCabinet } from './cabinet-math.js';
import { applyGlobalMaterialSelections } from './material-presets.js';

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

export class CabinetForm {
  constructor(container, onChange) {
    this.container = container;
    this.onChange = onChange;
    this.config = this._normalizeConfig(defaultCabinet());
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const form = document.createElement('form');
    form.className = 'cabinet-form';
    form.addEventListener('submit', e => e.preventDefault());
    form.addEventListener('input', () => this._emitChange());
    form.addEventListener('change', () => this._emitChange());

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

    if (opts.unit) {
      const wrap = document.createElement('div');
      wrap.className = 'input-wrap';
      wrap.appendChild(input);
      const unitSpan = document.createElement('span');
      unitSpan.className = 'unit';
      unitSpan.textContent = opts.unit;
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
      if (this.config.shelves?.count == null) this.config.shelves.count = 1;
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
    merged.materials = applyGlobalMaterialSelections(merged.materials);

    if (merged.front.mode === 'drawers' && merged.drawers.count > 0 && merged.drawers.heights.length !== merged.drawers.count) {
      merged.drawers.heights = this._buildAutoDrawerHeights(merged, merged.drawers.count);
    }

    return merged;
  }

  _cloneConfig(config = this.config) {
    return JSON.parse(JSON.stringify(config));
  }

  // ---- Field groups ----

  _typeFields() {
    const cat = this._createSelect([
      { value: 'base', label: 'Base' },
      { value: 'wall', label: 'Wall' },
      { value: 'tall', label: 'Tall' },
    ], { 'data-key': 'category' });
    cat.value = this.config.category;

    cat.addEventListener('change', () => {
      const hasTopChk = this.form?.querySelector('[data-key="hasTop"]');
      if (hasTopChk) {
        hasTopChk.checked = cat.value !== 'base';
      }
      if (this._frontMode() === 'drawers') {
        const drawerCountInput = this.form?.querySelector('[data-key="drawers.count"]');
        const drawerCount = Math.max(1, parseInt(drawerCountInput?.value ?? this.config.drawers.count, 10) || 1);
        this.config.category = cat.value;
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

    const drawerSideThk = this._createInput('number', {
      'data-key': 'drawers.sideThickness',
      value: this.config.drawers.sideThickness ?? 12,
      min: 3,
      max: 25,
      step: 1,
    });
    const drawerBottomThk = this._createInput('number', {
      'data-key': 'drawers.bottomThickness',
      value: this.config.drawers.bottomThickness ?? 6,
      min: 3,
      max: 25,
      step: 1,
    });
    const drawerSideClr = this._createInput('number', {
      'data-key': 'drawers.sideClearance',
      value: this.config.drawers.sideClearance ?? 10,
      min: 3,
      max: 30,
      step: 0.5,
    });

    return [
      this._makeBlurb('Set how many drawers you want and how the front is divided.'),
      this._makeField('Drawer count', drawerCount),
      this._makeField('Drawer front heights', drawerHeightsDiv),
      this._makeField('Side/back thickness', drawerSideThk, { unit: 'mm' }),
      this._makeField('Bottom thickness', drawerBottomThk, { unit: 'mm' }),
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
      const next = parseFloat(ffw.value) || 0;
      if (next <= 0) return;
      topRailW.value = String(next);
      bottomRailW.value = String(next);
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
    const eachH = count > 0 ? Math.floor((openingH - gaps) / count) : 0;
    const heights = [];
    let remaining = openingH - gaps;
    for (let i = 0; i < count; i++) {
      const h = i < count - 1 ? eachH : remaining;
      heights.push(h);
      remaining -= h;
    }
    return heights;
  }

  _autoDrawerHeights(count) {
    this.config.drawers.heights = this._buildAutoDrawerHeights(this.config, count);
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
        className: 'drawer-height-input',
      });
      input.addEventListener('input', () => {
        this.config.drawers.heights[idx] = parseFloat(input.value) || 0;
        this._updateDrawerSummary(container);
        this._emitChange();
      });

      const wrap = document.createElement('div');
      wrap.className = 'drawer-height-row';
      const label = document.createElement('span');
      label.textContent = `#${idx + 1}: `;
      wrap.appendChild(label);
      wrap.appendChild(input);

      const unit = document.createElement('span');
      unit.className = 'unit';
      unit.textContent = 'mm';
      wrap.appendChild(unit);
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
      msg.textContent = `Drawer fronts fit. Target total: ${targetFrontTotal}mm`;
      msg.style.color = '#487a57';
    } else if (diff > 0) {
      msg.textContent = `Add ${diff}mm more across the drawer fronts. Target total: ${targetFrontTotal}mm`;
      msg.style.color = '#b16a07';
    } else {
      msg.textContent = `Reduce drawer fronts by ${Math.abs(diff)}mm total. Target total: ${targetFrontTotal}mm`;
      msg.style.color = '#b16a07';
    }
    el.appendChild(msg);

    const autoBtn = document.createElement('button');
    autoBtn.type = 'button';
    autoBtn.className = 'drawer-auto-btn';
    autoBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i><span>Auto</span>';
    autoBtn.addEventListener('click', () => {
      this._autoDrawerHeights(count);
      this._renderDrawerHeights(container);
      this._emitChange();
    });
    el.appendChild(autoBtn);
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
    plateContent.append(
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
      } else if (input.type === 'number') {
        val = parseFloat(input.value);
        if (Number.isNaN(val)) val = 0;
      } else {
        val = input.value;
      }
      this._setNested(config, parts, val);
    }

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
          config.drawers.heights[idx] = parseFloat(input.value) || 0;
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

  _emitChange() {
    const config = this.getConfig();
    this.config = config;
    const warnings = validateCabinet(config);
    this._validationEl.innerHTML = warnings.map(w => `<div class="warn">Warning: ${w}</div>`).join('');
    if (this._drawerHeightsDiv) {
      this._updateDrawerSummary(this._drawerHeightsDiv);
    }
    if (this.onChange) this.onChange(config);
  }

  importConfig(data) {
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
