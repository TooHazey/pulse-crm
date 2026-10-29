// PULSE — static CRM demo for an electrical / MRO / automation distributor.
// Sample book is inspired by Marshall E. Campbell Company (mecampbell.com).
// This is a prototype, not an official MEC product. Data stored in localStorage.

const STAGES = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
const THEME_KEY = 'pulse-theme';

const STAGE_META = {
  'Lead': {
    column: 'bg-slate-100/90 border-slate-200 dark:bg-slate-800/80 dark:border-slate-700',
    dot: 'bg-slate-400',
    label: 'text-slate-700 dark:text-slate-200',
  },
  'Qualified': {
    column: 'bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:border-sky-900',
    dot: 'bg-sky-500',
    label: 'text-sky-950 dark:text-sky-100',
  },
  'Proposal': {
    column: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-900',
    dot: 'bg-indigo-500',
    label: 'text-indigo-950 dark:text-indigo-100',
  },
  'Negotiation': {
    column: 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900',
    dot: 'bg-amber-500',
    label: 'text-amber-950 dark:text-amber-100',
  },
  'Closed Won': {
    column: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900',
    dot: 'bg-emerald-500',
    label: 'text-emerald-950 dark:text-emerald-100',
  },
  'Closed Lost': {
    column: 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900',
    dot: 'bg-rose-500',
    label: 'text-rose-950 dark:text-rose-100',
  },
};

const AVATAR_TONES = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200',
  'bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-200',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200',
  'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-200',
  'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200',
  'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/60 dark:text-fuchsia-200',
  'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200',
];

const ORDER_STATUS_CLASS = {
  'Draft': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  'Confirmed': 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200',
  'Shipped': 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
  'Delivered': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
  'Cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200',
};

const CARD = 'bg-white rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800';
const FIELD = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500';
const ROW = 'border-t border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60';

// Bump when the sample book should replace an older `pulse-crm` seed once.
// Stored separately so the `pulse-crm` record shape stays the same.
// Theme stays on `pulse-theme` and is not part of this reseed.
const SEED_VERSION = '2';
const SEED_VERSION_KEY = 'pulse-crm-seed-version';

let state = {
  contacts: [],
  deals: [],
  tasks: [],
  activities: [],
  products: [],
  orders: [],
  currentView: 'dashboard'
};

let modalGen = 0;
let modalTimer = 0;

// Load / Save
function load() {
  const saved = localStorage.getItem('pulse-crm');
  const seedVersion = localStorage.getItem(SEED_VERSION_KEY);
  if (saved && seedVersion === SEED_VERSION) {
    state = { ...state, ...JSON.parse(saved) };
    return;
  }
  // First visit, or an older seed (no version flag / previous version): load the
  // current sample book once. User edits after this stay until the version bumps.
  if (saved) {
    try {
      const prev = JSON.parse(saved);
      if (prev.currentView) state.currentView = prev.currentView;
    } catch (err) {
      /* ignore a corrupt blob and reseed cleanly */
    }
  }
  seedData();
  localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
}
function save() {
  localStorage.setItem('pulse-crm', JSON.stringify(state));
}

