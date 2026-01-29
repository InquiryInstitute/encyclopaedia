# The Encyclopædia

> A seasonal, multi-volume Encyclopædia demonstrating and inspiring inquiry.

Published by the **Inquiry Institute** in two parallel editions:

1. **The Encyclopædia (Adult Edition)** — Canonical PD authorship with scholarly marginalia
2. **The Children's Encyclopædia** — Same topics and authors, rewritten for reading comprehension without simplifying the idea

## Mission

Demonstrate and inspire inquiry by publishing authoritative encyclopaedic entries written in the authentic voices of public domain Faculty members, with marginalia that shows the ongoing scholarly conversation.

## Publishing Model

- **12 volumes** forming an annual set
- **Release cadence**: One volume per month
- **Revision cadence**: Annual Candlemas revision cycle

## Volume Structure

### Spring (Candlemas → Beltane)
1. **Mind** — Attention, consciousness, experience, intelligence
2. **Language & Meaning** — Sign, symbol, grammar, rhetoric
3. **Nature (Becoming)** — Evolution, growth, emergence

### Summer (Beltane → Lammas)
4. **Measure** — Number, quantity, probability, scale
5. **Society** — Community, institution, power, justice
6. **Art & Form** — Beauty, expression, craft, creation

### Autumn (Lammas → Samhain)
7. **Knowledge** — Truth, evidence, method, wisdom
8. **History** — Time, memory, change, tradition
9. **Ethics** — Good, right, virtue, obligation

### Winter (Samhain → Candlemas)
10. **Machines** — Tool, automation, computation, system
11. **Futures** — Possibility, prediction, imagination, hope
12. **Limits** — Finitude, boundary, paradox, mystery

## Canon vs Marginalia

### Canonical Text
- Written by **Public Domain Faculty** only
- Must stand alone if all marginalia is removed
- Represents the authoritative treatment of the topic

