#!/usr/bin/env python3
"""
AsciiDoc to LaTeX Converter for The Encyclopædia
Properly handles canonical text and marginalia blocks
"""

import re
import sys
import subprocess
from pathlib import Path

def parse_marginalia_block(content):
    """Parse a marginalia block and extract attributes"""
    # Pattern: [role=marginalia, attr1=value1, attr2=value2]
    attrs = {}
    
    # Extract attributes from role line
    attr_pattern = r'(\w+)=(["\']?)([^"\',\]]+)\2'
    matches = re.findall(attr_pattern, content)
    for key, quote, value in matches:
        attrs[key] = value.strip('"\'')
    
    return attrs

def convert_asciidoc_to_latex(adoc_file, output_file, volume_num, edition, year="2026"):
    """Convert AsciiDoc file to LaTeX with proper marginalia handling"""
    
    # Check if input is already LaTeX (from asciidoctor) or AsciiDoc
    is_latex = adoc_file.endswith('.tex') or adoc_file.endswith('.raw')
    
    if is_latex:
        # Post-process LaTeX file
        with open(adoc_file, 'r', encoding='utf-8') as f:
            latex_content = f.read()
    else:
        # Convert AsciiDoc to LaTeX first
        with open(adoc_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Use asciidoctor via subprocess to convert
        # For now, we'll do a simple conversion
        latex_content = convert_asciidoc_direct(content, adoc_file)
    
    # Post-process LaTeX to handle marginalia
    latex_content = postprocess_latex_marginalia(latex_content)
    
    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(latex_content)

def convert_asciidoc_direct(content, source_file):
    """Direct AsciiDoc to LaTeX conversion (simplified)"""
    # This is a placeholder - in practice, use asciidoctor
    # For now, return basic structure
    return content

def postprocess_latex_marginalia(latex_content):
    r"""Post-process LaTeX to convert marginalia blocks to \marginalia commands"""
    
    # Pattern 1: Quote blocks with role=marginalia attributes
    # \begin{quote}[role=marginalia, ...] ... \end{quote}
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
            note_type = type_match.group(1).strip(' "\'')
        
        # Extract year
        year_match = re.search(r'year=["\']([^"\']+)["\']', attrs_str)
        if year_match:
            year = year_match.group(1)
        
        # Format note type
        if year:
            note_type_full = f"{note_type} ({year})"
        else:
            note_type_full = note_type
        
        # Clean content - remove LaTeX commands that might interfere
        content = content.strip()
        content = re.sub(r'\s+', ' ', content)  # Normalize whitespace
        content = content.replace('\\', '\\textbackslash{}')
        
        return f"\\marginalia{{{author}}}{{{note_type_full}}}{{{content}}}"
    
    # Match quote blocks with role=marginalia
    pattern = r'\\begin\{quote\}\[role=marginalia([^\]]*)\](.*?)\\end\{quote\}'
    latex_content = re.sub(pattern, replace_marginalia_quote, latex_content, flags=re.DOTALL)
    
    return latex_content
    
    # Post-process LaTeX content
    processed_latex = postprocess_latex_marginalia(latex_content)
    
    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(processed_latex)
    
    print(f"✅ Processed {adoc_file} → {output_file}")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 asciidoc-to-latex-converter.py <input.adoc> <output.tex>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    convert_asciidoc_to_latex(input_file, output_file, "01", "adult")
