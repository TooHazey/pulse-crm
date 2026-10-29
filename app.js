// PULSE — static CRM demo for an electrical / MRO / automation distributor.
// Sample book is inspired by Marshall E. Campbell Company (mecampbell.com).
// This is a prototype, not an official MEC product. Data stored in localStorage.

const STAGES = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

// Bump when the sample book should replace an older `pulse-crm` seed once.
// Stored separately so the `pulse-crm` record shape stays the same.
// `pulse-theme` is not read or written here.
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

// Navigation
document.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    state.currentView = link.dataset.view;
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
  // Attach dynamic listeners
  attachListeners();
}

function renderDashboard() {
  const totalValue = state.deals.filter(d => !d.stage.includes('Closed')).reduce((s, d) => s + d.value, 0);
  const won = state.deals.filter(d => d.stage === 'Closed Won').reduce((s, d) => s + d.value, 0);
  const openTasks = state.tasks.filter(t => !t.done).length;
  const lowStock = state.products.filter(p => p.stock <= p.reorderLevel).length;
  const openOrders = state.orders.filter(o => !['Delivered','Cancelled'].includes(o.status)).length;
  return `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold">Dashboard</h2>
        <p class="text-slate-500 text-sm mt-1">Quotes, job releases, and shelf stock for contractors, OEMs, and MRO accounts</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        ${statCard('Pipeline', formatMoney(totalValue), 'fa-dollar-sign', 'text-emerald-600 bg-emerald-50')}
        ${statCard('Won', formatMoney(won), 'fa-trophy', 'text-amber-600 bg-amber-50')}
        ${statCard('Open Tasks', openTasks, 'fa-list-check', 'text-blue-600 bg-blue-50')}
        ${statCard('Contacts', state.contacts.length, 'fa-users', 'text-violet-600 bg-violet-50')}
        ${statCard('Low Stock', lowStock, 'fa-exclamation-triangle', 'text-orange-600 bg-orange-50')}
        ${statCard('Open Orders', openOrders, 'fa-shopping-cart', 'text-indigo-600 bg-indigo-50')}
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 class="font-semibold mb-4">Recent Activity</h3>
          <div class="space-y-3">
            ${state.activities.slice(0, 5).map(a => `
              <div class="flex gap-3 text-sm">
                <div class="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0"></div>
                <div>
                  <div>${a.text}</div>
                  <div class="text-xs text-slate-400">${a.time}</div>
                </div>
              </div>`).join('') || '<p class="text-slate-400 text-sm">No activity yet. Quote calls, job releases, and deliveries will show up here.</p>'}
          </div>
        </div>
        <div class="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 class="font-semibold mb-4">Low Stock Alerts</h3>
          <div class="space-y-2">
            ${state.products.filter(p => p.stock <= p.reorderLevel).map(p => `
              <div class="flex justify-between text-sm p-2 hover:bg-slate-50 rounded-lg">
                <div>
                  <div class="font-medium">${p.name}</div>
                  <div class="text-xs text-slate-400">${p.sku}</div>
                </div>
                <div class="text-orange-600 font-medium">${p.stock} left</div>
              </div>`).join('') || '<p class="text-slate-400 text-sm">Shelf is healthy. Nothing is at or under its reorder point.</p>'}
          </div>
        </div>
      </div>
    </div>`;
}

function statCard(label, value, icon, color) {
  return `
    <div class="bg-white rounded-2xl border border-slate-200 p-5">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-slate-500">${label}</div>
          <div class="text-2xl font-bold mt-1">${value}</div>
        </div>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center ${color}">
          <i class="fa-solid ${icon}"></i>
        </div>
      </div>
    </div>`;
}

