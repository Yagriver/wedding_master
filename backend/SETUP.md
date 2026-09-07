# RSVP storage

The public frontend is hosted on GitHub Pages. The API is deployed on Cloudflare Workers with a D1 database and configured in `rsvp-config.js`. Local previews use a separate test database.

## Local preview

With Node.js 24, run `node backend/local.mjs` from the project folder, then open `http://127.0.0.1:4173/#rsvp`.

Test responses persist in `../WEBSITE_DATA/rsvp.sqlite`, outside the website and repository. Use fictional data locally. The local server serves an explicit list of public files only.

Run backend checks with `node --test backend/worker.test.mjs`.

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

## Behaviour

- The exact normalized first-name / first-surname pair identifies one household response. Capitalisation, diacritics and repeated spaces are ignored.
- This is deliberately name-only access, not authentication. Someone with the same name cannot be distinguished; guests are told to contact the couple if a retrieved response belongs to someone else.
- Lookup and save use POST bodies and uncached responses. There is no public list endpoint.
- Prepared SQL statements and server validation protect database integrity. Version checks reject accidental overwrites from stale forms.
- The public API still permits name guessing and unsolicited registrations. CORS does not authenticate guests. A guest allowlist and abuse controls may be added before wider rollout.
