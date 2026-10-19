# Person-based guest management

The protected admin page has three views: Invitati, Responses, and Table planning. A stable invited-person ID owns the group/party membership, private notes, aliases and table assignment. RSVP submissions remain in the original `responses` table. Each member of a submission can link to one invited person, and any invited person can have multiple response links. A decline without individual members can explicitly cover multiple people.

Confirming a link saves the response version and answer snapshot. Separate submissions for the same invited person do not create additional guests. Conflicting answers require an explicit source choice. Changed RSVP versions return to review and invalidate the previous resolution. Counts and table occupancy derive from invited people, never submission totals. Pending and conflicting answers do not count as confirmed attendees. Seating distinguishes confirmed and provisional places; declined guests retain their assignment for review but do not occupy a seat in the displayed count.

## Storage and deployment

Back up D1 before deployment. Apply `migrations/004_guests.sql`, then deploy the Worker and publish `admin.html`, `admin.js`, `admin.css` and `guest-model.mjs` together. The new table is additive. Previous `responses`, `planning`, and `finances` records remain intact. Existing planning entries are converted on the first read and persisted on the first successful save. No response identity is silently confirmed during migration. Original planning entries that overlap an imported list can be combined manually using guest Details.

`POST /admin/guests/list` and `POST /admin/guests/save` require the existing administrator credential. Saves use a global optimistic version check and validate IDs, references, answer snapshots and table capacity. The public lookup/save routes never return invitation records or private planning data. A stale admin tab must refresh before retrying a conflicting save.

Import private invitation data through the authenticated API, never frontend bundles or repository files. Stable source IDs make the initial import repeatable without duplicating unchanged source rows. The import is a snapshot, not ongoing Excel synchronisation. Unknown ages remain unknown; explicit child placeholders can be marked as children. Question-mark places remain tentative. Single/double/triple labels are preserved as metadata and never translated into guest counts.

Tests: `node --test --test-isolation=none backend/worker.test.mjs backend/finance.test.mjs backend/guests.test.mjs`.

The existing RSVP access model still uses a normalized lead-name pair. Editing the same pair updates that submission; different lead names can create separate submissions. The new matching model reconciles those submissions privately without changing the public RSVP flow.
