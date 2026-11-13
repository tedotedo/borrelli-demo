# Borrelli Delicatessen — Static Concept Website

Unsolicited static concept website created by **Mark Aszkenasy** for **Borrelli Delicatessen** (`3 Danby Wynd, Yarm TS15 9SF`).

## Design Archetype: Scalloped Italian Shopfront Awning, Butcher-Paper Salumeria & Perforated Friday Counter Ticket

- `index.html` — Authentic striped & scalloped Italian shopfront canopy awning header, asymmetric 3-layer artisanal butcher-paper & wax-sealed antipasto collage, overlapping perforated paper counter ticket (`FRI-03-DW`) for weekly **Friday "Piatto Di Antipasto Night"**, interactive **"Build Your Custom Sharing Board or Gift Hamper"** Counter Selector, and Danby Wynd directions.
- `menu-deli.html` — Accessible 3-tab showcase (`Daytime Café & Panini`, `Italian Deli Counter & Pantry`, `Seasonal Hampers & Sharing Boards`) plus the interactive Platter & Hamper Counter Customiser and `.ph` owner placeholders.
- `orders-bookings.html` — Interactive dual form switcher: (1) **Book Friday "Piatto Di Antipasto Night"** (with 1-tap upcoming Friday quick-select chips) and (2) **Pre-Order Sharing Platters & Gift Hampers** (automatically pre-populated from the Counter Customiser via `localStorage` and query params).
- `css/styles.css` — Self-hosted typography (`Lora` + `Karla`), WCAG AA+ contrast palette (`#FBF6EC`, `#9B341C`, `#DCE6D5`, `#1F3D2B`, `#8A1C1C`), CSS radial-gradient punched ticket notches, stitched butcher-paper borders, and solid opaque sticky mobile action bar.
- `js/main.js` — Interactive Counter Customiser with live pre-order sync, accessible mobile navigation, ARIA tablist keyboard controls, upcoming Friday chip generator, and client-side form validation.
- `favicon.svg` & `images/logo-mark.svg` — Custom octagonal Tuscan salumeria seal & serif `B` monogram SVGs.
- `PITCH.md` — Walk-in pitch playbook, domain audit, 3-tap demo, and owner placeholder checklist.

## Local Preview

Serve from this folder with any static HTTP server:

```bash
python3 -m http.server 8082
```

Then open `http://localhost:8082` in a browser.

## Compliance & Privacy

- Every HTML page includes `<meta name="robots" content="noindex, nofollow">`.
- Zero external network requests (all fonts, styles, scripts, and SVGs are self-hosted locally).
- Zero fabricated dishes, prices, reviews, staff names, or awards; unknown details are styled in `.ph` tags for owner confirmation.

## Set D — Build Your Board

- `d/index.html`, `d/css/styles.css`, `d/js/app.js` — Italian tin-label styling and a board builder: tap salumi, cheese and antipasti onto a wooden board, then send it to the counter.
- Live at https://tedotedo.github.io/borrelli-demo/d/. Reuses the root `fonts/` and `images/`; same `noindex`, zero external requests and `.ph` placeholder rules as Sets A–C.
- The twelve counter items are generic categories for illustration, not the confirmed range, and no prices are shown. The Google rating is left as a placeholder until re-checked.