function seedData() {
  // Fictional Midwest accounts a counter / inside-sales desk would actually work.
  // Shaped like the original seed: id, name, email, company, phone, title.
  state.contacts = [
    { id: 1, name: 'Dana Kowalski', email: 'dana.kowalski@lakeshore-electric.com', company: 'Lakeshore Electrical', phone: '+1 810-555-0142', title: 'Purchasing Manager' },
    { id: 2, name: 'Marcus Hale', email: 'marcus.hale@thumbpanel.com', company: 'Thumb Panel & Controls', phone: '+1 989-555-0174', title: 'Project Manager' },
    { id: 3, name: 'Priya Shah', email: 'priya.shah@saginawfoundry.com', company: 'Saginaw Foundry & Machine', phone: '+1 989-555-0190', title: 'Plant Engineer' },
    { id: 4, name: 'Tom Brennan', email: 'tom.brennan@sctdpw.org', company: 'St. Clair Township DPW', phone: '+1 810-555-0118', title: 'Facilities Buyer' },
    { id: 5, name: 'Elena Vasquez', email: 'elena.vasquez@bwautostamp.com', company: 'Blue Water Auto Stamping', phone: '+1 734-555-0166', title: 'MRO Buyer' },
    { id: 6, name: 'Chris Nguyen', email: 'chris.nguyen@wolverineline.com', company: 'Wolverine Line Construction', phone: '+1 810-555-0133', title: 'Estimator' },
    { id: 7, name: 'Angela Brooks', email: 'angela.brooks@huronshorewater.org', company: 'Huron Shore Water Authority', phone: '+1 989-555-0127', title: 'Maintenance Planner' },
    { id: 8, name: 'James Okonkwo', email: 'james.okonkwo@riverviewoem.com', company: 'Riverview OEM Systems', phone: '+1 248-555-0194', title: 'Controls Engineer' },
  ];
  state.deals = [
    { id: 1, title: 'St. Clair Hospital job package', contactId: 1, value: 186400, stage: 'Proposal', closeDate: '2026-11-21' },
    { id: 2, title: '24-cell starter panel build', contactId: 2, value: 74500, stage: 'Negotiation', closeDate: '2026-11-12' },
    { id: 3, title: 'Municipal garage lighting retrofit', contactId: 4, value: 42800, stage: 'Qualified', closeDate: '2026-11-30' },
    { id: 4, title: 'Annual MRO stock agreement', contactId: 5, value: 96000, stage: 'Lead', closeDate: '2026-12-15' },
    { id: 5, title: 'Conveyor VFD & controls upgrade', contactId: 3, value: 128400, stage: 'Proposal', closeDate: '2026-11-18' },
    { id: 6, title: 'Subdivision PVC & wire release', contactId: 6, value: 31200, stage: 'Closed Won', closeDate: '2026-10-22' },
    { id: 7, title: 'Machine-line PLC & sensor kit', contactId: 8, value: 58750, stage: 'Qualified', closeDate: '2026-12-04' },
    { id: 8, title: 'Pump station drive startup', contactId: 7, value: 22600, stage: 'Negotiation', closeDate: '2026-11-08' },
    { id: 9, title: 'County fairgrounds lighting bid', contactId: 4, value: 18400, stage: 'Closed Lost', closeDate: '2026-10-10' },
  ];
  state.tasks = [
    { id: 1, title: 'Send revised hospital package quote to Dana Kowalski', dealId: 1, due: '2026-10-30', done: false },
    { id: 2, title: 'Confirm job release dates for Thumb Panel starter cells', dealId: 2, due: '2026-10-31', done: false },
    { id: 3, title: 'Check 5 HP 480V drive backorder ETA for Saginaw Foundry', dealId: 5, due: '2026-10-29', done: false },
    { id: 4, title: 'Schedule Port Huron garage lighting delivery window', dealId: 3, due: '2026-11-03', done: false },
    { id: 5, title: 'Book drive startup at Huron Shore pump station', dealId: 8, due: '2026-11-06', done: true },
    { id: 6, title: 'Follow up on Blue Water annual stock-agreement pricing', dealId: 4, due: '2026-11-04', done: false },
  ];
  state.activities = [
    { id: 1, text: 'Quoted 3/4" EMT and 12 AWG THHN for the Lakeshore hospital package', time: '2h ago', contactId: 1 },
    { id: 2, text: 'Marcus Hale moved the panel-build release to the week of Nov 10', time: 'Yesterday', contactId: 2 },
    { id: 3, text: 'Sent high-bay submittals to Tom Brennan for the municipal garage', time: 'Yesterday', contactId: 4 },
    { id: 4, text: 'Priya Shah asked for startup support on the 480V conveyor drives', time: '3d ago', contactId: 3 },
    { id: 5, text: 'Wolverine Line PVC and building-wire release delivered to the job trailer', time: '4d ago', contactId: 6 },
  ];
  // Unit prices are counter-sell dollars. A few SKUs sit at or under reorder so the dashboard alerts.
  state.products = [
    { id: 1, sku: 'EMT-034-10', name: '3/4" EMT Conduit, 10 ft', price: 9, stock: 840, reorderLevel: 200, category: 'Conduit & Raceway' },
    { id: 2, sku: 'GRC-200-10', name: '2" Galvanized Rigid Conduit, 10 ft', price: 68, stock: 120, reorderLevel: 40, category: 'Conduit & Raceway' },
    { id: 3, sku: 'PVC-100-10', name: '1" PVC Schedule 40 Conduit, 10 ft', price: 11, stock: 460, reorderLevel: 100, category: 'Conduit & Raceway' },
    { id: 4, sku: 'LFMC-034-100', name: '3/4" Liquidtight Flexible Metal, 100 ft', price: 214, stock: 28, reorderLevel: 12, category: 'Conduit & Raceway' },
    { id: 5, sku: 'EMT-CPL-034', name: '3/4" EMT Set-Screw Coupling', price: 2, stock: 2400, reorderLevel: 500, category: 'Conduit & Raceway' },
    { id: 6, sku: 'THHN-12-BLK-500', name: '12 AWG THHN Copper, Black, 500 ft', price: 118, stock: 64, reorderLevel: 20, category: 'Wire & Cable' },
    { id: 7, sku: 'MC-122-250', name: '12/2 MC Armored Cable, 250 ft', price: 246, stock: 36, reorderLevel: 10, category: 'Wire & Cable' },
    { id: 8, sku: 'SOOW-124-250', name: '12/4 SOOW Portable Cord, 250 ft', price: 412, stock: 5, reorderLevel: 6, category: 'Wire & Cable' },
    { id: 9, sku: 'IEC-C32-24', name: 'IEC Contactor, 32A, 24V Coil', price: 96, stock: 42, reorderLevel: 15, category: 'Control & Automation' },
    { id: 10, sku: 'VFD-5HP-480', name: 'AC Drive, 5 HP, 480V', price: 1185, stock: 3, reorderLevel: 4, category: 'Control & Automation' },
    { id: 11, sku: 'PLC-CPU-24', name: 'Compact PLC CPU, 24 I/O', price: 640, stock: 11, reorderLevel: 4, category: 'Control & Automation' },
    { id: 12, sku: 'PSU-24-10', name: 'DIN Rail Power Supply, 24VDC 10A', price: 168, stock: 7, reorderLevel: 8, category: 'Control & Automation' },
    { id: 13, sku: 'PE-SEN-M18', name: 'M18 Photoelectric Sensor, PNP', price: 74, stock: 55, reorderLevel: 20, category: 'Control & Automation' },
    { id: 14, sku: 'HB-LED-150', name: 'LED High Bay, 150W, 5000K', price: 189, stock: 48, reorderLevel: 16, category: 'Lighting' },
    { id: 15, sku: 'EM-COMBO-LED', name: 'LED Emergency Combo Unit', price: 62, stock: 9, reorderLevel: 12, category: 'Lighting' },
    { id: 16, sku: 'VT-LED-4', name: '4 ft LED Vapor Tight Fixture', price: 98, stock: 30, reorderLevel: 10, category: 'Lighting' },
  ];
  state.orders = [
    { id: 1, orderNumber: 'ORD-4418', contactId: 1, date: '2026-10-18', status: 'Confirmed', items: [{ productId: 1, qty: 120, price: 9 }, { productId: 6, qty: 8, price: 118 }, { productId: 5, qty: 200, price: 2 }], total: 2424 },
    { id: 2, orderNumber: 'ORD-4422', contactId: 2, date: '2026-10-22', status: 'Shipped', items: [{ productId: 9, qty: 24, price: 96 }, { productId: 12, qty: 12, price: 168 }], total: 4320 },
    { id: 3, orderNumber: 'ORD-4429', contactId: 4, date: '2026-10-09', status: 'Delivered', items: [{ productId: 14, qty: 36, price: 189 }, { productId: 15, qty: 8, price: 62 }], total: 7300 },
    { id: 4, orderNumber: 'ORD-4436', contactId: 5, date: '2026-10-27', status: 'Confirmed', items: [{ productId: 7, qty: 6, price: 246 }, { productId: 8, qty: 2, price: 412 }], total: 2300 },
    { id: 5, orderNumber: 'ORD-4440', contactId: 3, date: '2026-10-28', status: 'Draft', items: [{ productId: 10, qty: 4, price: 1185 }, { productId: 11, qty: 2, price: 640 }, { productId: 13, qty: 10, price: 74 }], total: 6760 },
    { id: 6, orderNumber: 'ORD-4444', contactId: 6, date: '2026-10-21', status: 'Shipped', items: [{ productId: 3, qty: 200, price: 11 }, { productId: 6, qty: 10, price: 118 }], total: 3380 },
    { id: 7, orderNumber: 'ORD-4451', contactId: 7, date: '2026-10-24', status: 'Confirmed', items: [{ productId: 10, qty: 1, price: 1185 }, { productId: 12, qty: 2, price: 168 }, { productId: 4, qty: 2, price: 214 }], total: 1949 },
  ];
  save();
}

