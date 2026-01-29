#!/bin/bash
#
# Build PDFs via LaTeX pipeline
# AsciiDoc → LaTeX → PDF
#
# Usage:
#   ./scripts/build-pdf-latex.sh [options]
#
# Options:
#   --volumes "01,02"    Volumes to build (default: "01")
#   --editions "adult"   Editions to build: adult, children, or both (default: "both")
#   --output DIR         Output directory (default: "site/public/builds/pdf")
#

set -euo pipefail

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

# Ensure we're in the encyclopaedia directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Check dependencies
if ! command -v asciidoctor &> /dev/null; then
  echo "❌ asciidoctor not found. Install with: gem install asciidoctor"
  exit 1
fi

if ! command -v pdflatex &> /dev/null; then
  echo "❌ pdflatex not found. Install TeX Live or MacTeX"
  exit 1
fi

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
  
  # Step 1: AsciiDoc → LaTeX
  local TEX_FILE="${TEMP_DIR}/${EDITION}-${SLUG}.tex"
  
  # Use asciidoctor with latex backend
  # We'll need to post-process to handle marginalia
  asciidoctor \
    -b latex \
    -a latex-class=encyclopaedia \
    -a year=2026 \
    -a docdate=2026 \
    -o "$TEX_FILE" \
    "$MASTER" 2>&1 || {
    echo "⚠️  AsciiDoc to LaTeX conversion had warnings"
  }
  
  # Post-process LaTeX to handle marginalia blocks
  if [ -f "$TEX_FILE" ]; then
    # Replace [role=canonical] blocks (they should already be in two-column)
    # Replace [role=marginalia] blocks with \marginalia command
    # This is a simplified approach - we'll need to parse the AsciiDoc structure properly
    sed -i.bak \
      -e 's/\\begin{quote}\[role=marginalia[^]]*\]/\\marginalia{}{}{/g' \
      -e 's/\\end{quote}/}/g' \
      "$TEX_FILE" 2>/dev/null || true
  fi
  
  if [ ! -f "$TEX_FILE" ]; then
    echo "❌ Failed to generate LaTeX file"
    return 1
  fi
  
  # Step 2: Copy class file to temp directory
  cp shared/latex/encyclopaedia.cls "$TEMP_DIR/"
  
  # Step 3: LaTeX → PDF (multiple passes for references)
  cd "$TEMP_DIR"
  
  local PDF_BASE="${EDITION}-${SLUG}"
  local PDF_OUTPUT="${OUTPUT_DIR}/${PDF_BASE}.pdf"
  
  # First pass
  pdflatex -interaction=nonstopmode -halt-on-error \
    -output-directory="$TEMP_DIR" \
    "$TEX_FILE" > /dev/null 2>&1 || true
  
  # Second pass (for references)
  pdflatex -interaction=nonstopmode -halt-on-error \
    -output-directory="$TEMP_DIR" \
    "$TEX_FILE" > /dev/null 2>&1 || true
  
  # Copy PDF to output
  if [ -f "${PDF_BASE}.pdf" ]; then
    cp "${PDF_BASE}.pdf" "$PDF_OUTPUT"
    echo "✅ Built: $PDF_OUTPUT"
  else
    echo "❌ PDF generation failed"
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
