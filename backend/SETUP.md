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

### Item-based finances (September 2026)

Finance records use schemaVersion 2. Each item stores its description, amount in cents, before/after IVA basis, rate in hundredths of one percent, optional deadline, paid checkbox and payment date. Paid means the whole item including IVA; use separate items for instalments. Net and IVA are calculated per item and summed independently.

Choose Quote or Booked. Booked records automatically become Completed when all items are marked paid, and revert when an item becomes unpaid. Quotes are provisional and excluded from commitments and unpaid deadline totals. Actual paid figures include all marked-paid items.

Upcoming deadlines are ordered by date with five items per page. Card icons indicate IVA at least 8%; dollar icons indicate lower rates (all amounts remain EUR). The selected calendar month shows its unpaid booked items, separate net and IVA, and turns green when all items due that month are paid. Months without scheduled items are not marked completed.

The same administrator key protects finance listing, saves and deletion. Saves/deletions check record versions; older schemas cannot overwrite new records. The key stays in page memory only. Delete supplier is available with a confirmation; it removes the selected record and its items.

Migration uses only current production quotations and supplier details. Back up production first. Use migrateFinance from finance-items.mjs to retain quote amounts/rates/notes/references/document links, clear legacy payments and milestones, and initialise items with blank deadlines and unpaid status. Never import playground.json or local test snapshots into production. The existing finances table supports the new JSON payload without a SQL table change. Guest data is independent and must remain untouched.

Run node --test --test-isolation=none backend/worker.test.mjs backend/finance.test.mjs from the project root. Publish finance.html, finance.css, finance.js, finance-items.mjs and finance-model.mjs together with the updated Worker. Assets use an item-release cache key. Keep private backups, migration inputs and credentials outside this public repository.

## Behaviour

- The exact normalized first-name / first-surname pair identifies one household response. Capitalisation, diacritics and repeated spaces are ignored.
- This is deliberately name-only access, not authentication. Someone with the same name cannot be distinguished; guests are told to contact the couple if a retrieved response belongs to someone else.
- Lookup and save use POST bodies and uncached responses. There is no public list endpoint.
- Prepared SQL statements and server validation protect database integrity. Version checks reject accidental overwrites from stale forms.
- The public API still permits name guessing and unsolicited registrations. CORS does not authenticate guests. A guest allowlist and abuse controls may be added before wider rollout.
