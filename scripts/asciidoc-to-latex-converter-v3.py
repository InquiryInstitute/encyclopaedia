#!/usr/bin/env python3
"""
AsciiDoc to LaTeX Converter v3 for The Encyclopædia
Properly converts AsciiDoc structure to two-column entry layout with marginalia
"""

import re
import sys
from pathlib import Path

def escape_latex_safe(text):
    """Escape LaTeX special characters but preserve existing LaTeX commands"""
    # If text contains LaTeX commands, only escape parts outside commands
    if '\\' in text and any(cmd in text for cmd in ['\\textbf', '\\textit']):
        # Split by LaTeX commands and escape only non-command parts
        result = []
        last_pos = 0
        
        # Find all LaTeX command patterns
        pattern = r'\\(?:textbf|textit)\{([^}]+)\}'
        
        for match in re.finditer(pattern, text):
            # Add text before command (escaped)
            before = text[last_pos:match.start()]
            if before:
                result.append(escape_simple(before))
            
            # Add command as-is
            result.append(match.group(0))
            last_pos = match.end()
        
        # Add remaining text (escaped)
        if last_pos < len(text):
            result.append(escape_simple(text[last_pos:]))
        
        return ''.join(result)
    else:
        # No LaTeX commands - escape everything
        return escape_simple(text)

def escape_simple(text):
    """Escape LaTeX special characters (simple version)"""
    replacements = {
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

def get_volume_slug(volume_num):
    """Get volume slug from volume number"""
    slugs = {
        1: 'mind', 2: 'language-meaning', 3: 'nature', 4: 'measure',
        5: 'society', 6: 'art-form', 7: 'knowledge', 8: 'history',
        9: 'ethics', 10: 'machines', 11: 'futures', 12: 'limits'
    }
    return slugs.get(volume_num, 'unknown')

def parse_entry(entry_content):
    """Parse an entry AsciiDoc block and extract title, canonical text, and marginalia"""
    # Extract entry title (=== Title) - can be anywhere in file
    title_match = re.search(r'^=== (.+)$', entry_content, re.MULTILINE)
    if not title_match:
        # Try alternative: [[entry-slug]]\n=== Title
        title_match = re.search(r'\[\[entry-[^\]]+\]\]\s*\n=== (.+)$', entry_content, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else "Untitled"
    
    # Extract canonical text block - handle both generated and placeholder
    canonical_pattern = re.compile(
        r'\[role=canonical\]\s*\n====\s*\n(.*?)\n====',
        re.DOTALL
    )
    canonical_match = canonical_pattern.search(entry_content)
    canonical_text = canonical_match.group(1).strip() if canonical_match else ""
    
    # If no canonical text but has placeholder, use empty (will be filled later)
    if not canonical_text and '[CANONICAL TEXT TO BE GENERATED]' in entry_content:
        canonical_text = "[CANONICAL TEXT TO BE GENERATED]"
    
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

def convert_table_to_latex(lines):
    """Convert markdown table to LaTeX tabular"""
    # Simple table conversion - for now return as formatted text
    return '\\begin{quote}\\small ' + '\\\\'.join(lines[:3]) + '\\end{quote}'

def convert_canonical_to_latex(text):
    """Convert canonical text to LaTeX, preserving structure"""
    # First convert AsciiDoc/Markdown to LaTeX commands
    # Handle bold **text**
    text = re.sub(r'\*\*([^*]+?)\*\*', r'\\textbf{\1}', text)
    
    # Handle italic *text* (single asterisk, not double)
    # Be careful not to match **bold**
    text = re.sub(r'(?<!\*)\*([^*\n]+?)\*(?!\*)', r'\\textit{\1}', text)
    
    # Handle line breaks (double newline = paragraph break)
    paragraphs = text.split('\n\n')
    latex_paragraphs = []
    
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        
        # Handle tables (simple markdown tables) - before escaping
        if '|' in para and para.count('|') >= 2 and '\n' in para:
            lines = para.split('\n')
            if len(lines) >= 2:
                latex_paragraphs.append(convert_table_to_latex(lines))
                continue
        
        # Escape special characters but preserve LaTeX commands
        para = escape_latex_safe(para)
        
        # Regular paragraph
        latex_paragraphs.append(para)
    
    return '\n\n'.join(latex_paragraphs)

def convert_asciidoc_to_latex(adoc_file, output_file, volume_num, edition, year="2026"):
    """Convert AsciiDoc master file to LaTeX with proper structure"""
    base_dir = Path(adoc_file).parent
    volume_num_int = int(volume_num) if volume_num.isdigit() else 1
    
    # Read original content (before processing includes)
    with open(adoc_file, 'r', encoding='utf-8') as f:
        original_content = f.read()
    
    # Extract document metadata from original
    title_match = re.search(r'^= (.+)$', original_content, re.MULTILINE)
    doc_title = title_match.group(1) if title_match else "The Encyclopædia"
    
    volume_title_match = re.search(r'^:volume-title:\s*(.+)$', original_content, re.MULTILINE)
    volume_title = volume_title_match.group(1) if volume_title_match else "Untitled"
    
    # Find all entry includes BEFORE processing includes
    entries = []
    
    # Pattern 1: include::entries/entry.adoc[] (simple pattern)
    include_pattern = re.compile(r'include::entries/([^\s\[\]]+\.adoc)\[\]', re.MULTILINE)
    matches = list(include_pattern.finditer(original_content))
    
    if not matches:
        # Try alternative pattern
        include_pattern = re.compile(r'include::.*?entries/([^\s\[\]]+\.adoc)\[\]', re.MULTILINE)
        matches = list(include_pattern.finditer(original_content))
    
    print(f"Found {len(matches)} entry includes", file=sys.stderr)
    
    for match in matches:
        entry_filename = match.group(1)
        entry_file = base_dir / 'entries' / entry_filename
        
        if entry_file.exists():
            try:
                with open(entry_file, 'r', encoding='utf-8') as f:
                    entry_content = f.read()
                parsed = parse_entry(entry_content)
                # Include entries even if they have placeholders (for structure)
                if parsed['title'] and parsed['title'] != "Untitled":
                    entries.append(parsed)
                    print(f"  Added entry: {parsed['title']}", file=sys.stderr)
            except Exception as e:
                print(f"⚠️  Error processing {entry_file}: {e}", file=sys.stderr)
                continue
        else:
            print(f"⚠️  Entry file not found: {entry_file}", file=sys.stderr)
    
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
        
        # Convert canonical text (skip if placeholder)
        if entry['canonical'] and entry['canonical'] != "[CANONICAL TEXT TO BE GENERATED]":
            canonical_latex = convert_canonical_to_latex(entry['canonical'])
            latex += canonical_latex + "\n\n"
        else:
            # Placeholder - add note
            latex += "\\textit{[Canonical text to be generated]}\n\n"
        
        # Add marginalia (only if canonical text exists)
        if entry['canonical'] and entry['canonical'] != "[CANONICAL TEXT TO BE GENERATED]":
            for marg in entry['marginalia']:
                marg_content = escape_simple(marg['content'])
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
