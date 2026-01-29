#!/usr/bin/env python3
"""
AsciiDoc to LaTeX Converter v3 for The Encyclopædia
Properly converts AsciiDoc structure to two-column entry layout with marginalia
"""

import re
import sys
from pathlib import Path

def escape_latex(text):
    """Escape LaTeX special characters"""
    replacements = {
        '\\': '\\textbackslash{}',
        '&': '\\&',
        '%': '\\%',
        '$': '\\$',
        '#': '\\#',
        '^': '\\textasciicircum{}',
        '_': '\\_',
        '{': '\\{',
        '}': '\\}',
        '~': '\\textasciitilde{}',
        '<': '\\textless{}',
        '>': '\\textgreater{}',
    }
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    return text

def process_includes(content, base_dir):
    """Process include:: directives recursively"""
    include_pattern = re.compile(r'^include::(.+?)\[\]$', re.MULTILINE)
    
    def replace_include(match):
        include_path = match.group(1)
        full_path = (base_dir / include_path).resolve()
        
        if full_path.exists():
            with open(full_path, 'r', encoding='utf-8') as f:
                included = f.read()
            # Recursively process includes
            return process_includes(included, full_path.parent)
        else:
            return f"\\textbf{{[MISSING: {include_path}]}}"
    
    return include_pattern.sub(replace_include, content)

def parse_entry(entry_content):
    """Parse an entry AsciiDoc block and extract title, canonical text, and marginalia"""
    # Extract entry title (=== Title)
    title_match = re.search(r'^=== (.+)$', entry_content, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else "Untitled"
    
    # Extract canonical text block
    canonical_pattern = re.compile(
        r'\[role=canonical\]\s*\n====\s*\n(.*?)\n====',
        re.DOTALL
    )
    canonical_match = canonical_pattern.search(entry_content)
    canonical_text = canonical_match.group(1).strip() if canonical_match else ""
    
    # Extract all marginalia blocks
    marginalia_pattern = re.compile(
        r'\[role=marginalia,([^\]]+)\]\s*\n====\s*\n(.*?)\n====',
        re.DOTALL
    )
    marginalia_blocks = []
    for match in marginalia_pattern.finditer(entry_content):
        attrs_str = match.group(1)
        content = match.group(2).strip()
        
        # Parse attributes
        author = re.search(r'author=["\']([^"\']+)["\']', attrs_str)
        author = author.group(1) if author else "Unknown"
        
        m_type = re.search(r'type=([^,\]]+)', attrs_str)
        m_type = m_type.group(1).strip(' "\'') if m_type else "Note"
        
        year = re.search(r'year=["\']([^"\']+)["\']', attrs_str)
        year = year.group(1) if year else "N.D."
        
        marginalia_blocks.append({
            'author': author,
            'type': m_type,
            'year': year,
            'content': content
        })
    
    return {
        'title': title,
        'canonical': canonical_text,
        'marginalia': marginalia_blocks
    }

def convert_canonical_to_latex(text):
    """Convert canonical text to LaTeX, preserving structure"""
    # Remove AsciiDoc formatting and convert to LaTeX
    # Handle bold **text**
    text = re.sub(r'\*\*(.+?)\*\*', r'\\textbf{\1}', text)
    
    # Handle italic *text*
    text = re.sub(r'(?<!\*)\*([^*]+?)\*(?!\*)', r'\\textit{\1}', text)
    
    # Handle line breaks (double newline = paragraph break)
    paragraphs = text.split('\n\n')
    latex_paragraphs = []
    
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        
        # Handle inline formatting within paragraph
        para = escape_latex(para)
        
        # Restore LaTeX commands that were escaped
        para = para.replace('\\textbackslash{}\\textbf', '\\textbf')
        para = para.replace('\\textbackslash{}\\textit', '\\textit')
        
        # Handle tables (simple markdown tables)
        if '|' in para and para.count('|') >= 2:
            # Convert markdown table to LaTeX
            lines = para.split('\n')
            if len(lines) >= 2:
                latex_paragraphs.append(convert_table_to_latex(lines))
                continue
        
        # Regular paragraph
        latex_paragraphs.append(para)
    
    return '\n\n'.join(latex_paragraphs)

def convert_table_to_latex(lines):
    """Convert markdown table to LaTeX tabular"""
    # Simple table conversion
    # For now, return as formatted text
    return '\\begin{quote}\\small ' + '\\\\'.join(lines[:3]) + '\\end{quote}'

def convert_asciidoc_to_latex(adoc_file, output_file, volume_num, edition, year="2026"):
    """Convert AsciiDoc master file to LaTeX with proper structure"""
    base_dir = Path(adoc_file).parent
    
    # Read and process includes
    with open(adoc_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Process includes
    content = process_includes(content, base_dir)
    
    # Extract document metadata
    title_match = re.search(r'^= (.+)$', content, re.MULTILINE)
    doc_title = title_match.group(1) if title_match else "The Encyclopædia"
    
    volume_title_match = re.search(r'^:volume-title:\s*(.+)$', content, re.MULTILINE)
    volume_title = volume_title_match.group(1) if volume_title_match else "Untitled"
    
    # Split content into sections (entries)
    # Find all entry includes or direct entry blocks
    entries = []
    
    # Pattern 1: include::entries/entry.adoc[]
    include_pattern = re.compile(r'include::entries/([^/]+\.adoc)\[\]', re.MULTILINE)
    for match in include_pattern.finditer(content):
        entry_file = base_dir / 'entries' / match.group(1)
        if entry_file.exists():
            with open(entry_file, 'r', encoding='utf-8') as f:
                entry_content = f.read()
            parsed = parse_entry(entry_content)
            if parsed['title'] and parsed['canonical']:
                entries.append(parsed)
    
    # Build LaTeX document
    latex = f"""\\documentclass{{encyclopaedia}}
\\title{{{doc_title}: {volume_title}}}
\\author{{The Inquiry Institute}}
\\date{{{year}}}

\\begin{{document}}

\\maketitle

\\tableofcontents

\\cleardoublepage

"""
    
    # Add each entry
    for entry in entries:
        # Entry title spanning both columns
        latex += f"\\entry{{{entry['title']}}}\n\n"
        
        # Convert canonical text
        canonical_latex = convert_canonical_to_latex(entry['canonical'])
        latex += canonical_latex + "\n\n"
        
        # Add marginalia
        for marg in entry['marginalia']:
            marg_content = escape_latex(marg['content'])
            latex += f"\\marginalia{{{marg['author']}}}{{{marg['type']} ({marg['year']})}}{{{marg_content}}}\n"
        
        latex += "\n\\clearpage\n\n"
    
    latex += "\\end{document}\n"
    
    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(latex)
    
    print(f"✅ Converted {len(entries)} entries to LaTeX")

if __name__ == '__main__':
    if len(sys.argv) != 5:
        print("Usage: python3 asciidoc-to-latex-converter-v3.py <input.adoc> <output.tex> <volume_num> <edition>", file=sys.stderr)
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    volume_num = sys.argv[3]
    edition = sys.argv[4]
    
    convert_asciidoc_to_latex(input_file, output_file, volume_num, edition)
