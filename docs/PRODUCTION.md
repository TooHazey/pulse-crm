# Production path for PULSE

PULSE on GitHub Pages is a **demo**. Sign-in, branch filters, the audit list, and “Card (demo)” payments all live in the browser. The password `pulse` is plaintext in `app.js` and on the login screen. Anyone who can open the page can read `localStorage`. Do not put real customers, resale certificates, or card data in this build.

This note is how Marshall E. Campbell (or a similar four-branch distributor) would leave static Pages for a real counter system. Nothing in the current pull request calls Stripe, Supabase, or any other backend.

## 1. Authentication

Use a hosted identity provider. Any of these fit:

- **Supabase Auth** — email and password, with optional SAML/OIDC later. Closest fit if Postgres also lives in Supabase.
- **Firebase Auth** — email and password, Google, or Microsoft.
- **Auth0** — email and password plus SSO if MEC already has Microsoft 365.

Each user profile (or app metadata / custom claim) carries:

| Claim | Example | Use |
| --- | --- | --- |
| `branchId` | `1000`, `2000`, `3000`, `4000` | Home branch. Managers may hold a list. |
| `role` | `counter`, `sales`, `warehouse`, `manager`, `admin` | What the UI may do. |

Branch codes stay the ones in the demo:

- `1000` Port Huron
- `2000` Saginaw
- `3000` Lapeer
- `4000` Livonia

**Row level security** (Supabase/Postgres RLS, or equivalent security rules) is the real boundary. A Port Huron counter’s JWT must not be able to `select` a Saginaw quote, even if the UI is bypassed. Policies look like: `branch_id = auth.jwt() ->> 'branchId'`, with a second policy that lets `manager` and `admin` read every branch. The demo’s branch switcher is only a `viewBranch` field in `localStorage`. In production that switcher still exists, but the API refuses rows outside the claims.

Passwords are hashed by the provider. The app never stores them. Turn on MFA for manager and admin before the second branch goes live.

## 2. Data

Replace the `pulse-crm` blob with Postgres (Supabase is the straightforward host). One table per entity the demo already has:

- `branches` — the four codes above
- `profiles` — user id, name, role, home `branch_id`
- `contacts` — plus `tax_exempt`, `resale_certificate`, `ship_zip`, `branch_id`
- `deals`, `tasks`, `activities`
- `products` — shared catalog (SKU, cost, price, section, subcategory, manufacturer, UOM)
- `branch_inventory` — `(product_id, branch_id, qty_on_hand, reorder_point)`. This is what `stockByBranch` is pretending to be.
- `quotes`, `quote_lines`
- `orders`, `order_lines` — plus `ship_zip`, `tax_exempt`, `resale_certificate`, `tax_rate`, `tax_amount`, `subtotal`, `total`, `payment_status`
- `payments` — amount, method, status, user id, timestamps. No PAN, no CVV.
- `deliveries`
- `audit_log` — append-only

Migrate by exporting the demo JSON once, then loading it as seed for Port Huron. Do not keep writing the live book to `localStorage`.

The GitHub Pages build can stay up as a training sandbox. Point the real hostname at the hosted app.

## 3. Payments

Use **Stripe Checkout** or **Payment Element**. Both keep card entry on fields Stripe hosts. The PULSE server (a small Supabase Edge Function, or any backend you already run) creates a PaymentIntent or Checkout Session for the order balance and returns only a client secret or a redirect URL.

Rules:

- Never add inputs for the full card number, expiration, or CVV. The demo’s “Card (demo)” button exists specifically so the UI can be practiced without those fields.
- Do not put the Stripe secret key in this repo, in Pages, or in client JavaScript. Publishable key in the client; secret key only in server env.
- Cash, check, and on-account stay internal payments rows. Only `Card` creates a Stripe object.
- A webhook (`checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`) is what moves `payment_status` to Paid, leaves it Unpaid on failure, or sets Refunded. The browser success page is not the source of truth.
- Refunds are created server-side by manager/admin, then confirmed by the webhook.

Map demo statuses straight across: Unpaid, Partial, Paid, Refunded. Partial is a PaymentIntent for less than the balance, or several succeeded payments whose sum is under `total`.

## 4. Tax

Michigan sales tax in the demo is a flat **6%** ZIP table in `app.js`. That is a picture of the calculation (subtotal → tax → total, with a customer exemption), not a filing engine.

In production use **Stripe Tax**, **TaxJar**, or **Avalara**:

- Send the ship-to address (not just a ZIP typed at the counter) and the line items.
- Store `tax_exempt` and the resale or government certificate number on the customer, and attach the certificate id the tax vendor returns.
- Copy the exemption onto the quote, and copy it again when the quote becomes an order — the demo already does that copy.
- Persist the rate and tax amount the vendor returns on the order. Do not recompute 6% locally once Stripe Tax is on.
- Out-of-state ship-to and industrial-processing exemptions are the vendor’s job. The demo’s “non-Michigan ZIP → 0%” rule is only a stand-in.

## 5. Security

| Demo behavior | Production replacement |
| --- | --- |
| Password `pulse` in source | Provider hashes passwords. Users set their own. |
| Session JSON in `localStorage` | HttpOnly, Secure, SameSite cookies or the provider’s session. 15-minute idle timeout stays, enforced on the server. |
| Branch filter in JavaScript | RLS / security rules. Branch A cannot read branch B. |
| Role checks before delete, cancel, refund | Same checks in the API. The UI hide is not the control. |
| `pulse-audit` in `localStorage` | `audit_log` table, insert-only for the app role, readable by manager/admin. |
| Card copy that says “Stripe (demo)” | Stripe-hosted fields. PCI scope stays **SAQ-A** because card data never touches MEC’s server or this repo. |
| No transport security of its own | HTTPS everywhere. Secrets only in the host’s env, not in git. |
| Anyone can edit the book | MFA for managers. Separate warehouse logins. No shared counter password. |

Audit at least: sign-in, sign-out, idle timeout, branch switch, payment status changes, refunds, and voids/cancels. The demo already writes those action names.

## 6. Rollout across the four branches

Keep the Pages demo available for training the whole time.

1. **Port Huron (`1000`) — identity and read path.** Supabase (or the chosen host) with Auth, profiles, and RLS. Import accounts and the catalog. Counters sign in with email. They can look up a customer and a SKU. No live charges yet. Cash, check, and on-account can be recorded if the payment table exists.
2. **Port Huron — quotes, orders, inventory.** `branch_inventory` replaces `stockByBranch`. Confirming an order commits Port Huron on-hand only. Quote → order still copies tax exemption and ship-to ZIP.
3. **Port Huron — card and tax.** Stripe Checkout or Payment Element for the balance. Webhooks set Paid / failed / Refunded. Stripe Tax or TaxJar/Avalara uses the ship-to address and exemption certificates. Turn on MFA for the Port Huron manager.
4. **Saginaw (`2000`).** Same app, new users with `branchId=2000`. Prove a Saginaw login cannot read a Port Huron order. Stock is Saginaw’s bin, not Port Huron’s.
5. **Lapeer (`3000`), then Livonia (`4000`).** Lapeer is the smaller counter (no drive inventory in the sample book). Livonia is the OEM/automation desk. Each gets its own users and bin. Managers receive a multi-branch claim and the branch switcher, now backed by RLS instead of `localStorage`.
6. **Retire the shared demo password** on the production hostname. Leave GitHub Pages as the sandbox only.

Suggested order of branches matches how the sample book is weighted: Port Huron has the full shelf, Saginaw is controls and wire, Lapeer is a counter, Livonia is automation and MRO.