// Utils
function uid() { return Date.now() + Math.random().toString(36).slice(2, 7); }
function formatMoney(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n); }
function contactById(id) { return state.contacts.find(c => c.id == id); }
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}
function motionMs() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 200;
}
function isDesktop() {
  return window.matchMedia('(min-width: 1024px)').matches;
}

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function avatarTone(name) {
  const s = String(name || '');
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash + s.charCodeAt(i) * (i + 1)) % AVATAR_TONES.length;
  return AVATAR_TONES[hash];
}
function avatarChip(name, size) {
  const dim = size === 'xs' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs';
  return `<span class="inline-flex ${dim} items-center justify-center rounded-full font-semibold shrink-0 ${avatarTone(name)}" aria-hidden="true">${escapeHtml(initials(name))}</span>`;
}

function pageHeader(title, subtitle, buttonLabel, buttonAction) {
  const button = buttonLabel
    ? `<button type="button" onclick="${buttonAction}" class="shrink-0 inline-flex items-center gap-1.5 text-sm bg-primary hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg"><i class="fa-solid fa-plus text-xs"></i>${buttonLabel}</button>`
    : '';
  return `
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h2 class="text-xl sm:text-2xl font-bold tracking-tight">${title}</h2>
        <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">${subtitle}</p>
      </div>
      ${button}
    </div>`;
}

function emptyState(icon, title, message, actionLabel, actionFn) {
  const action = actionLabel
    ? `<button type="button" onclick="${actionFn}" class="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"><i class="fa-solid fa-plus text-xs"></i>${actionLabel}</button>`
    : '';
  return `
    <div class="px-6 py-14 text-center">
      <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <i class="fa-solid ${icon} text-lg"></i>
      </div>
      <p class="font-medium text-slate-800 dark:text-slate-100">${title}</p>
      <p class="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">${message}</p>
      ${action}
    </div>`;
}

function emptyNote(icon, message) {
  return `
    <div class="flex flex-col items-center text-center px-4 py-8 text-slate-400 dark:text-slate-500">
      <i class="fa-solid ${icon} text-lg mb-2"></i>
      <p class="text-sm">${message}</p>
    </div>`;
}

function formActions(submitLabel) {
  return `
    <div class="flex justify-end gap-2 pt-2">
      <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
      <button type="submit" class="px-4 py-2 text-sm bg-primary hover:bg-blue-700 text-white rounded-lg">${submitLabel}</button>
    </div>`;
}

function dataTable(headers, rowsHtml, minWidth) {
  return `
    <div class="${CARD} overflow-x-auto">
      <table class="w-full text-sm ${minWidth}">
        <thead class="bg-slate-50 text-slate-500 text-left dark:bg-slate-800/80 dark:text-slate-400">
          <tr>${headers.map(h => `<th class="px-4 py-3 font-medium whitespace-nowrap">${h}</th>`).join('')}</tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`;
}

function responsiveList(mobileHtml, tableHtml) {
  return `
    <div class="md:hidden ${CARD} divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">${mobileHtml}</div>
    <div class="hidden md:block">${tableHtml}</div>`;
}

// Shell: drawer + theme
function setSidebar(open) {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const desktop = isDesktop();
  const shown = open && !desktop;
  sidebar.classList.toggle('is-open', shown);
  backdrop.classList.toggle('hidden', !shown);
  if (!shown && !desktop) sidebar.setAttribute('inert', '');
  else sidebar.removeAttribute('inert');
  const toggle = document.getElementById('menu-toggle');
  if (toggle) toggle.setAttribute('aria-expanded', String(shown));
}
function closeSidebar(restoreFocus) {
  setSidebar(false);
  if (restoreFocus && !isDesktop()) document.getElementById('menu-toggle').focus();
}

function syncTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = stored === 'dark' || (stored !== 'light' && systemDark);
  document.documentElement.classList.toggle('dark', dark);
}
function initTheme() {
  syncTheme();
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const onChange = () => {
    if (!localStorage.getItem(THEME_KEY)) syncTheme();
  };
  if (mq.addEventListener) mq.addEventListener('change', onChange);
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const dark = document.documentElement.classList.contains('dark');
    localStorage.setItem(THEME_KEY, dark ? 'light' : 'dark');
    syncTheme();
  });
}

function toast(title, detail) {
  const wrap = document.getElementById('toasts');
  if (!wrap) return;
  while (wrap.children.length >= 4) wrap.firstChild.remove();
  const el = document.createElement('div');
  el.className = 'toast-item pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-800';
  el.innerHTML = `
    <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300">
      <i class="fa-solid fa-check text-[10px]"></i>
    </span>
    <div class="min-w-0">
      <div class="font-medium text-slate-800 dark:text-slate-100">${escapeHtml(title)}</div>
      ${detail ? `<div class="truncate text-slate-500 dark:text-slate-400">${escapeHtml(detail)}</div>` : ''}
    </div>`;
  el.style.opacity = '1';
  wrap.appendChild(el);
  const life = motionMs() === 0 ? 2400 : 3200;
  setTimeout(() => {
    el.style.opacity = '0';
    el.classList.add('toast-out');
    setTimeout(() => el.remove(), motionMs() || 180);
  }, life);
}

// Navigation
document.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    state.currentView = link.dataset.view;
    closeSidebar(false);
    render();
  });
});

document.getElementById('quick-add').addEventListener('click', () => openQuickAdd());
document.getElementById('global-search').addEventListener('input', e => {
  state.search = e.target.value.toLowerCase();
  render();
});

// Render
function render() {
  const content = document.getElementById('content');
  const q = state.search || '';
  switch (state.currentView) {
    case 'dashboard': content.innerHTML = renderDashboard(q); break;
    case 'pipeline': content.innerHTML = renderPipeline(q); setupDragDrop(); break;
    case 'contacts': content.innerHTML = renderContacts(q); break;
    case 'tasks': content.innerHTML = renderTasks(q); break;
    case 'products': content.innerHTML = renderProducts(q); break;
    case 'orders': content.innerHTML = renderOrders(q); break;
  }
  attachListeners();
}

function renderDashboard() {
  const totalValue = state.deals.filter(d => !d.stage.includes('Closed')).reduce((s, d) => s + d.value, 0);
  const won = state.deals.filter(d => d.stage === 'Closed Won').reduce((s, d) => s + d.value, 0);
  const openTasks = state.tasks.filter(t => !t.done).length;
  const lowStock = state.products.filter(p => p.stock <= p.reorderLevel);
  const openOrders = state.orders.filter(o => !['Delivered','Cancelled'].includes(o.status)).length;
  const activity = state.activities.slice(0, 5).map(a => `
    <div class="flex gap-3 text-sm">
      <div class="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0"></div>
      <div class="min-w-0">
        <div class="text-slate-700 dark:text-slate-200">${escapeHtml(a.text)}</div>
        <div class="text-xs text-slate-400 dark:text-slate-500">${escapeHtml(a.time)}</div>
      </div>
    </div>`).join('');
  const stockRows = lowStock.map(p => `
    <div class="flex justify-between gap-3 text-sm p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60">
      <div class="min-w-0">
        <div class="font-medium truncate">${escapeHtml(p.name)}</div>
        <div class="text-xs text-slate-400 dark:text-slate-500">${escapeHtml(p.sku)}</div>
      </div>
      <div class="text-orange-600 dark:text-orange-300 font-medium shrink-0">${p.stock} left</div>
    </div>`).join('');
  return `
    <div class="space-y-6">
      ${pageHeader('Dashboard', 'Quotes, job releases, and shelf stock for contractors, OEMs, and MRO accounts')}
      <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        ${statCard('Pipeline', formatMoney(totalValue), 'fa-dollar-sign', 'text-emerald-600 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/50')}
        ${statCard('Won', formatMoney(won), 'fa-trophy', 'text-amber-600 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/50')}
        ${statCard('Open Tasks', openTasks, 'fa-list-check', 'text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/50')}
        ${statCard('Contacts', state.contacts.length, 'fa-users', 'text-violet-600 bg-violet-50 dark:text-violet-300 dark:bg-violet-950/50')}
        ${statCard('Low Stock', lowStock.length, 'fa-exclamation-triangle', 'text-orange-600 bg-orange-50 dark:text-orange-300 dark:bg-orange-950/50')}
        ${statCard('Open Orders', openOrders, 'fa-shopping-cart', 'text-indigo-600 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950/50')}
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="lift-card ${CARD} p-5">
          <h3 class="font-semibold mb-4">Recent Activity</h3>
          <div class="space-y-3">
            ${activity || emptyNote('fa-clock', 'No activity yet. Quote calls, job releases, and deliveries will show up here.')}
          </div>
        </div>
        <div class="lift-card ${CARD} p-5">
          <h3 class="font-semibold mb-4">Low Stock Alerts</h3>
          <div class="space-y-2">
            ${stockRows || emptyNote('fa-circle-check', 'Shelf is healthy. Nothing is at or under its reorder point.')}
          </div>
        </div>
      </div>
    </div>`;
}

