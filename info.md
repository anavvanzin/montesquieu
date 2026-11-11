# Discussing Dauchy’s Montesquieu — interactive report

A cinematic, single-page HTML report adapted from Ana Vitória Vanzin Mendes’s seven-slide v4 discussion of Serge Dauchy’s paper. The Athena owl package supplies the reversible scroll journey, layered backgrounds, local fonts, and animation libraries. Ana’s supplied Montesquieu engraving replaces Athena in the opening. The report’s prose, evidence plates, speaker notes, and source register follow the v4 slide materials.

## Contents and interactions

- Seven-part argument covering political liberty and mœurs, the Brazilian Constitution of 1824, *Compromisso Constitucional*, *A Justiça*, article 6, II of the Civil Code of 1916, and two concluding questions.
- Gender as a second axis: authority inside the household, women in the constitutional gallery, the feminine Justice, and married women’s legal capacity.
- Dauchy’s fourteen-paragraph paper map and a thirteen-item source register.
- Expandable speaker scripts for all seven slides, including cues, timings, and verification limits.
- Full-artwork dialogs, mobile contents navigation, internal section links, and a download link for the v4 PPTX.
- A reversible owl journey using 120 local flight frames, layered backgrounds, text entrances, and parallax.
- Responsive layouts and a static reduced-motion presentation.
- All runtime images, fonts, and scripts are local. There is no backend, account system, analytics, API, or cross-device persistence.

## Editorial conventions

French and Portuguese source spelling is retained. English translations are marked `[tr. AVVM]`; “My reading” and “My juxtaposition” identify interpretation rather than source wording. Dauchy paragraph numbers follow the fourteen-paragraph manuscript. Neither artwork is presented as proof of direct Montesquieu reception.

Marker C in *Compromisso* interprets the 1896 composition, not attendance at the 1891 ceremony or the painter’s documented intention. The 1961/1962 pairing is Ana’s juxtaposition, not a claim about Ceschiatti’s intention. Beviláqua’s works are cited through secondary sources where the originals were not seen. The 1900 draft was not consulted, so the conflicting accounts of married women’s incapacity remain open. Reproduction rights and any unverified attribution or chronology should be checked again before external publication.

## File structure

```text
app/
├── index.html                  # Report text, evidence, notes, and document structure
├── css/report.css              # Editorial layout and responsive/reduced-motion states
├── js/report.js                # Navigation, dialogs, text flow, and owl choreography
├── package.json                # Local start command
├── server.cjs                  # Static development server
├── assets/
│   ├── report/                 # Artwork plates, Montesquieu portrait, and v4 PPTX
│   ├── owl/                    # 000–119.webp flight sequence
│   ├── owl-perched.webp        # Perched owl
│   └── img/                    # Athena logo, foregrounds, backgrounds, and layered scenes
├── vendor/
│   ├── js/                     # Local scrolling and animation libraries
│   └── fonts/                  # Local font CSS and WOFF2 files
└── docs/
    ├── source.md               # Athena source-package provenance
    ├── dependency-origins.json # Third-party dependency origins
    └── licenses/               # Font and dependency licences
```

## Run locally

Node.js 18 or newer is sufficient; no dependency installation or build step is required.

```sh
npm start
```

Open `http://127.0.0.1:8932/index.html`. To use another port:

```sh
node server.cjs 8933
```

Keep `index.html`, `css/`, `js/`, `assets/`, and `vendor/` together when moving the report to static hosting. Opening through a local or hosted HTTP server is recommended rather than `file://`.

## Editing

- Edit report prose, translations, notes, and references in `index.html`.
- Edit layout, typography, breakpoints, and reduced-motion rules in `css/report.css`.
- Adjust the four owl resting points in `anchors()` and the journey timing in `journeyPose()` in `js/report.js`. Screen positions use CSS pixels; artwork anchors use source-image pixels.
- If artwork dimensions, cropping, or filenames change, update the corresponding image styles and owl anchors together.
- The flight sequence loads `000.webp` through `119.webp`; changing its length requires updating `N` in `js/report.js`.

## Dependencies and provenance

The local server uses only the Node.js standard library. The page includes GSAP 3.13.0, ScrollTrigger, SplitText, Locomotive Scroll 5.0.0, and the Inter Tight, Newsreader, and Pinyon Script fonts. Dependency origins and licences are retained in `docs/`; the original Athena package is documented in `docs/source.md`.
