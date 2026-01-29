#!/bin/bash
# Build PDFs locally for testing

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# Check for asciidoctor-pdf
if ! command -v asciidoctor-pdf &> /dev/null; then
  echo "❌ asciidoctor-pdf not found. Install with:"
  echo "   gem install asciidoctor-pdf"
  exit 1
fi

# Create output directories
mkdir -p site/public/builds/pdf

echo "📄 Building PDFs for Volume I..."

# Build Adult Edition
if [ -f "editions/adult/volumes/volume-01-mind/volume.adoc" ]; then
  echo "  Building Adult Edition..."
  asciidoctor-pdf \
    -D site/public/builds/pdf \
    -o adult-volume-01.pdf \
    editions/adult/volumes/volume-01-mind/volume.adoc
  echo "  ✅ Built: site/public/builds/pdf/adult-volume-01.pdf"
else
  echo "  ⚠️  Adult volume.adoc not found"
fi

# Build Children's Edition
if [ -f "editions/children/volumes/volume-01-mind/volume.adoc" ]; then
  echo "  Building Children's Edition..."
  asciidoctor-pdf \
    -D site/public/builds/pdf \
    -o children-volume-01.pdf \
    editions/children/volumes/volume-01-mind/volume.adoc
  echo "  ✅ Built: site/public/builds/pdf/children-volume-01.pdf"
else
  echo "  ⚠️  Children's volume.adoc not found"
fi

echo ""
echo "📁 PDFs available at:"
ls -lh site/public/builds/pdf/*.pdf 2>/dev/null || echo "  (none built)"