function statCard(label, value, icon, color) {
  return `
    <div class="lift-card ${CARD} p-4 sm:p-5">
      <div class="flex items-center justify-between gap-2">
        <div class="min-w-0">
          <div class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">${label}</div>
          <div class="text-lg sm:text-2xl font-bold mt-1 leading-tight tracking-tight">${value}</div>
        </div>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}">
          <i class="fa-solid ${icon}"></i>
        </div>
      </div>
    </div>`;
}

function renderPipeline(q) {
  const filtered = state.deals.filter(d =>
    !q || d.title.toLowerCase().includes(q) || (contactById(d.contactId)?.name || '').toLowerCase().includes(q)
  );
  const board = (q && filtered.length === 0)
    ? `<div class="${CARD}">${emptyState('fa-columns', 'No matching quotes', `Nothing in the pipeline matches “${escapeHtml(q)}”.`)}</div>`
    : `<div class="flex gap-3 sm:gap-4 overflow-x-auto pb-4" id="kanban">
        ${STAGES.map(stage => {
          const meta = STAGE_META[stage];
          const deals = filtered.filter(d => d.stage === stage);
          const total = deals.reduce((s, d) => s + d.value, 0);
          return `
            <div class="kanban-column w-64 sm:w-72 shrink-0 rounded-2xl p-3 border ${meta.column}" data-stage="${escapeHtml(stage)}">
              <div class="flex justify-between items-center gap-2 mb-3 px-1">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="h-2 w-2 rounded-full shrink-0 ${meta.dot}"></span>
                  <div class="font-medium text-sm truncate ${meta.label}">${escapeHtml(stage)}</div>
                </div>
                <div class="text-xs text-slate-500 dark:text-slate-400 shrink-0">${deals.length} · ${formatMoney(total)}</div>
              </div>
              <div class="space-y-2 min-h-[200px]">
                ${deals.length
                  ? deals.map(d => dealCard(d)).join('')
                  : `<div class="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-black/10 px-3 text-center text-xs text-slate-400 dark:border-white/10 dark:text-slate-500">No quotes</div>`}
              </div>
            </div>`;
        }).join('')}
      </div>`;
  return `
    <div class="space-y-4">
      ${pageHeader('Pipeline', 'Job packages, panel builds, retrofits, and stock agreements — drag a quote between stages', 'Deal', 'openAddDeal()')}
      ${board}
    </div>`;
}

function dealCard(d) {
  const c = contactById(d.contactId);
  const name = c?.name || 'No contact';
  return `
    <div class="kanban-card bg-white rounded-xl p-3 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-700" draggable="true" data-deal="${d.id}">
      <div class="font-medium text-sm text-slate-800 dark:text-slate-100">${escapeHtml(d.title)}</div>
      <div class="flex items-center gap-2 mt-2 min-w-0">
        ${avatarChip(c?.name || '', 'xs')}
        <div class="text-xs text-slate-500 dark:text-slate-400 truncate">${escapeHtml(name)}</div>
      </div>
      <div class="flex justify-between items-center mt-3 gap-2">
        <div class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">${formatMoney(d.value)}</div>
        <div class="text-xs text-slate-400 dark:text-slate-500 shrink-0">${escapeHtml(d.closeDate || '')}</div>
      </div>
    </div>`;
}

function renderContacts(q) {
  const filtered = state.contacts.filter(c =>
    !q || c.name.toLowerCase().includes(q) || (c.company || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q)
  );
  const body = filtered.length === 0
    ? `<div class="${CARD}">${q
        ? emptyState('fa-users', 'No matching accounts', `Nothing matches “${escapeHtml(q)}”. Try another name, company, or email.`)
        : emptyState('fa-users', 'No accounts yet', 'Add a contractor, plant, OEM, or municipal buyer.', 'Add contact', 'openAddContact()')}</div>`
    : responsiveList(
        filtered.map(c => `
          <div class="flex items-center gap-3 p-3">
            ${avatarChip(c.name)}
            <div class="min-w-0 flex-1">
              <div class="font-medium text-slate-800 dark:text-slate-100 truncate">${escapeHtml(c.name)}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400 truncate">${escapeHtml(c.company || '—')}${c.title ? ` · ${escapeHtml(c.title)}` : ''}</div>
              <div class="text-xs text-slate-400 dark:text-slate-500 truncate">${escapeHtml(c.email)}</div>
            </div>
          </div>`).join(''),
        dataTable(
          ['Name', 'Company', 'Email', 'Title'],
          filtered.map(c => `
            <tr class="${ROW}">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3 min-w-0">
                  ${avatarChip(c.name)}
                  <span class="font-medium text-slate-800 dark:text-slate-100 truncate">${escapeHtml(c.name)}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300">${escapeHtml(c.company)}</td>
              <td class="px-4 py-3 text-slate-600 dark:text-slate-300">${escapeHtml(c.email)}</td>
              <td class="px-4 py-3 text-slate-500 dark:text-slate-400">${escapeHtml(c.title)}</td>
            </tr>`).join(''),
          'min-w-[40rem]'
        )
      );
  return `
    <div class="space-y-4">
      ${pageHeader('Contacts', `${filtered.length} buyers across contractors, plants, OEMs, and municipalities`, 'Contact', 'openAddContact()')}
      ${body}
    </div>`;
}

