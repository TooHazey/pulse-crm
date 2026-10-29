// PULSE — static CRM demo for an electrical / MRO / automation distributor.
// Sample book is inspired by Marshall E. Campbell Company (mecampbell.com).
// This is a prototype, not an official MEC product. Data stored in localStorage.
//
// Quotes are the commercial document. Pipeline deals stay opportunity stages.
// Orders are multi-line releases. Deliveries are the job-site board.
//
// Sign-in, branch tags, and the audit log are demo theater. They teach the
// model (who, which branch, which role) and do not authenticate anyone.
// The real path is docs/PRODUCTION.md. Demo password is plaintext on purpose.

const STAGES = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
const QUOTE_STATUSES = ['Draft', 'Sent', 'Accepted', 'Expired', 'Converted'];
const ORDER_STATUSES = ['Draft', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
const DELIVERY_STATUSES = ['Scheduled', 'Out for delivery', 'Delivered', 'Failed'];
const PAY_STATUSES = ['Unpaid', 'Partial', 'Paid', 'Refunded'];
const PAY_METHODS = ['Cash', 'Check', 'Card', 'Account'];
const UOMS = ['ea', 'ft', 'coil', 'box', 'c', 'm', 'roll', 'set'];
const VIEWS = ['dashboard', 'pipeline', 'quotes', 'contacts', 'tasks', 'products', 'orders', 'deliveries', 'audit'];
const THEME_KEY = 'pulse-theme';
const SESSION_KEY = 'pulse-session';
const AUDIT_KEY = 'pulse-audit';
const DEMO_PASSWORD = 'pulse';
const IDLE_MS = 15 * 60 * 1000;
const MI_RATE = 0.06;

const BRANCHES = [
  { id: '1000', name: 'Port Huron', short: 'PH', zip: '48060' },
  { id: '2000', name: 'Saginaw', short: 'SG', zip: '48601' },
  { id: '3000', name: 'Lapeer', short: 'LP', zip: '48446' },
  { id: '4000', name: 'Livonia', short: 'LV', zip: '48150' },
];

// Michigan is a flat 6% state rate in this demo. The ZIP table is the stand-in
// for a tax engine: known ship-to ZIPs resolve here, other 48xxx/49xxx ZIPs
// fall back to 6%, and a non-Michigan ZIP is treated as an out-of-state 0%.
const ZIP_RATES = {
  '48060': 0.06, '48059': 0.06, '48039': 0.06,
  '48601': 0.06, '48602': 0.06, '48607': 0.06, '48750': 0.06,
  '48446': 0.06, '48444': 0.06,
  '48150': 0.06, '48152': 0.06, '48154': 0.06, '48183': 0.06,
};

const DEMO_USERS = [
  { id: 'u-ph-counter', username: 'counter.ph', name: 'Jordan Hale', role: 'counter', branchId: '1000' },
  { id: 'u-ph-sales', username: 'sales.ph', name: 'Morgan Ellis', role: 'sales', branchId: '1000' },
  { id: 'u-ph-wh', username: 'warehouse.ph', name: 'Sam Ortega', role: 'warehouse', branchId: '1000' },
  { id: 'u-sg-counter', username: 'counter.sg', name: 'Casey Brandt', role: 'counter', branchId: '2000' },
  { id: 'u-sg-sales', username: 'sales.sg', name: 'Riley Nguyen', role: 'sales', branchId: '2000' },
  { id: 'u-sg-wh', username: 'warehouse.sg', name: 'Drew Patel', role: 'warehouse', branchId: '2000' },
  { id: 'u-lp-counter', username: 'counter.lp', name: 'Avery Quinn', role: 'counter', branchId: '3000' },
  { id: 'u-lp-sales', username: 'sales.lp', name: 'Parker Singh', role: 'sales', branchId: '3000' },
  { id: 'u-lp-wh', username: 'warehouse.lp', name: 'Quinn Brooks', role: 'warehouse', branchId: '3000' },
  { id: 'u-lv-counter', username: 'counter.lv', name: 'Taylor Brooks', role: 'counter', branchId: '4000' },
  { id: 'u-lv-sales', username: 'sales.lv', name: 'Jamie Okonkwo', role: 'sales', branchId: '4000' },
  { id: 'u-lv-wh', username: 'warehouse.lv', name: 'Reese Alvarez', role: 'warehouse', branchId: '4000' },
  { id: 'u-mgr', username: 'manager', name: 'Riley Cho', role: 'manager', branchId: '1000' },
  { id: 'u-admin', username: 'admin', name: 'Alex Morgan', role: 'admin', branchId: '1000' },
];

const ROLE_LABEL = {
  counter: 'Counter',
  sales: 'Inside sales',
  warehouse: 'Warehouse',
  manager: 'Manager',
  admin: 'Admin',
};

const VIEW_ROLES = {
  dashboard: ['counter', 'sales', 'warehouse', 'manager', 'admin'],
  pipeline: ['sales', 'manager', 'admin'],
  quotes: ['counter', 'sales', 'manager', 'admin'],
  contacts: ['counter', 'sales', 'manager', 'admin'],
  tasks: ['sales', 'manager', 'admin'],
  products: ['counter', 'sales', 'warehouse', 'manager', 'admin'],
  orders: ['counter', 'sales', 'warehouse', 'manager', 'admin'],
  deliveries: ['counter', 'sales', 'warehouse', 'manager', 'admin'],
  audit: ['manager', 'admin'],
};

const CONTACT_BRANCH = {
  1: '1000', 2: '2000', 3: '2000', 4: '1000',
  5: '4000', 6: '1000', 7: '2000', 8: '4000',
  9: '3000', 10: '3000', 11: '3000',
};

const CONTACT_TAX = {
  1: { shipZip: '48060', taxExempt: false, resaleCertificate: '' },
  2: { shipZip: '48602', taxExempt: true, resaleCertificate: 'MI-RS-22018' },
  3: { shipZip: '48601', taxExempt: false, resaleCertificate: '' },
  4: { shipZip: '48060', taxExempt: true, resaleCertificate: 'GOV-SCT-DPW' },
  5: { shipZip: '48183', taxExempt: false, resaleCertificate: '' },
  6: { shipZip: '48039', taxExempt: false, resaleCertificate: '' },
  7: { shipZip: '48750', taxExempt: true, resaleCertificate: 'GOV-HSWA' },
  8: { shipZip: '48150', taxExempt: true, resaleCertificate: 'MI-RS-88410' },
  9: { shipZip: '48446', taxExempt: true, resaleCertificate: 'GOV-LAPEER' },
  10: { shipZip: '48444', taxExempt: false, resaleCertificate: '' },
  11: { shipZip: '48446', taxExempt: true, resaleCertificate: 'MI-RS-30991' },
};

const CATALOG = [
  { section: 'Conduit & Raceway', subs: ['EMT', 'Rigid', 'PVC', 'Liquidtight', 'Flexible', 'Strut & Fittings'] },
  { section: 'Wire & Cable', subs: ['THHN', 'MC Cable', 'Portable Cord', 'Building Wire'] },
  { section: 'Control & Automation', subs: ['Contactors', 'Drives', 'PLC', 'Power Supplies', 'Sensors'] },
  { section: 'Lighting', subs: ['LED Fixtures', 'Emergency', 'Lamps'] },
  { section: 'Devices & Distribution', subs: ['Boxes', 'Devices', 'Breakers'] },
];

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

const DELIVERY_META = {
  'Scheduled': STAGE_META.Qualified,
  'Out for delivery': STAGE_META.Negotiation,
  'Delivered': STAGE_META['Closed Won'],
  'Failed': STAGE_META['Closed Lost'],
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

const QUOTE_STATUS_CLASS = {
  'Draft': ORDER_STATUS_CLASS.Draft,
  'Sent': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200',
  'Accepted': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
  'Expired': 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  'Converted': 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-200',
};

const PAY_STATUS_CLASS = {
  'Unpaid': ORDER_STATUS_CLASS.Draft,
  'Partial': ORDER_STATUS_CLASS.Shipped,
  'Paid': ORDER_STATUS_CLASS.Delivered,
  'Refunded': ORDER_STATUS_CLASS.Cancelled,
};

const DELIVERY_STATUS_CLASS = {
  'Scheduled': 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200',
  'Out for delivery': ORDER_STATUS_CLASS.Shipped,
  'Delivered': ORDER_STATUS_CLASS.Delivered,
  'Failed': ORDER_STATUS_CLASS.Cancelled,
};

const CARD = 'bg-white rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800';
const FIELD = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500';
const ROW = 'border-t border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60';
const LABEL = 'block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1';

// Bump when the sample book should replace an older `pulse-crm` seed once.
// The version lives in `pulse-crm-seed-version`, separate from the book and from `pulse-theme`.
// Version 4 tags the book by branch and adds Michigan tax plus demo payments.
const SEED_VERSION = '4';
const SEED_VERSION_KEY = 'pulse-crm-seed-version';

const DEFAULT_SHIP_TO = {
  1: 'Lakeshore Electrical laydown, St. Clair Hospital, Port Huron, MI',
  2: 'Thumb Panel & Controls, 410 Germania St, Saginaw, MI',
  3: 'Saginaw Foundry & Machine, 2100 E Genesee, Saginaw, MI',
  4: 'St. Clair Township DPW Garage, 5485 Gratiot, Port Huron, MI',
  5: 'Blue Water Auto Stamping, 22000 Allen Rd, Woodhaven, MI',
  6: 'Wolverine Line job trailer, North River subdivision, Marine City, MI',
  7: 'Huron Shore pump station 4, 8900 Lakeshore Rd, Oscoda, MI',
  8: 'Riverview OEM Systems, Livonia, MI',
  9: 'Lapeer County courthouse, 255 Clay St, Lapeer, MI 48446',
  10: 'Pell Electric laydown, 1400 S Cedar, Imlay City, MI 48444',
  11: 'Lapeer Metalworks, 1840 Imlay City Rd, Lapeer, MI 48446',
};

let session = null;
let idleTimer = 0;
let lastSessionWrite = 0;

let state = {
  contacts: [],
  deals: [],
  tasks: [],
  activities: [],
  products: [],
  quotes: [],
  orders: [],
  deliveries: [],
  currentView: 'dashboard'
};

const catalogUi = {
  section: '',
  subcategory: '',
  manufacturer: '',
  sort: 'name',
  page: 1,
  pageSize: 12,
  query: ''
};
const quoteUi = { status: '' };
const orderUi = { status: '' };

let modalGen = 0;
let modalTimer = 0;
let activeDoc = null;
let renderedView = '';
let ignoreNextClick = false;
let ignoreTimer = 0;
const skuPop = { matches: [], active: 0, input: null };

function load() {
  const saved = localStorage.getItem('pulse-crm');
  const seedVersion = localStorage.getItem(SEED_VERSION_KEY);
  if (saved && seedVersion === SEED_VERSION) {
    try {
      state = { ...state, ...JSON.parse(saved) };
    } catch (err) {
      seedData();
      localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
    }
  } else {
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
  state.contacts = state.contacts || [];
  state.deals = state.deals || [];
  state.tasks = state.tasks || [];
  state.activities = state.activities || [];
  state.products = state.products || [];
  state.quotes = state.quotes || [];
  state.orders = state.orders || [];
  state.deliveries = state.deliveries || [];
  if (!VIEWS.includes(state.currentView)) state.currentView = 'dashboard';
  seedAuditIfEmpty();
}

function save() {
  localStorage.setItem('pulse-crm', JSON.stringify(state));
}

function costFor(section, price) {
  const ratio = {
    'Conduit & Raceway': 0.8,
    'Wire & Cable': 0.78,
    'Control & Automation': 0.72,
    'Lighting': 0.74,
    'Devices & Distribution': 0.7
  }[section] ?? 0.78;
  return Math.round(price * ratio * 100) / 100;
}

function seedData() {
  state.contacts = [
    { id: 1, name: 'Dana Kowalski', email: 'dana.kowalski@lakeshore-electric.com', company: 'Lakeshore Electrical', phone: '+1 810-555-0142', title: 'Purchasing Manager' },
    { id: 2, name: 'Marcus Hale', email: 'marcus.hale@thumbpanel.com', company: 'Thumb Panel & Controls', phone: '+1 989-555-0174', title: 'Project Manager' },
    { id: 3, name: 'Priya Shah', email: 'priya.shah@saginawfoundry.com', company: 'Saginaw Foundry & Machine', phone: '+1 989-555-0190', title: 'Plant Engineer' },
    { id: 4, name: 'Tom Brennan', email: 'tom.brennan@sctdpw.org', company: 'St. Clair Township DPW', phone: '+1 810-555-0118', title: 'Facilities Buyer' },
    { id: 5, name: 'Elena Vasquez', email: 'elena.vasquez@bwautostamp.com', company: 'Blue Water Auto Stamping', phone: '+1 734-555-0166', title: 'MRO Buyer' },
    { id: 6, name: 'Chris Nguyen', email: 'chris.nguyen@wolverineline.com', company: 'Wolverine Line Construction', phone: '+1 810-555-0133', title: 'Estimator' },
    { id: 7, name: 'Angela Brooks', email: 'angela.brooks@huronshorewater.org', company: 'Huron Shore Water Authority', phone: '+1 989-555-0127', title: 'Maintenance Planner' },
    { id: 8, name: 'James Okonkwo', email: 'james.okonkwo@riverviewoem.com', company: 'Riverview OEM Systems', phone: '+1 248-555-0194', title: 'Controls Engineer' },
    { id: 9, name: 'Ruth Keller', email: 'ruth.keller@lapeercounty.gov', company: 'Lapeer County Facilities', phone: '+1 810-555-0188', title: 'Facilities Buyer' },
    { id: 10, name: 'Nate Pell', email: 'nate.pell@pellelectric.com', company: 'Pell Electric', phone: '+1 810-555-0160', title: 'Estimator' },
    { id: 11, name: 'Sofia Marin', email: 'sofia.marin@lapeerfab.com', company: 'Lapeer Metalworks', phone: '+1 810-555-0199', title: 'MRO Buyer' },
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
    { id: 10, title: 'Courthouse lighting retrofit', contactId: 9, value: 36400, stage: 'Qualified', closeDate: '2026-12-02' },
    { id: 11, title: 'Imlay City temp power', contactId: 10, value: 18250, stage: 'Proposal', closeDate: '2026-11-20' },
    { id: 12, title: 'Fab cell cord and sensors', contactId: 11, value: 9400, stage: 'Closed Won', closeDate: '2026-10-26' },
  ];
  state.tasks = [
    { id: 1, title: 'Send revised hospital package quote to Dana Kowalski', dealId: 1, due: '2026-10-30', done: false },
    { id: 2, title: 'Confirm job release dates for Thumb Panel starter cells', dealId: 2, due: '2026-10-31', done: false },
    { id: 3, title: 'Check 5 HP 480V drive backorder ETA for Saginaw Foundry', dealId: 5, due: '2026-10-29', done: false },
    { id: 4, title: 'Schedule Port Huron garage lighting delivery window', dealId: 3, due: '2026-11-03', done: false },
    { id: 5, title: 'Book drive startup at Huron Shore pump station', dealId: 8, due: '2026-11-06', done: true },
    { id: 6, title: 'Follow up on Blue Water annual stock-agreement pricing', dealId: 4, due: '2026-11-04', done: false },
    { id: 7, title: 'Call Nate Pell on the Imlay temp-power quote', dealId: 11, due: '2026-10-31', done: false },
    { id: 8, title: 'Confirm courthouse high-bay alternates with Ruth Keller', dealId: 10, due: '2026-11-05', done: false },
  ];
  state.activities = [
    { id: 6, text: 'Sent Q-1004 conveyor drive package to Priya Shah at Saginaw Foundry', time: '1h ago', contactId: 3 },
    { id: 1, text: 'Quoted 3/4" EMT and 12 AWG THHN for the Lakeshore hospital package', time: '2h ago', contactId: 1 },
    { id: 2, text: 'Marcus Hale moved the panel-build release to the week of Nov 10', time: 'Yesterday', contactId: 2 },
    { id: 3, text: 'Sent high-bay submittals to Tom Brennan for the municipal garage', time: 'Yesterday', contactId: 4 },
    { id: 4, text: 'Priya Shah asked for startup support on the 480V conveyor drives', time: '3d ago', contactId: 3 },
    { id: 5, text: 'Wolverine Line PVC and building-wire release delivered to the job trailer', time: '4d ago', contactId: 6 },
    { id: 7, text: 'Lapeer Metalworks put the fab-cell sensors on account', time: '2d ago', contactId: 11 },
    { id: 8, text: 'Refunded a mis-rung fittings ticket at the Lapeer counter', time: 'Yesterday', contactId: 10 },
  ];

  // id, sku, name, price, stock, reorder, section, subcategory, manufacturer, uom
  const rawProducts = [
    [1, 'EMT-034-10', '3/4" EMT Conduit, 10 ft', 9, 840, 200, 'Conduit & Raceway', 'EMT', 'Allied Tube', 'ea'],
    [2, 'GRC-200-10', '2" Galvanized Rigid Conduit, 10 ft', 68, 120, 40, 'Conduit & Raceway', 'Rigid', 'Wheatland', 'ea'],
    [3, 'PVC-100-10', '1" PVC Schedule 40 Conduit, 10 ft', 11, 460, 100, 'Conduit & Raceway', 'PVC', 'Heritage Plastics', 'ea'],
    [4, 'LFMC-034-100', '3/4" Liquidtight Flexible Metal, 100 ft', 214, 28, 12, 'Conduit & Raceway', 'Liquidtight', 'Electri-Flex', 'coil'],
    [5, 'EMT-CPL-034', '3/4" EMT Set-Screw Coupling', 2, 2400, 500, 'Conduit & Raceway', 'EMT', 'Thomas & Betts', 'ea'],
    [6, 'THHN-12-BLK-500', '12 AWG THHN Copper, Black, 500 ft', 118, 64, 20, 'Wire & Cable', 'THHN', 'Southwire', 'coil'],
    [7, 'MC-122-250', '12/2 MC Armored Cable, 250 ft', 246, 36, 10, 'Wire & Cable', 'MC Cable', 'Southwire', 'coil'],
    [8, 'SOOW-124-250', '12/4 SOOW Portable Cord, 250 ft', 412, 5, 6, 'Wire & Cable', 'Portable Cord', 'Carol', 'coil'],
    [9, 'IEC-C32-24', 'IEC Contactor, 32A, 24V Coil', 96, 42, 15, 'Control & Automation', 'Contactors', 'Eaton', 'ea'],
    [10, 'VFD-5HP-480', 'AC Drive, 5 HP, 480V', 1185, 3, 4, 'Control & Automation', 'Drives', 'ABB', 'ea'],
    [11, 'PLC-CPU-24', 'Compact PLC CPU, 24 I/O', 640, 11, 4, 'Control & Automation', 'PLC', 'Allen-Bradley', 'ea'],
    [12, 'PSU-24-10', 'DIN Rail Power Supply, 24VDC 10A', 168, 7, 8, 'Control & Automation', 'Power Supplies', 'Phoenix Contact', 'ea'],
    [13, 'PE-SEN-M18', 'M18 Photoelectric Sensor, PNP', 74, 55, 20, 'Control & Automation', 'Sensors', 'Banner', 'ea'],
    [14, 'HB-LED-150', 'LED High Bay, 150W, 5000K', 189, 48, 16, 'Lighting', 'LED Fixtures', 'Lithonia', 'ea'],
    [15, 'EM-COMBO-LED', 'LED Emergency Combo Unit', 62, 9, 12, 'Lighting', 'Emergency', 'Lithonia', 'ea'],
    [16, 'VT-LED-4', '4 ft LED Vapor Tight Fixture', 98, 30, 10, 'Lighting', 'LED Fixtures', 'RAB', 'ea'],
    [17, 'EMT-050-10', '1/2" EMT Conduit, 10 ft', 6.4, 920, 200, 'Conduit & Raceway', 'EMT', 'Allied Tube', 'ea'],
    [18, 'EMT-100-10', '1" EMT Conduit, 10 ft', 14.8, 510, 120, 'Conduit & Raceway', 'EMT', 'Allied Tube', 'ea'],
    [19, 'EMT-CONN-034', '3/4" EMT Set-Screw Connector', 2.1, 1800, 400, 'Conduit & Raceway', 'EMT', 'Thomas & Betts', 'ea'],
    [20, 'EMT-STR-034', '3/4" EMT One-Hole Strap', 0.42, 3200, 800, 'Conduit & Raceway', 'EMT', 'Thomas & Betts', 'ea'],
    [21, 'GRC-100-10', '1" Galvanized Rigid Conduit, 10 ft', 42, 86, 24, 'Conduit & Raceway', 'Rigid', 'Wheatland', 'ea'],
    [22, 'GRC-CPL-200', '2" Rigid Coupling', 18.5, 70, 20, 'Conduit & Raceway', 'Rigid', 'Wheatland', 'ea'],
    [23, 'PVC-075-10', '3/4" PVC Schedule 40 Conduit, 10 ft', 7.25, 380, 80, 'Conduit & Raceway', 'PVC', 'Heritage Plastics', 'ea'],
    [24, 'PVC-CPL-100', '1" PVC Coupling', 1.35, 900, 200, 'Conduit & Raceway', 'PVC', 'Heritage Plastics', 'ea'],
    [25, 'PVC-FA-100', '1" PVC Female Adapter', 1.85, 640, 150, 'Conduit & Raceway', 'PVC', 'Cantex', 'ea'],
    [26, 'LFMC-050-100', '1/2" Liquidtight Flexible Metal, 100 ft', 164, 22, 8, 'Conduit & Raceway', 'Liquidtight', 'Electri-Flex', 'coil'],
    [27, 'FMC-050-100', '1/2" Flexible Metal Conduit, 100 ft', 78, 18, 8, 'Conduit & Raceway', 'Flexible', 'Southwire', 'coil'],
    [28, 'STRUT-158-10', '1-5/8" Strut Channel, 10 ft', 18.75, 140, 40, 'Conduit & Raceway', 'Strut & Fittings', 'B-Line', 'ea'],
    [29, 'STRUT-NUT-38', '3/8" Strut Spring Nut', 0.72, 2500, 500, 'Conduit & Raceway', 'Strut & Fittings', 'B-Line', 'ea'],
    [30, 'CLAMP-034', '3/4" Strut Conduit Clamp', 1.15, 860, 200, 'Conduit & Raceway', 'Strut & Fittings', 'B-Line', 'ea'],
    [31, 'THHN-12-WHT-500', '12 AWG THHN Copper, White, 500 ft', 118, 58, 20, 'Wire & Cable', 'THHN', 'Southwire', 'coil'],
    [32, 'THHN-12-GRN-500', '12 AWG THHN Copper, Green, 500 ft', 118, 40, 16, 'Wire & Cable', 'THHN', 'Southwire', 'coil'],
    [33, 'THHN-10-BLK-500', '10 AWG THHN Copper, Black, 500 ft', 186, 32, 12, 'Wire & Cable', 'THHN', 'Southwire', 'coil'],
    [34, 'THHN-6-BLK-500', '6 AWG THHN Copper, Black, 500 ft', 468, 14, 6, 'Wire & Cable', 'THHN', 'Southwire', 'coil'],
    [35, 'XHHW-40-BLK', '4/0 XHHW-2 Copper, Black, per ft', 8.95, 1800, 500, 'Wire & Cable', 'Building Wire', 'Southwire', 'ft'],
    [36, 'MC-123-250', '12/3 MC Armored Cable, 250 ft', 318, 20, 8, 'Wire & Cable', 'MC Cable', 'Southwire', 'coil'],
    [37, 'MC-102-250', '10/2 MC Armored Cable, 250 ft', 390, 12, 6, 'Wire & Cable', 'MC Cable', 'Southwire', 'coil'],
    [38, 'SOOW-123-250', '12/3 SOOW Portable Cord, 250 ft', 368, 8, 4, 'Wire & Cable', 'Portable Cord', 'Carol', 'coil'],
    [39, 'SOOW-104-250', '10/4 SOOW Portable Cord, 250 ft', 624, 4, 3, 'Wire & Cable', 'Portable Cord', 'Carol', 'coil'],
    [40, 'NM-142-250', '14/2 NM-B Copper, 250 ft', 96, 44, 12, 'Wire & Cable', 'Building Wire', 'Southwire', 'coil'],
    [41, 'NM-122-250', '12/2 NM-B Copper, 250 ft', 148, 28, 10, 'Wire & Cable', 'Building Wire', 'Southwire', 'coil'],
    [42, 'IEC-C18-24', 'IEC Contactor, 18A, 24V Coil', 64, 30, 10, 'Control & Automation', 'Contactors', 'Eaton', 'ea'],
    [43, 'OL-32', 'Overload Relay, 24-32A', 48, 26, 8, 'Control & Automation', 'Contactors', 'Eaton', 'ea'],
    [44, 'VFD-1HP-480', 'AC Drive, 1 HP, 480V', 485, 6, 2, 'Control & Automation', 'Drives', 'ABB', 'ea'],
    [45, 'VFD-10HP-480', 'AC Drive, 10 HP, 480V', 2140, 2, 1, 'Control & Automation', 'Drives', 'ABB', 'ea'],
    [46, 'PLC-DI-16', '16-pt 24VDC Input Module', 186, 9, 3, 'Control & Automation', 'PLC', 'Allen-Bradley', 'ea'],
    [47, 'PLC-DO-16', '16-pt Relay Output Module', 210, 8, 3, 'Control & Automation', 'PLC', 'Allen-Bradley', 'ea'],
    [48, 'PLC-AI-4', '4-ch Analog Input Module', 265, 5, 2, 'Control & Automation', 'PLC', 'Allen-Bradley', 'ea'],
    [49, 'PSU-24-5', 'DIN Rail Power Supply, 24VDC 5A', 98, 4, 6, 'Control & Automation', 'Power Supplies', 'Phoenix Contact', 'ea'],
    [50, 'PROX-M12', 'M12 Inductive Proximity, PNP', 42, 40, 12, 'Control & Automation', 'Sensors', 'Banner', 'ea'],
    [51, 'ESTOP-40', '40mm Twist-Release E-Stop', 36, 22, 8, 'Control & Automation', 'Sensors', 'Eaton', 'ea'],
    [52, 'HB-LED-240', 'LED High Bay, 240W, 5000K', 268, 18, 6, 'Lighting', 'LED Fixtures', 'Lithonia', 'ea'],
    [53, 'WRAP-4-40', '4 ft LED Wrap, 40W, 4000K', 54, 36, 12, 'Lighting', 'LED Fixtures', 'Lithonia', 'ea'],
    [54, 'TROF-22-30', '2x2 LED Troffer, 30W', 72, 24, 8, 'Lighting', 'LED Fixtures', 'Lithonia', 'ea'],
    [55, 'EXIT-LED-GRN', 'LED Exit Sign, Green', 28, 6, 8, 'Lighting', 'Emergency', 'Lithonia', 'ea'],
    [56, 'A19-9W-4PK', '9W A19 LED Lamp, 4-pack', 12, 80, 24, 'Lighting', 'Lamps', 'TCP', 'box'],
    [57, 'T8-4FT-LED', '4 ft LED T8 Tube', 8.5, 150, 40, 'Lighting', 'Lamps', 'TCP', 'ea'],
    [58, 'BOX-4SQ', '4" Square Steel Box, 2-1/8"', 2.45, 600, 150, 'Devices & Distribution', 'Boxes', 'Raco', 'ea'],
    [59, 'BOX-1G-OW', '1-Gang Old-Work Box', 1.8, 420, 100, 'Devices & Distribution', 'Boxes', 'Carlon', 'ea'],
    [60, 'DEV-20A-DUP', '20A Spec-Grade Duplex Receptacle', 4.6, 240, 60, 'Devices & Distribution', 'Devices', 'Leviton', 'ea'],
    [61, 'DEV-20A-GFCI', '20A GFCI Receptacle', 18.75, 70, 20, 'Devices & Distribution', 'Devices', 'Leviton', 'ea'],
    [62, 'BRK-20A-1P', '20A 1-Pole Circuit Breaker', 8.25, 90, 24, 'Devices & Distribution', 'Breakers', 'Eaton', 'ea'],
    [63, 'PANEL-100A', '100A 20-Space Loadcenter', 168, 7, 3, 'Devices & Distribution', 'Breakers', 'Eaton', 'ea'],
  ];
  state.products = rawProducts.map(([id, sku, name, price, stock, reorderLevel, section, subcategory, manufacturer, uom]) => ({
    id, sku, name, price, stock, reorderLevel,
    category: section,
    section,
    subcategory,
    manufacturer,
    uom,
    cost: costFor(section, price)
  }));

  state.orders = [
    stamp({
      id: 1, orderNumber: 'ORD-4418', contactId: 1, date: '2026-10-18', status: 'Confirmed',
      customerPo: 'LSE-8841', jobName: 'St. Clair Hospital', quoteId: null,
      notes: 'EMT and building wire for the addition. Release against the hospital package.',
      items: [
        { productId: 1, qty: 120, price: 9, uom: 'ea' },
        { productId: 6, qty: 8, price: 118, uom: 'coil' },
        { productId: 5, qty: 200, price: 2, uom: 'ea' },
      ]
    }),
    stamp({
      id: 2, orderNumber: 'ORD-4422', contactId: 2, date: '2026-10-22', status: 'Shipped',
      customerPo: 'TPC-1904', jobName: '24-cell starter', quoteId: null,
      notes: 'Partial release of the starter-cell quote. Balance holds for Nov 10.',
      items: [
        { productId: 9, qty: 24, price: 96, uom: 'ea' },
        { productId: 12, qty: 12, price: 168, uom: 'ea' },
      ]
    }),
    stamp({
      id: 3, orderNumber: 'ORD-4429', contactId: 4, date: '2026-10-09', status: 'Delivered',
      customerPo: 'SCT-7720', jobName: 'Municipal garage', quoteId: null,
      notes: 'High bays and emergency combos. Signed for at the DPW garage.',
      items: [
        { productId: 14, qty: 36, price: 189, uom: 'ea' },
        { productId: 15, qty: 8, price: 62, uom: 'ea' },
      ]
    }),
    stamp({
      id: 4, orderNumber: 'ORD-4436', contactId: 5, date: '2026-10-27', status: 'Confirmed',
      customerPo: 'BW-44190', jobName: 'MRO crib', quoteId: null,
      notes: 'Cord and MC for the stamping-line crib. Dock refused the first attempt.',
      items: [
        { productId: 7, qty: 6, price: 246, uom: 'coil' },
        { productId: 8, qty: 2, price: 412, uom: 'coil' },
      ]
    }),
    stamp({
      id: 5, orderNumber: 'ORD-4440', contactId: 3, date: '2026-10-28', status: 'Draft',
      customerPo: 'SFM-2208', jobName: 'Conveyor drives', quoteId: null,
      notes: 'Hold as a draft until Priya confirms the 480V startup window.',
      items: [
        { productId: 10, qty: 4, price: 1185, uom: 'ea' },
        { productId: 11, qty: 2, price: 640, uom: 'ea' },
        { productId: 13, qty: 10, price: 74, uom: 'ea' },
      ]
    }),
    stamp({
      id: 6, orderNumber: 'ORD-4444', contactId: 6, date: '2026-10-21', status: 'Shipped',
      customerPo: 'WLC-3310', jobName: 'North River phase 2', quoteId: 5,
      notes: 'Converted from Q-1005. PVC sticks on the rack, wire coils inside.',
      items: [
        { productId: 3, qty: 200, price: 11, uom: 'ea' },
        { productId: 6, qty: 10, price: 118, uom: 'coil' },
      ]
    }),
    stamp({
      id: 7, orderNumber: 'ORD-4451', contactId: 7, date: '2026-10-24', status: 'Confirmed',
      customerPo: 'HSW-118', jobName: 'Pump station 4', quoteId: null,
      notes: 'Drive, power supply, and liquidtight for the pump-station startup.',
      items: [
        { productId: 10, qty: 1, price: 1185, uom: 'ea' },
        { productId: 12, qty: 2, price: 168, uom: 'ea' },
        { productId: 4, qty: 2, price: 214, uom: 'coil' },
      ]
    }),
    stamp({
      id: 8, orderNumber: 'ORD-4458', contactId: 11, date: '2026-10-26', status: 'Delivered',
      customerPo: 'LM-1044', jobName: 'Fab cell', quoteId: null,
      notes: 'Sensors and cord for the fabrication cell. Resale certificate on file.',
      items: [
        { productId: 13, qty: 8, price: 74, uom: 'ea' },
        { productId: 8, qty: 1, price: 412, uom: 'coil' },
      ]
    }),
    stamp({
      id: 9, orderNumber: 'ORD-4466', contactId: 10, date: '2026-10-27', status: 'Cancelled',
      customerPo: '', jobName: 'Counter — wrong job', quoteId: null,
      notes: 'Rung on the wrong job at the Lapeer counter. Refunded the same afternoon. Demo card only — no card number stored.',
      items: [
        { productId: 5, qty: 10, price: 2, uom: 'ea' },
      ]
    }),
  ];

  state.quotes = [
    stamp({
      id: 1, quoteNumber: 'Q-1001', contactId: 1, status: 'Sent', date: '2026-10-20', expiryDate: '2026-11-20', orderId: null,
      notes: 'Counter revision 2 for the hospital addition. Job trailer will call releases.',
      items: [
        { productId: 1, qty: 200, price: 9, uom: 'ea' },
        { productId: 5, qty: 400, price: 2, uom: 'ea' },
        { productId: 6, qty: 16, price: 118, uom: 'coil' },
      ]
    }),
    stamp({
      id: 2, quoteNumber: 'Q-1002', contactId: 2, status: 'Accepted', date: '2026-10-18', expiryDate: '2026-11-30', orderId: null,
      notes: '24-cell starter lineup. Hold the balance for the Nov 10 release.',
      items: [
        { productId: 9, qty: 24, price: 96, uom: 'ea' },
        { productId: 12, qty: 8, price: 168, uom: 'ea' },
        { productId: 11, qty: 2, price: 640, uom: 'ea' },
      ]
    }),
    stamp({
      id: 3, quoteNumber: 'Q-1003', contactId: 4, status: 'Draft', date: '2026-10-27', expiryDate: '2026-12-05', orderId: null,
      notes: 'Submittals sent. Waiting on spec alternates for the garage high bays.',
      items: [
        { productId: 14, qty: 40, price: 189, uom: 'ea' },
        { productId: 15, qty: 12, price: 62, uom: 'ea' },
        { productId: 16, qty: 8, price: 98, uom: 'ea' },
      ]
    }),
    stamp({
      id: 4, quoteNumber: 'Q-1004', contactId: 3, status: 'Sent', date: '2026-10-25', expiryDate: '2026-11-18', orderId: null,
      notes: 'Conveyor drive package with PLC and photoeyes. Startup support extra.',
      items: [
        { productId: 10, qty: 4, price: 1185, uom: 'ea' },
        { productId: 11, qty: 2, price: 640, uom: 'ea' },
        { productId: 13, qty: 12, price: 74, uom: 'ea' },
        { productId: 12, qty: 2, price: 168, uom: 'ea' },
      ]
    }),
    stamp({
      id: 5, quoteNumber: 'Q-1005', contactId: 6, status: 'Converted', date: '2026-10-15', expiryDate: '2026-10-30', orderId: 6,
      notes: 'North River phase 2 PVC and THHN. Released as ORD-4444.',
      items: [
        { productId: 3, qty: 200, price: 11, uom: 'ea' },
        { productId: 6, qty: 10, price: 118, uom: 'coil' },
      ]
    }),
    stamp({
      id: 6, quoteNumber: 'Q-1006', contactId: 5, status: 'Expired', date: '2026-09-28', expiryDate: '2026-10-12', orderId: null,
      notes: 'Requote if the stamping line slips into Q1.',
      items: [
        { productId: 8, qty: 4, price: 412, uom: 'coil' },
        { productId: 7, qty: 6, price: 246, uom: 'coil' },
      ]
    }),
    stamp({
      id: 7, quoteNumber: 'Q-1007', contactId: 7, status: 'Draft', date: '2026-10-28', expiryDate: '2026-11-14', orderId: null,
      notes: 'Second pump. Startup is already on the board — this quote is the material.',
      items: [
        { productId: 10, qty: 2, price: 1185, uom: 'ea' },
        { productId: 4, qty: 4, price: 214, uom: 'coil' },
        { productId: 13, qty: 6, price: 74, uom: 'ea' },
      ]
    }),
    stamp({
      id: 8, quoteNumber: 'Q-1008', contactId: 10, status: 'Sent', date: '2026-10-28', expiryDate: '2026-11-20', orderId: null,
      notes: 'Imlay City temp power. EMT and 12 AWG for the subdivision trailer.',
      items: [
        { productId: 1, qty: 80, price: 9, uom: 'ea' },
        { productId: 6, qty: 4, price: 118, uom: 'coil' },
      ]
    }),
    stamp({
      id: 9, quoteNumber: 'Q-1009', contactId: 9, status: 'Draft', date: '2026-10-29', expiryDate: '2026-12-02', orderId: null,
      notes: 'Courthouse high bays. County exemption certificate GOV-LAPEER.',
      items: [
        { productId: 14, qty: 16, price: 189, uom: 'ea' },
        { productId: 15, qty: 6, price: 62, uom: 'ea' },
      ]
    }),
  ];

  state.deliveries = [
    {
      id: 1, deliveryNumber: 'DEL-2201', orderId: 2, contactId: 2,
      shipTo: 'Thumb Panel & Controls, 410 Germania St, Saginaw, MI',
      jobSite: 'Panel shop — dock 2', requestedDate: '2026-10-29', window: '7:00–10:00 AM',
      carrier: 'MEC truck', tracking: 'MEC-4422-A', status: 'Out for delivery',
      notes: '24 contactors and power supplies. Tailgate required.'
    },
    {
      id: 2, deliveryNumber: 'DEL-2202', orderId: 3, contactId: 4,
      shipTo: 'St. Clair Township DPW Garage, 5485 Gratiot, Port Huron, MI',
      jobSite: 'Municipal garage', requestedDate: '2026-10-16', window: '1:00–3:00 PM',
      carrier: 'MEC truck', tracking: 'MEC-4429-B', status: 'Delivered',
      notes: 'High bays signed for by facilities.'
    },
    {
      id: 3, deliveryNumber: 'DEL-2208', orderId: 6, contactId: 6,
      shipTo: 'Wolverine Line job trailer, North River subdivision, Marine City, MI',
      jobSite: 'North River phase 2', requestedDate: '2026-10-30', window: '10:00 AM–1:00 PM',
      carrier: 'MEC truck', tracking: 'MEC-4444-C', status: 'Scheduled',
      notes: 'PVC sticks on the rack. Wire coils inside.'
    },
    {
      id: 4, deliveryNumber: 'DEL-2210', orderId: 7, contactId: 7,
      shipTo: 'Huron Shore pump station 4, 8900 Lakeshore Rd, Oscoda, MI',
      jobSite: 'Pump station 4', requestedDate: '2026-11-03', window: '8:00–11:00 AM',
      carrier: '', tracking: '', status: 'Scheduled',
      notes: 'Hold for the startup crew. Drive stays on the truck until checked in.'
    },
    {
      id: 5, deliveryNumber: 'DEL-2194', orderId: 4, contactId: 5,
      shipTo: 'Blue Water Auto Stamping, 22000 Allen Rd, Woodhaven, MI',
      jobSite: 'MRO crib', requestedDate: '2026-10-28', window: '2:00–4:00 PM',
      carrier: 'Common carrier', tracking: '1Z9983W403', status: 'Failed',
      notes: 'Dock refused — PO stamp missing. Reschedule with Elena.'
    },
    {
      id: 6, deliveryNumber: 'DEL-2214', orderId: 1, contactId: 1,
      shipTo: 'Lakeshore Electrical laydown, St. Clair Hospital, Port Huron, MI',
      jobSite: 'Hospital addition', requestedDate: '2026-11-04', window: '6:00–8:00 AM',
      carrier: 'MEC truck', tracking: '', status: 'Scheduled',
      notes: 'Early window. Hospital receiving opens at 6.'
    },
    {
      id: 7, deliveryNumber: 'DEL-2218', orderId: 8, contactId: 11,
      shipTo: 'Lapeer Metalworks, 1840 Imlay City Rd, Lapeer, MI 48446',
      jobSite: 'Fab cell', requestedDate: '2026-10-27', window: '9:00–11:00 AM',
      carrier: 'MEC truck', tracking: 'MEC-4458-D', status: 'Delivered',
      notes: 'Sensors and one coil of cord. Signed for at receiving.'
    },
  ];
  finalizeBook();
  save();
}

function stamp(doc) {
  doc.payments = doc.payments || [];
  return doc;
}

function branchById(id) {
  return BRANCHES.find(b => b.id === String(id || '')) || null;
}
function branchName(id) {
  if (!id || id === 'all') return 'All branches';
  const branch = branchById(id);
  return branch ? branch.name : 'Branch';
}
function isManagerRole(role) {
  return role === 'manager' || role === 'admin';
}
function isManager() {
  return !!(session && isManagerRole(session.role));
}
function can(action) {
  const role = session?.role;
  if (!role) return false;
  if (action === 'void' || action === 'refund' || action === 'delete' || action === 'audit' || action === 'switch-branch') {
    return isManagerRole(role);
  }
  if (action === 'pay') return role === 'counter' || role === 'sales' || isManagerRole(role);
  if (action === 'edit-product') return role === 'warehouse' || isManagerRole(role);
  if (action === 'edit-quote' || action === 'edit-contact') return role === 'counter' || role === 'sales' || isManagerRole(role);
  if (action === 'edit-order' || action === 'edit-delivery') return true;
  if (action === 'pipeline') return role === 'sales' || isManagerRole(role);
  return false;
}
function canView(view) {
  const roles = VIEW_ROLES[view] || [];
  return !!(session && roles.includes(session.role));
}
function activeBranchId() {
  if (!session) return null;
  if (isManager()) {
    if (!session.viewBranch || session.viewBranch === 'all') return null;
    return session.viewBranch;
  }
  return session.branchId;
}
function scopeLabel() {
  const id = activeBranchId();
  if (!id) return 'All branches';
  const branch = branchById(id);
  return branch ? `${branch.name} (${branch.id})` : id;
}
function inScope(row) {
  const branchId = activeBranchId();
  if (!branchId) return true;
  return String(row?.branchId || '') === String(branchId);
}
function scopeList(list) {
  return (list || []).filter(inScope);
}
function writingBranch(explicit) {
  return explicit || activeBranchId() || session?.branchId || '1000';
}
function branchTag(row) {
  if (activeBranchId() || !row) return '';
  return `<div class="text-[11px] text-slate-400 dark:text-slate-500">${escapeHtml(branchName(row.branchId))} · ${escapeHtml(row.branchId || '')}</div>`;
}
function normalizeZip(zip) {
  const match = String(zip || '').match(/\d{5}/);
  return match ? match[0] : '';
}
function rateForZip(zip) {
  const z = normalizeZip(zip);
  if (!z) return MI_RATE;
  if (Object.prototype.hasOwnProperty.call(ZIP_RATES, z)) return ZIP_RATES[z];
  const n = Number(z);
  if (n >= 48000 && n <= 49999) return MI_RATE;
  return 0;
}
function taxQuote(subtotal, ctx) {
  const taxExempt = !!(ctx && ctx.taxExempt);
  const shipZip = normalizeZip(ctx && ctx.shipZip);
  const taxRate = taxExempt ? 0 : rateForZip(shipZip);
  const base = moneyRound(subtotal);
  const taxAmount = moneyRound(base * taxRate);
  return {
    subtotal: base,
    taxExempt,
    shipZip,
    resaleCertificate: (ctx && ctx.resaleCertificate) || '',
    taxRate,
    taxAmount,
    total: moneyRound(base + taxAmount),
  };
}
function taxCaption(ctx) {
  const priced = taxQuote(0, ctx || {});
  if (ctx && ctx.taxExempt) {
    return ctx.resaleCertificate ? `Exempt · ${ctx.resaleCertificate}` : 'Tax exempt';
  }
  const z = normalizeZip(ctx && ctx.shipZip);
  if (priced.taxRate === 0) return z ? `Outside Michigan · ${z}` : 'No Michigan tax';
  const pct = (priced.taxRate * 100).toFixed(2).replace(/\.00$/, '');
  return z ? `MI ${pct}% · ${z}` : `MI ${pct}%`;
}
function paymentNet(doc) {
  return moneyRound((doc?.payments || []).reduce((sum, pay) => sum + (Number(pay.amount) || 0), 0));
}
function paymentStatusOf(doc) {
  const payments = doc?.payments || [];
  const net = paymentNet(doc);
  const refunded = payments.reduce((sum, pay) => sum + (Number(pay.amount) < 0 ? Math.abs(Number(pay.amount)) : 0), 0);
  if (refunded > 0.009 && net <= 0.009) return 'Refunded';
  const total = Number(doc?.total) || 0;
  if (total > 0 && net + 0.009 >= total) return 'Paid';
  if (net > 0.009) return 'Partial';
  return 'Unpaid';
}
function paymentMethodOf(doc) {
  if ((doc?.paymentStatus || paymentStatusOf(doc)) === 'Refunded') return 'Refund';
  const methods = [...new Set((doc?.payments || []).filter(pay => Number(pay.amount) > 0).map(pay => pay.method))];
  if (!methods.length) return '';
  if (methods.length > 1) return 'Mixed';
  return methods[0];
}
function methodLabel(method) {
  if (method === 'Card') return 'Card (demo)';
  if (method === 'Account') return 'Account';
  if (method === 'Refund') return 'Refund';
  return method || '';
}
function refreshPayment(doc) {
  doc.payments = doc.payments || [];
  doc.amountPaid = paymentNet(doc);
  doc.paymentStatus = paymentStatusOf(doc);
  doc.paymentMethod = paymentMethodOf(doc);
  return doc;
}
function priceDoc(doc) {
  const contact = contactById(doc.contactId);
  if (doc.taxExempt == null) doc.taxExempt = !!(contact && contact.taxExempt);
  if (!normalizeZip(doc.shipZip)) doc.shipZip = (contact && contact.shipZip) || branchById(doc.branchId)?.zip || '';
  if (!doc.resaleCertificate && contact && contact.resaleCertificate) doc.resaleCertificate = contact.resaleCertificate;
  const priced = taxQuote(lineSum(doc.items), doc);
  doc.subtotal = priced.subtotal;
  doc.taxExempt = priced.taxExempt;
  doc.shipZip = normalizeZip(doc.shipZip) || priced.shipZip;
  doc.taxRate = priced.taxRate;
  doc.taxAmount = priced.taxAmount;
  doc.total = priced.total;
  doc.payments = doc.payments || [];
  refreshPayment(doc);
  return doc;
}
function seedBranchInventory() {
  state.products.forEach(p => {
    const ph = Number(p.stock) || 0;
    const map = { '1000': ph };
    const section = p.section || p.category;
    const carry = (branch, factor) => {
      map[branch] = Math.max(1, Math.round(ph * factor));
    };
    if (section === 'Control & Automation') {
      carry('2000', 0.5);
      carry('4000', 0.4);
      if (['Sensors', 'Contactors'].includes(p.subcategory) && p.price < 100) carry('3000', 0.25);
    } else if (section === 'Wire & Cable') {
      carry('2000', 0.35);
      carry('3000', 0.2);
      carry('4000', 0.3);
    } else if (section === 'Conduit & Raceway') {
      carry('2000', 0.3);
      carry('3000', 0.35);
      if (['EMT', 'PVC', 'Strut & Fittings', 'Liquidtight'].includes(p.subcategory)) carry('4000', 0.15);
    } else if (section === 'Lighting') {
      carry('3000', 0.3);
      carry('2000', 0.15);
      carry('4000', 0.2);
    } else if (section === 'Devices & Distribution') {
      carry('3000', 0.4);
      carry('2000', 0.2);
      carry('4000', 0.2);
    }
    if (String(p.sku).startsWith('VFD-') || String(p.sku).startsWith('PLC-')) delete map['3000'];
    p.stockByBranch = map;
  });
}
function pushPay(doc, amount, method, userName, at, note) {
  doc.payments = doc.payments || [];
  doc.payments.push({
    id: `pay-${doc.id}-${doc.payments.length + 1}`,
    amount: moneyRound(amount),
    method,
    at,
    userId: 'seed',
    userName,
    note: note || (method === 'Card' ? 'Processed via Stripe (demo)' : ''),
  });
}
function seedPayments() {
  const byNum = {};
  state.orders.forEach(order => { byNum[order.orderNumber] = order; });
  const pay = (num, amount, method, user, at, note) => {
    if (byNum[num]) pushPay(byNum[num], amount, method, user, at, note);
  };
  pay('ORD-4422', 2000, 'Check', 'Casey Brandt', '2026-10-22T15:10:00', 'Partial check at the Saginaw counter');
  if (byNum['ORD-4429']) pay('ORD-4429', byNum['ORD-4429'].total, 'Check', 'Jordan Hale', '2026-10-16T14:05:00', 'Township check, exemption on file');
  pay('ORD-4436', 1000, 'Account', 'Taylor Brooks', '2026-10-27T11:40:00', 'Applied to the Blue Water house account');
  if (byNum['ORD-4444']) pay('ORD-4444', byNum['ORD-4444'].total, 'Card', 'Jordan Hale', '2026-10-21T16:20:00', 'Processed via Stripe (demo)');
  if (byNum['ORD-4458']) pay('ORD-4458', byNum['ORD-4458'].total, 'Account', 'Avery Quinn', '2026-10-26T10:15:00', 'On account — resale certificate MI-RS-30991');
  if (byNum['ORD-4466']) {
    pay('ORD-4466', byNum['ORD-4466'].total, 'Card', 'Avery Quinn', '2026-10-27T09:05:00', 'Processed via Stripe (demo)');
    pay('ORD-4466', -byNum['ORD-4466'].total, 'Refund', 'Riley Cho', '2026-10-27T15:40:00', 'Full refund of the mis-rung counter ticket. No card number stored.');
  }
  state.orders.forEach(refreshPayment);
  state.quotes.forEach(refreshPayment);
}
function finalizeBook() {
  state.contacts.forEach(contact => {
    const tax = CONTACT_TAX[contact.id] || {};
    contact.branchId = contact.branchId || CONTACT_BRANCH[contact.id] || '1000';
    if (contact.shipZip == null || contact.shipZip === '') contact.shipZip = tax.shipZip || branchById(contact.branchId)?.zip || '';
    if (contact.taxExempt == null) contact.taxExempt = !!tax.taxExempt;
    if (contact.resaleCertificate == null) contact.resaleCertificate = tax.resaleCertificate || '';
  });
  state.deals.forEach(deal => {
    deal.branchId = deal.branchId || contactById(deal.contactId)?.branchId || '1000';
  });
  state.tasks.forEach(task => {
    const deal = state.deals.find(item => item.id == task.dealId);
    task.branchId = task.branchId || deal?.branchId || '1000';
  });
  state.activities.forEach(activity => {
    activity.branchId = activity.branchId || contactById(activity.contactId)?.branchId || '1000';
  });
  seedBranchInventory();
  state.quotes.forEach(quote => {
    quote.branchId = quote.branchId || contactById(quote.contactId)?.branchId || '1000';
    quote.payments = quote.payments || [];
    priceDoc(quote);
  });
  state.orders.forEach(order => {
    order.branchId = order.branchId || contactById(order.contactId)?.branchId || '1000';
    order.payments = order.payments || [];
    priceDoc(order);
  });
  seedPayments();
  state.deliveries.forEach(delivery => {
    const order = orderById(delivery.orderId);
    delivery.branchId = delivery.branchId || order?.branchId || contactById(delivery.contactId)?.branchId || '1000';
  });
  seedAuditIfEmpty();
}
function branchCarries(product, branchId) {
  if (!product) return false;
  if (!branchId) return true;
  return Object.prototype.hasOwnProperty.call(product.stockByBranch || {}, String(branchId));
}
function onHand(product, branchId) {
  if (!product) return 0;
  const map = product.stockByBranch;
  if (!map) return Number(product.stock) || 0;
  const id = branchId === undefined ? activeBranchId() : branchId;
  if (!id) return Object.values(map).reduce((sum, qty) => sum + (Number(qty) || 0), 0);
  return Number(map[id] || 0);
}
function reorderPoint(product, branchId) {
  const base = Number(product?.reorderLevel) || 0;
  if (!branchId || branchId === '1000') return base;
  return Math.max(1, Math.round(base * 0.25));
}
function isLowStock(product, branchId) {
  const id = branchId === undefined ? activeBranchId() : branchId;
  if (!id) return BRANCHES.some(branch => branchCarries(product, branch.id) && onHand(product, branch.id) <= reorderPoint(product, branch.id));
  if (!branchCarries(product, id)) return false;
  return onHand(product, id) <= reorderPoint(product, id);
}
function productInScope(product) {
  const branchId = activeBranchId();
  if (!branchId) return true;
  return branchCarries(product, branchId);
}
function readAudit() {
  try {
    const rows = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
    return Array.isArray(rows) ? rows : [];
  } catch (err) {
    return [];
  }
}
function seedAuditIfEmpty() {
  if (localStorage.getItem(AUDIT_KEY)) return;
  const rows = [
    { id: 'aud-1', at: '2026-10-16T14:05:00', userId: 'u-ph-counter', userName: 'Jordan Hale', role: 'counter', branchId: '1000', action: 'payment', detail: 'ORD-4429 Unpaid → Paid · Check · exemption GOV-SCT-DPW' },
    { id: 'aud-2', at: '2026-10-21T16:20:00', userId: 'u-ph-counter', userName: 'Jordan Hale', role: 'counter', branchId: '1000', action: 'payment', detail: 'ORD-4444 Unpaid → Paid · Card · Processed via Stripe (demo)' },
    { id: 'aud-3', at: '2026-10-22T15:10:00', userId: 'u-sg-counter', userName: 'Casey Brandt', role: 'counter', branchId: '2000', action: 'payment', detail: 'ORD-4422 Unpaid → Partial · Check · $2,000.00' },
    { id: 'aud-4', at: '2026-10-26T10:15:00', userId: 'u-lp-counter', userName: 'Avery Quinn', role: 'counter', branchId: '3000', action: 'payment', detail: 'ORD-4458 Unpaid → Paid · Account' },
    { id: 'aud-5', at: '2026-10-27T09:05:00', userId: 'u-lp-counter', userName: 'Avery Quinn', role: 'counter', branchId: '3000', action: 'payment', detail: 'ORD-4466 Unpaid → Paid · Card · Processed via Stripe (demo)' },
    { id: 'aud-6', at: '2026-10-27T11:40:00', userId: 'u-lv-counter', userName: 'Taylor Brooks', role: 'counter', branchId: '4000', action: 'payment', detail: 'ORD-4436 Unpaid → Partial · Account · $1,000.00' },
    { id: 'aud-7', at: '2026-10-27T15:40:00', userId: 'u-mgr', userName: 'Riley Cho', role: 'manager', branchId: '3000', action: 'refund', detail: 'ORD-4466 Paid → Refunded · full refund of the mis-rung Lapeer ticket' },
    { id: 'aud-8', at: '2026-10-27T15:41:00', userId: 'u-mgr', userName: 'Riley Cho', role: 'manager', branchId: '3000', action: 'void', detail: 'ORD-4466 cancelled after the refund' },
  ];
  localStorage.setItem(AUDIT_KEY, JSON.stringify(rows));
}
function audit(action, detail) {
  const log = readAudit();
  log.unshift({
    id: uid(),
    at: new Date().toISOString(),
    userId: session?.userId || '',
    userName: session?.name || 'System',
    role: session?.role || '',
    branchId: activeBranchId() || session?.branchId || '',
    action,
    detail: detail || '',
  });
  localStorage.setItem(AUDIT_KEY, JSON.stringify(log.slice(0, 200)));
}
function saveSession() {
  if (!session) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
function readStoredSession() {
  try {
    const raw = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (!raw || !raw.userId) return null;
    const user = DEMO_USERS.find(item => item.id === raw.userId);
    if (!user) return null;
    raw.role = user.role;
    raw.name = user.name;
    raw.branchId = user.branchId;
    raw.branchName = branchName(user.branchId);
    raw.username = user.username;
    if (!isManagerRole(raw.role)) raw.viewBranch = raw.branchId;
    if (!raw.viewBranch) raw.viewBranch = raw.branchId;
    return raw;
  } catch (err) {
    return null;
  }
}
function sessionStale(raw) {
  return !raw || Date.now() - Number(raw.lastActivity || 0) > IDLE_MS;
}
function deny(message) {
  toast('Not allowed in this demo', message || 'A manager or admin has to do that. This gate is not server-side security.', 'warn');
}

function uid() { return Date.now() + Math.random().toString(36).slice(2, 7); }

function moneyRound(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}
function lineSum(items) {
  return moneyRound((items || []).reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0));
}
function lineTotal(qty, price) {
  return moneyRound((Number(qty) || 0) * (Number(price) || 0));
}
function formatMoney(n) {
  const v = Number(n) || 0;
  const cents = Math.abs(v - Math.round(v)) > 0.001;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(v);
}
function formatPct(n) {
  if (n == null || Number.isNaN(Number(n))) return '—';
  const r = Math.round(Number(n) * 10) / 10;
  return `${Number.isInteger(r) ? r.toFixed(0) : r.toFixed(1)}%`;
}
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function plusDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function isPastDate(iso) {
  return !!iso && iso < today();
}
function contactById(id) { return state.contacts.find(c => c.id == id); }
function productById(id) { return state.products.find(p => p.id == id); }
function quoteById(id) { return state.quotes.find(q => q.id == id); }
function orderById(id) { return state.orders.find(o => o.id == id); }
function deliveryById(id) { return state.deliveries.find(d => d.id == id); }
function quoteOrder(q) {
  if (!q || q.orderId == null || q.orderId === '') return null;
  return orderById(q.orderId);
}
function productSection(p) { return p?.section || p?.category || 'Other'; }
function productSub(p) { return p?.subcategory || ''; }
function productLabel(p) { return p ? `${p.sku} — ${p.name}` : ''; }
function lineLabel(item) {
  const p = productById(item?.productId);
  if (p) return productLabel(p);
  return item?.productId ? 'Removed SKU' : '';
}
function orderLabel(o) {
  const c = contactById(o.contactId);
  const who = c?.company || c?.name || 'Customer';
  return `${o.orderNumber} — ${who}${o.jobName ? ' · ' + o.jobName : ''}`;
}
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
function pill(text, cls) {
  return `<span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}">${escapeHtml(text)}</span>`;
}
function nextNumber(list, field, prefix, floor) {
  let max = (floor || 1) - 1;
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('^' + escaped + '(\\d+)$');
  (list || []).forEach(item => {
    const match = String(item[field] || '').match(re);
    if (match) max = Math.max(max, parseInt(match[1], 10));
  });
  return prefix + (max + 1);
}
function cloneItems(items) {
  return (items || []).map(i => ({
    productId: i.productId,
    qty: Number(i.qty) || 0,
    uom: i.uom || productById(i.productId)?.uom || 'ea',
    price: Number(i.price) || 0
  }));
}
function priceOut(items) {
  let subtotal = 0;
  let cost = 0;
  let costed = 0;
  let lines = 0;
  (items || []).forEach(i => {
    const qty = Number(i.qty) || 0;
    const price = Number(i.price) || 0;
    if (!i.productId || qty <= 0) return;
    lines += 1;
    subtotal += qty * price;
    const product = productById(i.productId);
    if (product && product.cost != null && product.cost !== '') {
      cost += qty * Number(product.cost);
      costed += 1;
    }
  });
  subtotal = moneyRound(subtotal);
  cost = moneyRound(cost);
  const known = lines > 0 && costed === lines;
  const margin = known ? moneyRound(subtotal - cost) : null;
  const marginPct = known && subtotal ? (margin / subtotal) * 100 : null;
  return { subtotal, total: subtotal, cost: known ? cost : null, margin, marginPct, lines };
}
function commitsStock(status) {
  return status === 'Confirmed' || status === 'Shipped' || status === 'Delivered';
}
function qtyByProduct(items) {
  const map = {};
  (items || []).forEach(i => {
    if (i.productId == null || i.productId === '') return;
    const key = String(i.productId);
    map[key] = (map[key] || 0) + (Number(i.qty) || 0);
  });
  return map;
}
function adjustStock(productId, deltaQty, branchId) {
  if (!deltaQty) return;
  const product = productById(productId);
  if (!product) return;
  const branch = String(branchId || '1000');
  product.stockByBranch = product.stockByBranch || {};
  const next = Math.round(((Number(product.stockByBranch[branch]) || 0) - deltaQty) * 1000) / 1000;
  product.stockByBranch[branch] = next;
  if (branch === '1000') product.stock = next;
}
function syncOrderStock(prev, next) {
  const branch = (next || prev)?.branchId || activeBranchId() || '1000';
  const before = prev && commitsStock(prev.status) ? qtyByProduct(prev.items) : {};
  const after = next && commitsStock(next.status) ? qtyByProduct(next.items) : {};
  const ids = new Set([...Object.keys(before), ...Object.keys(after)]);
  ids.forEach(id => adjustStock(id, (after[id] || 0) - (before[id] || 0), branch));
}
function suggestShipTo(contactId) {
  const existing = state.deliveries.find(d => d.contactId == contactId && d.shipTo);
  if (existing) return existing.shipTo;
  if (DEFAULT_SHIP_TO[contactId]) return DEFAULT_SHIP_TO[contactId];
  const contact = contactById(contactId);
  if (!contact) return '';
  return `${contact.company || contact.name} — ship-to pending`;
}
function customerBits(contactId) {
  const contact = contactById(contactId);
  return { name: contact?.name || '—', company: contact?.company || '', contact };
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
function iconBtn(action, id, icon, label, tone) {
  const toneCls = tone === 'danger'
    ? 'hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-300'
    : 'hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-100';
  return `<button type="button" data-action="${action}" data-id="${escapeHtml(id)}" class="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-400 ${toneCls}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}"><i class="fa-solid ${icon} text-xs pointer-events-none"></i></button>`;
}
function actionCluster(html) {
  return `<div class="flex items-center justify-end gap-0.5">${html}</div>`;
}
function statusChips(statuses, active, action) {
  const all = [{ id: '*', label: 'All' }, ...statuses.map(s => ({ id: s, label: s }))];
  return `<div class="flex flex-wrap gap-1.5">${all.map(s => {
    const on = (s.id === '*' && !active) || s.id === active;
    const cls = on
      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800';
    return `<button type="button" data-action="${action}" data-id="${escapeHtml(s.id)}" class="px-2.5 py-1 rounded-full text-xs font-medium ${cls}">${escapeHtml(s.label)}</button>`;
  }).join('')}</div>`;
}
function contactOptions(selected, branchId) {
  const branch = branchId === undefined ? activeBranchId() : branchId;
  const list = state.contacts.filter(c => !branch || String(c.branchId) === String(branch) || c.id == selected);
  return `<option value="">Select customer</option>` + list.map(c =>
    `<option value="${escapeHtml(c.id)}" ${c.id == selected ? 'selected' : ''}>${escapeHtml(c.name)}${c.company ? ` (${escapeHtml(c.company)})` : ''}</option>`
  ).join('');
}
function statusOptions(list, selected) {
  return list.map(s => `<option ${s === selected ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('');
}
function uomOptions(selected) {
  const current = selected || 'ea';
  const opts = UOMS.includes(current) ? UOMS : [current, ...UOMS];
  return opts.map(u => `<option value="${escapeHtml(u)}" ${u === current ? 'selected' : ''}>${escapeHtml(u)}</option>`).join('');
}

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
  const toggleTheme = () => {
    const dark = document.documentElement.classList.contains('dark');
    localStorage.setItem(THEME_KEY, dark ? 'light' : 'dark');
    syncTheme();
  };
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  const loginTheme = document.getElementById('login-theme');
  if (loginTheme) loginTheme.addEventListener('click', toggleTheme);
}
function toast(title, detail, tone) {
  const wrap = document.getElementById('toasts');
  if (!wrap) return;
  while (wrap.children.length >= 4) wrap.firstChild.remove();
  const warn = tone === 'warn';
  const el = document.createElement('div');
  el.className = 'toast-item pointer-events-none flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-800';
  const bubble = warn
    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200'
    : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300';
  el.innerHTML = `
    <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${bubble}">
      <i class="fa-solid ${warn ? 'fa-exclamation' : 'fa-check'} text-[10px]"></i>
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

function syncNav() {
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.toggle('active', link.dataset.view === state.currentView);
  });
}
function gotoView(view) {
  if (!view || !VIEWS.includes(view) || !canView(view)) return;
  state.currentView = view;
  closeSidebar(false);
  save();
  render();
}
function render() {
  if (!session) return;
  if (!canView(state.currentView)) state.currentView = 'dashboard';
  const content = document.getElementById('content');
  const same = renderedView === state.currentView;
  const scroll = same ? content.scrollTop : 0;
  renderedView = state.currentView;
  syncNav();
  const q = state.search || '';
  switch (state.currentView) {
    case 'dashboard': content.innerHTML = renderDashboard(); break;
    case 'pipeline': content.innerHTML = renderPipeline(q); setupDragDrop(); break;
    case 'quotes': content.innerHTML = renderQuotes(q); break;
    case 'contacts': content.innerHTML = renderContacts(q); break;
    case 'tasks': content.innerHTML = renderTasks(q); break;
    case 'products': content.innerHTML = renderProducts(q); break;
    case 'orders': content.innerHTML = renderOrders(q); break;
    case 'deliveries': content.innerHTML = renderDeliveries(q); setupDeliveryBoard(); break;
    case 'audit': content.innerHTML = renderAudit(); break;
    default:
      state.currentView = 'dashboard';
      content.innerHTML = renderDashboard();
  }
  if (same) content.scrollTop = scroll;
}

function linkCard(title, body, view, icon, color) {
  return `
    <button type="button" data-goto="${view}" class="lift-card ${CARD} p-4 flex items-center gap-3 text-left w-full h-full">
      <span class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}"><i class="fa-solid ${icon}"></i></span>
      <span class="min-w-0">
        <span class="block text-sm font-semibold">${title}</span>
        <span class="block text-xs text-slate-500 dark:text-slate-400">${body}</span>
      </span>
    </button>`;
}
function renderDashboard() {
  const deals = scopeList(state.deals);
  const tasks = scopeList(state.tasks);
  const products = state.products.filter(productInScope);
  const orders = scopeList(state.orders);
  const quotes = scopeList(state.quotes);
  const deliveries = scopeList(state.deliveries);
  const contacts = scopeList(state.contacts);
  const totalValue = deals.filter(d => !d.stage.includes('Closed')).reduce((s, d) => s + d.value, 0);
  const won = deals.filter(d => d.stage === 'Closed Won').reduce((s, d) => s + d.value, 0);
  const openTasks = tasks.filter(t => !t.done).length;
  const lowStock = products.filter(p => isLowStock(p));
  const openOrders = orders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length;
  const openQuoteList = quotes.filter(q => ['Draft', 'Sent', 'Accepted'].includes(q.status));
  const openQuoteValue = openQuoteList.reduce((s, q) => s + (Number(q.total) || 0), 0);
  const activeDeliveries = deliveries.filter(d => d.status === 'Scheduled' || d.status === 'Out for delivery');
  const outNow = deliveries.filter(d => d.status === 'Out for delivery').length;
  const activity = scopeList(state.activities).slice(0, 5).map(a => `
    <div class="flex gap-3 text-sm">
      <div class="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0"></div>
      <div class="min-w-0">
        <div class="text-slate-700 dark:text-slate-200">${escapeHtml(a.text)}</div>
        <div class="text-xs text-slate-400 dark:text-slate-500">${escapeHtml(a.time)}</div>
      </div>
    </div>`).join('');
  const stockShown = lowStock.slice(0, 8);
  const stockRows = stockShown.map(p => `
    <div class="flex justify-between gap-3 text-sm p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60">
      <div class="min-w-0">
        <div class="font-medium truncate">${escapeHtml(p.name)}</div>
        <div class="text-xs text-slate-400 dark:text-slate-500">${escapeHtml(p.sku)}</div>
      </div>
      <div class="text-orange-600 dark:text-orange-300 font-medium shrink-0">${onHand(p) < 0 ? `${Math.abs(onHand(p))} backorder` : `${onHand(p)} left`}</div>
    </div>`).join('');
  return `
    <div class="space-y-6">
      ${pageHeader('Dashboard', `${escapeHtml(scopeLabel())} · opportunities, quotes, releases, and the shelf for this view`)}
      <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        ${statCard('Pipeline', formatMoney(totalValue), 'fa-dollar-sign', 'text-emerald-600 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/50')}
        ${statCard('Won', formatMoney(won), 'fa-trophy', 'text-amber-600 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/50')}
        ${statCard('Open Tasks', openTasks, 'fa-list-check', 'text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/50')}
        ${statCard('Contacts', contacts.length, 'fa-users', 'text-violet-600 bg-violet-50 dark:text-violet-300 dark:bg-violet-950/50')}
        ${statCard('Low Stock', lowStock.length, 'fa-exclamation-triangle', 'text-orange-600 bg-orange-50 dark:text-orange-300 dark:bg-orange-950/50')}
        ${statCard('Open Orders', openOrders, 'fa-shopping-cart', 'text-indigo-600 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950/50')}
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        ${linkCard('Open quotes', `${openQuoteList.length} in play · ${formatMoney(openQuoteValue)}`, 'quotes', 'fa-file-invoice-dollar', 'text-indigo-600 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950/50')}
        ${linkCard('Deliveries', `${activeDeliveries.length} active · ${outNow} out now`, 'deliveries', 'fa-truck', 'text-sky-600 bg-sky-50 dark:text-sky-300 dark:bg-sky-950/50')}
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
            ${stockRows || emptyNote('fa-circle-check', 'Shelf is healthy for this view. Nothing carried here is at or under its reorder point.')}
            ${lowStock.length > stockShown.length ? `<p class="px-2 pt-2 text-xs text-slate-400 dark:text-slate-500">${lowStock.length - stockShown.length} more SKUs are at or under the reorder point.</p>` : ''}
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
  const filtered = scopeList(state.deals).filter(d =>
    !q || d.title.toLowerCase().includes(q) || (contactById(d.contactId)?.name || '').toLowerCase().includes(q)
  );
  const board = (q && filtered.length === 0)
    ? `<div class="${CARD}">${emptyState('fa-columns', 'No matching deals', `Nothing in the pipeline matches “${escapeHtml(q)}”.`)}</div>`
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
                  : `<div class="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-black/10 px-3 text-center text-xs text-slate-400 dark:border-white/10 dark:text-slate-500">No deals</div>`}
              </div>
            </div>`;
        }).join('')}
      </div>`;
  return `
    <div class="space-y-4">
      ${pageHeader('Pipeline', `${escapeHtml(scopeLabel())} · job packages, panel builds, retrofits, and stock agreements`, 'Deal', 'openAddDeal()')}
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

function taxChip(contact) {
  if (contact?.taxExempt) {
    const cert = contact.resaleCertificate ? ` · ${contact.resaleCertificate}` : '';
    return pill(`Exempt${cert}`, 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200');
  }
  return pill(contact?.shipZip ? `Taxable · ${contact.shipZip}` : 'Taxable', ORDER_STATUS_CLASS.Draft);
}
function renderContacts(q) {
  const filtered = scopeList(state.contacts).filter(c =>
    !q || [c.name, c.company, c.email, c.resaleCertificate, c.shipZip].join(' ').toLowerCase().includes(q)
  );
  const body = filtered.length === 0
    ? `<div class="${CARD}">${q
        ? emptyState('fa-users', 'No matching accounts', `Nothing matches “${escapeHtml(q)}”. Try another name, company, or email.`)
        : emptyState('fa-users', 'No accounts yet', 'Add a contractor, plant, OEM, or municipal buyer.', 'Add contact', 'openAddContact()')}</div>`
    : responsiveList(
        filtered.map(c => `
          <div class="flex items-center gap-3 p-3 cursor-pointer" data-action="edit-contact" data-id="${escapeHtml(c.id)}">
            ${avatarChip(c.name)}
            <div class="min-w-0 flex-1">
              <div class="font-medium text-slate-800 dark:text-slate-100 truncate">${escapeHtml(c.name)}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400 truncate">${escapeHtml(c.company || '—')}${c.title ? ` · ${escapeHtml(c.title)}` : ''}</div>
              <div class="mt-1 flex flex-wrap gap-1">${taxChip(c)}</div>
              ${branchTag(c)}
            </div>
          </div>`).join(''),
        dataTable(
          ['Name', 'Company', 'Tax', 'Title'],
          filtered.map(c => `
            <tr class="${ROW} cursor-pointer" data-action="edit-contact" data-id="${escapeHtml(c.id)}">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3 min-w-0">
                  ${avatarChip(c.name)}
                  <span class="min-w-0">
                    <span class="block font-medium text-slate-800 dark:text-slate-100 truncate">${escapeHtml(c.name)}</span>
                    ${branchTag(c)}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300">${escapeHtml(c.company)}</td>
              <td class="px-4 py-3">${taxChip(c)}</td>
              <td class="px-4 py-3 text-slate-500 dark:text-slate-400">${escapeHtml(c.title || '')}</td>
            </tr>`).join(''),
          'min-w-[40rem]'
        )
      );
  return `
    <div class="space-y-4">
      ${pageHeader('Contacts', `${escapeHtml(scopeLabel())} · ${filtered.length} buyers. Exemption and resale certificates sit on the account.`, 'Contact', 'openAddContact()')}
      ${body}
    </div>`;
}

function renderTasks(q) {
  const filtered = scopeList(state.tasks).filter(t => !q || t.title.toLowerCase().includes(q));
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

function setupDragDrop() {
  const board = document.getElementById('kanban');
  if (!board) return;
  const cards = board.querySelectorAll('.kanban-card');
  const columns = board.querySelectorAll('.kanban-column');
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
      if (deal && stage && deal.stage !== stage) {
        deal.stage = stage;
        addActivity(`Moved "${deal.title}" to ${stage}`);
        save();
        toast('Deal moved', `${deal.title} → ${stage}`);
        render();
      }
    });
  });
}
function addActivity(text, branchId) {
  state.activities.unshift({
    id: uid(),
    text,
    time: 'Just now',
    branchId: branchId || writingBranch(),
  });
  if (state.activities.length > 40) state.activities.pop();
}

