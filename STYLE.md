# Typographic Constitution
## The Encyclopædia (Inquiry Institute)

**Version 1.0** — Locked for Volume I

> An encyclopædia should not be the place where questions go to die.  
> It should be the place where better questions are learned.

---

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

## Implementation Status

**✅ Fully Implemented:**
- Entry title spanning rules (automatic detection)
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

**⚠️ Partially Implemented:**
- Terminal element collision (bottom 30mm exclusion — requires page-level detection)
- Function separation (left vs right margin — currently uses outer margin only)

**📋 Future Enhancements:**
- End-of-entry marker (light rule or consistent spacing)
- Left/right margin function separation
- Page-level terminal element detection

---

## The Sentence That Locks This Constitution

**Marginalia must feel intentional, scholarly, trustworthy, and quietly powerful.**

They reinforce the core idea that inquiry is guided, not shouted.

---

## Quick Reference

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

---

**Version:** 1.0  
**Locked:** Volume I  
**Last Updated:** 2026-01-30