function renderTasks(q) {
  const filtered = state.tasks.filter(t => !q || t.title.toLowerCase().includes(q));
  const rows = filtered.map(t => `
    <div class="flex items-center gap-4 p-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60">
      <input type="checkbox" data-task="${t.id}" class="task-check h-5 w-5 accent-blue-600" ${t.done ? 'checked' : ''}>
      <div class="flex-1 min-w-0">
        <div class="${t.done ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}">${escapeHtml(t.title)}</div>
        <div class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Due ${escapeHtml(t.due || '—')}</div>
      </div>
    </div>`).join('');
  const body = filtered.length
    ? `<div class="${CARD} overflow-hidden">${rows}</div>`
    : `<div class="${CARD}">${q
        ? emptyState('fa-check-square', 'No matching follow-ups', `Nothing matches “${escapeHtml(q)}”.`)
        : emptyState('fa-check-square', 'No follow-ups yet', 'Log a quote chase, job release, backorder, or drive startup.', 'Add task', 'openAddTask()')}</div>`;
  return `
    <div class="space-y-4">
      ${pageHeader('Tasks', 'Quote follow-ups, job releases, backorders, deliveries, and drive startups', 'Task', 'openAddTask()')}
      ${body}
    </div>`;
}

// Drag & Drop for Pipeline
function setupDragDrop() {
  const cards = document.querySelectorAll('.kanban-card');
  const columns = document.querySelectorAll('.kanban-column');

  cards.forEach(card => {
    card.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', card.dataset.deal);
      card.classList.add('opacity-50');
    });
    card.addEventListener('dragend', () => card.classList.remove('opacity-50'));
  });

  columns.forEach(col => {
    col.addEventListener('dragover', e => {
      e.preventDefault();
      col.classList.add('drag-over');
    });
    col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
    col.addEventListener('drop', e => {
      e.preventDefault();
      col.classList.remove('drag-over');
      const dealId = e.dataTransfer.getData('text/plain');
      const stage = col.dataset.stage;
      const deal = state.deals.find(d => d.id == dealId);
      if (deal && deal.stage !== stage) {
        deal.stage = stage;
        addActivity(`Moved "${deal.title}" to ${stage}`);
        save();
        toast('Deal moved', `${deal.title} → ${stage}`);
        render();
      }
    });
  });
}

function addActivity(text) {
  state.activities.unshift({ id: uid(), text, time: 'Just now' });
  if (state.activities.length > 20) state.activities.pop();
}

// Modals
function openModal(title, html) {
  clearTimeout(modalTimer);
  const gen = ++modalGen;
  const modal = document.getElementById('modal');
  const backdrop = document.getElementById('modal-backdrop');
  const panel = document.getElementById('modal-panel');
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = html;
  const alreadyVisible = !modal.classList.contains('hidden') && panel.classList.contains('opacity-100');
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  if (!alreadyVisible) {
    backdrop.classList.remove('opacity-100');
    backdrop.classList.add('opacity-0');
    panel.classList.remove('opacity-100', 'scale-100');
    panel.classList.add('opacity-0', 'scale-95');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (gen !== modalGen) return;
        backdrop.classList.remove('opacity-0');
        backdrop.classList.add('opacity-100');
        panel.classList.remove('opacity-0', 'scale-95');
        panel.classList.add('opacity-100', 'scale-100');
      });
    });
  }
  const field = document.querySelector('#modal-body input, #modal-body select, #modal-body textarea');
  if (field) field.focus();
}
function closeModal() {
  const modal = document.getElementById('modal');
  if (modal.classList.contains('hidden')) return;
  const gen = ++modalGen;
  const backdrop = document.getElementById('modal-backdrop');
  const panel = document.getElementById('modal-panel');
  backdrop.classList.remove('opacity-100');
  backdrop.classList.add('opacity-0');
  panel.classList.remove('opacity-100', 'scale-100');
  panel.classList.add('opacity-0', 'scale-95');
  modal.setAttribute('aria-hidden', 'true');
  clearTimeout(modalTimer);
  modalTimer = setTimeout(() => {
    if (gen !== modalGen) return;
    modal.classList.add('hidden');
  }, motionMs());
}
window.closeModal = closeModal;

function openAddContact() {
  openModal('Add Contact', `
    <form id="contact-form" class="space-y-3">
      <input name="name" required placeholder="Full name" class="${FIELD}" />
      <input name="email" type="email" required placeholder="Email" class="${FIELD}" />
      <input name="company" placeholder="Company" class="${FIELD}" />
      <input name="title" placeholder="Title" class="${FIELD}" />
      ${formActions('Save')}
    </form>
  `);
  document.getElementById('contact-form').onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get('name');
    state.contacts.push({
      id: uid(),
      name,
      email: fd.get('email'),
      company: fd.get('company') || '',
      title: fd.get('title') || '',
      phone: ''
    });
    addActivity(`Added contact ${name}`);
    save();
    closeModal();
    toast('Contact saved', name);
    render();
  };
}

