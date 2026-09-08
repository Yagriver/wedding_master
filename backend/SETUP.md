# RSVP storage

The public frontend is hosted on GitHub Pages. The API is deployed on Cloudflare Workers with a D1 database and configured in `rsvp-config.js`. Local previews use a separate test database.

## Local preview

With Node.js 24, run `node backend/local.mjs` from the project folder, then open `http://127.0.0.1:4173/#rsvp`.

Test responses persist in `../WEBSITE_DATA/rsvp.sqlite`, outside the website and repository. Use fictional data locally. The local server serves an explicit list of public files only.

Run backend checks with `node --test backend/worker.test.mjs`.
Run the full suite with `node --test --test-isolation=none backend/worker.test.mjs backend/finance.test.mjs`.

## Cloudflare deployment

Using the official Wrangler CLI in this folder:

1. Sign in with `wrangler login`.
2. Create the database with `wrangler d1 create wedding-rsvp`.
3. Put the returned database ID in `wrangler.jsonc`.
4. Apply the schema: `wrangler d1 execute wedding-rsvp --remote --file=schema.sql`.
5. Apply the planning migration: `wrangler d1 execute wedding-rsvp --remote --file=migrations/002_planning.sql`.
6. Set a long, random administrator key (at least 24 characters) using `wrangler secret put ADMIN_PASSWORD`. Never put it in the frontend or Git.
7. Deploy: `wrangler deploy`.
8. Set the production value in `../rsvp-config.js` to the returned HTTPS Worker URL, then push the frontend to GitHub.

## Management

Open `/admin.html`. Locally, a random administrator key is created at `../WEBSITE_DATA/admin-key.txt`; copy it into the sign-in field. The key is outside the served files and public repository. Production uses the Worker secret above. The key is held only in page memory and is cleared on sign-out or reload.

Management supports invited households, private groups and notes, per-person table assignments, filters, totals, and CSV export. Add invitations using the same lead name and first surname used for RSVP; the normalized pair links responses automatically. Households without an invitation list are flagged for review.

Guest answers and private planning records are stored in separate tables. Updating an RSVP cannot overwrite planning notes. Version checks reject stale planning edits. This first version assigns attendance, hotel and bus choices at household level; guest names, adult/child category and dietary notes are individual. Mixed attendance or different hotels within a household can use separate registrations for now.

Catering and transport CSV exports include only confirmed rows in the current filter and exclude private planning notes. The full export includes them. Spreadsheet formula prefixes are escaped. Older free-text RSVPs are displayed without guessing individual names; review those records when converting them.

Keep credentials out of source control. Do not upload the local test database. Back up production data through D1 export before schema changes.

## Wedding finances

Open `/finance.html`, or follow Wedding finances from guest management. It uses the same administrator key, entered separately on each page. Finance records are private, held in a separate `finances` table, and never returned by guest RSVP endpoints. Stale saves are rejected rather than overwriting another device's changes.

Before publishing this feature, back up D1, then apply `wrangler d1 execute wedding-rsvp --remote --file=migrations/003_finances.sql` from the backend folder. Deploy the updated Worker and publish the frontend files together, including `finance-model.mjs`. The migration only creates a new table and can be safely reapplied. Local startup applies it automatically. No production migration or deployment was performed while implementing this feature.

For an isolated local demo, set `WEDDING_DATA_DIR` to a separate temporary directory before starting `local.mjs`. Otherwise the existing `../WEBSITE_DATA` directory remains the default. Demo data does not represent live RSVP or finance data.

### Workflow

1. Create a separate record for each supplier quote or alternative, with category, reference, date and optional document URL. Keep it in Quote status until accepted. Multiple records may use the same supplier name.
2. Enter each item's full price and explicitly choose before or including IVA. Enter the rate supplied on the quotation; different rates require separate items. Amounts are in EUR with two decimal places. Add a tax note for exemptions or other supplier explanations. The app does not determine applicable tax rates.
3. Mark the chosen quote Contracted. Contracted and Completed records contribute to committed totals. Declined, Cancelled and alternative Quote records remain available without increasing commitments. Only mark multiple alternatives contracted when they are actually separate purchases.
4. Add payment deadlines with amounts including IVA. Record actual payments separately with payment date, method and invoice/receipt/bank reference. Link each payment to a deadline to reduce that deadline's unpaid amount. Split one transfer into multiple entries with the same bank reference when allocating it across deadlines.
5. Enter the amount actually paid and choose With IVA or Without IVA. With IVA extracts tax from that total using the payment IVA rate (e.g. EUR 110 at 10% is EUR 100 net and EUR 10 IVA). Without IVA allocates the full cash amount to net, leaving IVA outstanding. A single quote rate is prefilled when adding a payment; mixed-rate quotes require an explicit applicable rate or separate payment entries by rate. The rate is saved with the payment and changing a quote later does not rewrite historical payments. Refunds reverse the calculated parts. Deadlines track combined cash amounts.
6. Export contracts, item-level tax breakdowns, payments/refunds or deadlines using the export selector. Exports include all records, independently of the search filter; supplier name and contract ID connect the files. CSV cells are protected against spreadsheet formula prefixes.

Each item is rounded to cents: tax is calculated on the entered net amount, or extracted from an inclusive total. Invoice rounding can differ, so reconcile the entered quote items against the supplier's document. The dashboard separates committed IVA from paid IVA, and net outstanding from IVA outstanding. Paid figures include all records and subtract refunds; outstanding figures include accepted contracts and do not offset credits between components or suppliers. These are planning totals, not a tax return. Deadlines exceeding a quote total trigger an editor warning. Deadlines are displayed in date order and marked overdue; no email reminders are sent.

Existing payments retain their saved allocation under Keep existing allocation. Select With IVA or Without IVA to recalculate an older payment explicitly; pending allocations are not guessed. Payment CSVs include calculation mode and rate as well as net and IVA amounts. The server calculates and validates the split independently of the browser. No additional SQL migration is needed; restart the local server or deploy the updated Worker and frontend together.

This release stores document links and payment references, not uploaded attachments. It does not provide an immutable accounting audit trail, currency conversion, automatic invoice import or a target-budget planner. Keep original contracts and payment evidence. Use Delete quote / contract in the editor to permanently remove a saved record, including all its payments, deadlines and notes. A confirmation popup names the record and explains the deletion; version checks reject deletion of a record changed on another device. Declined and Cancelled statuses remain available when you want to retain the history.

## Behaviour

- The exact normalized first-name / first-surname pair identifies one household response. Capitalisation, diacritics and repeated spaces are ignored.
- This is deliberately name-only access, not authentication. Someone with the same name cannot be distinguished; guests are told to contact the couple if a retrieved response belongs to someone else.
- Lookup and save use POST bodies and uncached responses. There is no public list endpoint.
- Prepared SQL statements and server validation protect database integrity. Version checks reject accidental overwrites from stale forms.
- The public API still permits name guessing and unsolicited registrations. CORS does not authenticate guests. A guest allowlist and abuse controls may be added before wider rollout.
