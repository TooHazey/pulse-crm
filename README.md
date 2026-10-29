# PULSE

A static CRM + light inventory/ordering demo for **electrical distribution sales** — accounts, opportunities, quotes, shelf stock, releases, and job-site deliveries for contractors, OEMs, and MRO buyers.

The sample book is inspired by [Marshall E. Campbell Company](https://www.mecampbell.com) (Port Huron, Livonia, and Saginaw). PULSE is a prototype for that kind of counter and inside-sales desk. It is not an official MEC product.

## Sample data

Opening the app seeds `localStorage` key `pulse-crm` (contacts, deals, tasks, activities, products, quotes, orders, deliveries). A separate flag, `pulse-crm-seed-version`, is set to `3`. If an older install has `pulse-crm` without that flag (or with a lower version), the next load replaces the sample book once and writes the flag. Edits made after that stay put until the version is bumped again. The theme key `pulse-theme` is separate and is not reset by the reseed.

Version 3 is the commercial-document book: multi-line quotes, a sectioned electrical catalog, multi-line orders, and deliveries.

To load this book over an older demo, reload the page — the version check reseeds on its own. If the browser is still running an older `app.js` (GitHub Pages cache), hard-refresh so the new script loads (`Ctrl+Shift+R`, or `Cmd+Shift+R` on a Mac).

To throw away edits and load the sample book again after you already have version 3, clear two keys and reload:

- `pulse-crm`
- `pulse-crm-seed-version`

Leave `pulse-theme` alone if you want to keep light or dark mode. In devtools: Application → Local Storage → delete those two keys.

## Features
- **Dashboard** — Pipeline, open quotes, tasks, low-stock alerts, orders, deliveries
- **Pipeline** — Opportunity stages with drag-and-drop (separate from quote documents)
- **Quotes** — Multi-line quotes (SKU, qty, UOM, price), status, expiry, margin, convert to order
- **Contacts** — Searchable people & companies
- **Tasks** — Follow-up tracking
- **Products & Inventory** — Section and subcategory, manufacturer, sort, paging, reorder alerts
- **Orders** — Multi-line sales orders, customer PO, job name, editable status (Draft → Delivered)
- **Deliveries** — Ship-to, window, carrier, tracking, status board linked to orders
- **Quick Add** + global search
- **Local storage** persistence

## How to Use
1. Open `index.html` in any modern browser (or the GitHub Pages site).
2. Sample data loads on first visit. A saved book from an earlier seed version is replaced once (see above).
3. Build a quote from the shelf, convert it to an order, and confirm the ticket when it should commit stock. A delivery stub is created with the conversion.
4. Stock adjusts when an order is Confirmed, Shipped, or Delivered, and returns if the order goes back to Draft or Cancelled.

## Next Steps
- Purchase orders, barcode scanning, warehouse locations
- Full ERP features (purchasing, receiving, invoicing)
- Backend + multi-user + auth
- AI recommendations and demand forecasting
