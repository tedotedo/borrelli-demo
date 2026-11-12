# Borrelli Delicatessen — Static Concept Website

Unsolicited static concept website created by **Mark Aszkenasy** for **Borrelli Delicatessen** (`3 Danby Wynd, Yarm TS15 9SF`).

## Structure

- `index.html` — Classic Danby Wynd salumeria homepage featuring the antipasto platter hero, weekly **Friday "Piatto Di Antipasto Night"** spotlight ticket, deli counter & wicker gift hamper showcase, and Danby Wynd directions.
- `menu-deli.html` — Accessible 3-tab showcase (`Daytime Café & Panini`, `Italian Deli Counter & Pantry`, `Seasonal Hampers & Sharing Boards`) with clear `.ph` owner placeholders.
- `orders-bookings.html` — Interactive dual form switcher: (1) **Book Friday "Piatto Di Antipasto Night"** (with 1-tap upcoming Friday quick-select chips) and (2) **Pre-Order Sharing Platters & Gift Hampers** for collection at 3 Danby Wynd.
- `css/styles.css` — Self-hosted typography (`Lora` + `Karla`), WCAG AA contrast palette (`#FCF8F0`, `#99361F`, `#274732`, `#231C18`), butcher-paper pinstripe salumeria detailing, double-ruled deli cards, and solid opaque sticky mobile action bar.
- `js/main.js` — Accessible mobile navigation (`Escape` closes), ARIA tablist keyboard controls, URL hash deep-linking, upcoming Friday chip generator, and client-side form validation.
- `favicon.svg` & `images/logo-mark.svg` — Custom octagonal Tuscan salumeria seal & serif `B` monogram SVGs.
- `PITCH.md` — Walk-in pitch playbook covering `borrellis.co.uk` → `survey-keys.com` spam redirect, `borrellideli.co.uk` availability (Nominet), 20-sec opener, 3-tap demo, and owner placeholder checklist.

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