function quoteActions(q) {
  const linked = quoteOrder(q);
  const mid = linked
    ? iconBtn('open-order', linked.id, 'fa-arrow-up-right-from-square', `Open ${linked.orderNumber}`)
    : iconBtn('convert-quote', q.id, 'fa-share', 'Convert to order');
  return actionCluster([
    iconBtn('edit-quote', q.id, 'fa-pen', 'Edit quote'),
    mid,
    iconBtn('delete-quote', q.id, 'fa-trash', 'Delete quote', 'danger'),
  ].join(''));
}
function quoteMatches(q, quote) {
  if (quoteUi.status && quote.status !== quoteUi.status) return false;
  if (!q) return true;
  const c = contactById(quote.contactId);
  const skus = (quote.items || []).map(i => {
    const p = productById(i.productId);
    return p ? `${p.sku} ${p.name}` : '';
  }).join(' ');
  return [quote.quoteNumber, quote.status, quote.notes, c?.name, c?.company, skus].join(' ').toLowerCase().includes(q);
}
function renderQuotes(q) {
  const filtered = scopeList(state.quotes).filter(item => quoteMatches(q, item))
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || String(b.quoteNumber).localeCompare(String(a.quoteNumber)));
  const chips = statusChips(QUOTE_STATUSES, quoteUi.status, 'quote-status');
  const body = filtered.length === 0
    ? `<div class="${CARD}">${q || quoteUi.status
        ? emptyState('fa-file-invoice-dollar', 'No matching quotes', 'Try another status, customer, or SKU.')
        : emptyState('fa-file-invoice-dollar', 'No quotes yet', 'Write a multi-line quote, then convert it when the job releases.', 'Add quote', 'openAddQuote()')}</div>`
    : responsiveList(
        filtered.map(item => {
          const bits = customerBits(item.contactId);
          const past = (isPastDate(item.expiryDate) && !['Converted'].includes(item.status)) || item.status === 'Expired';
          return `
            <div class="p-3 space-y-2 cursor-pointer" data-action="edit-quote" data-id="${escapeHtml(item.id)}">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="font-medium text-slate-800 dark:text-slate-100">${escapeHtml(item.quoteNumber)}</div>
                  <div class="text-xs text-slate-500 dark:text-slate-400 truncate">${escapeHtml(bits.name)}${bits.company ? ` · ${escapeHtml(bits.company)}` : ''}</div>
                </div>
                <div class="text-right shrink-0">
                  <div class="text-sm font-medium tabular-nums">${formatMoney(item.total)}</div>
                  <div class="text-[11px] text-slate-400 dark:text-slate-500">${item.taxExempt ? 'Exempt' : `Tax ${formatMoney(item.taxAmount || 0)}`}</div>
                  <div class="mt-1 flex flex-col items-end gap-1">${pill(item.status, QUOTE_STATUS_CLASS[item.status] || ORDER_STATUS_CLASS.Draft)}${pill(item.paymentStatus || 'Unpaid', PAY_STATUS_CLASS[item.paymentStatus] || PAY_STATUS_CLASS.Unpaid)}</div>
                </div>
              </div>
              <div class="flex items-center justify-between gap-2">
                <div class="text-xs ${past ? 'text-rose-600 dark:text-rose-300' : 'text-slate-400 dark:text-slate-500'}">${(item.items || []).length} lines · exp ${escapeHtml(item.expiryDate || '—')}</div>
                ${quoteActions(item)}
              </div>
            </div>`;
        }).join(''),
        dataTable(
          ['Quote', 'Customer', 'Status', 'Expires', 'Lines', 'Total', 'Payment', '<span class="sr-only">Actions</span>'],
          filtered.map(item => {
            const bits = customerBits(item.contactId);
            const past = (isPastDate(item.expiryDate) && item.status !== 'Converted') || item.status === 'Expired';
            return `
              <tr class="${ROW} cursor-pointer" data-action="edit-quote" data-id="${escapeHtml(item.id)}">
                <td class="px-4 py-3 font-medium text-slate-800 dark:text-slate-100 whitespace-nowrap">${escapeHtml(item.quoteNumber)}</td>
                <td class="px-4 py-3">
                  <div class="text-slate-800 dark:text-slate-100">${escapeHtml(bits.name)}</div>
                  <div class="text-xs text-slate-400 dark:text-slate-500">${escapeHtml(bits.company)}</div>
                  ${branchTag(item)}
                </td>
                <td class="px-4 py-3">${pill(item.status, QUOTE_STATUS_CLASS[item.status] || ORDER_STATUS_CLASS.Draft)}</td>
                <td class="px-4 py-3 whitespace-nowrap ${past ? 'text-rose-600 dark:text-rose-300' : 'text-slate-600 dark:text-slate-300'}">${escapeHtml(item.expiryDate || '—')}</td>
                <td class="px-4 py-3 text-slate-600 dark:text-slate-300">${(item.items || []).length}</td>
                <td class="px-4 py-3 font-medium tabular-nums">
                  <div>${formatMoney(item.total)}</div>
                  <div class="text-[11px] font-normal text-slate-400 dark:text-slate-500">${item.taxExempt ? 'Exempt' : `Tax ${formatMoney(item.taxAmount || 0)}`}</div>
                </td>
                <td class="px-4 py-3">${pill(item.paymentStatus || 'Unpaid', PAY_STATUS_CLASS[item.paymentStatus] || PAY_STATUS_CLASS.Unpaid)}</td>
                <td class="px-4 py-3">${quoteActions(item)}</td>
              </tr>`;
          }).join(''),
          'min-w-[56rem]'
        )
      );
  return `
    <div class="space-y-4">
      ${pageHeader('Quotes', `${escapeHtml(scopeLabel())} · line items, Michigan tax, then a release when the job is ready.`, can('edit-quote') ? 'Quote' : '', can('edit-quote') ? 'openAddQuote()' : '')}
      ${chips}
      ${body}
    </div>`;
}