function renderPipeline(q) {
  const filtered = state.deals.filter(d => 
    !q || d.title.toLowerCase().includes(q) || (contactById(d.contactId)?.name || '').toLowerCase().includes(q)
  );
  return `
    <div class="space-y-4">
      <div class="flex justify-between items-end">
        <div>
          <h2 class="text-2xl font-bold">Pipeline</h2>
          <p class="text-slate-500 text-sm mt-1">Job packages, panel builds, retrofits, and stock agreements — drag a quote between stages</p>
        </div>
        <button onclick="openAddDeal()" class="text-sm bg-primary text-white px-3 py-1.5 rounded-lg">+ Deal</button>
      </div>
      <div class="flex gap-4 overflow-x-auto pb-4" id="kanban">
        ${STAGES.map(stage => {
          const deals = filtered.filter(d => d.stage === stage);
          const total = deals.reduce((s, d) => s + d.value, 0);
          return `
            <div class="kanban-column w-72 shrink-0 bg-slate-100/70 rounded-2xl p-3 border border-slate-200" data-stage="${stage}">
              <div class="flex justify-between items-center mb-3 px-1">
                <div class="font-medium text-sm">${stage}</div>
                <div class="text-xs text-slate-500">${deals.length} · ${formatMoney(total)}</div>
              </div>
              <div class="space-y-2 min-h-[200px]">
                ${deals.map(d => dealCard(d)).join('')}
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

function dealCard(d) {
  const c = contactById(d.contactId);
  return `
    <div class="kanban-card bg-white rounded-xl p-3 shadow-sm border border-slate-200" draggable="true" data-deal="${d.id}">
      <div class="font-medium text-sm">${d.title}</div>
      <div class="text-xs text-slate-500 mt-1">${c?.name || 'No contact'}</div>
      <div class="flex justify-between items-center mt-2">
        <div class="text-sm font-semibold text-emerald-600">${formatMoney(d.value)}</div>
        <div class="text-xs text-slate-400">${d.closeDate}</div>
      </div>
    </div>`;
}

function renderContacts(q) {
  const filtered = state.contacts.filter(c => 
    !q || c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  );
  return `
    <div class="space-y-4">
      <div class="flex justify-between items-end">
        <div>
          <h2 class="text-2xl font-bold">Contacts</h2>
          <p class="text-slate-500 text-sm mt-1">${filtered.length} buyers across contractors, plants, OEMs, and municipalities</p>
        </div>
        <button onclick="openAddContact()" class="text-sm bg-primary text-white px-3 py-1.5 rounded-lg">+ Contact</button>
      </div>
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th class="px-4 py-3 font-medium">Name</th>
              <th class="px-4 py-3 font-medium">Company</th>
              <th class="px-4 py-3 font-medium">Email</th>
              <th class="px-4 py-3 font-medium">Title</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(c => `
              <tr class="border-t border-slate-100 hover:bg-slate-50">
                <td class="px-4 py-3 font-medium">${c.name}</td>
                <td class="px-4 py-3">${c.company}</td>
                <td class="px-4 py-3 text-slate-600">${c.email}</td>
                <td class="px-4 py-3 text-slate-500">${c.title}</td>
              </tr>`).join('')}
          </tbody>
        </table>
        ${filtered.length === 0 ? `<div class="p-8 text-center text-slate-400">${q ? 'No accounts match that search.' : 'No accounts yet. Add a contractor, plant, OEM, or municipal buyer.'}</div>` : ''}
      </div>
    </div>`;
}

function renderTasks(q) {
  const filtered = state.tasks.filter(t => !q || t.title.toLowerCase().includes(q));
  return `
    <div class="space-y-4">
      <div class="flex justify-between items-end">
        <div>
          <h2 class="text-2xl font-bold">Tasks</h2>
          <p class="text-slate-500 text-sm mt-1">Quote follow-ups, job releases, backorders, deliveries, and drive startups</p>
        </div>
        <button onclick="openAddTask()" class="text-sm bg-primary text-white px-3 py-1.5 rounded-lg">+ Task</button>
      </div>
      <div class="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        ${filtered.map(t => `
          <div class="flex items-center gap-4 p-4 hover:bg-slate-50">
            <input type="checkbox" data-task="${t.id}" class="task-check w-5 h-5 rounded" ${t.done ? 'checked' : ''}>
            <div class="flex-1">
              <div class="${t.done ? 'line-through text-slate-400' : ''}">${t.title}</div>
              <div class="text-xs text-slate-400 mt-0.5">Due ${t.due}</div>
            </div>
          </div>`).join('') || `<div class="p-8 text-center text-slate-400">${q ? 'No follow-ups match that search.' : 'No follow-ups yet. Log a quote chase, job release, backorder, or drive startup.'}</div>`}
      </div>
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
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('modal').classList.add('flex');
}
function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('modal').classList.remove('flex');
}
window.closeModal = closeModal;

function openAddContact() {
  openModal('Add Contact', `
    <form id="contact-form" class="space-y-3">
      <input name="name" required placeholder="Full name" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
      <input name="email" type="email" required placeholder="Email" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
      <input name="company" placeholder="Company" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
      <input name="title" placeholder="Title" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
      <div class="flex justify-end gap-2 pt-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm text-slate-600">Cancel</button>
        <button type="submit" class="px-4 py-2 text-sm bg-primary text-white rounded-lg">Save</button>
      </div>
    </form>
  `);
  document.getElementById('contact-form').onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    state.contacts.push({
      id: uid(),
      name: fd.get('name'),
      email: fd.get('email'),
      company: fd.get('company') || '',
      title: fd.get('title') || '',
      phone: ''
    });
    addActivity(`Added contact ${fd.get('name')}`);
    save();
    closeModal();
    render();
  };
}

function openAddDeal() {
  const options = state.contacts.map(c => `<option value="${c.id}">${c.name} (${c.company})</option>`).join('');
  openModal('Add Deal', `
    <form id="deal-form" class="space-y-3">
      <input name="title" required placeholder="Job package, panel build, stock agreement" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
      <input name="value" type="number" required placeholder="Value ($)" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
      <select name="contactId" required class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
        <option value="">Select contact</option>${options}
      </select>
      <select name="stage" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
        ${STAGES.map(s => `<option>${s}</option>`).join('')}
      </select>
      <input name="closeDate" type="date" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
      <div class="flex justify-end gap-2 pt-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm text-slate-600">Cancel</button>
        <button type="submit" class="px-4 py-2 text-sm bg-primary text-white rounded-lg">Save</button>
      </div>
    </form>
  `);
  document.getElementById('deal-form').onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    state.deals.push({
      id: uid(),
      title: fd.get('title'),
      value: Number(fd.get('value')),
      contactId: fd.get('contactId'),
      stage: fd.get('stage'),
      closeDate: fd.get('closeDate') || ''
    });
    addActivity(`Created deal "${fd.get('title')}"`);
    save();
    closeModal();
    render();
  };
}

function openAddTask() {
  openModal('Add Task', `
    <form id="task-form" class="space-y-3">
      <input name="title" required placeholder="Quote follow-up, release, backorder, startup" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
      <input name="due" type="date" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
      <div class="flex justify-end gap-2 pt-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm text-slate-600">Cancel</button>
        <button type="submit" class="px-4 py-2 text-sm bg-primary text-white rounded-lg">Save</button>
      </div>
    </form>
  `);
  document.getElementById('task-form').onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    state.tasks.push({
      id: uid(),
      title: fd.get('title'),
      due: fd.get('due') || '',
      done: false
    });
    save();
    closeModal();
    render();
  };
}

function renderProducts(q) {
  const filtered = state.products.filter(p => 
    !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.category||'').toLowerCase().includes(q)
  );
  return `
    <div class="space-y-4">
      <div class="flex justify-between items-end">
        <div>
          <h2 class="text-2xl font-bold">Products & Inventory</h2>
          <p class="text-slate-500 text-sm mt-1">${filtered.length} SKUs · conduit, wire, controls, and lighting · low stock highlighted</p>
        </div>
        <button onclick="openAddProduct()" class="text-sm bg-primary text-white px-3 py-1.5 rounded-lg">+ Product</button>
      </div>
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th class="px-4 py-3 font-medium">SKU</th>
              <th class="px-4 py-3 font-medium">Name</th>
              <th class="px-4 py-3 font-medium">Category</th>
              <th class="px-4 py-3 font-medium">Price</th>
              <th class="px-4 py-3 font-medium">Stock</th>
              <th class="px-4 py-3 font-medium">Reorder</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(p => `
              <tr class="border-t border-slate-100 hover:bg-slate-50 ${p.stock <= p.reorderLevel ? 'bg-orange-50' : ''}">
                <td class="px-4 py-3 font-mono text-xs">${p.sku}</td>
                <td class="px-4 py-3 font-medium">${p.name}</td>
                <td class="px-4 py-3 text-slate-600">${p.category || '—'}</td>
                <td class="px-4 py-3">${formatMoney(p.price)}</td>
                <td class="px-4 py-3 font-medium ${p.stock <= p.reorderLevel ? 'text-orange-600' : ''}">${p.stock}</td>
                <td class="px-4 py-3 text-slate-500">${p.reorderLevel}</td>
              </tr>`).join('')}
          </tbody>
        </table>
        ${filtered.length === 0 ? `<div class="p-8 text-center text-slate-400">${q ? 'No SKUs match that search.' : 'No SKUs yet. Add conduit, wire, controls, or lighting.'}</div>` : ''}
      </div>
    </div>`;
}

function renderOrders(q) {
  const filtered = state.orders.filter(o => 
    !q || o.orderNumber.toLowerCase().includes(q) || (contactById(o.contactId)?.name || '').toLowerCase().includes(q) || o.status.toLowerCase().includes(q)
  );
  return `
    <div class="space-y-4">
      <div class="flex justify-between items-end">
        <div>
          <h2 class="text-2xl font-bold">Orders</h2>
          <p class="text-slate-500 text-sm mt-1">${filtered.length} releases and counter tickets</p>
        </div>
        <button onclick="openAddOrder()" class="text-sm bg-primary text-white px-3 py-1.5 rounded-lg">+ Order</button>
      </div>
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th class="px-4 py-3 font-medium">Order #</th>
              <th class="px-4 py-3 font-medium">Customer</th>
              <th class="px-4 py-3 font-medium">Date</th>
              <th class="px-4 py-3 font-medium">Status</th>
              <th class="px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(o => {
              const c = contactById(o.contactId);
              const statusColor = {
                'Draft': 'bg-slate-100 text-slate-700',
                'Confirmed': 'bg-blue-100 text-blue-700',
                'Shipped': 'bg-amber-100 text-amber-700',
                'Delivered': 'bg-emerald-100 text-emerald-700',
                'Cancelled': 'bg-red-100 text-red-700'
              }[o.status] || 'bg-slate-100';
              return `
                <tr class="border-t border-slate-100 hover:bg-slate-50">
                  <td class="px-4 py-3 font-medium">${o.orderNumber}</td>
                  <td class="px-4 py-3">${c?.name || '—'}</td>
                  <td class="px-4 py-3 text-slate-600">${o.date}</td>
                  <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}">${o.status}</span></td>
                  <td class="px-4 py-3 font-medium">${formatMoney(o.total)}</td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
        ${filtered.length === 0 ? `<div class="p-8 text-center text-slate-400">${q ? 'No orders match that search.' : 'No orders yet. Release stocked SKUs to a contractor, plant, or OEM.'}</div>` : ''}
      </div>
    </div>`;
}