### Marginalia
- **Adjunct**: Scholars who extend or clarify
- **Heretic**: Voices that challenge assumptions
- **Synthetic**: AI-generated pedagogical notes (Children's Edition)
- Always marked, dated, targeted, and length-bounded

## Repository Structure

```
encyclopaedia/
├── editions/
│   ├── adult/
│   │   └── volumes/
│   │       └── volume-01-mind/
│   │           ├── volume.adoc          # Master file
│   │           ├── front-matter.adoc
│   │           ├── back-matter.adoc
│   │           └── entries/
│   │               ├── attention.adoc
│   │               ├── consciousness.adoc
│   │               └── ...
│   └── children/
│       └── volumes/
│           └── volume-01-mind/
│               └── entries/
│                   └── ...
├── shared/
│   ├── marginalia-spec.adoc     # Marginalia specification
│   ├── macros.adoc              # Shared AsciiDoc macros
│   └── style-guides/
│       ├── adult-authoring-guide.adoc
│       ├── children-authoring-guide.adoc
│       └── peer-review-charter.adoc
├── site/                        # Astro site (GitHub Pages)
│   ├── astro.config.mjs
│   ├── package.json
│   └── src/
│       ├── pages/
│       └── components/
├── scripts/
│   ├── generate-entry.ts        # Generate entries via ask-faculty
│   └── build-content.sh         # Build HTML/PDF outputs
└── .github/workflows/
    ├── build-content.yml        # Build AsciiDoc → HTML/PDF
    └── deploy-site.yml          # Deploy Astro site to GitHub Pages
```

## Getting Started

### Prerequisites

- Node.js 20+
- Ruby 3.3+ (for Asciidoctor)
- Asciidoctor and Asciidoctor-PDF gems

### Installation

```bash
# Install Asciidoctor
gem install asciidoctor asciidoctor-pdf

# Install site dependencies
cd site && npm install

# Install script dependencies (from repo root)
npm install
```

### Building Content

```bash
# Build Volume I (both editions)
./scripts/build-content.sh --volumes "01" --editions "both"

# Build specific editions
./scripts/build-content.sh --volumes "01" --editions "adult"
```

### Generating Entries

Use the `ask-faculty` integration to generate entry content:

```bash
# Generate a single entry
tsx scripts/generate-entry.ts \
  --entry "attention" \
  --faculty "a.james" \
  --edition "adult" \
  --volume 1 \
  --type "major"
```

Required environment variables:
- `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Running the Site Locally

```bash
cd site
npm run dev
```

## Entry Format

Each entry follows this AsciiDoc structure:

```asciidoc
[[entry-attention]]
=== Attention
:canonical-author: William James
:faculty-id: a.james
:status: canonical
:entry-type: major
:length-target: 8–12 pages

[role=canonical]
====
{CANONICAL TEXT}
====

[role=marginalia,
 type=objection,
 author="Herbert A. Simon",
 status="adjunct",
 year="1971",
 length="42",
 targets="paragraph:4",
 scope="local"]
====
Marginalia content here.
====
```

## Faculty Authors

All canonical authors must be in the `a.{surname}` format and exist in the Supabase faculty table. Current Volume I authors:

| Entry | Author | Faculty ID |
|-------|--------|------------|
| Attention | William James | `a.james` |
| Consciousness | Henri Bergson | `a.bergson` |
| Experience | John Dewey | `a.dewey` |
| Intelligence | Jean Piaget | `a.piaget` |
| Abstraction | A.N. Whitehead | `a.whitehead` |
| Affect | Baruch Spinoza | `a.spinoza` |
| Agency | Aristotle | `a.aristotle` |
| Awareness | Edmund Husserl | `a.husserl` |
| Belief | C.S. Peirce | `a.peirce` |
| Emotion | Charles Darwin | `a.darwin` |
| Reason | Immanuel Kant | `a.kant` |
| Artificial Mind | Alan Turing | `a.turing` |
| Collective Mind | Émile Durkheim | `a.durkheim` |
| Mind–Body Problem | René Descartes | `a.descartes` |
| Ignorance | Socrates | `a.socrates` |
| Uncertainty | Blaise Pascal | `a.pascal` |
| Not-Knowing | Nicholas of Cusa | `a.cusa` |

## Peer Review

Reviews become marginalia, not hidden reports:

- **Reviewer A**: Sympathetic clarifier (3–8 `clarification`/`extension` notes)
- **Reviewer B**: Principled dissenter (3–8 `objection`/`heretic` notes)

All marginalia is signed, dated, and targeted to specific passages.

## Children's Edition

Same topics, same authors, different pace:

- Shorter sentences (8–15 words)
- Concrete examples before abstractions
- Explicit transitions
- Open questions, not definitive answers
- **Never** simplified ideas—preserved depth

## Website

**Live at: [cyc.inquiry.institute](https://cyc.inquiry.institute)**

The site is built with Astro and deployed to GitHub Pages:

- **Home**: Browse volumes by season
- **Reader**: PDF flipbook viewer for each volume
- **Builds**: HTML and PDF downloads

See `DEPLOY_CYC_SUBDOMAIN.md` for DNS and deployment configuration.

## Annual Candlemas Revision

Each year at Candlemas (February 2):

1. Freeze prior year's PDFs
2. Promote high-value marginalia to canon
3. Retire outdated marginalia
4. Update cross-references for new volumes
5. Publish "Candlemas Notes" in back matter

## Contributing

1. **Entry authors**: Write canonical text following the style guide
2. **Reviewers**: Submit marginalia following the peer review charter
3. **Editors**: Ensure marginalia compliance and length bounds

## License

- **Canonical texts**: Public Domain (by design)
- **Marginalia**: CC BY 4.0
- **Site and tooling**: MIT

---

*"Canon must stand alone if all marginalia is removed."*

Published by [Inquiry Institute](https://inquiry.institute)