function openAddDeal() {
  const options = state.contacts.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)} (${escapeHtml(c.company)})</option>`).join('');
  openModal('Add Deal', `
    <form id="deal-form" class="space-y-3">
      <input name="title" required placeholder="Job package, panel build, stock agreement" class="${FIELD}" />
      <input name="value" type="number" required placeholder="Value ($)" class="${FIELD}" />
      <select name="contactId" required class="${FIELD}">
        <option value="">Select contact</option>${options}
      </select>
      <select name="stage" class="${FIELD}">
        ${STAGES.map(s => `<option>${escapeHtml(s)}</option>`).join('')}
      </select>
      <input name="closeDate" type="date" class="${FIELD}" />
      ${formActions('Save')}
    </form>
  `);
  document.getElementById('deal-form').onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const title = fd.get('title');
    state.deals.push({
      id: uid(),
      title,
      value: Number(fd.get('value')),
      contactId: fd.get('contactId'),
      stage: fd.get('stage'),
      closeDate: fd.get('closeDate') || ''
    });
    addActivity(`Created deal "${title}"`);
    save();
    closeModal();
    toast('Deal created', title);
    render();
  };
}

function openAddTask() {
  openModal('Add Task', `
    <form id="task-form" class="space-y-3">
      <input name="title" required placeholder="Quote follow-up, release, backorder, startup" class="${FIELD}" />
      <input name="due" type="date" class="${FIELD}" />
      ${formActions('Save')}
    </form>
  `);
  document.getElementById('task-form').onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const title = fd.get('title');
    state.tasks.push({
      id: uid(),
      title,
      due: fd.get('due') || '',
      done: false
    });
    save();
    closeModal();
    toast('Task saved', title);
    render();
  };
}

function renderProducts(q) {
  const filtered = state.products.filter(p =>
    !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.category||'').toLowerCase().includes(q)
  );
  const body = filtered.length === 0
    ? `<div class="${CARD}">${q
        ? emptyState('fa-box', 'No matching SKUs', `Nothing matches “${escapeHtml(q)}”.`)
        : emptyState('fa-box', 'No SKUs yet', 'Add conduit, wire, controls, or lighting.', 'Add product', 'openAddProduct()')}</div>`
    : responsiveList(
        filtered.map(p => {
          const low = p.stock <= p.reorderLevel;
          return `
            <div class="flex items-center justify-between gap-3 p-3 ${low ? 'bg-orange-50 dark:bg-orange-950/30' : ''}">
              <div class="min-w-0">
                <div class="font-medium text-slate-800 dark:text-slate-100 truncate">${escapeHtml(p.name)}</div>
                <div class="text-xs text-slate-500 dark:text-slate-400 truncate">${escapeHtml(p.sku)}${p.category ? ` · ${escapeHtml(p.category)}` : ''}</div>
              </div>
              <div class="text-right shrink-0">
                <div class="text-sm font-medium">${formatMoney(p.price)}</div>
                <div class="text-xs ${low ? 'text-orange-600 dark:text-orange-300 font-medium' : 'text-slate-400 dark:text-slate-500'}">${p.stock} in stock</div>
              </div>
            </div>`;
        }).join(''),
        dataTable(
          ['SKU', 'Name', 'Category', 'Price', 'Stock', 'Reorder'],
          filtered.map(p => `
            <tr class="${ROW} ${p.stock <= p.reorderLevel ? 'bg-orange-50 hover:bg-orange-100/70 dark:bg-orange-950/30 dark:hover:bg-orange-950/50' : ''}">
              <td class="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">${escapeHtml(p.sku)}</td>
              <td class="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">${escapeHtml(p.name)}</td>
              <td class="px-4 py-3 text-slate-600 dark:text-slate-300">${escapeHtml(p.category || '—')}</td>
              <td class="px-4 py-3">${formatMoney(p.price)}</td>
              <td class="px-4 py-3 font-medium ${p.stock <= p.reorderLevel ? 'text-orange-600 dark:text-orange-300' : ''}">${p.stock}</td>
              <td class="px-4 py-3 text-slate-500 dark:text-slate-400">${p.reorderLevel}</td>
            </tr>`).join(''),
          'min-w-[44rem]'
        )
      );
  return `
    <div class="space-y-4">
      ${pageHeader('Products & Inventory', `${filtered.length} SKUs · conduit, wire, controls, and lighting · low stock highlighted`, 'Product', 'openAddProduct()')}
      ${body}
    </div>`;
}

function renderOrders(q) {
  const filtered = state.orders.filter(o =>
    !q || o.orderNumber.toLowerCase().includes(q) || (contactById(o.contactId)?.name || '').toLowerCase().includes(q) || o.status.toLowerCase().includes(q)
  );
  const body = filtered.length === 0
    ? `<div class="${CARD}">${q
        ? emptyState('fa-shopping-cart', 'No matching orders', `Nothing matches “${escapeHtml(q)}”.`)
        : emptyState('fa-shopping-cart', 'No orders yet', 'Release stocked SKUs to a contractor, plant, or OEM.', 'Add order', 'openAddOrder()')}</div>`
    : responsiveList(
        filtered.map(o => {
          const c = contactById(o.contactId);
          const statusColor = ORDER_STATUS_CLASS[o.status] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
          return `
            <div class="flex items-center justify-between gap-3 p-3">
              <div class="min-w-0">
                <div class="font-medium text-slate-800 dark:text-slate-100">${escapeHtml(o.orderNumber)}</div>
                <div class="text-xs text-slate-500 dark:text-slate-400 truncate">${escapeHtml(c?.name || '—')} · ${escapeHtml(o.date)}</div>
              </div>
              <div class="text-right shrink-0">
                <div class="text-sm font-medium">${formatMoney(o.total)}</div>
                <span class="mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}">${escapeHtml(o.status)}</span>
              </div>
            </div>`;
        }).join(''),
        dataTable(
          ['Order #', 'Customer', 'Date', 'Status', 'Total'],
          filtered.map(o => {
            const c = contactById(o.contactId);
            const statusColor = ORDER_STATUS_CLASS[o.status] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
            return `
              <tr class="${ROW}">
                <td class="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">${escapeHtml(o.orderNumber)}</td>
                <td class="px-4 py-3">${escapeHtml(c?.name || '—')}</td>
                <td class="px-4 py-3 text-slate-600 dark:text-slate-300">${escapeHtml(o.date)}</td>
                <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}">${escapeHtml(o.status)}</span></td>
                <td class="px-4 py-3 font-medium">${formatMoney(o.total)}</td>
              </tr>`;
          }).join(''),
          'min-w-[40rem]'
        )
      );
  return `
    <div class="space-y-4">
      ${pageHeader('Orders', `${filtered.length} releases and counter tickets`, 'Order', 'openAddOrder()')}
      ${body}
    </div>`;
}

function openAddProduct() {
  openModal('Add Product', `
    <form id="product-form" class="space-y-3">
      <input name="sku" required placeholder="SKU" class="${FIELD}" />
      <input name="name" required placeholder="Product name" class="${FIELD}" />
      <input name="price" type="number" step="0.01" required placeholder="Price" class="${FIELD}" />
      <div class="grid grid-cols-2 gap-2">
        <input name="stock" type="number" required placeholder="Stock" class="${FIELD}" />
        <input name="reorderLevel" type="number" placeholder="Reorder level" class="${FIELD}" />
      </div>
      <input name="category" placeholder="Conduit, wire, controls, lighting" class="${FIELD}" />
      ${formActions('Save')}
    </form>
  `);
  document.getElementById('product-form').onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get('name');
    state.products.push({
      id: uid(),
      sku: fd.get('sku'),
      name,
      price: Number(fd.get('price')),
      stock: Number(fd.get('stock')),
      reorderLevel: Number(fd.get('reorderLevel')) || 0,
      category: fd.get('category') || ''
    });
    addActivity(`Added product ${name}`);
    save();
    closeModal();
    toast('Product saved', name);
    render();
  };
}

function openAddOrder() {
  const contactOptions = state.contacts.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)}</option>`).join('');
  const productOptions = state.products.map(p => `<option value="${escapeHtml(p.id)}" data-price="${p.price}">${escapeHtml(p.name)} (${formatMoney(p.price)})</option>`).join('');
  openModal('New Order', `
    <form id="order-form" class="space-y-3">
      <select name="contactId" required class="${FIELD}">
        <option value="">Select customer</option>${contactOptions}
      </select>
      <select name="productId" required class="${FIELD}">
        <option value="">Select product</option>${productOptions}
      </select>
      <input name="qty" type="number" min="1" value="1" required class="${FIELD}" />
      <select name="status" class="${FIELD}">
        <option>Draft</option>
        <option>Confirmed</option>
        <option>Shipped</option>
        <option>Delivered</option>
      </select>
      ${formActions('Create Order')}
    </form>
  `);
  document.getElementById('order-form').onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const product = state.products.find(p => p.id == fd.get('productId'));
    const qty = Number(fd.get('qty'));
    const price = product?.price || 0;
    const orderNum = 'ORD-' + (1000 + state.orders.length + 1);
    state.orders.push({
      id: uid(),
      orderNumber: orderNum,
      contactId: fd.get('contactId'),
      date: new Date().toISOString().slice(0,10),
      status: fd.get('status'),
      items: [{ productId: product.id, qty, price }],
      total: qty * price
    });
    // Deduct stock if not draft
    if (fd.get('status') !== 'Draft' && product) {
      product.stock = Math.max(0, product.stock - qty);
    }
    addActivity(`Created order ${orderNum}`);
    save();
    closeModal();
    toast('Order created', orderNum);
    render();
  };
}

