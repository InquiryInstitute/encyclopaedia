# LaTeX Layout for The Encyclopædia

## Overview

This directory contains the LaTeX class file and supporting files for generating PDFs with the specified layout:

- **A4 hardbound format** (210 × 297 mm)
- **Two-column canonical text**
- **Outer-margin marginalia** (Talmudic-inspired)
- **Libertinus typography**
- **Durable, conservative design**

## Files

- `encyclopaedia.cls` - Main LaTeX class file implementing the layout specification
- `asciidoc-latex-extension.rb` - AsciiDoctor extension for handling marginalia
- `asciidoc-latex-backend.conf` - Backend configuration

## Building PDFs

Use the build script:

```bash
./scripts/build-pdf-latex-v2.sh --volumes "01" --editions "both"
```

This will:
1. Convert AsciiDoc to LaTeX (resolving includes)
2. Post-process LaTeX to handle marginalia blocks
3. Compile LaTeX to PDF using pdflatex

## Layout Specifications

### Margins
- Inner: 30mm (binding + thumb space)
- Outer: 40mm (marginalia)
- Top: 25mm
- Bottom: 30mm
- Column gap: 8mm

### Typography
- Serif: Libertinus Serif
- Sans: Libertinus Sans
- Line spacing: 1.05
- Paragraph indent: 1em

### Marginalia
- Always in outer margin
- Format: `\marginalia{Author}{Type (Year)}{Text}`
- Font: footnotesize (8-9pt)

## Requirements

- AsciiDoctor (`gem install asciidoctor`)
- TeX Live or MacTeX (`pdflatex`)
- Python 3 (for post-processing)