function openAddProduct() {
  openModal('Add Product', `
    <form id="product-form" class="space-y-3">
      <input name="sku" required placeholder="SKU" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
      <input name="name" required placeholder="Product name" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
      <input name="price" type="number" step="0.01" required placeholder="Price" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
      <div class="grid grid-cols-2 gap-2">
        <input name="stock" type="number" required placeholder="Stock" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
        <input name="reorderLevel" type="number" placeholder="Reorder level" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
      </div>
      <input name="category" placeholder="Conduit, wire, controls, lighting" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
      <div class="flex justify-end gap-2 pt-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm text-slate-600">Cancel</button>
        <button type="submit" class="px-4 py-2 text-sm bg-primary text-white rounded-lg">Save</button>
      </div>
    </form>
  `);
  document.getElementById('product-form').onsubmit = e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    state.products.push({
      id: uid(),
      sku: fd.get('sku'),
      name: fd.get('name'),
      price: Number(fd.get('price')),
      stock: Number(fd.get('stock')),
      reorderLevel: Number(fd.get('reorderLevel')) || 0,
      category: fd.get('category') || ''
    });
    addActivity(`Added product ${fd.get('name')}`);
    save();
    closeModal();
    render();
  };
}

function openAddOrder() {
  const contactOptions = state.contacts.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  const productOptions = state.products.map(p => `<option value="${p.id}" data-price="${p.price}">${p.name} (${formatMoney(p.price)})</option>`).join('');
  openModal('New Order', `
    <form id="order-form" class="space-y-3">
      <select name="contactId" required class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
        <option value="">Select customer</option>${contactOptions}
      </select>
      <select name="productId" required class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
        <option value="">Select product</option>${productOptions}
      </select>
      <input name="qty" type="number" min="1" value="1" required class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
      <select name="status" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
        <option>Draft</option>
        <option>Confirmed</option>
        <option>Shipped</option>
        <option>Delivered</option>
      </select>
      <div class="flex justify-end gap-2 pt-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 text-sm text-slate-600">Cancel</button>
        <button type="submit" class="px-4 py-2 text-sm bg-primary text-white rounded-lg">Create Order</button>
      </div>
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
    render();
  };
}

function openQuickAdd() {
  openModal('Quick Add', `
    <div class="space-y-2">
      <button onclick="openAddContact(); closeModal();" class="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 flex items-center gap-3">
        <i class="fa-solid fa-user-plus text-primary"></i> New Contact
      </button>
      <button onclick="openAddDeal(); closeModal();" class="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 flex items-center gap-3">
        <i class="fa-solid fa-handshake text-primary"></i> New Deal
      </button>
      <button onclick="openAddTask(); closeModal();" class="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 flex items-center gap-3">
        <i class="fa-solid fa-check text-primary"></i> New Task
      </button>
      <button onclick="openAddProduct(); closeModal();" class="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 flex items-center gap-3">
        <i class="fa-solid fa-box text-primary"></i> New Product
      </button>
      <button onclick="openAddOrder(); closeModal();" class="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 flex items-center gap-3">
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
        render();
      }
    });
  });
}

// Expose for inline handlers
window.openAddContact = openAddContact;
window.openAddDeal = openAddDeal;
window.openAddTask = openAddTask;
window.openAddProduct = openAddProduct;
window.openAddOrder = openAddOrder;

// Init
load();
render();