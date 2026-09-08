# Wedding website

A simple, responsive, multilingual website built with HTML, CSS and JavaScript.

## Features

- Five sections: Home, The Wedding Day, Locations, Accommodation, and RSVP.
- Spanish, Italian, and English, with a language selector that remembers your choice.
- Responsive layouts for phones, tablets, and computers.
- A day timeline, venue photos and map links, and space for accommodation information.
- An RSVP form with name-based lookup, basic questions, and editable responses, connected to persistent storage.
- A protected management page with household grouping, invitation tracking, filters, private notes, table assignments, and CSV export.
- A protected finance page (`finance.html`) for EUR quotes, contracts, item-level IVA, payment deadlines, dated payments/refunds, and finance CSV exports.

## Preview and hosting

Open `index.html` in a browser to preview the website locally. No installation or build step is required.

The public pages can be hosted on GitHub Pages. RSVP storage uses a separate backend; see `backend/SETUP.md` for local testing and setup.

## Editing

- `app.js`: page content, navigation, and translations.
- `day.js`: timeline content and translations.
- `styles.css` and `day.css`: appearance and responsive layouts.
- `assets/`: photographs.
- `admin.html`, `admin.js`, and `admin.css`: the management screen.
- `backend/SETUP.md`: storage and administrator access setup.

Keep private guest information and credentials out of the repository.
