# Setting Up LaTeX for Local Testing

## Quick Setup (Recommended)

Install full MacTeX (includes everything, ~4GB):

```bash
# Uninstall BasicTeX if installed
brew uninstall --cask basictex

# Install MacTeX
brew install --cask mactex

# Add to PATH (add to ~/.zshrc)
echo 'export PATH="/Library/TeX/texbin:$PATH"' >> ~/.zshrc

# Reload shell
source ~/.zshrc
```

## Test Compilation

Once pdflatex is installed, run:

```bash
cd ~/GitHub/encyclopaedia
./test-latex-local.sh
```

This will:
1. Check if pdflatex is available
2. Copy the class file
3. Compile test-entry.tex
4. Open the resulting PDF

## Manual Compilation

If you prefer to compile manually:

```bash
cd ~/GitHub/encyclopaedia
cp shared/latex/encyclopaedia.cls .
pdflatex -interaction=nonstopmode test-entry.tex
pdflatex -interaction=nonstopmode test-entry.tex  # Run twice for references
open test-entry.pdf
```

## Alternative: Fix BasicTeX

If you want to keep BasicTeX (smaller install):

```bash
# Find TeX Live path
TEXLIVE_PATH=$(find /usr/local -name pdflatex 2>/dev/null | head -1 | xargs dirname)
export PATH="$TEXLIVE_PATH:$PATH"

# Install required packages (requires password)
sudo tlmgr update --self
sudo tlmgr install collection-latexextra collection-fontsrecommended libertinus

# Add to ~/.zshrc
echo "export PATH=\"$TEXLIVE_PATH:\$PATH\"" >> ~/.zshrc
source ~/.zshrc
```

