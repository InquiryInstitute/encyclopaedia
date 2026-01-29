#!/bin/bash
#
# Build Encyclopædia Content
#
# This script builds HTML and PDF outputs for the encyclopaedia volumes.
# It can be called directly or from GitHub Actions.
#
# Usage:
#   ./scripts/build-content.sh [options]
#
# Options:
#   --volumes "01,02"    Volumes to build (default: "01")
#   --editions "adult"   Editions to build: adult, children, or both (default: "both")
#   --output DIR         Output directory (default: "dist/builds")
#

set -euo pipefail

# Defaults
VOLUMES="01"
EDITIONS="both"
OUTPUT_DIR="dist/builds"

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

# Create output directories
mkdir -p "$OUTPUT_DIR/html" "$OUTPUT_DIR/pdf"

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
  
  echo "📖 Building ${EDITION} ${SLUG}..."
  
  # Build HTML
  if command -v asciidoctor &> /dev/null; then
    asciidoctor \
      -D "${OUTPUT_DIR}/html" \
      -o "${EDITION}-${SLUG}.html" \
      "$MASTER" 2>&1 || echo "⚠️  HTML build had warnings"
  else
    echo "⚠️  asciidoctor not found, skipping HTML build"
  fi
  
  # Build PDF
  if command -v asciidoctor-pdf &> /dev/null; then
    asciidoctor-pdf \
      -D "${OUTPUT_DIR}/pdf" \
      -o "${EDITION}-${SLUG}.pdf" \
      "$MASTER" 2>&1 || echo "⚠️  PDF build had warnings"
  else
    echo "⚠️  asciidoctor-pdf not found, skipping PDF build"
  fi
  
  echo "✅ Built ${EDITION} ${SLUG}"
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
echo ""
echo "HTML outputs:"
ls -la "$OUTPUT_DIR/html/" 2>/dev/null || echo "  (none)"
echo ""
echo "PDF outputs:"
ls -la "$OUTPUT_DIR/pdf/" 2>/dev/null || echo "  (none)"