function catalogTree() {
  const sections = CATALOG.map(c => ({ section: c.section, subs: [...c.subs] }));
  state.products.forEach(p => {
    const section = productSection(p);
    let node = sections.find(s => s.section === section);
    if (!node) {
      node = { section, subs: [] };
      sections.push(node);
    }
    const sub = productSub(p);
    if (sub && !node.subs.includes(sub)) node.subs.push(sub);
  });
  return sections;
}
function filterProducts({ section, sub, mfr, q }) {
  return state.products.filter(productInScope).filter(p => {
    if (section && productSection(p) !== section) return false;
    if (sub && productSub(p) !== sub) return false;
    if (mfr && p.manufacturer !== mfr) return false;
    if (!q) return true;
    return [p.sku, p.name, p.category, p.section, p.subcategory, p.manufacturer, p.uom].join(' ').toLowerCase().includes(q);
  });
}
function sortProducts(list) {
  const rows = [...list];
  const by = catalogUi.sort;
  rows.sort((a, b) => {
    if (by === 'sku') return a.sku.localeCompare(b.sku);
    if (by === 'price-asc') return a.price - b.price || a.name.localeCompare(b.name);
    if (by === 'price-desc') return b.price - a.price || a.name.localeCompare(b.name);
    if (by === 'stock') return onHand(a) - onHand(b) || a.name.localeCompare(b.name);
    if (by === 'manufacturer') return (a.manufacturer || '').localeCompare(b.manufacturer || '') || a.name.localeCompare(b.name);
    return a.name.localeCompare(b.name);
  });
  return rows;
}
function catCount(section, sub) {
  return filterProducts({
    section,
    sub,
    mfr: catalogUi.manufacturer,
    q: catalogUi.query
  }).length;
}
function navBtn(label, count, on, action, id, nested) {
  const cls = on
    ? 'bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950/50 dark:text-blue-200'
    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800';
  const pad = nested ? 'pl-8' : 'pl-3';
  const dim = count === 0 && !on ? 'opacity-50' : '';
  return `<button type="button" data-action="${action}" data-id="${escapeHtml(id)}" class="w-full flex items-center justify-between gap-2 ${pad} pr-3 py-2 rounded-lg text-sm ${cls} ${dim}">
    <span class="truncate text-left">${escapeHtml(label)}</span>
    <span class="text-xs tabular-nums ${on ? 'text-blue-500 dark:text-blue-300' : 'text-slate-400'}">${count}</span>
  </button>`;
}
function pagerHtml(page, pages, total) {
  if (!total) return '';
  const from = (page - 1) * catalogUi.pageSize + 1;
  const to = Math.min(total, page * catalogUi.pageSize);
  const btn = (id, label, disabled) => `<button type="button" data-action="cat-page" data-id="${id}" ${disabled ? 'disabled' : ''} class="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium disabled:opacity-40 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">${label}</button>`;
  return `
    <div class="flex items-center justify-between gap-3">
      <div class="text-xs text-slate-500 dark:text-slate-400">Showing ${from}–${to} of ${total}</div>
      <div class="flex items-center gap-1.5">
        ${btn('prev', 'Prev', page <= 1)}
        <span class="text-xs tabular-nums text-slate-500 dark:text-slate-400 px-1">${page} / ${pages}</span>
        ${btn('next', 'Next', page >= pages)}
      </div>
    </div>`;
}
function stockText(p) {
  const uom = p.uom || 'ea';
  const qty = onHand(p);
  const body = qty < 0 ? `${Math.abs(qty)} ${uom} backorder` : `${qty} ${uom}`;
  if (activeBranchId()) return body;
  const parts = BRANCHES.filter(branch => branchCarries(p, branch.id)).map(branch => `${branch.short} ${onHand(p, branch.id)}`);
  return parts.length > 1 ? `${body} total · ${parts.join(' · ')}` : body;
}
function renderProducts(q) {
  if (catalogUi.query !== q) {
    catalogUi.query = q;
    catalogUi.page = 1;
  }
  const tree = catalogTree();
  const base = filterProducts({ section: catalogUi.section, sub: catalogUi.subcategory, mfr: '', q });
  const mfrs = [...new Set(base.map(p => p.manufacturer).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  if (catalogUi.manufacturer && !mfrs.includes(catalogUi.manufacturer)) catalogUi.manufacturer = '';
  let rows = catalogUi.manufacturer ? base.filter(p => p.manufacturer === catalogUi.manufacturer) : base.slice();
  rows = sortProducts(rows);
  const pages = Math.max(1, Math.ceil(rows.length / catalogUi.pageSize) || 1);
  if (catalogUi.page > pages) catalogUi.page = pages;
  if (catalogUi.page < 1) catalogUi.page = 1;
  const start = (catalogUi.page - 1) * catalogUi.pageSize;
  const pageRows = rows.slice(start, start + catalogUi.pageSize);
  const nav = `
    <aside class="w-full lg:w-60 shrink-0 lg:sticky lg:top-0">
      <div class="${CARD} p-2 max-h-[40vh] lg:max-h-[70vh] overflow-y-auto space-y-0.5">
        ${navBtn('All sections', catCount('', ''), !catalogUi.section, 'cat-section', '*', false)}
        ${tree.map(node => {
          const on = catalogUi.section === node.section;
          const subs = on ? node.subs.map(sub => navBtn(sub, catCount(node.section, sub), catalogUi.subcategory === sub, 'cat-sub', sub, true)).join('') : '';
          return navBtn(node.section, catCount(node.section, ''), on, 'cat-section', node.section, false) + subs;
        }).join('')}
      </div>
    </aside>`;
  const toolbar = `
    <div class="flex flex-col sm:flex-row sm:items-center gap-2">
      <select id="catalog-mfr" aria-label="Manufacturer" class="${FIELD} sm:w-56">
        <option value="">All manufacturers</option>
        ${mfrs.map(m => `<option value="${escapeHtml(m)}" ${m === catalogUi.manufacturer ? 'selected' : ''}>${escapeHtml(m)}</option>`).join('')}
      </select>
      <select id="catalog-sort" aria-label="Sort" class="${FIELD} sm:w-52">
        ${[
          ['name', 'Sort by name'],
          ['sku', 'Sort by SKU'],
          ['price-asc', 'Price: low to high'],
          ['price-desc', 'Price: high to low'],
          ['stock', 'On-hand'],
          ['manufacturer', 'Manufacturer'],
        ].map(([value, label]) => `<option value="${value}" ${catalogUi.sort === value ? 'selected' : ''}>${label}</option>`).join('')}
      </select>
    </div>`;
  const productActions = p => actionCluster([
    iconBtn('edit-product', p.id, 'fa-pen', 'Edit product'),
    iconBtn('delete-product', p.id, 'fa-trash', 'Delete product', 'danger'),
  ].join(''));
  const list = pageRows.length === 0
    ? `<div class="${CARD}">${state.products.length
        ? `<div class="px-6 py-14 text-center">
            <p class="font-medium text-slate-800 dark:text-slate-100">No SKUs in this slice</p>
            <p class="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">${q ? `Nothing matches “${escapeHtml(q)}” with these filters.` : 'Nothing in this section, subcategory, or manufacturer.'}</p>
            <button type="button" data-action="cat-clear" class="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Clear filters</button>
          </div>`
        : emptyState('fa-box', 'No SKUs yet', 'Add conduit, wire, controls, or lighting.', 'Add product', 'openAddProduct()')}</div>`
    : `
      ${responsiveList(
        pageRows.map(p => {
          const low = isLowStock(p);
          return `
            <div class="p-3 cursor-pointer ${low ? 'bg-orange-50 dark:bg-orange-950/30' : ''}" data-action="edit-product" data-id="${escapeHtml(p.id)}">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="font-medium text-slate-800 dark:text-slate-100 truncate">${escapeHtml(p.name)}</div>
                  <div class="text-xs text-slate-500 dark:text-slate-400 truncate">${escapeHtml(p.sku)} · ${escapeHtml(productSection(p))}${p.subcategory ? ` › ${escapeHtml(p.subcategory)}` : ''}</div>
                  <div class="text-xs text-slate-400 dark:text-slate-500 truncate">${escapeHtml(p.manufacturer || '—')}</div>
                </div>
                <div class="text-right shrink-0">
                  <div class="text-sm font-medium tabular-nums">${formatMoney(p.price)}</div>
                  <div class="text-xs ${low ? 'text-orange-600 dark:text-orange-300 font-medium' : 'text-slate-400 dark:text-slate-500'}">${escapeHtml(stockText(p))}</div>
                </div>
              </div>
              <div class="mt-2 flex justify-end">${productActions(p)}</div>
            </div>`;
        }).join(''),
        dataTable(
          ['SKU', 'Product', 'Manufacturer', 'Price', 'On hand', 'Reorder', '<span class="sr-only">Actions</span>'],
          pageRows.map(p => `
            <tr class="${ROW} cursor-pointer ${isLowStock(p) ? 'bg-orange-50 hover:bg-orange-100/70 dark:bg-orange-950/30 dark:hover:bg-orange-950/50' : ''}" data-action="edit-product" data-id="${escapeHtml(p.id)}">
              <td class="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">${escapeHtml(p.sku)}</td>
              <td class="px-4 py-3">
                <div class="font-medium text-slate-800 dark:text-slate-100">${escapeHtml(p.name)}</div>
                <div class="text-xs text-slate-400 dark:text-slate-500">${escapeHtml(productSection(p))}${p.subcategory ? ` › ${escapeHtml(p.subcategory)}` : ''}</div>
              </td>
              <td class="px-4 py-3 text-slate-600 dark:text-slate-300">${escapeHtml(p.manufacturer || '—')}</td>
              <td class="px-4 py-3 tabular-nums whitespace-nowrap">${formatMoney(p.price)}</td>
              <td class="px-4 py-3 font-medium whitespace-nowrap ${isLowStock(p) ? 'text-orange-600 dark:text-orange-300' : ''}">${escapeHtml(stockText(p))}</td>
              <td class="px-4 py-3 text-slate-500 dark:text-slate-400">${p.reorderLevel} ${escapeHtml(p.uom || '')}</td>
              <td class="px-4 py-3">${productActions(p)}</td>
            </tr>`).join(''),
          'min-w-[52rem]'
        )
      )}
      ${pagerHtml(catalogUi.page, pages, rows.length)}`;
  const visibleProducts = state.products.filter(productInScope);
  const sectionCount = new Set(visibleProducts.map(productSection)).size;
  return `
    <div class="space-y-4">
      ${pageHeader('Products & Inventory', `${escapeHtml(scopeLabel())} · ${visibleProducts.length} SKUs across ${sectionCount} sections · on-hand is this branch`, can('edit-product') ? 'Product' : '', can('edit-product') ? 'openAddProduct()' : '')}
      <div class="flex flex-col lg:flex-row gap-4 items-start">
        ${nav}
        <div class="flex-1 min-w-0 space-y-3 w-full">
          ${toolbar}
          ${list}
        </div>
      </div>
    </div>`;
}

function orderActions(o) {
  return actionCluster([
    iconBtn('edit-order', o.id, 'fa-pen', 'Edit order'),
    iconBtn('add-delivery', o.id, 'fa-truck', 'Add delivery'),
    iconBtn('delete-order', o.id, 'fa-trash', 'Delete order', 'danger'),
  ].join(''));
}
function orderMatches(q, order) {
  if (orderUi.status && order.status !== orderUi.status) return false;
  if (!q) return true;
  const c = contactById(order.contactId);
  const skus = (order.items || []).map(i => {
    const p = productById(i.productId);
    return p ? `${p.sku} ${p.name}` : '';
  }).join(' ');
  const from = order.quoteId ? (quoteById(order.quoteId)?.quoteNumber || '') : '';
  return [order.orderNumber, order.status, order.customerPo, order.jobName, order.notes, c?.name, c?.company, skus, from].join(' ').toLowerCase().includes(q);
}
function renderOrders(q) {
  const filtered = scopeList(state.orders).filter(o => orderMatches(q, o))
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || String(b.orderNumber).localeCompare(String(a.orderNumber)));
  const chips = statusChips(ORDER_STATUSES, orderUi.status, 'order-status');
  const body = filtered.length === 0
    ? `<div class="${CARD}">${q || orderUi.status
        ? emptyState('fa-shopping-cart', 'No matching orders', 'Try another status, PO, job, or SKU.')
        : emptyState('fa-shopping-cart', 'No orders yet', 'Release stocked SKUs to a contractor, plant, or OEM.', 'Add order', 'openAddOrder()')}</div>`
    : responsiveList(
        filtered.map(o => {
          const bits = customerBits(o.contactId);
          return `
            <div class="p-3 space-y-2 cursor-pointer" data-action="edit-order" data-id="${escapeHtml(o.id)}">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="font-medium text-slate-800 dark:text-slate-100">${escapeHtml(o.orderNumber)}</div>
                  <div class="text-xs text-slate-500 dark:text-slate-400 truncate">${escapeHtml(bits.name)}${o.jobName ? ` · ${escapeHtml(o.jobName)}` : ''}</div>
                  <div class="text-xs text-slate-400 dark:text-slate-500 truncate">${o.customerPo ? `PO ${escapeHtml(o.customerPo)} · ` : ''}${(o.items || []).length} lines</div>
                </div>
                <div class="text-right shrink-0">
                  <div class="text-sm font-medium tabular-nums">${formatMoney(o.total)}</div>
                  <div class="text-[11px] text-slate-400 dark:text-slate-500">${o.taxExempt ? 'Exempt' : `Tax ${formatMoney(o.taxAmount || 0)}`}</div>
                  <div class="mt-1 flex flex-col items-end gap-1">
                    ${pill(o.status, ORDER_STATUS_CLASS[o.status] || ORDER_STATUS_CLASS.Draft)}
                    ${pill(o.paymentStatus || 'Unpaid', PAY_STATUS_CLASS[o.paymentStatus] || PAY_STATUS_CLASS.Unpaid)}
                  </div>
                </div>
              </div>
              <div class="flex justify-end">${orderActions(o)}</div>
            </div>`;
        }).join(''),
        dataTable(
          ['Order', 'Customer', 'Job / PO', 'Status', 'Lines', 'Total', 'Payment', '<span class="sr-only">Actions</span>'],
          filtered.map(o => {
            const bits = customerBits(o.contactId);
            const from = o.quoteId ? quoteById(o.quoteId) : null;
            return `
              <tr class="${ROW} cursor-pointer" data-action="edit-order" data-id="${escapeHtml(o.id)}">
                <td class="px-4 py-3">
                  <div class="font-medium text-slate-800 dark:text-slate-100 whitespace-nowrap">${escapeHtml(o.orderNumber)}</div>
                  ${from ? `<div class="text-[11px] text-violet-600 dark:text-violet-300">${escapeHtml(from.quoteNumber)}</div>` : ''}
                </td>
                <td class="px-4 py-3">
                  <div>${escapeHtml(bits.name)}</div>
                  <div class="text-xs text-slate-400 dark:text-slate-500">${escapeHtml(bits.company)}</div>
                  ${branchTag(o)}
                </td>
                <td class="px-4 py-3">
                  <div class="text-slate-700 dark:text-slate-200">${escapeHtml(o.jobName || '—')}</div>
                  <div class="text-xs text-slate-400 dark:text-slate-500">${o.customerPo ? `PO ${escapeHtml(o.customerPo)}` : ''}</div>
                </td>
                <td class="px-4 py-3">${pill(o.status, ORDER_STATUS_CLASS[o.status] || ORDER_STATUS_CLASS.Draft)}</td>
                <td class="px-4 py-3 text-slate-600 dark:text-slate-300">${(o.items || []).length}</td>
                <td class="px-4 py-3 font-medium tabular-nums">
                  <div>${formatMoney(o.total)}</div>
                  <div class="text-[11px] font-normal text-slate-400 dark:text-slate-500">${o.taxExempt ? 'Exempt' : `Tax ${formatMoney(o.taxAmount || 0)}`}</div>
                </td>
                <td class="px-4 py-3">
                  ${pill(o.paymentStatus || 'Unpaid', PAY_STATUS_CLASS[o.paymentStatus] || PAY_STATUS_CLASS.Unpaid)}
                  ${o.paymentMethod ? `<div class="mt-1 text-[11px] text-slate-400 dark:text-slate-500">${escapeHtml(methodLabel(o.paymentMethod))}</div>` : ''}
                </td>
                <td class="px-4 py-3">${orderActions(o)}</td>
              </tr>`;
          }).join(''),
          'min-w-[52rem]'
        )
      );
  return `
    <div class="space-y-4">
      ${pageHeader('Orders', `${escapeHtml(scopeLabel())} · ${scopeList(state.orders).length} releases · tax and payment status on each ticket`, 'Order', 'openAddOrder()')}
      ${chips}
      ${body}
    </div>`;
}

function deliveryBlob(d) {
  const order = orderById(d.orderId);
  const c = contactById(d.contactId);
  return [d.deliveryNumber, d.status, d.shipTo, d.jobSite, d.carrier, d.tracking, d.window, d.notes, order?.orderNumber, order?.jobName, c?.name, c?.company].join(' ').toLowerCase();
}
function renderDeliveries(q) {
  const filtered = scopeList(state.deliveries).filter(d => !q || deliveryBlob(d).includes(q));
  const board = (q && filtered.length === 0)
    ? `<div class="${CARD}">${emptyState('fa-truck', 'No matching deliveries', `Nothing matches “${escapeHtml(q)}”.`)}</div>`
    : `<div class="flex gap-3 sm:gap-4 overflow-x-auto pb-4">
        ${DELIVERY_STATUSES.map(status => {
          const meta = DELIVERY_META[status];
          const rows = filtered
            .filter(d => d.status === status)
            .sort((a, b) => String(a.requestedDate || '').localeCompare(String(b.requestedDate || '')));
          return `
            <div class="kanban-column delivery-column w-72 shrink-0 rounded-2xl p-3 border ${meta.column}" data-dstatus="${escapeHtml(status)}">
              <div class="flex justify-between items-center gap-2 mb-3 px-1">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="h-2 w-2 rounded-full shrink-0 ${meta.dot}"></span>
                  <div class="font-medium text-sm truncate ${meta.label}">${escapeHtml(status)}</div>
                </div>
                <div class="text-xs text-slate-500 dark:text-slate-400 shrink-0">${rows.length}</div>
              </div>
              <div class="space-y-2 min-h-[180px]">
                ${rows.length ? rows.map(deliveryCard).join('') : `<div class="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-black/10 px-3 text-center text-xs text-slate-400 dark:border-white/10 dark:text-slate-500">No stops</div>`}
              </div>
            </div>`;
        }).join('')}
      </div>`;
  return `
    <div class="space-y-4">
      ${pageHeader('Deliveries', `${escapeHtml(scopeLabel())} · job-site drops and counter runs tied back to the order`, 'Delivery', 'openAddDelivery()')}
      ${board}
    </div>`;
}
function deliveryCard(d) {
  const order = orderById(d.orderId);
  const bits = customerBits(d.contactId);
  return `
    <div class="kanban-card delivery-card bg-white rounded-xl p-3 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-700 cursor-pointer" draggable="true" data-delivery="${escapeHtml(d.id)}" title="Edit delivery">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="font-medium text-sm text-slate-800 dark:text-slate-100">${escapeHtml(d.deliveryNumber)}</div>
          <div class="text-xs text-primary truncate">${escapeHtml(order?.orderNumber || 'Order removed')}</div>
        </div>
        ${iconBtn('delete-delivery', d.id, 'fa-trash', 'Delete delivery', 'danger')}
      </div>
      <div class="text-xs text-slate-500 dark:text-slate-400 mt-2 truncate">${escapeHtml(bits.company || bits.name)}</div>
      <div class="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">${escapeHtml(d.shipTo || 'Ship-to pending')}</div>
      <div class="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-slate-400 dark:text-slate-500">
        <span>${escapeHtml(d.requestedDate || 'No date')}</span>
        ${d.window ? `<span>${escapeHtml(d.window)}</span>` : ''}
      </div>
      ${d.carrier || d.tracking ? `<div class="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">${escapeHtml([d.carrier, d.tracking].filter(Boolean).join(' · '))}</div>` : ''}
    </div>`;
}
function armIgnoreClick() {
  ignoreNextClick = true;
  clearTimeout(ignoreTimer);
  ignoreTimer = setTimeout(() => { ignoreNextClick = false; }, 280);
}
function setupDeliveryBoard() {
  const cards = document.querySelectorAll('.delivery-card');
  const columns = document.querySelectorAll('.delivery-column');
  cards.forEach(card => {
    card.addEventListener('dragstart', e => {
      armIgnoreClick();
      e.dataTransfer.setData('text/plain', card.dataset.delivery);
      card.classList.add('opacity-50');
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('opacity-50');
      armIgnoreClick();
    });
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
      const id = e.dataTransfer.getData('text/plain');
      const status = col.dataset.dstatus;
      const delivery = deliveryById(id);
      if (delivery && status && delivery.status !== status) {
        delivery.status = status;
        addActivity(`${delivery.deliveryNumber} is ${status}`);
        save();
        toast('Delivery updated', `${delivery.deliveryNumber} → ${status}`);
        render();
      }
    });
  });
}

