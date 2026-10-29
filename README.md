# PULSE

A static CRM + light inventory/ordering demo for **electrical distribution sales** — accounts, job quotes, shelf stock, and releases for contractors, OEMs, and MRO buyers.

The sample book is inspired by [Marshall E. Campbell Company](https://www.mecampbell.com) (Port Huron, Livonia, and Saginaw). PULSE is a prototype for that kind of counter and inside-sales desk. It is not an official MEC product.

## Sample data

Opening the app seeds `localStorage` key `pulse-crm` (contacts, deals, tasks, activities, products, orders). A separate flag, `pulse-crm-seed-version`, is set to `2`. If an older install has `pulse-crm` without that flag (or with a lower version), the next load replaces the sample book once and writes the flag. Edits made after that stay put until the version is bumped again. The theme key `pulse-theme` is separate and is not reset by the reseed.

## Features
- **Dashboard** — Pipeline, revenue, tasks, low-stock alerts, open orders
- **Pipeline** — Kanban board with drag-and-drop
- **Contacts** — Searchable people & companies
- **Tasks** — Follow-up tracking
- **Products & Inventory** — SKU, price, stock levels, reorder alerts
- **Orders** — Sales orders with line items and status (Draft → Delivered)
- **Quick Add** + global search
- **Local storage** persistence

## How to Use
1. Open `index.html` in any modern browser.
2. Sample data loads on first visit. A saved book from an earlier seed version is replaced once (see above).
3. Create products, then orders — stock adjusts automatically on non-draft orders.

## Next Steps
- Multi-line orders, purchase orders, barcode scanning
- Full ERP features (purchasing, receiving, warehouse locations)
- Backend + multi-user + auth
- AI recommendations and demand forecasting
