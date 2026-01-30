# Article Classes
## The Encyclopædia (Inquiry Institute)

**Version 1.0** — Locked for Volume I

> Article class determines layout, not the other way around.

---

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

## Implementation Status

**✅ Implemented:**
- Automatic class detection by word count
- Class I/II use `\entry{}` (spanning title)
- Class III uses `\shortentry{}` (run-in headword)
- Class IV/V implemented as marginalia

**⚠️ Future Enhancements:**
- Manual class override via AsciiDoc attribute
- Class-aware generation prompts in `generate-entry.ts`
- Page break enforcement for Class I (must begin fresh page)
- Class promotion/demotion rules

---

**Version:** 1.0  
**Locked:** Volume I  
**Last Updated:** 2026-01-30
