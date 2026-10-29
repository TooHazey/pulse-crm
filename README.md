# PULSE

A static CRM + light inventory/ordering demo for **electrical distribution sales** — accounts, opportunities, quotes, shelf stock, releases, and job-site deliveries for contractors, OEMs, and MRO buyers.

The sample book is inspired by [Marshall E. Campbell Company](https://www.mecampbell.com) (Port Huron, Livonia, and Saginaw). PULSE is a prototype for that kind of counter and inside-sales desk. It is not an official MEC product.

## Sample data

Opening the app seeds `localStorage` key `pulse-crm` (contacts, deals, tasks, activities, products, quotes, orders, deliveries). A separate flag, `pulse-crm-seed-version`, is set to `4`. If an older install has `pulse-crm` without that flag (or with a lower version), the next load replaces the sample book once and writes the flag. Edits made after that stay put until the version is bumped again. The theme key `pulse-theme` is separate and is not reset by the reseed.

Version 4 is the branch book: each record is tagged with a branch code, on-hand is tracked per branch, and quotes and orders carry Michigan sales tax plus a demo payment status. Signing in does not change the theme.

To load this book over an older demo, reload the page — the version check reseeds on its own. If the browser is still running an older `app.js` (GitHub Pages cache), hard-refresh so the new script loads (`Ctrl+Shift+R`, or `Cmd+Shift+R` on a Mac).

To throw away edits and load the sample book again after you already have version 4, clear two keys and reload:

- `pulse-crm`
- `pulse-crm-seed-version`

Leave `pulse-theme` alone if you want to keep light or dark mode. The demo session is `pulse-session`. The demo audit list is `pulse-audit`. Neither is real security. In devtools: Application → Local Storage → delete the keys you want reset.

## Demo sign-in

The CRM shell stays behind a login screen. This is **not** production authentication. Every account uses the password `pulse` (also printed on the sign-in panel). The session is a JSON blob in `localStorage` (`pulse-session`) and clears after 15 minutes without a click or keypress. Branch filtering, role gates, and the audit log are the same kind of theater: they show the model, and a visitor can still read or edit storage. The real path — Supabase or Firebase or Auth0, Postgres, Stripe, and tax — is [docs/PRODUCTION.md](docs/PRODUCTION.md).

| Branch | Code | Usernames |
| --- | --- | --- |
| Port Huron | 1000 | `counter.ph`, `sales.ph`, `warehouse.ph` |
| Saginaw | 2000 | `counter.sg`, `sales.sg`, `warehouse.sg` |
| Lapeer | 3000 | `counter.lp`, `sales.lp`, `warehouse.lp` |
| Livonia | 4000 | `counter.lv`, `sales.lv`, `warehouse.lv` |
| All four | — | `manager`, `admin` |

A branch user only sees that branch’s accounts, pipeline, quotes, orders, deliveries, and on-hand. Manager and admin get a branch switcher, including All branches. Void, cancel, refund, and delete ask for a manager or admin. Card tenders are labeled “Processed via Stripe (demo)” and never ask for a card number.

## Features
- **Sign-in** — Demo users per branch, idle timeout, sign out, role-gated destructive actions
- **Dashboard** — Pipeline, open quotes, tasks, low-stock alerts, orders, deliveries for the branch you are viewing
- **Pipeline** — Opportunity stages with drag-and-drop (separate from quote documents)
- **Quotes** — Multi-line quotes (SKU, qty, UOM, price), Michigan tax, payment status, expiry, margin, convert to order
- **Contacts** — Searchable people & companies, tax exempt flag, resale or exemption certificate, ship-to ZIP
- **Tasks** — Follow-up tracking
- **Products & Inventory** — Section and subcategory, manufacturer, sort, paging, on-hand per branch, reorder alerts
- **Orders** — Multi-line sales orders, customer PO, job name, tax, payment status, collect-payment demo, status (Draft → Delivered)
- **Deliveries** — Ship-to, window, carrier, tracking, status board linked to orders
- **Audit log** — Demo trail for sign-in, payment changes, refunds, and voids (manager and admin)
- **Quick Add** + global search
- **Local storage** persistence

## How to Use
1. Open `index.html` in any modern browser (or the GitHub Pages site).
2. Sign in with a demo account. `counter.ph` / `pulse` opens the Port Huron book. Sample data loads on first visit. A saved book from an earlier seed version is replaced once (see above).
3. Build a quote from that branch’s shelf. Tax follows the ship-to ZIP (6% inside Michigan in this demo) unless the customer is exempt. Convert the quote when the job releases — ZIP, exemption, and certificate copy onto the order, and a delivery stub is created.
4. Collect payment with cash, check, account, or card (demo). Stock adjusts when an order is Confirmed, Shipped, or Delivered, and returns if the order goes back to Draft or Cancelled. Cancelling and refunding need a manager.

## Next Steps
- Purchase orders, barcode scanning, warehouse locations
- Full ERP features (purchasing, receiving, invoicing)
- The production auth, database, Stripe, and tax plan in [docs/PRODUCTION.md](docs/PRODUCTION.md)
- AI recommendations and demand forecasting