function setModalSize(size) {
  const panel = document.getElementById('modal-panel');
  panel.classList.remove('max-w-md', 'max-w-lg', 'max-w-4xl');
  panel.classList.add(size === 'xl' ? 'max-w-4xl' : size === 'lg' ? 'max-w-lg' : 'max-w-md');
}
function openModal(title, html, size) {
  hideSkuPopover();
  activeDoc = null;
  setModalSize(size || 'md');
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
  activeDoc = null;
  hideSkuPopover();
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

function openContactModal(record) {
  if (!can('edit-contact')) {
    deny('Contacts are maintained by counter, sales, manager, and admin.');
    return;
  }
  const branch = record?.branchId || writingBranch();
  const branchControl = isManager() && !record
    ? `<label class="block"><span class="${LABEL}">Branch</span>
        <select name="branchId" class="${FIELD}">
          ${BRANCHES.map(item => `<option value="${item.id}" ${item.id === branch ? 'selected' : ''}>${escapeHtml(item.name)} · ${item.id}</option>`).join('')}
        </select>
      </label>`
    : `<input type="hidden" name="branchId" value="${escapeHtml(branch)}" />
       <p class="text-xs text-slate-400 dark:text-slate-500">${escapeHtml(branchName(branch))} · ${escapeHtml(branch)}</p>`;
  openModal(record ? 'Edit contact' : 'Add Contact', `
    <form id="contact-form" class="space-y-3">
      ${branchControl}
      <input name="name" required placeholder="Full name" value="${escapeHtml(record?.name || '')}" class="${FIELD}" />
      <input name="email" type="email" required placeholder="Email" value="${escapeHtml(record?.email || '')}" class="${FIELD}" />
      <input name="company" placeholder="Company" value="${escapeHtml(record?.company || '')}" class="${FIELD}" />
      <input name="title" placeholder="Title" value="${escapeHtml(record?.title || '')}" class="${FIELD}" />
      <input name="phone" placeholder="Phone" value="${escapeHtml(record?.phone || '')}" class="${FIELD}" />
      <label class="block"><span class="${LABEL}">Ship-to ZIP</span>
        <input name="shipZip" inputmode="numeric" maxlength="10" value="${escapeHtml(record?.shipZip || branchById(branch)?.zip || '')}" placeholder="48060" class="${FIELD}" />
      </label>
      <label class="flex items-center gap-2 text-sm">
        <input name="taxExempt" type="checkbox" class="h-4 w-4 accent-blue-600" ${record?.taxExempt ? 'checked' : ''} />
        Tax exempt
      </label>
      <label class="block"><span class="${LABEL}">Resale / exemption certificate</span>
        <input name="resaleCertificate" value="${escapeHtml(record?.resaleCertificate || '')}" placeholder="MI-RS- or GOV-" class="${FIELD}" />
      </label>
      <p class="text-[11px] text-slate-400 dark:text-slate-500">Exemption is copied onto new quotes and orders when you pick this customer. It does not rewrite tickets already saved.</p>
      ${formActions('Save')}
    </form>
  `, 'lg');
  document.getElementById('contact-form').onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = String(fd.get('name') || '');
    const contact = record || { id: uid() };
    contact.name = name;
    contact.email = String(fd.get('email') || '');
    contact.company = String(fd.get('company') || '');
    contact.title = String(fd.get('title') || '');
    contact.phone = String(fd.get('phone') || '');
    contact.branchId = String(fd.get('branchId') || branch);
    contact.shipZip = normalizeZip(fd.get('shipZip')) || branchById(contact.branchId)?.zip || '';
    contact.taxExempt = !!e.target.taxExempt?.checked;
    contact.resaleCertificate = String(fd.get('resaleCertificate') || '');
    if (!record) {
      state.contacts.push(contact);
      addActivity(`Added contact ${name}`, contact.branchId);
    }
    save();
    closeModal();
    toast('Contact saved', name);
    render();
  };
}
function openAddContact() { openContactModal(null); }
function openAddDeal() {
  openModal('Add Deal', `
    <form id="deal-form" class="space-y-3">
      <input name="title" required placeholder="Job package, panel build, stock agreement" class="${FIELD}" />
      <input name="value" type="number" required placeholder="Value ($)" class="${FIELD}" />
      <select name="contactId" required class="${FIELD}">
        ${contactOptions('')}
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
    const contactId = fd.get('contactId');
    const contact = contactById(contactId);
    state.deals.push({
      id: uid(),
      title,
      value: Number(fd.get('value')),
      contactId,
      branchId: contact?.branchId || writingBranch(),
      stage: fd.get('stage'),
      closeDate: fd.get('closeDate') || ''
    });
    addActivity(`Created deal "${title}"`, contact?.branchId || writingBranch());
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
      done: false,
      branchId: writingBranch(),
    });
    save();
    closeModal();
    toast('Task saved', title);
    render();
  };
}

function linesFrom(items) {
  const source = items && items.length ? items : [{ qty: 1, uom: 'ea', price: 0, productId: '' }];
  return source.map(item => ({
    key: uid(),
    productId: item.productId || '',
    qty: item.qty != null ? item.qty : 1,
    uom: item.uom || productById(item.productId)?.uom || 'ea',
    price: item.price != null && item.price !== '' ? item.price : (productById(item.productId)?.price || 0),
  }));
}
function formatMoneyExact(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);
}
function summaryHtml(items, taxCtx) {
  const totals = priceOut(items);
  const priced = taxQuote(totals.subtotal, taxCtx || {});
  const margin = totals.margin == null
    ? `<div class="flex justify-between gap-3 text-slate-400"><span>Est. margin</span><span>Add cost on each SKU</span></div>`
    : `<div class="flex justify-between gap-3"><span class="text-slate-500 dark:text-slate-400">Est. margin</span><span class="font-medium text-emerald-700 dark:text-emerald-300 tabular-nums">${formatMoney(totals.margin)} · ${formatPct(totals.marginPct)}</span></div>`;
  return `
    <div class="rounded-xl bg-slate-50 dark:bg-slate-800/70 px-3 py-3 space-y-1.5 text-sm">
      <div class="flex justify-between gap-3"><span class="text-slate-500 dark:text-slate-400">Subtotal</span><span class="tabular-nums">${formatMoneyExact(priced.subtotal)}</span></div>
      <div class="flex justify-between gap-3"><span class="text-slate-500 dark:text-slate-400">Tax</span><span class="tabular-nums text-right">${formatMoneyExact(priced.taxAmount)}<span class="block text-[11px] text-slate-400 dark:text-slate-500">${escapeHtml(taxCaption(taxCtx || {}))}</span></span></div>
      ${margin}
      <div class="flex justify-between gap-3 border-t border-slate-200 dark:border-slate-700 pt-1.5"><span class="font-medium">Total</span><span class="font-semibold tabular-nums">${formatMoneyExact(priced.total)}</span></div>
      <p class="text-[11px] text-slate-400 dark:text-slate-500">Demo Michigan tax from the ship-to ZIP. Margin stays pre-tax. Nothing here calls Stripe Tax.</p>
    </div>`;
}
function lineRowHtml(line) {
  const label = line.productId ? lineLabel(line) : '';
  return `
    <div data-line="${escapeHtml(line.key)}" data-product-id="${escapeHtml(line.productId)}" class="grid grid-cols-12 gap-2 items-start">
      <div class="col-span-12 sm:col-span-5">
        <input class="sku-search ${FIELD}" value="${escapeHtml(label)}" placeholder="SKU or product name" autocomplete="off" spellcheck="false" aria-label="Product" />
      </div>
      <div class="col-span-3 sm:col-span-1">
        <input class="line-qty ${FIELD}" type="number" min="1" step="1" inputmode="numeric" value="${escapeHtml(line.qty)}" aria-label="Quantity" placeholder="Qty" />
      </div>
      <div class="col-span-4 sm:col-span-2">
        <select class="line-uom ${FIELD}" aria-label="Unit of measure">${uomOptions(line.uom)}</select>
      </div>
      <div class="col-span-3 sm:col-span-2">
        <input class="line-price ${FIELD}" type="number" min="0" step="0.01" inputmode="decimal" value="${escapeHtml(line.price)}" aria-label="Unit price" placeholder="Price" />
      </div>
      <div class="col-span-2 sm:col-span-2 flex items-center justify-end gap-1 pt-2">
        <span class="line-total text-sm font-medium tabular-nums">${formatMoney(lineTotal(line.qty, line.price))}</span>
        <button type="button" data-doc-action="remove-line" class="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40" aria-label="Remove line"><i class="fa-solid fa-times text-xs pointer-events-none"></i></button>
      </div>
    </div>`;
}
function renderDocLines(lines) {
  const host = document.getElementById('line-host');
  if (!host) return;
  host.innerHTML = lines.map(lineRowHtml).join('');
  paintSummary(lines);
}
function paintLine(row, line) {
  const el = row.querySelector('.line-total');
  if (el) el.textContent = formatMoney(lineTotal(line.qty, line.price));
}
function currentTaxCtx() {
  const form = document.getElementById('doc-form');
  if (!form) return { shipZip: '', taxExempt: false, resaleCertificate: '' };
  return {
    shipZip: form.shipZip ? form.shipZip.value : '',
    taxExempt: !!(form.taxExempt && form.taxExempt.checked),
    resaleCertificate: form.resaleCertificate ? form.resaleCertificate.value : '',
  };
}
function paintSummary(lines) {
  const el = document.getElementById('doc-summary');
  if (!el) return;
  el.innerHTML = summaryHtml(lines.map(l => ({
    productId: l.productId,
    qty: Number(l.qty) || 0,
    price: Number(l.price) || 0
  })), currentTaxCtx());
}
function setFormError(msg) {
  const el = document.getElementById('form-error');
  if (!el) return;
  el.textContent = msg || '';
  el.classList.toggle('hidden', !msg);
}
function docKicker(kind, record) {
  if (!record) {
    return `<p class="text-xs text-slate-400 dark:text-slate-500">${kind === 'quote' ? 'Quote number' : 'Order number'} is assigned when you save.</p>`;
  }
  const num = kind === 'quote' ? record.quoteNumber : record.orderNumber;
  const from = kind === 'order' && record.quoteId ? quoteById(record.quoteId) : null;
  return `<div class="flex items-baseline justify-between gap-2">
    <div class="text-sm font-semibold">${escapeHtml(num)}</div>
    ${from ? `<div class="text-xs text-violet-600 dark:text-violet-300">From ${escapeHtml(from.quoteNumber)}</div>` : ''}
  </div>`;
}
function quoteBanner(record) {
  const order = record ? quoteOrder(record) : null;
  if (!order) return '';
  return `<div class="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-950 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-100 flex items-center justify-between gap-3">
    <span>Converted to ${escapeHtml(order.orderNumber)}. Editing lines here does not change the release.</span>
    <button type="button" data-doc-action="open-order" data-id="${escapeHtml(order.id)}" class="shrink-0 font-medium underline">Open</button>
  </div>`;
}
function orderDeliveryNote(record) {
  if (!record) return '';
  const rows = state.deliveries.filter(d => d.orderId == record.id);
  if (!rows.length) return '';
  const bits = rows.map(d => `${escapeHtml(d.deliveryNumber)} · ${escapeHtml(d.status)}`).join(', ');
  return `<div class="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-950 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100">Deliveries: ${bits}</div>`;
}
function docFooter(kind, record) {
  const linked = kind === 'quote' && record && quoteOrder(record);
  const del = record
    ? `<button type="button" data-doc-action="delete" class="mr-auto px-3 py-2 text-sm text-rose-600 rounded-lg hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40">Delete</button>`
    : '<span class="mr-auto"></span>';
  let extra = '';
  if (kind === 'quote' && !linked) {
    extra = `<button type="button" data-doc-action="convert" class="px-3 py-2 text-sm font-medium text-emerald-700 rounded-lg hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40">Convert to order</button>`;
  }
  if (kind === 'order') {
    extra = `<button type="button" data-doc-action="delivery" class="px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Add delivery</button>`;
  }
  return `
    <div class="flex flex-wrap items-center justify-end gap-2 pt-1">
      ${del}
      <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
      ${extra}
      <button type="submit" class="px-4 py-2 text-sm bg-primary hover:bg-blue-700 text-white rounded-lg">Save</button>
    </div>`;
}
function docBranch(record) {
  return record?.branchId || writingBranch();
}
function branchField(record) {
  const current = docBranch(record);
  if (!isManager()) {
    return `<input type="hidden" name="branchId" value="${escapeHtml(current)}" />`;
  }
  if (record) {
    return `<input type="hidden" name="branchId" value="${escapeHtml(current)}" />
      <p class="sm:col-span-2 text-xs text-slate-400 dark:text-slate-500">${escapeHtml(branchName(current))} · ${escapeHtml(current)}</p>`;
  }
  return `<label class="block sm:col-span-2"><span class="${LABEL}">Branch</span>
    <select name="branchId" class="${FIELD}">
      ${BRANCHES.map(branch => `<option value="${branch.id}" ${branch.id === current ? 'selected' : ''}>${escapeHtml(branch.name)} · ${branch.id}</option>`).join('')}
    </select>
  </label>`;
}
function taxFields(record) {
  const zip = record?.shipZip || branchById(docBranch(record))?.zip || '';
  return `
      <label class="block"><span class="${LABEL}">Ship-to ZIP</span>
        <input name="shipZip" inputmode="numeric" maxlength="10" value="${escapeHtml(zip)}" placeholder="48060" class="${FIELD}" />
      </label>
      <label class="flex items-center gap-2 sm:pt-5">
        <input name="taxExempt" type="checkbox" class="h-4 w-4 accent-blue-600" ${record?.taxExempt ? 'checked' : ''} />
        <span class="text-sm">Tax exempt</span>
      </label>
      <label class="block sm:col-span-2"><span class="${LABEL}">Resale / exemption certificate</span>
        <input name="resaleCertificate" value="${escapeHtml(record?.resaleCertificate || '')}" placeholder="MI-RS-22018 or GOV-SCT-DPW" class="${FIELD}" />
      </label>`;
}
function formatWhen(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || '';
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
function payPanelHtml(record) {
  if (!record) {
    return `<p class="text-[11px] text-slate-400 dark:text-slate-500">Save the ticket, then collect payment. Card is a demo tender — no card number field.</p>`;
  }
  const status = record.paymentStatus || 'Unpaid';
  const net = paymentNet(record);
  const balance = Math.max(0, moneyRound((Number(record.total) || 0) - net));
  const rows = (record.payments || []).map(pay => `
    <li class="flex justify-between gap-3 text-xs">
      <span class="min-w-0 text-slate-500 dark:text-slate-400">${escapeHtml(methodLabel(pay.method))} · ${escapeHtml(pay.userName || '')} · ${escapeHtml(formatWhen(pay.at))}</span>
      <span class="shrink-0 tabular-nums ${Number(pay.amount) < 0 ? 'text-rose-600 dark:text-rose-300' : ''}">${formatMoneyExact(pay.amount)}</span>
    </li>
    ${pay.note ? `<li class="text-[11px] text-slate-400 dark:text-slate-500">${escapeHtml(pay.note)}</li>` : ''}`).join('');
  const collect = can('pay') && balance > 0.009 && status !== 'Refunded'
    ? `<button type="button" data-doc-action="toggle-pay" class="text-sm font-medium text-primary hover:text-blue-700">Collect payment</button>
       <div id="collect-box" class="is-collapsed grid sm:grid-cols-2 gap-2 pt-1">
         <label class="block"><span class="${LABEL}">Amount</span>
           <input name="payAmount" type="number" min="0.01" step="0.01" value="${balance.toFixed(2)}" class="${FIELD}" />
         </label>
         <label class="block"><span class="${LABEL}">Method</span>
           <select name="payMethod" class="${FIELD}">
             <option>Cash</option>
             <option>Check</option>
             <option value="Card">Card (demo)</option>
             <option value="Account">Account (on account)</option>
           </select>
         </label>
         <p id="card-note" class="hidden sm:col-span-2 text-[11px] text-slate-500 dark:text-slate-400">Processed via Stripe (demo). This does not charge a card, and there is nowhere to type a card number.</p>
         <div class="sm:col-span-2"><button type="button" data-doc-action="apply-payment" class="px-3 py-1.5 text-sm bg-primary hover:bg-blue-700 text-white rounded-lg">Record payment</button></div>
       </div>`
    : '';
  const refund = can('refund') && net > 0.009
    ? `<button type="button" data-doc-action="refund" class="text-sm font-medium text-rose-600 dark:text-rose-300">Refund</button>`
    : '';
  return `
    <div id="pay-panel" class="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-3 space-y-2">
      <div class="flex items-center justify-between gap-2">
        <span class="text-sm font-medium">Payment</span>
        ${pill(status, PAY_STATUS_CLASS[status] || PAY_STATUS_CLASS.Unpaid)}
      </div>
      <div class="flex justify-between text-sm"><span class="text-slate-500 dark:text-slate-400">Paid</span><span class="tabular-nums">${formatMoneyExact(Math.max(0, net))}</span></div>
      <div class="flex justify-between text-sm"><span class="text-slate-500 dark:text-slate-400">Balance</span><span class="tabular-nums">${formatMoneyExact(balance)}</span></div>
      ${rows ? `<ul class="space-y-1 border-t border-slate-100 dark:border-slate-800 pt-2">${rows}</ul>` : '<p class="text-[11px] text-slate-400 dark:text-slate-500">No tenders yet.</p>'}
      <div class="flex flex-wrap items-center gap-3">${collect}${refund}</div>
    </div>`;
}
function docFormHtml(kind, record) {
  const isQuote = kind === 'quote';
  const branch = docBranch(record);
  const hint = isQuote
    ? 'Converting copies lines, ship-to ZIP, and the exemption onto a draft order, and schedules a delivery stub.'
    : 'Shelf stock at this branch commits when status is Confirmed, Shipped, or Delivered. Cancelling needs a manager. Card payments are a demo tender — never a real charge.';
  const fields = isQuote ? `
      ${branchField(record)}
      <label class="block"><span class="${LABEL}">Customer</span>
        <select name="contactId" required class="${FIELD}">${contactOptions(record?.contactId || '', branch)}</select>
      </label>
      <label class="block"><span class="${LABEL}">Status</span>
        <select name="status" class="${FIELD}">${statusOptions(QUOTE_STATUSES, record?.status || 'Draft')}</select>
      </label>
      <label class="block sm:col-span-2"><span class="${LABEL}">Expiry</span>
        <input name="expiry" type="date" value="${escapeHtml(record?.expiryDate || '')}" class="${FIELD}" />
      </label>
      ${taxFields(record)}
      <label class="block sm:col-span-2"><span class="${LABEL}">Notes</span>
        <textarea name="notes" rows="2" placeholder="Release notes, alternates, who has to approve" class="${FIELD}">${escapeHtml(record?.notes || '')}</textarea>
      </label>` : `
      ${branchField(record)}
      <label class="block"><span class="${LABEL}">Customer</span>
        <select name="contactId" required class="${FIELD}">${contactOptions(record?.contactId || '', branch)}</select>
      </label>
      <label class="block"><span class="${LABEL}">Status</span>
        <select name="status" class="${FIELD}">${statusOptions(ORDER_STATUSES, record?.status || 'Draft')}</select>
      </label>
      <label class="block"><span class="${LABEL}">Date</span>
        <input name="date" type="date" value="${escapeHtml(record?.date || today())}" class="${FIELD}" />
      </label>
      <label class="block"><span class="${LABEL}">Customer PO</span>
        <input name="customerPo" value="${escapeHtml(record?.customerPo || '')}" placeholder="PO number" class="${FIELD}" />
      </label>
      <label class="block sm:col-span-2"><span class="${LABEL}">Job name</span>
        <input name="jobName" value="${escapeHtml(record?.jobName || '')}" placeholder="Hospital addition, pump station, panel shop" class="${FIELD}" />
      </label>
      ${taxFields(record)}
      <label class="block sm:col-span-2"><span class="${LABEL}">Notes</span>
        <textarea name="notes" rows="2" placeholder="Release notes" class="${FIELD}">${escapeHtml(record?.notes || '')}</textarea>
      </label>`;
  return `
    <form id="doc-form" class="space-y-4" autocomplete="off">
      ${docKicker(kind, record)}
      ${isQuote ? quoteBanner(record) : orderDeliveryNote(record)}
      <div class="grid sm:grid-cols-2 gap-3">${fields}</div>
      <div class="space-y-2">
        <div class="hidden sm:grid grid-cols-12 gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
          <div class="col-span-5">Product</div>
          <div class="col-span-1">Qty</div>
          <div class="col-span-2">UOM</div>
          <div class="col-span-2">Unit price</div>
          <div class="col-span-2 text-right">Amount</div>
        </div>
        <div id="line-host" class="space-y-2"></div>
        <button type="button" data-doc-action="add-line" class="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-blue-700">
          <i class="fa-solid fa-plus text-xs"></i> Add line
        </button>
      </div>
      <div id="doc-summary"></div>
      ${payPanelHtml(record)}
      <p id="form-error" class="hidden text-sm text-rose-600 dark:text-rose-300"></p>
      <p class="text-[11px] text-slate-400 dark:text-slate-500">${hint}</p>
      ${docFooter(kind, record)}
    </form>`;
}
function openDocModal(kind, record) {
  const lines = linesFrom(record?.items);
  const title = record
    ? (kind === 'quote' ? record.quoteNumber : record.orderNumber)
    : (kind === 'quote' ? 'New quote' : 'New order');
  openModal(title, docFormHtml(kind, record), 'xl');
  activeDoc = { kind, lines, branchId: docBranch(record), record };
  const form = document.getElementById('doc-form');
  if (!form) return;
  renderDocLines(lines);
  form.addEventListener('input', e => onDocField(e, lines));
  form.addEventListener('change', e => onDocField(e, lines));
  form.addEventListener('focusout', e => onDocBlur(e, lines));
  form.addEventListener('keydown', e => onDocKey(e, lines));
  form.addEventListener('click', e => onDocClick(e, lines, kind, record, form));
  form.addEventListener('submit', e => onDocSubmit(e, lines, kind, record, form));
}
function onDocField(e, lines) {
  const name = e.target.name;
  if (name === 'shipZip' || name === 'taxExempt' || name === 'resaleCertificate') {
    paintSummary(lines);
    return;
  }
  if (name === 'contactId' && e.type === 'change') {
    const contact = contactById(e.target.value);
    const form = e.target.form;
    if (contact && form) {
      if (form.shipZip) form.shipZip.value = contact.shipZip || '';
      if (form.taxExempt) form.taxExempt.checked = !!contact.taxExempt;
      if (form.resaleCertificate) form.resaleCertificate.value = contact.resaleCertificate || '';
    }
    paintSummary(lines);
    return;
  }
  if (name === 'payMethod') {
    const note = document.getElementById('card-note');
    if (note) note.classList.toggle('hidden', e.target.value !== 'Card');
    return;
  }
  if (name === 'branchId' && e.type === 'change') {
    if (activeDoc) activeDoc.branchId = e.target.value;
    const form = e.target.form;
    if (form && form.contactId) form.contactId.innerHTML = contactOptions(form.contactId.value, e.target.value);
    const branch = branchById(e.target.value);
    if (form && form.shipZip && branch && !form.shipZip.value) form.shipZip.value = branch.zip;
    paintSummary(lines);
    return;
  }
  if (e.type === 'change' && e.target.classList.contains('sku-search')) return;
  const row = e.target.closest('[data-line]');
  if (!row) return;
  const line = lines.find(l => l.key === row.dataset.line);
  if (!line) return;
  if (e.target.classList.contains('line-qty')) line.qty = Number(e.target.value);
  if (e.target.classList.contains('line-price')) line.price = Number(e.target.value);
  if (e.target.classList.contains('line-uom')) line.uom = e.target.value;
  if (e.target.classList.contains('sku-search') && e.type === 'input') {
    const picked = line.productId ? productLabel(productById(line.productId)) : '';
    if (e.target.value.trim() !== picked) {
      line.productId = '';
      row.dataset.productId = '';
    }
    const text = e.target.value.trim();
    if (text) showSkuPopover(e.target, searchProducts(text));
    else hideSkuPopover();
  }
  paintLine(row, line);
  paintSummary(lines);
}
function onDocBlur(e, lines) {
  if (!e.target.classList.contains('sku-search')) return;
  const row = e.target.closest('[data-line]');
  if (!row) return;
  const line = lines.find(l => l.key === row.dataset.line);
  if (!line || line.productId) return;
  const product = resolveProduct(e.target.value);
  if (product) pickSku(e.target, product, lines);
}
function onDocKey(e, lines) {
  if (e.key === 'Escape') {
    if (hideSkuPopover()) {
      e.stopPropagation();
      e.preventDefault();
    }
    return;
  }
  if (!e.target.classList.contains('sku-search')) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    const pop = document.getElementById('sku-popover');
    if (!pop || pop.classList.contains('hidden')) return;
    e.preventDefault();
    moveSkuActive(e.key === 'ArrowDown' ? 1 : -1);
    return;
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    const pop = document.getElementById('sku-popover');
    if (pop && !pop.classList.contains('hidden') && skuPop.matches.length) {
      pickSku(skuPop.input, skuPop.matches[skuPop.active], lines);
      return;
    }
    const product = resolveProduct(e.target.value);
    if (product) pickSku(e.target, product, lines);
  }
}
function onDocClick(e, lines, kind, record, form) {
  const btn = e.target.closest('[data-doc-action]');
  if (!btn) return;
  const action = btn.dataset.docAction;
  if (action === 'add-line') {
    lines.push({ key: uid(), productId: '', qty: 1, uom: 'ea', price: 0 });
    renderDocLines(lines);
    const inputs = document.querySelectorAll('#line-host .sku-search');
    const last = inputs[inputs.length - 1];
    if (last) last.focus();
    return;
  }
  if (action === 'remove-line') {
    const row = btn.closest('[data-line]');
    const idx = lines.findIndex(l => l.key === row.dataset.line);
    if (idx >= 0) lines.splice(idx, 1);
    if (!lines.length) lines.push({ key: uid(), productId: '', qty: 1, uom: 'ea', price: 0 });
    hideSkuPopover();
    renderDocLines(lines);
    return;
  }
  if (action === 'convert' || action === 'delivery') {
    form.dataset.convert = action === 'convert' ? '1' : '';
    form.dataset.delivery = action === 'delivery' ? '1' : '';
    if (typeof form.reportValidity === 'function' && !form.reportValidity()) {
      form.dataset.convert = '';
      form.dataset.delivery = '';
      return;
    }
    if (typeof form.requestSubmit === 'function') form.requestSubmit();
    else form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    return;
  }
  if (action === 'delete') {
    if (kind === 'quote' && record) deleteQuote(record.id);
    if (kind === 'order' && record) deleteOrder(record.id);
    return;
  }
  if (action === 'toggle-pay') {
    const box = document.getElementById('collect-box');
    if (box) box.classList.toggle('is-collapsed');
    return;
  }
  if (action === 'apply-payment') {
    applyCollectedPayment(kind, record, form);
    return;
  }
  if (action === 'refund') {
    refundDocument(kind, record);
    return;
  }
  if (action === 'open-order') {
    const order = orderById(btn.dataset.id);
    closeModal();
    if (order) openDocModal('order', order);
  }
}
function readDocLines(lines) {
  const rows = [...document.querySelectorAll('#line-host [data-line]')];
  const items = [];
  let incomplete = false;
  rows.forEach(row => {
    const line = lines.find(l => l.key === row.dataset.line);
    const text = row.querySelector('.sku-search').value.trim();
    const qty = Number(row.querySelector('.line-qty').value);
    const price = Number(row.querySelector('.line-price').value);
    const uom = row.querySelector('.line-uom').value || 'ea';
    let productId = line?.productId || '';
    if (!productId && text) {
      const product = resolveProduct(text);
      if (product) productId = product.id;
    }
    if (!text && !productId) return;
    if (!productId || !(qty > 0)) {
      incomplete = true;
      return;
    }
    items.push({ productId, qty, uom, price: Number.isFinite(price) ? price : 0 });
  });
  return { items, incomplete };
}
function persistDoc(kind, record, form, lines) {
  setFormError('');
  const parsed = readDocLines(lines);
  if (parsed.incomplete || !parsed.items.length) {
    setFormError(parsed.incomplete
      ? 'Each line needs a shelf SKU and a quantity. Search, then pick a match.'
      : 'Add at least one line with a SKU and a quantity.');
    return null;
  }
  const fd = new FormData(form);
  const contactId = fd.get('contactId');
  if (!contactId) {
    setFormError('Choose a customer.');
    return null;
  }
  const items = parsed.items.map(i => ({
    productId: i.productId,
    qty: i.qty,
    uom: i.uom || 'ea',
    price: moneyRound(i.price)
  }));
  const branchId = String(fd.get('branchId') || record?.branchId || writingBranch());
  const taxExempt = !!(form.taxExempt && form.taxExempt.checked);
  const shipZip = String(fd.get('shipZip') || '');
  const resaleCertificate = String(fd.get('resaleCertificate') || '');
  if (kind === 'quote') {
    if (!can('edit-quote')) {
      setFormError('Quotes are written by counter, sales, manager, and admin.');
      return null;
    }
    const quote = record || {
      id: uid(),
      quoteNumber: nextNumber(state.quotes, 'quoteNumber', 'Q-', 1001),
      date: today(),
      orderId: null,
      payments: []
    };
    quote.contactId = contactId;
    quote.branchId = record?.branchId || branchId;
    quote.status = fd.get('status') || 'Draft';
    quote.expiryDate = fd.get('expiry') || '';
    quote.notes = String(fd.get('notes') || '');
    quote.items = items;
    quote.taxExempt = taxExempt;
    quote.shipZip = shipZip;
    quote.resaleCertificate = resaleCertificate;
    quote.payments = quote.payments || [];
    priceDoc(quote);
    if (!record) state.quotes.push(quote);
    return quote;
  }
  const nextStatus = fd.get('status') || 'Draft';
  if (nextStatus === 'Cancelled' && record?.status !== 'Cancelled' && !can('void')) {
    setFormError('Cancelling a ticket needs a manager or admin. This is a demo role gate, not server-side security.');
    return null;
  }
  const prev = record ? { status: record.status, items: cloneItems(record.items), branchId: record.branchId } : null;
  const order = record || {
    id: uid(),
    orderNumber: nextNumber(state.orders, 'orderNumber', 'ORD-', 1001),
    date: fd.get('date') || today(),
    quoteId: null,
    payments: []
  };
  order.contactId = contactId;
  order.branchId = record?.branchId || branchId;
  order.status = nextStatus;
  order.date = fd.get('date') || order.date || today();
  order.customerPo = String(fd.get('customerPo') || '');
  order.jobName = String(fd.get('jobName') || '');
  order.notes = String(fd.get('notes') || '');
  order.items = items;
  order.taxExempt = taxExempt;
  order.shipZip = shipZip;
  order.resaleCertificate = resaleCertificate;
  order.payments = order.payments || [];
  priceDoc(order);
  if (!record) state.orders.push(order);
  syncOrderStock(prev, order);
  return order;
}
function onDocSubmit(e, lines, kind, record, form) {
  e.preventDefault();
  const convert = form.dataset.convert === '1';
  const thenDelivery = form.dataset.delivery === '1';
  form.dataset.convert = '';
  form.dataset.delivery = '';
  const created = !record;
  const prevStatus = record?.status;
  const saved = persistDoc(kind, record, form, lines);
  if (!saved) return;
  if (created) addActivity(kind === 'quote' ? `Created quote ${saved.quoteNumber}` : `Created order ${saved.orderNumber}`, saved.branchId);
  else if (prevStatus && prevStatus !== saved.status) {
    addActivity(`${saved.quoteNumber || saved.orderNumber} marked ${saved.status}`, saved.branchId);
    if (kind === 'order' && saved.status === 'Cancelled') {
      audit('void', `${saved.orderNumber} cancelled by ${session?.name || 'unknown'}`);
    }
  }
  if (kind === 'quote' && convert) {
    convertQuote(saved.id);
    return;
  }
  save();
  closeModal();
  if (kind === 'order' && thenDelivery) {
    toast('Order saved', saved.orderNumber);
    render();
    openDeliveryModal(null, saved.id);
    return;
  }
  toast(kind === 'quote' ? 'Quote saved' : 'Order saved', kind === 'quote' ? saved.quoteNumber : saved.orderNumber);
  render();
}
function reopenDoc(kind, record) {
  const fresh = kind === 'quote' ? quoteById(record.id) : orderById(record.id);
  closeModal();
  render();
  if (fresh) openDocModal(kind, fresh);
}
function applyCollectedPayment(kind, record, form) {
  if (!record) {
    setFormError('Save the ticket before recording a payment.');
    return;
  }
  if (!can('pay')) {
    deny('Collecting payment is limited to counter, sales, manager, and admin.');
    return;
  }
  const amount = moneyRound(form.payAmount && form.payAmount.value);
  const method = form.payMethod ? form.payMethod.value : 'Cash';
  const balance = Math.max(0, moneyRound((Number(record.total) || 0) - paymentNet(record)));
  if (!(amount > 0)) {
    setFormError('Enter a payment amount.');
    return;
  }
  if (amount - balance > 0.009) {
    setFormError(`That is above the open balance of ${formatMoneyExact(balance)}.`);
    return;
  }
  const prev = record.paymentStatus || 'Unpaid';
  const note = method === 'Card'
    ? 'Processed via Stripe (demo)'
    : (method === 'Account' ? 'On account' : '');
  record.payments = record.payments || [];
  record.payments.push({
    id: uid(),
    amount,
    method,
    at: new Date().toISOString(),
    userId: session?.userId || '',
    userName: session?.name || '',
    note,
  });
  refreshPayment(record);
  const label = record.quoteNumber || record.orderNumber;
  audit('payment', `${label} ${prev} → ${record.paymentStatus} · ${methodLabel(method)} ${formatMoneyExact(amount)} · ${session?.name || ''}`);
  addActivity(`${session?.name || 'Someone'} recorded ${formatMoneyExact(amount)} ${methodLabel(method)} on ${label}`, record.branchId);
  save();
  toast('Payment recorded', `${label} · ${record.paymentStatus}`);
  reopenDoc(kind, record);
}
function refundDocument(kind, record) {
  if (!record) return;
  if (!can('refund')) {
    deny('Refunds need a manager or admin. This demo gate is not server-side security.');
    return;
  }
  const net = paymentNet(record);
  if (!(net > 0)) return;
  const label = record.quoteNumber || record.orderNumber;
  if (!confirm(`Refund ${formatMoneyExact(net)} on ${label}? No card number is stored. This only updates the demo ticket.`)) return;
  const prev = record.paymentStatus || 'Unpaid';
  record.payments.push({
    id: uid(),
    amount: moneyRound(-net),
    method: 'Refund',
    at: new Date().toISOString(),
    userId: session.userId,
    userName: session.name,
    note: 'Demo refund. No card number stored.',
  });
  refreshPayment(record);
  audit('refund', `${label} ${prev} → ${record.paymentStatus} · ${formatMoneyExact(net)} · ${session.name}`);
  addActivity(`${session.name} refunded ${formatMoneyExact(net)} on ${label}`, record.branchId);
  save();
  toast('Refund recorded', `${label} · ${record.paymentStatus}`);
  reopenDoc(kind, record);
}
function openAddQuote() { openDocModal('quote', null); }
function openEditQuote(id) {
  const quote = quoteById(id);
  if (quote) openDocModal('quote', quote);
}
function openAddOrder() { openDocModal('order', null); }
function openEditOrder(id) {
  const order = orderById(id);
  if (order) openDocModal('order', order);
}
function deleteQuote(id) {
  const quote = quoteById(id);
  if (!quote) return;
  if (!can('delete')) {
    deny('Deleting a quote needs a manager or admin. This demo gate is not server-side security.');
    return;
  }
  if (!confirm(`Delete ${quote.quoteNumber}?`)) return;
  state.quotes = state.quotes.filter(q => q.id != id);
  save();
  closeModal();
  toast('Quote deleted', quote.quoteNumber);
  render();
}
function deleteOrder(id) {
  const order = orderById(id);
  if (!order) return;
  if (!can('delete')) {
    deny('Deleting an order needs a manager or admin. This demo gate is not server-side security.');
    return;
  }
  const deliveries = state.deliveries.filter(d => d.orderId == id);
  const linked = state.quotes.find(q => q.orderId == id);
  let message = `Delete ${order.orderNumber}? Committed stock returns to the shelf.`;
  if (deliveries.length) message += ` ${deliveries.length} linked ${deliveries.length === 1 ? 'delivery stays' : 'deliveries stay'} on the board.`;
  if (linked) message += ` ${linked.quoteNumber} returns to Accepted.`;
  if (!confirm(message)) return;
  syncOrderStock({ status: order.status, items: order.items, branchId: order.branchId }, null);
  state.orders = state.orders.filter(o => o.id != id);
  if (linked) {
    linked.orderId = null;
    if (linked.status === 'Converted') linked.status = 'Accepted';
  }
  save();
  closeModal();
  toast('Order deleted', order.orderNumber);
  render();
}
function convertQuote(id) {
  const quote = quoteById(id);
  if (!quote) return;
  const existing = quoteOrder(quote);
  if (existing) {
    toast('Already converted', `${quote.quoteNumber} → ${existing.orderNumber}`);
    return;
  }
  if (!quote.items || !quote.items.length) {
    toast('Quote has no lines', quote.quoteNumber, 'warn');
    return;
  }
  const items = cloneItems(quote.items);
  const order = {
    id: uid(),
    orderNumber: nextNumber(state.orders, 'orderNumber', 'ORD-', 1001),
    contactId: quote.contactId,
    branchId: quote.branchId || contactById(quote.contactId)?.branchId || writingBranch(),
    date: today(),
    status: 'Draft',
    customerPo: '',
    jobName: '',
    notes: quote.notes || '',
    quoteId: quote.id,
    items,
    shipZip: quote.shipZip || '',
    taxExempt: !!quote.taxExempt,
    resaleCertificate: quote.resaleCertificate || '',
    payments: (quote.payments || []).map(pay => ({ ...pay, id: uid() })),
  };
  priceDoc(order);
  state.orders.push(order);
  quote.status = 'Converted';
  quote.orderId = order.id;
  const delivery = {
    id: uid(),
    deliveryNumber: nextNumber(state.deliveries, 'deliveryNumber', 'DEL-', 1001),
    orderId: order.id,
    contactId: quote.contactId,
    branchId: order.branchId,
    shipTo: suggestShipTo(quote.contactId),
    jobSite: '',
    requestedDate: quote.expiryDate && !isPastDate(quote.expiryDate) ? quote.expiryDate : plusDays(7),
    window: '',
    carrier: '',
    tracking: '',
    status: 'Scheduled',
    notes: `Stub from ${quote.quoteNumber}. Confirm ship-to and window.`
  };
  state.deliveries.push(delivery);
  addActivity(`Converted ${quote.quoteNumber} to ${order.orderNumber}`, order.branchId);
  save();
  closeModal();
  toast('Quote converted', `${order.orderNumber} · ${delivery.deliveryNumber}`);
  render();
}

