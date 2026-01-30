# Style Guide
## The Encyclopædia (Inquiry Institute)

**Version 1.0** — Locked for Volume I

> An encyclopædia should not be the place where questions go to die.  
> It should be the place where better questions are learned.

---

## Table of Contents

1. [Article Classes](#article-classes)
2. [Typographic Constitution](#typographic-constitution)
3. [Marginalia Placement Rules](#marginalia-placement-rules)
4. [Author Attribution](#author-attribution)
5. [Implementation Status](#implementation-status)

---

# Article Classes

> Article class determines layout, not the other way around.

## Class I — Constellation Entry

**(Major, orienting articles)**

### Purpose
- Define a core concept
- Survey multiple traditions
- Establish the conceptual terrain

### Typical Topics
- Consciousness
- Attention
- Time
- Civilization
- Life

### Length
- **800–1,200 words**
- **≈ 3–5 columns**
- **1.5–2.5 pages**

### Layout Privileges
- ✔ Spanning title
- ✔ Signed (author required)
- ✔ Multiple marginalia (quotes, questions, objections)
- ✔ May open a new section or volume

### Rules
- Must begin on a fresh page
- Must not share a page start with another entry
- Always uses `\entry{}` command (spanning title)

---

## Class II — Major Entry

**(Standard encyclopaedia article)**

### Purpose
- Explain a concept clearly
- Present multiple perspectives
- Leave synthesis open

### Typical Topics
- Attention
- Memory
- Intentionality
- Evolution
- Computation

### Length
- **450–600 words**
- **≈ 2 full columns**
- **1 page**

### Layout Privileges
- ✔ Spanning title
- ✔ Signed (author optional but encouraged)
- ✔ 1–2 marginalia items

### Rules
- May start mid-volume
- Must occupy ≥ 1.5 columns to justify spanning title
- Uses `\entry{}` command (spanning title)

---

## Class III — Minor Entry

**(Focused, self-contained concepts)**

### Purpose
- Define or contextualize a single idea
- Support larger entries
- Enable cross-referencing

### Typical Topics
- Hard problem of consciousness
- Intentionality
- Apophasis
- Attention deficit

### Length
- **220–300 words**
- **≈ 1 column**

### Layout Privileges
- ✘ No spanning title
- ✔ Column-width headword
- ✔ Optional marginalia (max 1)

### Rules
- May share page with other minor entries
- Should not begin with excessive white space
- Uses `\shortentry{}` command (run-in headword)

---

## Class IV — Scholium / Note

**(Marginal or supplemental)**

### Purpose
- Clarify, provoke, or historicize
- Add voice without expanding body text

### Typical Content
- Definitions
- Objections
- Faculty asides
- Cross-references

### Length
- **40–120 words**

### Layout Privileges
- ✘ No title
- ✔ Margin-only or footnote
- ✔ Always attached to a host entry

### Rules
- Never standalone
- Never span columns
- Never exceed margin density limits
- Implemented as marginalia only (no separate entry)

---

## Class V — Citation / Quotation Entry

**(Primary-source fragments)**

### Purpose
- Let thinkers speak directly
- Anchor abstractions historically

### Typical Content
- James, Husserl, Turing, Eckhart
- Letters, notebooks, lectures

### Length
- **25–80 words (excerpt)**

### Layout Privileges
- ✔ Margin or inset block
- ✔ Attribution mandatory
- ✔ May use distinct typographic voice

### Rules
- Must point to a parent entry
- Never compete visually with body text
- Implemented as marginalia with quotation formatting

---

## Summary Table (Generator-Friendly)

| Class | Words | Columns | Title Spans? | Shares Page? | LaTeX Command |
|-------|-------|---------|--------------|--------------|---------------|
| I — Constellation | 800–1200 | 3–5 | Yes | No | `\entry{}` |
| II — Major | 450–600 | ~2 | Yes | Sometimes | `\entry{}` |
| III — Minor | 220–300 | ~1 | No | Yes | `\shortentry{}` |
| IV — Scholium | 40–120 | — | No | Margin only | Marginalia |
| V — Quotation | 25–80 | — | No | Margin/inset | Marginalia |

---

## The Single Most Important Enforcement Rule

**Article class determines layout, not the other way around.**

If an article doesn't fit:
- edit it
- split it
- promote or demote its class

**Do not fudge the page.**

---

## Class Detection Logic

### Automatic Detection (by word count)
- **Class I (Constellation)**: 800–1200 words
- **Class II (Major)**: 450–600 words
- **Class III (Minor)**: 220–300 words
- **Class IV (Scholium)**: 40–120 words (marginalia only)
- **Class V (Quotation)**: 25–80 words (marginalia only)

### Manual Override
Entries can specify class via AsciiDoc attribute:
```
:article-class: constellation
:article-class: major
:article-class: minor
```

---

## Class-Aware Generation Prompts

### Class I — Constellation Entry
```
"Write a Class I Constellation Entry on [Topic] (~1000 words, 
surveying multiple traditions, establishing conceptual terrain, 
no synthesis)."
```

### Class II — Major Entry
```
"Write a Class II Major Entry on [Topic] (~500 words, 
neutral tone, multiple perspectives, no synthesis)."
```

### Class III — Minor Entry
```
"Write a Class III Minor Entry on [Topic] (~250 words, 
focused definition, supports larger entries)."
```

### Class IV — Scholium
```
"Provide a Class IV Scholium note from [Author] 
clarifying [concept] (40-120 words, margin-only)."
```

### Class V — Quotation
```
"Provide a Class V Quotation from [Author] on [Topic] 
(25-80 words, primary source excerpt)."
```

---

# Typographic Constitution

## RULE SET 1: Entry Titles

### Rule 1.1 — Spanning titles must dominate

Primary entry titles must:
- span the full text block (both columns)
- sit alone above the body
- be followed by a clear vertical break

**Recommendation:**
- Increase title size slightly
- Add extra leading below the title
- Consider small caps or letterspacing for gravity

**Principle:** If it doesn't feel like a doorway, it isn't a title.

### Rule 1.2 — No spanning title without substance

A spanning title may appear only if:
- the article occupies ≥ 1.5 columns
- **or** the title begins a new page

**Implementation:**
- Short entries (<750 words) use run-in headword style: `**TITLE.**` followed by text
- Substantial entries (≥750 words) use spanning titles
- This preserves rhythm and avoids false grandeur

**Exception:** If a short article must have a spanning title, it should be placed at the top of a fresh page so the visual reset feels intentional, not truncated.

---

## RULE SET 2: Marginalia Geometry

### Rule 2.1 — One function per margin

A single margin may host only one marginalia type per page:
- inquiry prompts
- quotations
- faculty voice
- objections / extensions

**Rule:** The same margin may not contain both interrogative and declarative marginalia.

This preserves cognitive clarity.

**Implementation:**
- Left margin → questions / inquiry prompts
- Right margin → authorial voice, faculty attribution, glosses
- (Currently using outer margin only; function separation is future enhancement)

### Rule 2.2 — Marginalia must be lighter than body text

Marginalia must always be:
- smaller (2–3pt smaller than body text)
- lighter in tone
- visually subordinate

**Rule:** If a marginal note demands equal attention, it belongs in the body.

They may be interesting, but never dominant.

**Typography:**
- Size: `\footnotesize` (~8–9pt, body is 11pt)
- Leading: Tighter (0.9× baseline)
- Alignment: Left-aligned (raggedright), never justified
- Hyphenation: Disabled (`\hyphenpenalty=10000`)

### Rule 2.3 — Attribution is margin-internal

Names like "Edmund Husserl" or "Alan Turing" must be:
- visually attached to their marginal text
- not floating near the body
- clearly secondary to the idea

**Principle:** Think signature, not byline.

**Format:**
```
\textit{Author Name}\\
\textbf{Type (Year)}\\
Content text
```

---

## RULE SET 3: Vertical Placement

### Rule 3.1 — Anchor marginalia to paragraph starts

Marginalia must align with:
- the first baseline of the paragraph they address

**Rule:** Never center them optically. Never float them to "look nice."

**Implementation:**
- LaTeX `\marginpar` automatically aligns to baseline grid
- No manual vertical adjustment
- Anchoring is automatic via LaTeX positioning

### Rule 3.2 — End-of-entry silence

The final paragraph of an entry may not be accompanied by marginalia.

**After the last idea:**
- let the page breathe
- let the author credit stand alone

**Rule:** Silence signals completion.

**Implementation:**
- Converter excludes final paragraph from marginalia placement
- Author signature follows final paragraph with no marginalia

---

## RULE SET 4: Entry Closure

### Rule 4.1 — Signed entries must close formally

A signed entry must end with:
- a clear author attribution
- visual separation from marginalia
- no additional commentary below

**Format:**
```
--- AUTHOR NAME
```

Or with frontal bust portrait:
```
[Portrait] --- AUTHOR NAME
```

**Spacing:**
- Extra vertical space before signature (`\vspace*{0.5\baselineskip}`)
- Space after signature (`\vspace*{0.3\baselineskip}`)
- Signature uses `\nopagebreak[4]` to prevent orphan

### Rule 4.2 — White space is allowed

**Rule:** Do not try to "use up" the page.

A partially empty page is preferable to:
- crammed marginalia
- orphaned subtopics
- weak continuations

**Principle:** Encyclopedias value dignity over efficiency.

**Optional end-of-entry marker:**
- Extra vertical space
- A light rule (future consideration)
- Consistent spacing before the page number

Not decorative. Just declarative.

It helps the eye say: "This thought is complete."

---

## RULE SET 5: Typographic Consistency

### Rule 5.1 — No new type voices without meaning

Every typographic change must signal:
- hierarchy
- voice
- function

**Rule:** No "just because" italics, breaks, or styles.

Your system is close to being symbolic — keep it that way.

**Allowed typographic variations:**
- **Bold** for emphasis in body text
- *Italic* for emphasis or technical terms
- `\textsc{}` for author signatures (small caps)
- `\textbf{}` for marginalia type labels
- `\textit{}` for marginalia author names

**Prohibited:**
- Decorative fonts
- Unnecessary color
- Arbitrary size changes
- Stylistic flourishes without function

---

## RULE SET 6: Marginalia Density & Placement

### Rule 6.1 — Density limit: marginalia are seasoning, not substrate

**Rule of thumb (print):**
- Max 1 marginal note per ~250–300 words
- Never more than 2 marginal notes per column

**If a page wants more:**
- convert excess into footnotes
- defer to a later revisit
- or promote the idea into the main text

This keeps the page breathable.

**Implementation:**
- Converter calculates word count
- Limits marginalia to `min(word_count // 275, 2)`
- Enforced automatically during LaTeX generation

### Rule 6.2 — Marginalia must not interrupt reading rhythm

Placement should favor paragraph openings, not mid-flow density.

**Preferred anchors:**
- first paragraph of a section
- definition paragraphs
- transitions ("However," "From another perspective…")

**Avoid:**
- dense technical paragraphs
- lists
- quotations already carrying attribution

**Rule:** Marginalia should greet the reader before difficulty, not interrupt them during it.

**Implementation:**
- Marginalia placed in first 2–3 paragraphs when possible
- Final paragraph always excluded

### Rule 6.3 — Marginalia must never collide with terminal elements

**Absolute no-fly zones:**
- bottom 20–25% of the page
- page numbers
- running headers / footers
- author signatures

**Rule:** Marginalia may not appear below the final baseline of body text.

If the text runs long, the margin goes silent.

**Principle:** Silence is preferable to clutter.

**Implementation:**
- Bottom margin set to 32mm (prevents collision with page numbers)
- LaTeX automatically prevents marginalia in footer area
- Manual detection for bottom 30mm exclusion (future enhancement)

---

## RULE SET 7: Page Geometry

### Rule 7.1 — Margins designed for marginalia from the start

**A4 Page (210 × 297 mm):**

- **Inner margin:** 22mm (binding + thumb space — sacred, don't steal)
- **Outer margin:** 40mm (marginalia lives here — intentional width)
- **Top margin:** 26mm (allows running headers without crushing)
- **Bottom margin:** 32mm (prevents collision with page numbers)

**Resulting text block:**
- Usable width: ~148mm
- Column width: ~68–70mm per column
- Intercolumn gutter: 10mm (don't steal for marginalia)

**Marginalia dimensions:**
- Width: 32mm (75% of 40mm outer margin)
- Margin parsep: 6mm (space between text and marginalia)

**Principle:** Marginalia need real estate, not leftovers.

### Rule 7.2 — Absolute constraints (lock these in)

**Hard-coded rules:**
1. Marginalia may not exceed 75% of margin width (32mm max)
2. Marginalia may not appear:
   - below last body baseline
   - within bottom 30mm of page
3. Marginalia must snap to the same baseline grid as body text

These three rules prevent 90% of layout drift.

---

## RULE SET 8: Marginalia Anchoring & Boundaries

### Rule 8.1 — Marginalia must be anchored, never floating

Every marginal note must attach to something specific:
- a paragraph
- a sentence
- a subsection
- a page-level concept

**Rule:** A marginal note's vertical center must align with the first line of the text it comments on.

No drifting to "fill space."  
No aesthetic nudging after the fact.

If it can't be anchored, it doesn't belong in the margin.

**Implementation:**
- LaTeX `\marginpar` automatically anchors to insertion point
- Baseline grid alignment is automatic

### Rule 8.2 — Marginalia do not cross conceptual boundaries

A marginal note may not refer backward across:
- a section break
- a rule
- a new topic
- a new author

**If the thought spans concepts, it becomes:**
- a footnote
- a cross-reference
- a future entry

**Rule:** Marginalia belong to this thought, on this page, right now.

---

## RULE SET 9: Two-Column Layout

### Rule 9.1 — Two-column canonical text

**Canonical text:**
- Always two-column
- No switching mid-entry
- Keeps reference rhythm intact

**Column specifications:**
- Column width: ~68–70mm
- Intercolumn gutter: 10mm
- Column separation: clear and visible

**Entry titles:**
- Span both columns when substantial (≥1.5 columns)
- Use `\twocolumn[title]` syntax
- Title sits alone above body with clear break

### Rule 9.2 — Entry structure

**Substantial entries (≥750 words):**
```
\entry{TITLE}

[Two-column body text]
```

**Short entries (<750 words):**
```
\shortentry{TITLE.} [Body text continues in same column]
```

---

## RULE SET 10: Running Heads & Page Numbers

### Rule 10.1 — Running headers

**Format:**
- Left page (even): "THE ENCYCLOPÆDIA" | Entry title
- Right page (odd): Entry title | "Volume I: Mind"

**Typography:**
- Small caps (`\textsc{}`)
- Small size (`\small`)
- No rules (clean, minimal)

### Rule 10.2 — Page numbers

**Placement:**
- Bottom center
- No rules
- Clear but unobtrusive

**Format:**
- Arabic numerals
- Centered (`\fancyfoot[C]{\thepage}`)

---

# Marginalia Placement Rules

## 1. Marginalia must be anchored, never floating

Every marginal note must attach to something specific:
- a paragraph
- a sentence
- a subsection
- a page-level concept

**Rule:** A marginal note's vertical center must align with the first line of the text it comments on.

No drifting to "fill space."  
No aesthetic nudging after the fact.

If it can't be anchored, it doesn't belong in the margin.

---

## 2. One margin = one function

Do not mix functions in the same margin.

Choose one per page (or per spread):
- **Left margin** → questions / inquiry prompts
- **Right margin** → authorial voice, faculty attribution, glosses

**Rule:** The same margin may not contain both interrogative and declarative marginalia.

This preserves cognitive clarity.

---

## 3. Marginalia must never collide with terminal elements

Absolute no-fly zones:
- bottom 20–25% of the page
- page numbers
- running headers / footers
- author signatures

**Rule:** Marginalia may not appear below the final baseline of body text.

If the text runs long, the margin goes silent.

Silence is preferable to clutter.

---

## 4. Density limit: marginalia are seasoning, not substrate

**Rule of thumb (print):**
- Max 1 marginal note per ~250–300 words
- Never more than 2 marginal notes per column

If a page wants more:
- convert excess into footnotes
- defer to a later revisit
- or promote the idea into the main text

This keeps the page breathable.

---

## 5. Marginalia must not interrupt reading rhythm

Placement should favor paragraph openings, not mid-flow density.

**Preferred anchors:**
- first paragraph of a section
- definition paragraphs
- transitions ("However," "From another perspective…")

**Avoid:**
- dense technical paragraphs
- lists
- quotations already carrying attribution

**Rule:** Marginalia should greet the reader before difficulty, not interrupt them during it.

---

## 6. Vertical alignment: snap to a baseline grid

This is critical for the calm, classical feel.

**Rule:** The first line of marginalia must align to the same baseline grid as body text.

No optical centering.  
No "looks about right."

This single constraint will make everything feel intentional.

---

## 7. Marginalia do not cross conceptual boundaries

A marginal note may not refer backward across:
- a section break
- a rule
- a new topic
- a new author

If the thought spans concepts, it becomes:
- a footnote
- a cross-reference
- a future entry

**Rule:** Marginalia belong to this thought, on this page, right now.

---

## 8. End-of-article rule (important)

At the end of an article:
- No new marginalia
- Let the author attribution breathe
- The page should resolve

**Rule:** The final paragraph of an entry may not be accompanied by marginalia.

This gives conceptual closure.

---

## Optional: Marginalia Typology (lightweight)

If you want just a bit more structure without complexity:
- `?` = inquiry prompt
- `→` = cross-reference
- `✦` = faculty voice / aside

But keep symbols subtle — don't let them become UI.

---

## Why these rules matter

They ensure marginalia feel:
- intentional
- scholarly
- trustworthy
- quietly powerful

And most importantly:  
they reinforce your core idea that inquiry is guided, not shouted.

---

# Author Attribution

## Format

Author attributions use the `a.{surname}` format, matching the faculty table structure.

**Examples:**
- `a.husserl` (Edmund Husserl)
- `a.james` (William James)
- `a.turing` (Alan Turing)
- `a.eckhart` (Meister Eckhart)

## Placement

Author signatures appear at the end of entries:
- After the main text
- Before references / marginalia
- In small caps or restrained typography

**Format:**
```
--- a.{surname}
```

Or with frontal bust portrait:
```
[Portrait] --- a.{surname}
```

## Rules

1. Every article has an author (no anonymous canon)
2. Authorship appears at the end of the article, not the beginning
3. No bylines, no bios, no credentials
4. The dead do not need resumes
5. Constellation topics: each article is credited individually

---

# Implementation Status

## ✅ Fully Implemented

- Entry title spanning rules (automatic detection)
- Article class detection by word count
- Class I/II use `\entry{}` (spanning title)
- Class III uses `\shortentry{}` (run-in headword)
- Marginalia density limits (max 1 per 275 words, max 2 per column)
- End-of-article rule (no marginalia in final paragraph)
- Placement preference (first paragraphs, avoid final)
- Baseline grid alignment (automatic via LaTeX)
- Anchoring (automatic via LaTeX)
- Page geometry (22mm inner, 40mm outer, 26mm top, 32mm bottom)
- Marginalia dimensions (32mm width, 6mm parsep)
- Marginalia typography (smaller, tighter, left-aligned, no hyphenation)
- Author signature orphan prevention
- Two-column layout enforcement
- Author attribution in `a.{surname}` format
- Right-hand pages: marginalia on right; Left-hand pages: marginalia on left

## ⚠️ Partially Implemented

- Terminal element collision (bottom 30mm exclusion — requires page-level detection)
- Function separation (left vs right margin — currently uses outer margin only)
- Manual class override via AsciiDoc attribute
- Page break enforcement for Class I (must begin fresh page)

## 📋 Future Enhancements

- End-of-entry marker (light rule or consistent spacing)
- Left/right margin function separation
- Page-level terminal element detection
- Class promotion/demotion rules
- Class-aware generation prompts in `generate-entry.ts`

---

## The Sentence That Locks This Constitution

**Marginalia must feel intentional, scholarly, trustworthy, and quietly powerful.**

They reinforce the core idea that inquiry is guided, not shouted.

---

## Quick Reference

**Article Classes:**
- Class I (Constellation): 800-1200 words, spanning title, fresh page
- Class II (Major): 450-600 words, spanning title, may share page
- Class III (Minor): 220-300 words, run-in headword, shares page

**Entry Titles:**
- Span only if ≥1.5 columns or new page
- Short entries use run-in headword

**Marginalia:**
- Max 1 per 275 words, max 2 per column
- Never in final paragraph
- Anchor to paragraph starts
- 32mm width, left-aligned, no hyphenation

**Page Geometry:**
- Inner: 22mm, Outer: 40mm
- Top: 26mm, Bottom: 32mm
- Column: ~68–70mm, Gutter: 10mm

**Author Signatures:**
- End of entry, no marginalia after
- Prevent orphans with `\nopagebreak`
- Clear visual separation
- Format: `a.{surname}`

---

**Version:** 1.0  
**Locked:** Volume I  
**Last Updated:** 2026-01-30
