#!/bin/bash
#
# Build PDFs via LaTeX pipeline (v2)
# AsciiDoc → LaTeX → PDF with proper marginalia handling
#
# This script:
# 1. Converts AsciiDoc to LaTeX using asciidoctor
# 2. Post-processes LaTeX to extract and convert marginalia blocks
# 3. Compiles LaTeX to PDF using pdflatex
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Check dependencies
if ! command -v python3 &> /dev/null; then
  echo "❌ python3 not found"
  exit 1
fi

if ! command -v pdflatex &> /dev/null; then
  echo "❌ pdflatex not found. Install TeX Live or MacTeX"
  echo "   On macOS: brew install --cask mactex"
  exit 1
fi

# Defaults
VOLUMES="01"
EDITIONS="both"
OUTPUT_DIR="site/public/builds/pdf"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --volumes)
      VOLUMES="$2"
      shift 2
      ;;
    --editions)
      EDITIONS="$2"
      shift 2
      ;;
    --output)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Create output directories
mkdir -p "$OUTPUT_DIR"
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Volume name mapping
declare -A VOLUME_NAMES=(
  ["01"]="mind"
  ["02"]="language-meaning"
  ["03"]="nature"
  ["04"]="measure"
  ["05"]="society"
  ["06"]="art-form"
  ["07"]="knowledge"
  ["08"]="history"
  ["09"]="ethics"
  ["10"]="machines"
  ["11"]="futures"
  ["12"]="limits"
)

# Post-process LaTeX to handle marginalia
postprocess_latex() {
  local TEX_FILE="$1"
  
  # Create a Python script to properly parse and convert marginalia
  python3 << 'PYTHON_SCRIPT'
import sys
import re

def convert_marginalia(tex_content):
    # Pattern to match [role=marginalia] blocks in AsciiDoc LaTeX output
    # These typically appear as quote blocks with attributes
    
    # First, handle marginalia blocks that are in quote environments
    # Pattern: \begin{quote}[role=marginalia, ...] ... \end{quote}
    
    def replace_marginalia_quote(match):
        attrs_str = match.group(1) if match.group(1) else ''
        content = match.group(2)
        
        # Parse attributes
        author = 'Unknown'
        note_type = 'note'
        year = ''
        
        # Extract author
        author_match = re.search(r'author=["\']([^"\']+)["\']', attrs_str)
        if author_match:
            author = author_match.group(1)
        
        # Extract type
        type_match = re.search(r'type=([^,\]]+)', attrs_str)
        if type_match:
            note_type = type_match.group(1).strip('"\'')
        
        # Extract year
        year_match = re.search(r'year=["\']([^"\']+)["\']', attrs_str)
        if year_match:
            year = year_match.group(1)
        
        # Format note type
        if year:
            note_type_full = f"{note_type} ({year})"
        else:
            note_type_full = note_type
        
        # Clean content
        content = content.strip()
        content = re.sub(r'\s+', ' ', content)  # Normalize whitespace
        
        return f"\\marginalia{{{author}}}{{{note_type_full}}}{{{content}}}"
    
    # Match quote blocks with role=marginalia
    pattern = r'\\begin\{quote\}\[role=marginalia([^\]]*)\](.*?)\\end\{quote\}'
    tex_content = re.sub(pattern, replace_marginalia_quote, tex_content, flags=re.DOTALL)
    
    # Also handle if marginalia appears in other formats
    # This is a fallback for different LaTeX output formats
    
    return tex_content

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 script.py <input.tex>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    processed = convert_marginalia(content)
    
    with open(input_file, 'w', encoding='utf-8') as f:
        f.write(processed)
PYTHON_SCRIPT
}

# Build function
build_volume() {
  local EDITION="$1"
  local VOL_NUM="$2"
  
  local VOL_NAME="${VOLUME_NAMES[$VOL_NUM]:-mind}"
  local VOLUME_DIR="editions/${EDITION}/volumes/volume-${VOL_NUM}-${VOL_NAME}"
  local SLUG="volume-${VOL_NUM}"
  
  # Check if directory exists
  if [ ! -d "$VOLUME_DIR" ]; then
    echo "⚠️  Skipping: $VOLUME_DIR (not found)"
    return 0
  fi
  
  local MASTER="${VOLUME_DIR}/volume.adoc"
  
  if [ ! -f "$MASTER" ]; then
    echo "⚠️  Skipping: $MASTER (not found)"
    return 0
  fi
  
  echo "📖 Building ${EDITION} ${SLUG} via LaTeX..."
  
  local TEX_FILE="${TEMP_DIR}/${EDITION}-${SLUG}.tex"
  
  # Convert directly from AsciiDoc to properly structured LaTeX
  # Skip asciidoctor conversion - use our custom converter
  echo "  Converting AsciiDoc to structured LaTeX..."
  
  python3 "$SCRIPT_DIR/asciidoc-to-latex-converter-v3.py" \
    "$MASTER" \
    "$TEX_FILE" \
    "$VOL_NUM" \
    "$EDITION" \
    "2026" || {
    echo "❌ Failed to convert AsciiDoc to LaTeX"
    return 1
  }
  
  if [ ! -f "$TEX_FILE" ]; then
    echo "❌ Failed to generate LaTeX file"
    return 1
  fi
  
  # Step 3: Copy class file to temp directory
  cp shared/latex/encyclopaedia.cls "$TEMP_DIR/"
  
  # Step 4: LaTeX → PDF (multiple passes for references)
  cd "$TEMP_DIR"
  
  local PDF_BASE="${EDITION}-${SLUG}"
  local PDF_OUTPUT="${OUTPUT_DIR}/${PDF_BASE}.pdf"
  
  echo "  Compiling LaTeX to PDF..."
  
  # First pass
  pdflatex -interaction=nonstopmode -halt-on-error \
    -output-directory="$TEMP_DIR" \
    "$TEX_FILE" > /dev/null 2>&1 || {
    echo "⚠️  First LaTeX pass had warnings (checking output...)"
  }
  
  # Second pass (for references)
  pdflatex -interaction=nonstopmode -halt-on-error \
    -output-directory="$TEMP_DIR" \
    "$TEX_FILE" > /dev/null 2>&1 || {
    echo "⚠️  Second LaTeX pass had warnings"
  }
  
  # Copy PDF to output
  if [ -f "${PDF_BASE}.pdf" ]; then
    cp "${PDF_BASE}.pdf" "$PDF_OUTPUT"
    echo "✅ Built: $PDF_OUTPUT"
  else
    echo "❌ PDF generation failed"
    # Show LaTeX log for debugging
    if [ -f "${PDF_BASE}.log" ]; then
      echo "  Last 20 lines of LaTeX log:"
      tail -20 "${PDF_BASE}.log"
    fi
    return 1
  fi
  
  cd "$SCRIPT_DIR/.."
}

# Parse volumes list
IFS=',' read -ra VOL_ARRAY <<< "$VOLUMES"

# Build each volume
for VOL in "${VOL_ARRAY[@]}"; do
  VOL=$(echo "$VOL" | xargs)  # Trim whitespace
  
  if [ "$EDITIONS" = "both" ] || [ "$EDITIONS" = "adult" ]; then
    build_volume "adult" "$VOL"
  fi
  
  if [ "$EDITIONS" = "both" ] || [ "$EDITIONS" = "children" ]; then
    build_volume "children" "$VOL"
  fi
done

# Summary
echo ""
echo "📁 Build complete!"
echo "PDFs in: $OUTPUT_DIR"
ls -lh "$OUTPUT_DIR"/*.pdf 2>/dev/null || echo "  (none)"
