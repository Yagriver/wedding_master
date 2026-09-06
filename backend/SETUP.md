# RSVP storage

The public frontend is hosted on GitHub Pages. The API is designed for a Cloudflare Worker with a D1 database. The public form remains closed until its API URL is configured.

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
5. Deploy: `wrangler deploy`.
6. Set the production value in `../rsvp-config.js` to the returned HTTPS Worker URL, then push the frontend to GitHub.

Keep credentials out of source control. Do not upload the local test database. Back up production data through D1 export before schema changes.

## Behaviour

- The exact normalized first-name / first-surname pair identifies one household response. Capitalisation, diacritics and repeated spaces are ignored.
- This is deliberately name-only access, not authentication. Someone with the same name cannot be distinguished; guests are told to contact the couple if a retrieved response belongs to someone else.
- Lookup and save use POST bodies and uncached responses. There is no public list endpoint.
- Prepared SQL statements and server validation protect database integrity. Version checks reject accidental overwrites from stale forms.
- The public API still permits name guessing and unsolicited registrations. CORS does not authenticate guests. A guest allowlist and abuse controls may be added before wider rollout.
