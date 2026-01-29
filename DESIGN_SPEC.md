# The Encyclopædia — Design Specification (Locked)

## Topic Map Structure

### Notation
- **●** Single article (one author, one article)
- **✦** Constellation topic (multiple independent articles by different authors)
- **Closing Entries** Always appear last, never alphabetized

### Structural Principle

> Where a concept can be responsibly defined, it receives one article.  
> Where it fractures under inquiry, it receives several—without synthesis.

### Alphabetization Rules
- All single articles: alphabetized
- All constellation sub-articles: alphabetized by their full title (e.g., "Mind (Collective)", "Mind (Embodied)")
- Closing entries: never alphabetized, always appear last

---

## Volume I — Mind

### Core Topics
- **●** Abstraction
- **●** Affect
- **●** Awareness
- **●** Belief
- **●** Cognition
- **✦** Consciousness
- **●** Dream
- **●** Emotion
- **●** Experience
- **●** Habit
- **●** Imagination
- **✦** Intelligence
- **●** Memory
- **✦** Mind
- **●** Perception
- **●** Reason
- **✦** Self
- **●** Sensation
- **●** Sleep
- **●** Thought
- **●** Will

### Boundary Topics
- **●** Animal Mind
- **●** Artificial Mind
- **●** Collective Mind

### Closing Entries
- Ignorance (Mental)
- Uncertainty (Subjective)
- Not-Knowing

---

## Volume II — Language & Meaning

### Core Topics
- **●** Grammar
- **✦** Interpretation
- **✦** Language
- **✦** Meaning
- **●** Metaphor
- **●** Narrative
- **●** Reference
- **✦** Symbol
- **●** Translation
- **●** Voice
- **●** Writing

### Boundary Topics
- **●** Silence
- **●** Untranslatable

### Closing Entries
- Ambiguity
- Indeterminacy

---

## Volume III — Nature (Becoming)

### Core Topics
- **●** Adaptation
- **●** Complexity
- **●** Ecology
- **✦** Evolution
- **●** Form (Natural)
- **●** Growth
- **✦** Life
- **✦** Nature
- **●** Organism
- **●** Process

### Boundary Topics
- **●** Artificial Life
- **●** Extinction

### Closing Entries
- Contingency
- Irreversibility

---

## Volume IV — Measure

### Core Topics
- **●** Chance
- **●** Dimension
- **●** Error
- **●** Infinity
- **●** Limit (Mathematical)
- **✦** Number
- **✦** Probability
- **●** Scale
- **✦** Time

### Boundary Topics
- **●** Measurement
- **●** Uncertainty (Formal)

### Closing Entries
- Incommensurability
- Approximation

---

## Volume V — Society

### Core Topics
- **✦** Agency
- **●** Authority
- **●** Class
- **●** Community
- **✦** Culture
- **●** Institution
- **✦** Power
- **●** Ritual
- **●** Role
- **●** Tradition

### Boundary Topics
- **●** Crowd
- **●** Network

### Closing Entries
- Alienation
- Solidarity

---

## Volume VI — Art & Form

### Core Topics
- **✦** Art
- **✦** Beauty
- **●** Craft
- **●** Design
- **✦** Form
- **●** Imitation
- **●** Style
- **●** Taste

### Boundary Topics
- **●** Ornament
- **●** Kitsch

### Closing Entries
- Expression
- Failure (Aesthetic)

---

## Volume VII — Knowledge

### Core Topics
- **●** Belief (Epistemic)
- **●** Certainty
- **●** Evidence
- **✦** Explanation
- **●** Ignorance (Epistemic)
- **✦** Knowledge
- **●** Method
- **●** Proof
- **✦** Truth

### Boundary Topics
- **●** Pseudoscience
- **●** Revelation

### Closing Entries
- Fallibility
- Skepticism

---

## Volume VIII — History

### Core Topics
- **●** Archive
- **●** Event
- **✦** History
- **●** Memory
- **●** Periodization
- **✦** Progress
- **●** Revolution
- **●** Tradition (Historical)

### Boundary Topics
- **●** Myth (Historical)
- **●** Trauma

### Closing Entries
- Rupture
- Forgetting

---

## Volume IX — Ethics

### Core Topics
- **●** Care
- **●** Duty
- **✦** Ethics
- **●** Good
- **✦** Justice
- **●** Responsibility
- **●** Rights
- **●** Virtue

### Boundary Topics
- **●** Evil
- **●** Harm

### Closing Entries
- Moral Luck
- Tragedy

---

## Volume X — Machines

### Core Topics
- **●** Automation
- **●** Control
- **●** Efficiency
- **●** Feedback
- **✦** Machine
- **●** Optimization
- **●** System
- **✦** Technology

### Boundary Topics
- **●** Artificial Intelligence
- **●** Tool

### Closing Entries
- Dependence
- Autonomy

---

## Volume XI — Futures

### Core Topics
- **●** Collapse
- **●** Forecast
- **✦** Future
- **●** Innovation
- **●** Planning
- **✦** Risk
- **●** Scenario
- **●** Speculation

### Boundary Topics
- **●** Apocalypse
- **●** Resilience

### Closing Entries
- Unintended Consequences
- Irreversibility (Social)

---

## Volume XII — Limits

### Core Topics
- **●** Constraint
- **●** Death
- **✦** Freedom
- **✦** Limit
- **●** Necessity
- **●** Responsibility (Ultimate)

### Boundary Topics
- **●** Absurd
- **●** Silence (Final)

### Closing Entries
- Meaning (Ultimate)
- Meaning (Absent)

---

## Constellation Article Naming Convention

Constellation articles use the format: **"Topic (Perspective)"**

Examples:
- `Mind (Individual)` by William James
- `Mind (Extended)` by John Dewey
- `Mind (Embodied)` by Maurice Merleau-Ponty
- `Mind (Collective)` by Émile Durkheim

File naming: `mind-individual.adoc`, `mind-extended.adoc`, etc.

---

## Indexing Rules

1. **Single articles**: Indexed by topic name only
2. **Constellation articles**: Indexed by full title "Topic (Perspective)"
3. **Alphabetization**: All entries alphabetized except closing entries
4. **Cross-references**: Constellation articles cross-reference related perspectives

---

## Repository Structure

```
encyclopaedia/
├── editions/
│   ├── adult/
│   │   └── volumes/
│   │       └── volume-01-mind/
│   │           └── entries/
│   │               ├── abstraction.adoc
│   │               ├── affect.adoc
│   │               ├── consciousness-phenomenological.adoc
│   │               ├── consciousness-biological.adoc
│   │               ├── consciousness-computational.adoc
│   │               ├── consciousness-mystical.adoc
│   │               └── ...
│   └── children/
│       └── (mirror structure)
```

---

**Status**: Locked — This specification governs all future development.