function searchProducts(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const branch = activeDoc?.branchId || activeBranchId();
  const scored = [];
  state.products.forEach(p => {
    if (branch && !branchCarries(p, branch)) return;
    const sku = p.sku.toLowerCase();
    const name = p.name.toLowerCase();
    const mfr = (p.manufacturer || '').toLowerCase();
    const sub = (p.subcategory || '').toLowerCase();
    const section = productSection(p).toLowerCase();
    let score = 0;
    if (sku === q) score = 100;
    else if (sku.startsWith(q)) score = 80;
    else if (sku.includes(q)) score = 60;
    else if (name.startsWith(q)) score = 50;
    else if (name.includes(q)) score = 40;
    else if (sub.includes(q)) score = 30;
    else if (mfr.includes(q)) score = 20;
    else if (section.includes(q)) score = 15;
    else return;
    scored.push({ p, score });
  });
  scored.sort((a, b) => b.score - a.score || a.p.sku.localeCompare(b.p.sku));
  return scored.slice(0, 8).map(row => row.p);
}
function resolveProduct(text) {
  const q = String(text || '').trim().toLowerCase();
  if (!q) return null;
  const branch = activeDoc?.branchId || activeBranchId();
  const list = state.products.filter(p => !branch || branchCarries(p, branch));
  return list.find(p => p.sku.toLowerCase() === q)
    || list.find(p => productLabel(p).toLowerCase() === q)
    || list.find(p => p.name.toLowerCase() === q)
    || null;
}
function showSkuPopover(input, matches) {
  const pop = document.getElementById('sku-popover');
  if (!pop) return;
  skuPop.matches = matches;
  skuPop.active = 0;
  skuPop.input = input;
  if (!matches.length) {
    pop.innerHTML = '<div class="px-3 py-2 text-sm text-slate-400">No matching SKUs</div>';
  } else {
    pop.innerHTML = matches.map((p, i) => `
      <button type="button" data-sku-index="${i}" class="sku-opt w-full text-left px-3 py-2 flex items-start gap-3 ${i === 0 ? 'is-active' : ''}">
        <span class="font-mono text-[11px] text-slate-500 dark:text-slate-400 w-[7.5rem] shrink-0 pt-0.5">${escapeHtml(p.sku)}</span>
        <span class="min-w-0 flex-1">
          <span class="block text-sm text-slate-800 dark:text-slate-100 truncate">${escapeHtml(p.name)}</span>
          <span class="block text-[11px] text-slate-400 truncate">${escapeHtml([productSection(p), p.subcategory, p.manufacturer].filter(Boolean).join(' · '))}</span>
        </span>
        <span class="text-right shrink-0">
          <span class="block text-xs font-medium text-slate-700 dark:text-slate-200 tabular-nums">${formatMoney(p.price)}</span>
          <span class="block text-[11px] ${isLowStock(p) ? 'text-orange-600 dark:text-orange-300' : 'text-slate-400'}">${escapeHtml(stockText(p))}</span>
        </span>
      </button>`).join('');
  }
  pop.classList.remove('hidden');
  placeSkuPopover(input);
}
function placeSkuPopover(input) {
  const pop = document.getElementById('sku-popover');
  const rect = input.getBoundingClientRect();
  const width = Math.min(Math.max(rect.width, 320), window.innerWidth - 16);
  const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);
  pop.style.width = width + 'px';
  pop.style.left = left + 'px';
  pop.style.top = (rect.bottom + 4) + 'px';
  const height = pop.offsetHeight;
  if (window.innerHeight - rect.bottom < height + 12 && rect.top > height + 12) {
    pop.style.top = Math.max(8, rect.top - height - 4) + 'px';
  }
}
function hideSkuPopover() {
  const pop = document.getElementById('sku-popover');
  if (!pop || pop.classList.contains('hidden')) return false;
  pop.classList.add('hidden');
  pop.innerHTML = '';
  skuPop.matches = [];
  skuPop.input = null;
  return true;
}
function paintSkuActive() {
  document.querySelectorAll('#sku-popover .sku-opt').forEach(btn => {
    btn.classList.toggle('is-active', Number(btn.dataset.skuIndex) === skuPop.active);
  });
}
function moveSkuActive(delta) {
  if (!skuPop.matches.length) return;
  skuPop.active = (skuPop.active + delta + skuPop.matches.length) % skuPop.matches.length;
  paintSkuActive();
  const btn = document.querySelector(`#sku-popover [data-sku-index="${skuPop.active}"]`);
  if (btn && btn.scrollIntoView) btn.scrollIntoView({ block: 'nearest' });
}
function pickSku(input, product, lines) {
  if (!input || !product) return;
  const row = input.closest('[data-line]');
  if (!row) return;
  const line = lines.find(l => l.key === row.dataset.line);
  if (!line) return;
  line.productId = product.id;
  line.price = product.price;
  line.uom = product.uom || 'ea';
  row.dataset.productId = String(product.id);
  input.value = productLabel(product);
  const price = row.querySelector('.line-price');
  const uom = row.querySelector('.line-uom');
  if (price) price.value = product.price;
  if (uom) {
    if (![...uom.options].some(o => o.value === line.uom)) {
      const opt = document.createElement('option');
      opt.value = line.uom;
      opt.textContent = line.uom;
      uom.appendChild(opt);
    }
    uom.value = line.uom;
  }
  paintLine(row, line);
  paintSummary(lines);
  hideSkuPopover();
}

