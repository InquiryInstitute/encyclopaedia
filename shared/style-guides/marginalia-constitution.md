# Marginalia Placement Rules
## The Encyclopædia (Inquiry Institute)

**Version 1.0** — Locked for Volume I

---

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

**Implementation Status:**
- ✅ Density limits enforced (max 1 per 275 words, max 2 per column)
- ✅ End-of-article rule enforced (no marginalia in final paragraph)
- ✅ Placement preference (first paragraphs, avoid final)
- ✅ Baseline grid alignment (automatic via LaTeX)
- ✅ Anchoring (automatic via LaTeX)
- ⚠️ Terminal element collision (requires page-level detection - future enhancement)
- ⚠️ Function separation (left vs right margin) - currently uses outer margin only