function openQuickAdd() {
  openModal('Quick Add', `
    <div class="space-y-2">
      <button type="button" onclick="openAddContact()" class="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-200">
        <i class="fa-solid fa-user-plus text-primary"></i> New Contact
      </button>
      <button type="button" onclick="openAddDeal()" class="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-200">
        <i class="fa-solid fa-handshake text-primary"></i> New Deal
      </button>
      <button type="button" onclick="openAddTask()" class="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-200">
        <i class="fa-solid fa-check text-primary"></i> New Task
      </button>
      <button type="button" onclick="openAddProduct()" class="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-200">
        <i class="fa-solid fa-box text-primary"></i> New Product
      </button>
      <button type="button" onclick="openAddOrder()" class="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-200">
        <i class="fa-solid fa-shopping-cart text-primary"></i> New Order
      </button>
    </div>
  `);
}

function attachListeners() {
  document.querySelectorAll('.task-check').forEach(cb => {
    cb.addEventListener('change', () => {
      const task = state.tasks.find(t => t.id == cb.dataset.task);
      if (task) {
        task.done = cb.checked;
        save();
        if (task.done) toast('Task completed', task.title);
        render();
      }
    });
  });
}

function initShell() {
  initTheme();
  document.getElementById('menu-toggle').addEventListener('click', () => {
    setSidebar(true);
    document.getElementById('sidebar-close').focus();
  });
  document.getElementById('sidebar-close').addEventListener('click', () => closeSidebar(true));
  document.getElementById('sidebar-backdrop').addEventListener('click', () => closeSidebar(true));
  const desktopMq = window.matchMedia('(min-width: 1024px)');
  const syncSidebar = () => {
    const open = document.getElementById('sidebar').classList.contains('is-open');
    if (isDesktop() || !open) setSidebar(false);
  };
  if (desktopMq.addEventListener) desktopMq.addEventListener('change', syncSidebar);
  window.addEventListener('resize', syncSidebar);
  setSidebar(false);

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-backdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const modal = document.getElementById('modal');
    if (!modal.classList.contains('hidden')) {
      closeModal();
      return;
    }
    if (document.getElementById('sidebar').classList.contains('is-open')) closeSidebar(true);
  });
}

// Expose for inline handlers
window.openAddContact = openAddContact;
window.openAddDeal = openAddDeal;
window.openAddTask = openAddTask;
window.openAddProduct = openAddProduct;
window.openAddOrder = openAddOrder;

// Init
initShell();
load();
render();
