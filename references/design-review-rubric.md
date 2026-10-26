# Design Review Rubric

## Weighted score

| Category | Weight |
|---|---:|
| Strategic fit | 10 |
| Industry appropriateness | 7 |
| Brand distinctiveness | 9 |
| Visual hierarchy | 8 |
| Typography | 6 |
| Composition diversity and semantic fit | 7 |
| Page rhythm and spacing | 5 |
| Content clarity | 8 |
| Conversion support | 8 |
| Responsive behavior | 8 |
| Accessibility | 8 |
| SEO integration | 5 |
| Performance | 5 |
| Component consistency | 3 |
| Avoidance of generic AI patterns | 3 |
| **Total** | **100** |

Score each category from 0–5, then multiply by `weight / 5`.

## Thresholds

- **Below 70:** Fail
- **70–79:** Conditional pass after high-severity remediation
- **80–89:** Strong
- **90–100:** Excellent, provided no automatic failure exists

## Automatic failures

- Major keyboard barrier or keyboard trap
- Unreadable contrast affecting critical content
- Horizontal overflow on target mobile widths
- Missing H1 on a normal content page
- Missing or duplicated page title
- Fabricated business claim, review, rating, credential, price, address, or availability
- Copied identifiable composition
- Missing primary conversion
- Severe unexplained performance regression
- Critical content hidden behind inaccessible interaction
- Form cannot identify or recover from errors
- Essential page content unavailable without failed client-side JavaScript
- Composition map absent before implementation
- Major section components collapse materially different content into one universal section schema
- Prominent heading leaves a single character or punctuation fragment on its own line
- Prominent heading contains a clearly avoidable broken word
- Hero contains a large unexplained dead zone caused by layout mechanics rather than art direction
- Primary hero content is substantially delayed below adjacent media without a compositional purpose

Apply typography failures with language and viewport context. Legitimate language-specific wrapping and truly unavoidable narrow-screen behavior require documented rationale rather than an automatic failure.

## Remediation

Every deduction must identify the element, viewport/state, evidence, exact change, rationale, expected outcome, owner, and verification method. Re-score only after evidence of remediation.

## Composition scoring anchors

Score composition diversity and page rhythm together with semantic appropriateness. Inspect eyebrow frequency, repeated introduction patterns, alignment runs, component silhouettes, section density, media ratios, hierarchy sources, mobile adaptations, whitespace purpose, and the vertical relationship between text and media in heroes and split layouts.

- **0-1:** Mechanical repetition or chaotic variation obscures purpose; compositions are unrelated to content semantics.
- **2:** Some differentiated sections, but a dominant generic formula, repeated silhouette, or desktop-only composition weakens the page.
- **3:** Mostly content-appropriate composition with minor accidental repetition or mobile flattening.
- **4:** Cohesive brand system with clear, content-driven changes in rhythm and hierarchy across viewports.
- **5:** Every major composition advances the narrative or decision task; repetition is intentional, mobile preserves the ideas, and the page is distinctive without arbitrary novelty.

## Typography scoring anchors

Inspect prominent heading measure and line-break quality at every required viewport. Distinguish intentional editorial breaks from unavoidable responsive wrapping and accidental browser outcomes.

- **0-1:** Prominent text contains isolated characters, punctuation-only lines, avoidable word fragments, or repeated severe orphans that obstruct reading.
- **2:** Text remains readable, but restrictive measures or unstable breaks make headings unnecessarily tall or weaken hierarchy.
- **3:** Mostly intentional wrapping with minor avoidable orphan or phrase-break issues.
- **4:** Measures and fluid scales produce readable, balanced wraps across viewports; manual breaks, if any, are justified.
- **5:** Line breaking actively supports the art direction and hierarchy across viewports without sacrificing readability or resilience.
