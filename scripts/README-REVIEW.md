# Article Generation with Peer Review Workflow

## Overview

The `generate-with-review.ts` script implements a complete peer review workflow for generating Encyclopædia entries:

1. **Generate** initial article using `ask-faculty`
2. **Check voice fidelity** of generated text
3. **Select reviewers** (two per article)
4. **Generate review feedback** from reviewers
5. **Revise** article based on feedback
6. **Check voice fidelity** of revision
7. **Generate marginalia** from reviewers
8. **Check voice fidelity** of marginalia
9. **Update entry file** with canonical text and marginalia

## Features

- **Voice Fidelity Checking**: Uses LLM to verify that generated text maintains authentic voice
- **Automatic Reviewer Selection**: Selects appropriate reviewers based on topic
- **Multi-Perspective Support**: Generate multiple articles on the same topic from different authors
- **Marginalia Generation**: Automatically generates marginalia from reviewers

## Usage

### Basic Usage

```bash
tsx scripts/generate-with-review.ts \
  --entry attention \
  --faculty a.james \
  --edition adult \
  --volume 1 \
  --type major
```

### With Specific Reviewers

```bash
tsx scripts/generate-with-review.ts \
  --entry attention \
  --faculty a.james \
  --edition adult \
  --volume 1 \
  --type major \
  --reviewers a.simon,a.weil
```

### Multi-Perspective Articles

Generate multiple articles on the same topic from different authors:

```bash
tsx scripts/generate-with-review.ts \
  --entry attention \
  --faculty a.james \
  --edition adult \
  --volume 1 \
  --type major \
  --multi-perspective \
  --additional-authors a.freud,a.darwin
```

This will generate:
- `attention.adoc` by a.james
- `attention-freud.adoc` by a.freud
- `attention-darwin.adoc` by a.darwin

## Voice Fidelity Checking

The script checks voice fidelity at three stages:
1. Initial article generation
2. After revision
3. Marginalia generation

Each check returns:
- **Score**: 0-100 (higher is better)
- **Passed**: Boolean
- **Issues**: List of voice fidelity problems
- **Suggestions**: Recommendations for improvement

## Reviewer Selection

Reviewers are selected based on:
1. Explicit `--reviewers` parameter (if provided)
2. Default mappings for specific topics
3. Automatic selection (diverse, avoiding author)

## Marginalia Types

Marginalia types are determined based on reviewer:
- `a.simon`: objection
- `a.weil`: heretic
- `a.husserl`: clarification
- `a.dennett`: objection
- `a.dewey`: extension
- Default: clarification

## Requirements

- `SUPABASE_URL` and `SUPABASE_KEY` (for ask-faculty)
- `OPENROUTER_API_KEY` (for voice fidelity checks, optional)

## Workflow Output

The script will:
1. Generate and save canonical text to entry file
2. Add marginalia blocks from reviewers
3. Preserve existing metadata and structure
4. Log all steps with voice fidelity scores
