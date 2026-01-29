# The Encyclopædia — TODO

> Tracking progress on the Encyclopædia project.

## Phase 1: Foundation ✅

- [x] Create repository structure per design document
- [x] Write marginalia specification (`shared/marginalia-spec.adoc`)
- [x] Write shared macros (`shared/macros.adoc`)
- [x] Write style guides
  - [x] Adult authoring guide
  - [x] Children's authoring guide
  - [x] Peer review charter
- [x] Create Volume I master files (Adult + Children)
- [x] Create entry stubs for Volume I (27 entries)
- [x] Set up Astro site framework
- [x] Create GitHub Actions workflows
- [x] Create entry generation script (`scripts/generate-entry.ts`)
- [x] Write comprehensive README.md

## Phase 2: Content Generation 🚧

### Volume I: Mind (In Progress)

#### Major Entries (8–12 pages)
- [ ] **Attention** — a.james
- [ ] **Consciousness** — a.bergson
- [ ] **Experience** — a.dewey
- [ ] **Intelligence** — a.piaget

#### Standard Entries (4–6 pages)
- [ ] Abstraction — a.whitehead
- [ ] Affect — a.spinoza
- [ ] Agency — a.aristotle
- [ ] Awareness — a.husserl
- [ ] Belief — a.peirce
- [ ] Cognition — a.neisser
- [ ] Dream — a.freud
- [ ] Emotion — a.darwin
- [ ] Habit — a.james
- [ ] Imagination — a.coleridge
- [ ] Memory — a.bergson
- [ ] Perception — a.merleauponty
- [ ] Reason — a.kant
- [ ] Self — a.james
- [ ] Sensation — a.weber
- [ ] Sleep — a.aristotle
- [ ] Thought — a.arendt
- [ ] Will — a.schopenhauer

#### Boundary Entries (6–10 pages)
- [ ] Animal Mind — a.uexkull
- [ ] Artificial Mind — a.turing
- [ ] Collective Mind — a.durkheim
- [ ] Mind–Body Problem — a.descartes

#### Closing Entries (2–4 pages)
- [ ] Ignorance (Mental) — a.socrates
- [ ] Uncertainty (Subjective) — a.pascal
- [ ] Not-Knowing — a.cusa

### Children's Edition Volume I
- [ ] Generate children's versions of all 27 entries
- [ ] Add synthetic marginalia for pedagogical support

## Phase 3: Faculty Population

### Missing Faculty (need to add to Supabase)

These canonical authors need to be added to the `faculty` table:

| Author | Proposed ID | Fields |
|--------|-------------|--------|
| Henri Bergson | `a.bergson` | Philosophy, Mind |
| Jean Piaget | `a.piaget` | Psychology, Education |
| Edmund Husserl | `a.husserl` | Philosophy, Phenomenology |
| Ulric Neisser | `a.neisser` | Psychology, Cognition |
| Sigmund Freud | `a.freud` | Psychology, Psychoanalysis |
| Samuel Taylor Coleridge | `a.coleridge` | Literature, Philosophy |
| Maurice Merleau-Ponty | `a.merleauponty` | Philosophy, Phenomenology |
| Ernst Weber | `a.weber` | Physiology, Psychology |
| Hannah Arendt | `a.arendt` | Philosophy, Politics |
| Arthur Schopenhauer | `a.schopenhauer` | Philosophy |
| Jakob von Uexküll | `a.uexkull` | Biology, Biosemiotics |
| Blaise Pascal | `a.pascal` | Mathematics, Philosophy |
| Nicholas of Cusa | `a.cusa` | Philosophy, Theology |

### Faculty with Existing Entries
- [x] a.james (William James)
- [x] a.dewey (John Dewey)
- [x] a.whitehead (A.N. Whitehead)
- [x] a.spinoza (Baruch Spinoza)
- [x] a.aristotle (Aristotle)
- [x] a.peirce (C.S. Peirce)
- [x] a.darwin (Charles Darwin)
- [x] a.kant (Immanuel Kant)
- [x] a.turing (Alan Turing)
- [x] a.durkheim (Émile Durkheim)
- [x] a.descartes (René Descartes)
- [x] a.socrates (Socrates)

## Phase 4: Build Pipeline

- [x] HTML build via Asciidoctor
- [x] PDF build via Asciidoctor-PDF
- [ ] LaTeX output for Talmudic margin layout
- [ ] Custom LaTeX class for two-column + margin commentary
- [ ] Marginalia linter (validate required fields, length bounds)
- [ ] Pre-commit hooks for marginalia validation

## Phase 5: Site Enhancement

- [x] Basic Astro site structure
- [x] Home page with volume listing
- [x] PDF flipbook component
- [x] Volume navigation component
- [ ] Volume index pages
- [ ] Reader route with PDF.js integration
- [ ] Entry HTML pages
- [ ] Search functionality
- [ ] Entry cross-referencing

## Phase 6: Peer Review

- [ ] Assign Reviewer A (sympathetic) to each entry
- [ ] Assign Reviewer B (dissenter) to each entry
- [ ] Collect review marginalia
- [ ] Author responses
- [ ] Editorial compilation

## Phase 7: Publication

- [ ] Final editorial review
- [ ] Layout proofing
- [ ] Print PDF generation
- [ ] HTML publication to GitHub Pages
- [ ] Announcement

## Future Volumes (Planned)

| Volume | Title | Season | Status |
|--------|-------|--------|--------|
| II | Language & Meaning | Spring | Planned |
| III | Nature (Becoming) | Spring | Planned |
| IV | Measure | Summer | Planned |
| V | Society | Summer | Planned |
| VI | Art & Form | Summer | Planned |
| VII | Knowledge | Autumn | Planned |
| VIII | History | Autumn | Planned |
| IX | Ethics | Autumn | Planned |
| X | Machines | Winter | Planned |
| XI | Futures | Winter | Planned |
| XII | Limits | Winter | Planned |

## Technical Debt

- [ ] Map volume numbers to volume names in build script
- [ ] Implement `--from-outline` mode in generate-entry.ts
- [ ] Add volume entry list parsing
- [ ] Handle multiple volumes in single build
- [ ] LaTeX pipeline setup

## Notes

### Command to Generate All Volume I Entries

```bash
# Generate all major entries
for entry in attention consciousness experience intelligence; do
  tsx scripts/generate-entry.ts \
    --entry "$entry" \
    --faculty "$(grep -A2 "entry-$entry" editions/adult/volumes/volume-01-mind/entries/$entry.adoc | grep faculty-id | cut -d: -f2 | tr -d ' ')" \
    --edition "adult" \
    --volume 1 \
    --type "major"
done
```

### Marginalia Word Count Targets

| Class | Words | Use |
|-------|-------|-----|
| short | 10–25 | Brief clarifications |
| standard | 30–60 | Most notes |
| extended | 80–120 | Rare, flagged |

---

*Last updated: January 2026*
