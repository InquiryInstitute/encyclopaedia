# PDF Formatting Validation Checklist

## Britannica-Style Formatting Requirements

### Page Layout
- [ ] A4 paper size (210 × 297 mm)
- [ ] Inner margin: 25mm (binding + thumb space)
- [ ] Outer margin: 45mm (for marginalia)
- [ ] Top margin: 20mm
- [ ] Bottom margin: 25mm
- [ ] Column separation: 10mm

### Typography
- [ ] Two-column layout for canonical text
- [ ] Entry titles span both columns (uppercase, centered)
- [ ] Running headers with volume number/title and entry title
- [ ] Page numbers centered at bottom
- [ ] Libertinus font family used
- [ ] Proper character encoding (UTF-8, T1)

### Entry Structure
- [ ] Entry titles are uppercase and centered
- [ ] Titles span both columns using `\entry{}` command
- [ ] Canonical text in two columns
- [ ] Marginalia appear in outer margin
- [ ] Author signature at end of entry (small caps)
- [ ] Each entry starts on a new page

### Front Matter
- [ ] Title page with volume information
- [ ] Table of Contents
- [ ] Constitutional front matter (Volume I only)
- [ ] Proper page numbering

### Marginalia
- [ ] Marginalia in outer margin
- [ ] Author name in italic
- [ ] Type and year in bold
- [ ] Compact formatting
- [ ] Proper placement after first paragraph

### Author Signatures
- [ ] Author name in small caps
- [ ] Optional frontal bust portrait
- [ ] Positioned at end of canonical text
- [ ] Restrained typography

### Content Quality
- [ ] All entries have generated content (no placeholders)
- [ ] Inquiry-first template structure followed
- [ ] Proper markdown/LaTeX conversion
- [ ] No duplicate titles
- [ ] Citations formatted correctly

## Issues to Check

1. **Two-column layout**: Verify canonical text is in two columns
2. **Entry titles**: Should be uppercase, centered, spanning both columns
3. **Running headers**: Volume info on left, entry title on right
4. **Marginalia placement**: Should be in outer margin, not interfering with text
5. **Page breaks**: Each entry should start on a new page
6. **Font rendering**: Special characters should display correctly
7. **Spacing**: Proper line spacing and paragraph breaks
8. **Title page**: Should use custom `\maketitle` command

## Validation Method

1. Download PDF from GitHub Pages
2. Open in PDF viewer
3. Check each requirement systematically
4. Document any issues found
5. Note formatting inconsistencies
