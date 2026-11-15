# Home illustration and collapsed navigation review

Independently reviewed on 15 November 2026 for `feat/home-illustration-collapsed-contents`. The reviewer did not implement these presentation changes. Scope: generated home/lesson navigation, responsive layout, decorative image and theme readability; no CPU/model/content changes or execution corpus recheck.

## Browser evidence

Fresh Chromium pages served at port 4230 passed at desktop 1440 × 1000 and phone 390 × 844 in both light and dark themes:

- Home Course contents and all 15 nested modules started closed; all 58 lesson links remained present. Enter opened the outer disclosure, Space opened a module, Tab reached its previously hidden first lesson link, and Enter navigated to the correct lesson.
- Lesson Course lessons started closed with a visible summary at both widths. Enter and Space toggled it. Resizing from desktop to phone and back preserved the user's open or closed choice. The closed desktop layout used one column, releasing the sidebar's space.
- No horizontal document overflow occurred on home or lesson pages. A separate check with every module expanded also found no overflow at widths 320, 650, 950, 951, 1280 and 1440 pixels.
- The main Start the course link led directly to the first lesson. Screenshot inspection found readable CTA text and hero copy, an intact illustration and sensible stacked phone layout. No uncaught page errors occurred.

The WebP is 81,626 bytes and decoded to its declared 1536 × 1024 dimensions. Its displayed aspect ratio was preserved (approximately 517 × 345 on desktop, 321 × 214 on phone). Empty `alt` is appropriate: this abstract chip illustration is decorative, has no readable instructions/results, and supplies no information needed to understand or use the course. It is not presented as a technical diagram or simulation result.

After the theme transition settled, computed CTA text/background contrast was 4.96:1 in light and 8.43:1 in dark; muted hero copy against the panel was 5.23:1 and 7.65:1 respectively. These checks concern the sampled text, not a complete accessibility certification. An initial contrast probe sampled the short background transition while its foreground had already changed; waiting for the final theme colour removed that test artifact.

## Findings

No P1/P2 issue found in the reviewed changes. Accepted and closed one P3 typography finding: at desktop widths 1280 and 1440, the original hero title split `RISC-` and `V` across lines. The implementer added a nonwrapping architecture-name span and adjusted the title width. Independently checked the regenerated page at 1280, 1440 and 390 pixels in light and dark: `RISC-V` occupied one intact text rectangle in each of the six checks, with no document overflow or clipped CTA.

The implementer also moved the folded contents immediately after hero/progress and before the longer introduction and prerequisites. Independently verified that DOM order, closed initial state, all 15 modules and all 58 links in the same six checks. Enter → Space → Tab → Enter still opened contents, opened the first module, selected its link and navigated to the first lesson. No unresolved finding remains in this review.

Limitations: browser phone emulation, not physical-device or screen-reader testing. Keyboard interactions, rendered screenshots, image dimensions and sampled colour contrast were checked independently. The Digital Design comparison and image provenance are author records, not independently re-established here.

## Follow-up: remove home adaptation note

Independently checked `fix/remove-home-adaptation-note` on 15 November 2026. A character-level comparison against HEAD confirmed the generator and generated home page each contain only the same 634-character deletion for the adaptation section, including its floating-point scope paragraph. In fresh Chromium pages at 1440 and 390 pixels, the section was absent, the Start link and decoded hero image remained visible, all 58 contents links remained present, and neither page overflowed horizontally. The footer retained Sources and licences, Arm Assembly Lab and Report a problem with their original targets; the local NOTICE target returned HTTP 200. No runtime recheck was needed or performed. No finding remains for this follow-up.
