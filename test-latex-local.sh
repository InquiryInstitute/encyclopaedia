#!/bin/bash
# Test LaTeX compilation locally
# Make sure pdflatex is installed first!

set -e

cd "$(dirname "$0")"

echo "📄 Testing LaTeX compilation..."

# Check if pdflatex is available
if ! command -v pdflatex &> /dev/null; then
    echo "❌ pdflatex not found!"
    echo ""
    echo "Install MacTeX:"
    echo "  brew install --cask mactex"
    echo ""
    echo "Then add to ~/.zshrc:"
    echo "  export PATH=\"/Library/TeX/texbin:\$PATH\""
    echo ""
    echo "Then reload: source ~/.zshrc"
    exit 1
fi

echo "✅ Found pdflatex: $(which pdflatex)"
echo ""

# Copy class file
cp shared/latex/encyclopaedia.cls .

# Compile (run twice for references)
echo "Compiling test-entry.tex..."
pdflatex -interaction=nonstopmode test-entry.tex > /dev/null
pdflatex -interaction=nonstopmode test-entry.tex

if [ -f test-entry.pdf ]; then
    echo ""
    echo "✅ PDF generated: test-entry.pdf"
    echo "📄 Opening PDF..."
    open test-entry.pdf
else
    echo "❌ PDF generation failed"
    exit 1
fi
