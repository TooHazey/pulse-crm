// PULSE — Clean, user-friendly CRM prototype for sales teams & agencies
// Data stored in localStorage

const STAGES = ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

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
  if (saved) {
    state = { ...state, ...JSON.parse(saved) };
  } else {
    seedData();
  }
}
function save() {
  localStorage.setItem('pulse-crm', JSON.stringify(state));
}

function seedData() {
  state.contacts = [
    { id: 1, name: 'Alex Rivera', email: 'alex@agencyco.com', company: 'Agency Co', phone: '+1 555-0101', title: 'Founder' },
    { id: 2, name: 'Jordan Lee', email: 'jordan@brandstudio.io', company: 'Brand Studio', phone: '+1 555-0102', title: 'Marketing Director' },
    { id: 3, name: 'Sam Chen', email: 'sam@growthlab.com', company: 'Growth Lab', phone: '+1 555-0103', title: 'Head of Sales' },
  ];
  state.deals = [
    { id: 1, title: 'Website Redesign', contactId: 1, value: 18500, stage: 'Proposal', closeDate: '2026-11-15' },
    { id: 2, title: 'SEO Retainer', contactId: 2, value: 4200, stage: 'Qualified', closeDate: '2026-10-30' },
    { id: 3, title: 'Brand Campaign', contactId: 3, value: 32000, stage: 'Negotiation', closeDate: '2026-12-01' },
    { id: 4, title: 'Monthly Social', contactId: 1, value: 2800, stage: 'Lead', closeDate: '2026-11-05' },
  ];
  state.tasks = [
    { id: 1, title: 'Send proposal to Alex', dealId: 1, due: '2026-10-30', done: false },
    { id: 2, title: 'Follow up on SEO call', dealId: 2, due: '2026-10-29', done: false },
    { id: 3, title: 'Prepare case studies', dealId: 3, due: '2026-11-02', done: true },
  ];
  state.activities = [
    { id: 1, text: 'Call with Alex Rivera — interested in redesign', time: '2h ago', contactId: 1 },
    { id: 2, text: 'Email sent to Jordan Lee with pricing', time: 'Yesterday', contactId: 2 },
  ];
  state.products = [
    { id: 1, sku: 'WEB-PKG-001', name: 'Website Package', price: 8500, stock: 12, reorderLevel: 3, category: 'Services' },
    { id: 2, sku: 'SEO-RET-M', name: 'SEO Monthly Retainer', price: 1400, stock: 99, reorderLevel: 10, category: 'Services' },
    { id: 3, sku: 'BRAND-KIT', name: 'Brand Identity Kit', price: 4200, stock: 5, reorderLevel: 2, category: 'Products' },
    { id: 4, sku: 'SOCIAL-M', name: 'Social Media Management', price: 950, stock: 20, reorderLevel: 5, category: 'Services' },
  ];
  state.orders = [
    { id: 1, orderNumber: 'ORD-1001', contactId: 1, date: '2026-10-20', status: 'Confirmed', items: [{productId: 1, qty: 1, price: 8500}], total: 8500 },
    { id: 2, orderNumber: 'ORD-1002', contactId: 2, date: '2026-10-25', status: 'Shipped', items: [{productId: 2, qty: 3, price: 1400}], total: 4200 },
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
        <p class="text-slate-500 text-sm mt-1">Sales, inventory, and orders at a glance</p>
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
              </div>`).join('') || '<p class="text-slate-400 text-sm">No activity yet</p>'}
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
              </div>`).join('') || '<p class="text-slate-400 text-sm">All stock levels healthy</p>'}
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
          <p class="text-slate-500 text-sm mt-1">Drag deals between stages</p>
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
          <p class="text-slate-500 text-sm mt-1">${filtered.length} contacts</p>
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
        ${filtered.length === 0 ? '<div class="p-8 text-center text-slate-400">No contacts found</div>' : ''}
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
          <p class="text-slate-500 text-sm mt-1">Stay on top of follow-ups</p>
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
          </div>`).join('') || '<div class="p-8 text-center text-slate-400">No tasks yet</div>'}
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
      <input name="title" required placeholder="Deal title" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
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
      <input name="title" required placeholder="Task" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
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
          <p class="text-slate-500 text-sm mt-1">${filtered.length} items · Low stock highlighted</p>
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
        ${filtered.length === 0 ? '<div class="p-8 text-center text-slate-400">No products found</div>' : ''}
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
          <p class="text-slate-500 text-sm mt-1">${filtered.length} orders</p>
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
        ${filtered.length === 0 ? '<div class="p-8 text-center text-slate-400">No orders found</div>' : ''}
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
      <input name="category" placeholder="Category" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
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