function sectionChoices(current) {
  const names = CATALOG.map(c => c.section);
  if (current && !names.includes(current)) names.push(current);
  return names;
}
function subsFor(section) {
  const known = [];
  const add = value => { if (value && !known.includes(value)) known.push(value); };
  const node = CATALOG.find(c => c.section === section);
  (node?.subs || []).forEach(add);
  state.products.forEach(p => {
    if (productSection(p) === section) add(p.subcategory);
  });
  return known;
}
function fillSubList(section) {
  const list = document.getElementById('sub-list');
  if (!list) return;
  list.innerHTML = subsFor(section).map(sub => `<option value="${escapeHtml(sub)}"></option>`).join('');
}
function stockInputs(record) {
  const reorder = `<label class="block"><span class="${LABEL}">Reorder</span>
        <input name="reorderLevel" type="number" placeholder="Reorder" value="${record ? escapeHtml(record.reorderLevel ?? '') : ''}" class="${FIELD}" />
      </label>`;
  if (!activeBranchId() && isManager()) {
    return `<div class="grid grid-cols-2 gap-2">
      ${BRANCHES.map(item => {
        const carried = record && branchCarries(record, item.id);
        const value = carried ? escapeHtml(onHand(record, item.id)) : '';
        return `<label class="block"><span class="${LABEL}">On hand · ${escapeHtml(item.short)} ${item.id}</span>
          <input name="stock-${item.id}" type="number" value="${value}" placeholder="Not carried" class="${FIELD}" />
        </label>`;
      }).join('')}
      ${reorder}
    </div>
    <p class="text-[11px] text-slate-400 dark:text-slate-500">Leave a branch blank if that house does not carry the SKU. On-hand is per branch.</p>`;
  }
  const id = activeBranchId() || session?.branchId || '1000';
  return `<div class="grid grid-cols-2 gap-2">
      <label class="block"><span class="${LABEL}">On hand · ${escapeHtml(branchName(id))}</span>
        <input name="stock" type="number" required value="${record ? escapeHtml(onHand(record, id)) : ''}" class="${FIELD}" />
      </label>
      ${reorder}
    </div>`;
}
function writeStockFromForm(product, fd) {
  product.stockByBranch = { ...(product.stockByBranch || {}) };
  if (!activeBranchId() && isManager()) {
    BRANCHES.forEach(item => {
      const raw = fd.get('stock-' + item.id);
      const carried = branchCarries(product, item.id);
      if (raw == null || String(raw).trim() === '') {
        if (carried) delete product.stockByBranch[item.id];
        return;
      }
      const qty = Number(raw) || 0;
      if (!carried && qty === 0) return;
      product.stockByBranch[item.id] = qty;
    });
  } else {
    const id = activeBranchId() || session?.branchId || '1000';
    product.stockByBranch[id] = Number(fd.get('stock')) || 0;
  }
  if (product.stockByBranch['1000'] != null) product.stock = product.stockByBranch['1000'];
}
function openProductModal(record) {
  const sections = sectionChoices(record ? productSection(record) : CATALOG[0].section);
  const section = record ? productSection(record) : sections[0];
  const uom = record?.uom || 'ea';
  openModal(record ? 'Edit product' : 'Add product', `
    <form id="product-form" class="space-y-3">
      <div class="grid grid-cols-2 gap-2">
        <input name="sku" required placeholder="SKU" value="${escapeHtml(record?.sku || '')}" class="${FIELD}" />
        <input name="manufacturer" placeholder="Manufacturer" value="${escapeHtml(record?.manufacturer || '')}" class="${FIELD}" />
      </div>
      <input name="name" required placeholder="Product name" value="${escapeHtml(record?.name || '')}" class="${FIELD}" />
      <div class="grid grid-cols-2 gap-2">
        <label class="block"><span class="${LABEL}">Section</span>
          <select id="product-section" name="section" class="${FIELD}">
            ${sections.map(s => `<option ${s === section ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
          </select>
        </label>
        <label class="block"><span class="${LABEL}">Subcategory</span>
          <input id="product-sub" name="subcategory" list="sub-list" placeholder="EMT, THHN, PLC…" value="${escapeHtml(record?.subcategory || '')}" class="${FIELD}" />
          <datalist id="sub-list"></datalist>
        </label>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <label class="block"><span class="${LABEL}">UOM</span>
          <select name="uom" class="${FIELD}">${uomOptions(uom)}</select>
        </label>
        <label class="block"><span class="${LABEL}">Price</span>
          <input name="price" type="number" step="0.01" min="0" required value="${record ? escapeHtml(record.price) : ''}" class="${FIELD}" />
        </label>
        <label class="block"><span class="${LABEL}">Cost</span>
          <input name="cost" type="number" step="0.01" min="0" placeholder="For margin" value="${record && record.cost != null ? escapeHtml(record.cost) : ''}" class="${FIELD}" />
        </label>
      </div>
      ${stockInputs(record)}
      <div class="flex flex-wrap items-center justify-end gap-2 pt-1">
        ${record ? '<button type="button" id="product-delete" class="mr-auto px-3 py-2 text-sm text-rose-600 rounded-lg hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40">Delete</button>' : '<span class="mr-auto"></span>'}
        <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
        <button type="submit" class="px-4 py-2 text-sm bg-primary hover:bg-blue-700 text-white rounded-lg">Save</button>
      </div>
    </form>
  `, 'lg');
  fillSubList(section);
  const sectionSel = document.getElementById('product-section');
  if (sectionSel) {
    sectionSel.addEventListener('change', () => {
      fillSubList(sectionSel.value);
      const subInput = document.getElementById('product-sub');
      const allowed = subsFor(sectionSel.value);
      if (subInput && subInput.value && !allowed.includes(subInput.value)) subInput.value = '';
    });
  }
  const del = document.getElementById('product-delete');
  if (del && record) del.addEventListener('click', () => deleteProduct(record.id));
  if (!can('edit-product')) {
    document.querySelectorAll('#product-form input, #product-form select, #product-form textarea, #product-form button').forEach(el => {
      if (el.getAttribute('onclick') === 'closeModal()') return;
      el.disabled = true;
    });
  }
  document.getElementById('product-form').onsubmit = e => {
    if (!can('edit-product')) return;
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = String(fd.get('name') || '');
    const sectionName = String(fd.get('section') || '');
    const costRaw = String(fd.get('cost') ?? '').trim();
    const product = record || { id: uid() };
    product.sku = String(fd.get('sku') || '');
    product.name = name;
    product.manufacturer = String(fd.get('manufacturer') || '');
    product.section = sectionName;
    product.category = sectionName;
    product.subcategory = String(fd.get('subcategory') || '');
    product.uom = String(fd.get('uom') || 'ea');
    product.price = Number(fd.get('price')) || 0;
    product.cost = costRaw === '' ? null : Number(costRaw);
    product.reorderLevel = Number(fd.get('reorderLevel')) || 0;
    writeStockFromForm(product, fd);
    if (!record) {
      state.products.push(product);
      addActivity(`Added product ${name}`);
    }
    save();
    closeModal();
    toast('Product saved', name);
    render();
  };
}
function openAddProduct() { openProductModal(null); }
function productInUse(id) {
  const refs = [];
  state.quotes.forEach(q => {
    if ((q.items || []).some(i => i.productId == id)) refs.push(q.quoteNumber);
  });
  state.orders.forEach(o => {
    if ((o.items || []).some(i => i.productId == id)) refs.push(o.orderNumber);
  });
  return refs;
}
function deleteProduct(id) {
  const product = productById(id);
  if (!product) return;
  if (!can('delete')) {
    deny('Deleting a SKU needs a manager or admin. This demo gate is not server-side security.');
    return;
  }
  const refs = productInUse(id);
  if (refs.length) {
    toast('SKU is on a document', refs.slice(0, 3).join(', '), 'warn');
    return;
  }
  if (!confirm(`Delete ${product.sku}?`)) return;
  state.products = state.products.filter(p => p.id != id);
  save();
  closeModal();
  toast('Product deleted', product.sku);
  render();
}

function orderOptions(selected) {
  const branch = activeBranchId();
  const opts = state.orders.filter(o => !branch || String(o.branchId) === String(branch) || o.id == selected).map(o =>
    `<option value="${escapeHtml(o.id)}" ${o.id == selected ? 'selected' : ''}>${escapeHtml(orderLabel(o))}</option>`
  ).join('');
  const missing = selected && !state.orders.some(o => o.id == selected)
    ? `<option value="${escapeHtml(selected)}" selected>Order removed</option>`
    : '';
  return `<option value="">Select order</option>${missing}${opts}`;
}
function openDeliveryModal(record, presetOrderId) {
  const orderId = record?.orderId || presetOrderId || '';
  const order = orderById(orderId);
  const shipDefault = record?.shipTo || (order ? suggestShipTo(order.contactId) : '');
  const jobDefault = record?.jobSite || order?.jobName || '';
  openModal(record ? record.deliveryNumber : 'New delivery', `
    <form id="delivery-form" class="space-y-3" autocomplete="off">
      <label class="block"><span class="${LABEL}">Order</span>
        <select id="delivery-order" name="orderId" required class="${FIELD}">${orderOptions(orderId)}</select>
      </label>
      <label class="block"><span class="${LABEL}">Ship-to / job site</span>
        <textarea name="shipTo" required rows="2" placeholder="Dock, trailer, or counter will-call" class="${FIELD}">${escapeHtml(shipDefault)}</textarea>
      </label>
      <label class="block"><span class="${LABEL}">Job name</span>
        <input name="jobSite" value="${escapeHtml(jobDefault)}" placeholder="Hospital addition, pump station" class="${FIELD}" />
      </label>
      <div class="grid grid-cols-2 gap-2">
        <label class="block"><span class="${LABEL}">Requested date</span>
          <input name="requestedDate" type="date" value="${escapeHtml(record?.requestedDate || plusDays(7))}" class="${FIELD}" />
        </label>
        <label class="block"><span class="${LABEL}">Window</span>
          <input name="window" value="${escapeHtml(record?.window || '')}" placeholder="7:00–10:00 AM" class="${FIELD}" />
        </label>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <label class="block"><span class="${LABEL}">Carrier</span>
          <input name="carrier" value="${escapeHtml(record?.carrier || '')}" placeholder="MEC truck" class="${FIELD}" />
        </label>
        <label class="block"><span class="${LABEL}">Tracking #</span>
          <input name="tracking" value="${escapeHtml(record?.tracking || '')}" placeholder="MEC-4418-A" class="${FIELD}" />
        </label>
      </div>
      <label class="block"><span class="${LABEL}">Status</span>
        <select name="status" class="${FIELD}">${statusOptions(DELIVERY_STATUSES, record?.status || 'Scheduled')}</select>
      </label>
      <label class="block"><span class="${LABEL}">Notes</span>
        <textarea name="notes" rows="2" class="${FIELD}">${escapeHtml(record?.notes || '')}</textarea>
      </label>
      <div class="flex flex-wrap items-center justify-end gap-2 pt-1">
        ${record ? '<button type="button" id="delivery-delete" class="mr-auto px-3 py-2 text-sm text-rose-600 rounded-lg hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40">Delete</button>' : '<span class="mr-auto"></span>'}
        <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm text-slate-600 rounded-lg hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
        <button type="submit" class="px-4 py-2 text-sm bg-primary hover:bg-blue-700 text-white rounded-lg">Save</button>
      </div>
    </form>
  `, 'lg');
  const orderSel = document.getElementById('delivery-order');
  if (orderSel) {
    orderSel.addEventListener('change', () => {
      const next = orderById(orderSel.value);
      const ship = document.querySelector('#delivery-form [name="shipTo"]');
      const job = document.querySelector('#delivery-form [name="jobSite"]');
      if (next && ship && !ship.value.trim()) ship.value = suggestShipTo(next.contactId);
      if (next && job && !job.value.trim() && next.jobName) job.value = next.jobName;
    });
  }
  const del = document.getElementById('delivery-delete');
  if (del && record) del.addEventListener('click', () => deleteDelivery(record.id));
  document.getElementById('delivery-form').onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const chosen = orderById(fd.get('orderId'));
    const delivery = record || {
      id: uid(),
      deliveryNumber: nextNumber(state.deliveries, 'deliveryNumber', 'DEL-', 1001)
    };
    const prevStatus = record?.status;
    delivery.orderId = fd.get('orderId');
    delivery.contactId = chosen?.contactId || delivery.contactId || '';
    delivery.branchId = chosen?.branchId || delivery.branchId || writingBranch();
    delivery.shipTo = String(fd.get('shipTo') || '');
    delivery.jobSite = String(fd.get('jobSite') || '');
    delivery.requestedDate = String(fd.get('requestedDate') || '');
    delivery.window = String(fd.get('window') || '');
    delivery.carrier = String(fd.get('carrier') || '');
    delivery.tracking = String(fd.get('tracking') || '');
    delivery.status = String(fd.get('status') || 'Scheduled');
    delivery.notes = String(fd.get('notes') || '');
    if (!record) {
      state.deliveries.push(delivery);
      addActivity(`Scheduled ${delivery.deliveryNumber}`, delivery.branchId);
    } else if (prevStatus && prevStatus !== delivery.status) {
      addActivity(`${delivery.deliveryNumber} is ${delivery.status}`, delivery.branchId);
    }
    save();
    closeModal();
    toast(record ? 'Delivery saved' : 'Delivery scheduled', delivery.deliveryNumber);
    render();
  };
}
function openAddDelivery() { openDeliveryModal(null, null); }
function deleteDelivery(id) {
  const delivery = deliveryById(id);
  if (!delivery) return;
  if (!can('delete')) {
    deny('Deleting a delivery needs a manager or admin. This demo gate is not server-side security.');
    return;
  }
  if (!confirm(`Delete ${delivery.deliveryNumber}?`)) return;
  state.deliveries = state.deliveries.filter(d => d.id != id);
  save();
  closeModal();
  toast('Delivery deleted', delivery.deliveryNumber);
  render();
}

function quickAddButton(label, icon, action) {
  return `<button type="button" onclick="${action}" class="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-200">
    <i class="fa-solid ${icon} text-primary"></i> ${label}
  </button>`;
}
function openQuickAdd() {
  const items = [
    can('edit-contact') ? quickAddButton('New Contact', 'fa-user-plus', 'openAddContact()') : '',
    can('pipeline') ? quickAddButton('New Deal', 'fa-handshake', 'openAddDeal()') : '',
    can('edit-quote') ? quickAddButton('New Quote', 'fa-file-invoice-dollar', 'openAddQuote()') : '',
    can('pipeline') ? quickAddButton('New Task', 'fa-check', 'openAddTask()') : '',
    can('edit-product') ? quickAddButton('New Product', 'fa-box', 'openAddProduct()') : '',
    can('edit-order') ? quickAddButton('New Order', 'fa-shopping-cart', 'openAddOrder()') : '',
    can('edit-delivery') ? quickAddButton('New Delivery', 'fa-truck', 'openAddDelivery()') : '',
  ].filter(Boolean).join('');
  openModal('Quick Add', `<div class="space-y-2">${items || '<p class="text-sm text-slate-500">Nothing to add for this role.</p>'}</div>`);
}

function handleAction(action, id) {
  if (action === 'edit-contact') {
    const contact = contactById(id);
    if (contact) openContactModal(contact);
    return;
  }
  if (action === 'edit-quote') return openEditQuote(id);
  if (action === 'delete-quote') return deleteQuote(id);
  if (action === 'convert-quote') return convertQuote(id);
  if (action === 'open-order') return openEditOrder(id);
  if (action === 'edit-order') return openEditOrder(id);
  if (action === 'delete-order') return deleteOrder(id);
  if (action === 'add-delivery') return openDeliveryModal(null, id);
  if (action === 'edit-product') {
    const product = productById(id);
    if (product) openProductModal(product);
    return;
  }
  if (action === 'delete-product') return deleteProduct(id);
  if (action === 'delete-delivery') return deleteDelivery(id);
  if (action === 'quote-status') {
    quoteUi.status = id === '*' ? '' : id;
    render();
    return;
  }
  if (action === 'order-status') {
    orderUi.status = id === '*' ? '' : id;
    render();
    return;
  }
  if (action === 'cat-section') {
    catalogUi.section = id === '*' ? '' : id;
    catalogUi.subcategory = '';
    catalogUi.page = 1;
    render();
    return;
  }
  if (action === 'cat-sub') {
    catalogUi.subcategory = catalogUi.subcategory === id ? '' : id;
    catalogUi.page = 1;
    render();
    return;
  }
  if (action === 'cat-page') {
    if (id === 'prev') catalogUi.page -= 1;
    else if (id === 'next') catalogUi.page += 1;
    render();
    return;
  }
  if (action === 'cat-clear') {
    catalogUi.section = '';
    catalogUi.subcategory = '';
    catalogUi.manufacturer = '';
    catalogUi.sort = 'name';
    catalogUi.page = 1;
    render();
  }
}
function onContentClick(e) {
  if (ignoreNextClick) {
    ignoreNextClick = false;
    return;
  }
  const actionEl = e.target.closest('[data-action]');
  if (actionEl) {
    handleAction(actionEl.dataset.action, actionEl.dataset.id);
    return;
  }
  const go = e.target.closest('[data-goto]');
  if (go) {
    gotoView(go.dataset.goto);
    return;
  }
  const card = e.target.closest('.delivery-card');
  if (card) openDeliveryModal(deliveryById(card.dataset.delivery));
}
function onContentChange(e) {
  if (e.target.classList.contains('task-check')) {
    const task = state.tasks.find(t => t.id == e.target.dataset.task);
    if (!task) return;
    task.done = e.target.checked;
    save();
    if (task.done) toast('Task completed', task.title);
    render();
    return;
  }
  if (e.target.id === 'catalog-mfr') {
    catalogUi.manufacturer = e.target.value;
    catalogUi.page = 1;
    render();
    return;
  }
  if (e.target.id === 'catalog-sort') {
    catalogUi.sort = e.target.value;
    catalogUi.page = 1;
    render();
  }
}

function renderAudit() {
  if (!can('audit')) {
    return `<div class="space-y-4">${pageHeader('Audit log', 'Demo trail')}<div class="${CARD}">${emptyState('fa-clipboard-list', 'Managers only', 'The demo audit log is visible to a manager or admin.')}</div></div>`;
  }
  const rows = readAudit().slice().sort((a, b) => String(b.at).localeCompare(String(a.at)));
  const table = rows.length
    ? dataTable(
      ['When', 'Who', 'Action', 'Detail'],
      rows.map(row => `
        <tr class="${ROW}">
          <td class="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">${escapeHtml(formatWhen(row.at))}</td>
          <td class="px-4 py-3">
            <div class="font-medium text-slate-800 dark:text-slate-100">${escapeHtml(row.userName || '')}</div>
            <div class="text-xs text-slate-400 dark:text-slate-500">${escapeHtml(ROLE_LABEL[row.role] || row.role || '')}${row.branchId ? ` · ${escapeHtml(row.branchId)}` : ''}</div>
          </td>
          <td class="px-4 py-3 whitespace-nowrap">${escapeHtml(row.action || '')}</td>
          <td class="px-4 py-3 text-slate-600 dark:text-slate-300">${escapeHtml(row.detail || '')}</td>
        </tr>`).join(''),
      'min-w-[48rem]'
    )
    : `<div class="${CARD}">${emptyState('fa-clipboard-list', 'No audit entries', 'Sign-in, payment changes, refunds, and voids show up here.')}</div>`;
  return `
    <div class="space-y-4">
      ${pageHeader('Audit log', 'Who signed in, and who changed a payment, refund, or void.')}
      <div class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
        Demo only. This list lives in localStorage and can be edited or wiped in the browser. It is not a tamper-proof audit table. Production stores the same events in a database the user cannot rewrite. See docs/PRODUCTION.md.
      </div>
      ${table}
    </div>`;
}
function paintChrome() {
  if (!session) return;
  const name = document.getElementById('session-name');
  const meta = document.getElementById('session-meta');
  const avatar = document.getElementById('session-avatar');
  if (name) name.textContent = session.name;
  if (meta) meta.textContent = `${ROLE_LABEL[session.role] || session.role} · ${scopeLabel()}`;
  if (avatar) {
    avatar.textContent = initials(session.name);
    avatar.title = `${session.name} · ${ROLE_LABEL[session.role] || session.role} · ${session.branchName} (${session.branchId})`;
  }
  const side = document.getElementById('sidebar-session');
  if (side) {
    side.innerHTML = `
      <div class="flex items-center gap-2">
        ${avatarChip(session.name, 'xs')}
        <div class="min-w-0">
          <div class="font-medium text-slate-700 dark:text-slate-200 truncate">${escapeHtml(session.name)}</div>
          <div class="text-[11px] text-slate-400 dark:text-slate-500 truncate">${escapeHtml(ROLE_LABEL[session.role] || '')} · ${escapeHtml(scopeLabel())}</div>
        </div>
      </div>`;
  }
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.toggle('is-locked', !canView(link.dataset.view));
  });
  const wrap = document.getElementById('branch-switch-wrap');
  const select = document.getElementById('branch-switch');
  if (wrap && select) {
    if (can('switch-branch')) {
      wrap.classList.remove('hidden');
      const current = session.viewBranch || session.branchId;
      select.innerHTML = `<option value="all">All branches</option>${BRANCHES.map(branch =>
        `<option value="${branch.id}">${escapeHtml(branch.name)} · ${branch.id}</option>`
      ).join('')}`;
      select.value = current;
    } else {
      wrap.classList.add('hidden');
    }
  }
}
function showLogin(notice) {
  const login = document.getElementById('login-screen');
  const app = document.getElementById('app-shell');
  if (login) login.classList.remove('is-off');
  if (app) {
    app.classList.remove('is-on');
    app.setAttribute('inert', '');
  }
  const note = document.getElementById('login-notice');
  if (note) {
    note.textContent = notice || '';
    note.classList.toggle('hidden', !notice);
  }
}
function enterApp() {
  const login = document.getElementById('login-screen');
  const app = document.getElementById('app-shell');
  if (login) login.classList.add('is-off');
  if (app) {
    app.classList.add('is-on');
    app.removeAttribute('inert');
  }
  paintChrome();
  if (!canView(state.currentView)) state.currentView = 'dashboard';
  render();
  armIdle();
}
function signOut(reason) {
  if (session) {
    if (reason === 'timeout') audit('timeout', `${session.name} signed out after 15 minutes of inactivity`);
    else audit('logout', `${session.name} signed out`);
  }
  clearInterval(idleTimer);
  session = null;
  localStorage.removeItem(SESSION_KEY);
  closeModal();
  showLogin(reason === 'timeout'
    ? 'You were signed out after 15 minutes without activity. That timeout lives in this browser only — it is not a server session.'
    : '');
}
function noteActivity() {
  if (!session) return;
  const now = Date.now();
  if (now - Number(session.lastActivity || 0) > IDLE_MS) {
    signOut('timeout');
    return;
  }
  session.lastActivity = now;
  if (now - lastSessionWrite > 15000) {
    lastSessionWrite = now;
    saveSession();
  }
}
function armIdle() {
  clearInterval(idleTimer);
  idleTimer = setInterval(() => {
    if (session && Date.now() - Number(session.lastActivity || 0) > IDLE_MS) signOut('timeout');
  }, 20000);
}
function boot() {
  const stored = readStoredSession();
  if (stored && sessionStale(stored)) {
    session = stored;
    audit('timeout', `${stored.name} signed out after 15 minutes of inactivity`);
    session = null;
    localStorage.removeItem(SESSION_KEY);
    showLogin('You were signed out after 15 minutes without activity. That timeout lives in this browser only — it is not a server session.');
    return;
  }
  if (stored) {
    session = stored;
    session.lastActivity = Date.now();
    saveSession();
    enterApp();
    return;
  }
  showLogin('');
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

  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      gotoView(link.dataset.view);
    });
  });
  document.getElementById('quick-add').addEventListener('click', () => openQuickAdd());
  document.getElementById('global-search').addEventListener('input', e => {
    state.search = e.target.value.toLowerCase();
    render();
  });
  document.getElementById('content').addEventListener('click', onContentClick);
  document.getElementById('content').addEventListener('change', onContentChange);

  const pop = document.getElementById('sku-popover');
  if (pop) {
    pop.addEventListener('mousedown', e => e.preventDefault());
    pop.addEventListener('click', e => {
      const btn = e.target.closest('[data-sku-index]');
      if (!btn || !activeDoc || !skuPop.input) return;
      const product = skuPop.matches[Number(btn.dataset.skuIndex)];
      if (product) pickSku(skuPop.input, product, activeDoc.lines);
    });
    pop.addEventListener('mouseover', e => {
      const btn = e.target.closest('[data-sku-index]');
      if (!btn) return;
      const idx = Number(btn.dataset.skuIndex);
      if (idx === skuPop.active) return;
      skuPop.active = idx;
      paintSkuActive();
    });
  }
  document.addEventListener('click', e => {
    if (e.target.closest && (e.target.closest('#sku-popover') || e.target.classList?.contains('sku-search'))) return;
    hideSkuPopover();
  });
  document.addEventListener('scroll', event => {
    const target = event.target;
    if (target && (target.id === 'modal-body' || target.id === 'content')) hideSkuPopover();
  }, true);
  window.addEventListener('resize', () => hideSkuPopover());

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-backdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const popEl = document.getElementById('sku-popover');
    if (popEl && !popEl.classList.contains('hidden')) {
      hideSkuPopover();
      return;
    }
    const modal = document.getElementById('modal');
    if (!modal.classList.contains('hidden')) {
      closeModal();
      return;
    }
    if (document.getElementById('sidebar').classList.contains('is-open')) closeSidebar(true);
  });

  document.getElementById('sign-out').addEventListener('click', () => signOut('logout'));
  const branchSelect = document.getElementById('branch-switch');
  if (branchSelect) {
    branchSelect.addEventListener('change', () => {
      if (!session || !can('switch-branch')) return;
      session.viewBranch = branchSelect.value;
      saveSession();
      audit('branch-switch', `${session.name} is viewing ${scopeLabel()}`);
      paintChrome();
      render();
    });
  }
  document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const username = String(fd.get('username') || '').trim().toLowerCase();
    const password = String(fd.get('password') || '');
    const user = DEMO_USERS.find(item => item.username === username);
    const err = document.getElementById('login-error');
    if (!user || password !== DEMO_PASSWORD) {
      if (err) {
        err.textContent = 'That username and password don’t match a demo account. The shared demo password is pulse.';
        err.classList.remove('hidden');
      }
      return;
    }
    if (err) {
      err.textContent = '';
      err.classList.add('hidden');
    }
    const branch = branchById(user.branchId);
    session = {
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      branchId: user.branchId,
      branchName: branch ? branch.name : '',
      viewBranch: user.branchId,
      loggedInAt: Date.now(),
      lastActivity: Date.now(),
    };
    saveSession();
    audit('login', `${session.name} (${session.username}) signed in as ${ROLE_LABEL[session.role]} at ${session.branchName} (${session.branchId})`);
    enterApp();
  });
  ['pointerdown', 'keydown'].forEach(type => document.addEventListener(type, noteActivity, { passive: true }));
}

window.openAddContact = openAddContact;
window.openAddDeal = openAddDeal;
window.openAddTask = openAddTask;
window.openAddProduct = openAddProduct;
window.openAddOrder = openAddOrder;
window.openAddQuote = openAddQuote;
window.openAddDelivery = openAddDelivery;

initShell();
load();
boot();
