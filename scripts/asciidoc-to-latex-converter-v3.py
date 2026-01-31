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
    # First, normalize Unicode spaces and special characters
    # U+202F (narrow no-break space) -> regular space
    text = text.replace('\u202F', ' ')
    # U+00A0 (non-breaking space) -> regular space
    text = text.replace('\u00A0', ' ')
    # U+2009 (thin space) -> regular space
    text = text.replace('\u2009', ' ')
    # U+2013 (en dash) -> --
    text = text.replace('\u2013', '--')
    # U+2014 (em dash) -> ---
    text = text.replace('\u2014', '---')
    # U+2018 (left single quote) -> `
    text = text.replace('\u2018', '`')
    # U+2019 (right single quote/apostrophe) -> '
    text = text.replace('\u2019', "'")
    # U+201C (left double quote) -> ``
    text = text.replace('\u201C', '``')
    # U+201D (right double quote) -> ''
    text = text.replace('\u201D', "''")
    
    # Then escape LaTeX special characters
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
    """Parse an entry AsciiDoc block and extract title, canonical text, author, and marginalia"""
    # Extract entry title (=== Title) - can be anywhere in file
    title_match = re.search(r'^=== (.+)$', entry_content, re.MULTILINE)
    if not title_match:
        # Try alternative: [[entry-slug]]\n=== Title
        title_match = re.search(r'\[\[entry-[^\]]+\]\]\s*\n=== (.+)$', entry_content, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else "Untitled"
    
    # Extract author information
    # Author attribution should be in format a.{surname}
    faculty_id_match = re.search(r':faculty-id:\s*(.+)', entry_content)
    faculty_id = faculty_id_match.group(1).strip() if faculty_id_match else None
    
    canonical_author_match = re.search(r':canonical-author:\s*(.+)', entry_content)
    canonical_author = canonical_author_match.group(1).strip() if canonical_author_match else None
    
    # Extract author image/portrait path
    author_image_match = re.search(r':author-image:\s*(.+)', entry_content)
    author_image = author_image_match.group(1).strip() if author_image_match else None
    
    # Use faculty-id (a.{surname}) format for author attribution
    # This is the canonical format for author signatures
    author_attribution = faculty_id if faculty_id else None
    if not author_attribution and canonical_author:
        # Fallback: if canonical-author is already in a.{surname} format, use it
        if canonical_author and canonical_author.startswith('a.'):
            author_attribution = canonical_author
        elif canonical_author:
            # Convert full name to a.{surname} format (last resort)
            # Extract surname (last word)
            surname = canonical_author.split()[-1].lower()
            author_attribution = f"a.{surname}"
    
    # Extract all marginalia blocks first (before cleaning canonical text)
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
    
    # Extract canonical text block - remove all marginalia blocks first to avoid contamination
    entry_content_clean = marginalia_pattern.sub('', entry_content)
    
    canonical_pattern = re.compile(
        r'\[role=canonical\]\s*\n====\s*\n(.*?)\n====',
        re.DOTALL
    )
    canonical_match = canonical_pattern.search(entry_content_clean)
    canonical_text = canonical_match.group(1).strip() if canonical_match else ""
    
    # If no canonical text but has placeholder, use empty (will be filled later)
    if not canonical_text and '[CANONICAL TEXT TO BE GENERATED]' in entry_content_clean:
        canonical_text = "[CANONICAL TEXT TO BE GENERATED]"
    
    # Remove any remaining marginalia markup that might have slipped through
    canonical_text = re.sub(r'\[role=marginalia[^\]]*\].*?', '', canonical_text, flags=re.DOTALL)
    
    return {
        'title': title,
        'canonical': canonical_text,
        'author': author_attribution,  # Now in a.{surname} format
        'author_image': author_image,
        'marginalia': marginalia_blocks
    }

def convert_table_to_latex(lines):
    """Convert markdown table to LaTeX tabular"""
    # Basic table conversion - assumes simple markdown table
    header = [h.strip() for h in lines[0].split('|') if h.strip()]
    alignment_line = [a.strip() for a in lines[1].split('|') if a.strip()] if len(lines) > 1 else []
    
    # Determine column alignment (l, c, r)
    col_align = []
    for align_cell in alignment_line:
        if align_cell.startswith(':') and align_cell.endswith(':'):
            col_align.append('c')
        elif align_cell.endswith(':'):
            col_align.append('r')
        else:
            col_align.append('l')
    
    if not col_align:  # Fallback if alignment line is empty or malformed
        col_align = ['l'] * len(header)

    latex_table = [
        '\\begin{center}',
        '\\begin{tabular}{|' + '|'.join(col_align) + '|}',
        '\\hline',
        ' & '.join([escape_simple(h) for h in header]) + ' \\\\ \\hline'
    ]
    
    for line in lines[2:]:
        cells = [c.strip() for c in line.split('|') if c.strip()]
        if cells:
            latex_table.append(' & '.join([escape_simple(c) for c in cells]) + ' \\\\ \\hline')
    
    latex_table.append('\\end{tabular}')
    latex_table.append('\\end{center}')
    return '\n'.join(latex_table)

def convert_canonical_to_latex(text, entry_title=None):
    """Convert canonical text to LaTeX, preserving structure"""
    # Remove the entry title if it appears at the start (duplicate of \entry{})
    if entry_title:
        # Remove title if it's the first bold text on its own line
        title_pattern = rf'^\*\*{re.escape(entry_title)}\*\*\s*\n\n'
        text = re.sub(title_pattern, '', text, flags=re.MULTILINE | re.IGNORECASE)
        # Also try without the double newline
        title_pattern2 = rf'^\*\*{re.escape(entry_title)}\*\*\s*\n'
        text = re.sub(title_pattern2, '', text, flags=re.MULTILINE | re.IGNORECASE)
        # Also handle AsciiDoc-style bold title (.**Title**)
        title_pattern3 = rf'^\.\*\*{re.escape(entry_title)}\*\*\s*\n'
        text = re.sub(title_pattern3, '', text, flags=re.MULTILINE | re.IGNORECASE)
    
    # First convert AsciiDoc/Markdown to LaTeX commands
    # Handle bold **text**
    text = re.sub(r'\*\*([^*]+?)\*\*', r'\\textbf{\1}', text)
    
    # Handle italic *text* (single asterisk, not double)
    # Be careful not to match **bold** or standalone asterisks
    text = re.sub(r'(?<!\*)\*([^*\n]+?)\*(?!\*)', r'\\textit{\1}', text)
    
    # Handle AsciiDoc-style horizontal rules (---)
    text = re.sub(r'^---+$', '', text, flags=re.MULTILINE)
    
    # Handle AsciiDoc-style section headers (###, ####, etc.)
    # Convert to bold text for now (we don't want section headers in entries)
    text = re.sub(r'^###+ (.+)$', r'\\textbf{\1}', text, flags=re.MULTILINE)
    
    # Handle numbered lists (1. item)
    def convert_numbered_list(match):
        items = match.group(0).strip().split('\n')
        latex_items = []
        for item in items:
            # Remove leading number and period
            item_text = re.sub(r'^\d+\.\s*', '', item.strip())
            if item_text:
                latex_items.append(f'\\item {escape_latex_safe(item_text)}')
        if latex_items:
            return '\\begin{enumerate}\n' + '\n'.join(latex_items) + '\n\\end{enumerate}'
        return ''
    
    # Match numbered lists (lines starting with number and period)
    text = re.sub(r'(?:^\d+\.\s+.+(?:\n|$))+', convert_numbered_list, text, flags=re.MULTILINE)
    
    # Handle bullet lists (- item or * item)
    def convert_bullet_list(match):
        items = match.group(0).strip().split('\n')
        latex_items = []
        for item in items:
            # Remove leading bullet marker
            item_text = re.sub(r'^[-*]\s+', '', item.strip())
            if item_text:
                latex_items.append(f'\\item {escape_latex_safe(item_text)}')
        if latex_items:
            return '\\begin{itemize}\n' + '\n'.join(latex_items) + '\n\\end{itemize}'
        return ''
    
    # Match bullet lists
    text = re.sub(r'(?:^[-*]\s+.+(?:\n|$))+', convert_bullet_list, text, flags=re.MULTILINE)
    
    # Handle line breaks (double newline = paragraph break)
    paragraphs = text.split('\n\n')
    latex_paragraphs = []
    
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        
        # Skip if it's already a LaTeX environment (lists, tables)
        if para.startswith('\\begin{'):
            latex_paragraphs.append(para)
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
    # IMPORTANT: Only process entries, skip front matter sections
    # Front matter sections like "== Front Matter", "== Volume I: Mind", 
    # "== Boundary Entries", "== Closing Entries" should NOT be included
    
    entries = []
    
    # Pattern 1: include::entries/entry.adoc[] (simple pattern)
    # Only match includes that are for entries, not front matter
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
    
    # Build LaTeX document (Britannica-style)
    volume_num_roman = {
        '01': 'I', '02': 'II', '03': 'III', '04': 'IV', '05': 'V',
        '06': 'VI', '07': 'VII', '08': 'VIII', '09': 'IX', '10': 'X',
        '11': 'XI', '12': 'XII'
    }.get(volume_num, 'I')
    
    latex = f"""\\documentclass{{encyclopaedia}}

% Volume metadata for running headers
\\renewcommand{{\\volumenum}}{{{volume_num_roman}}}
\\renewcommand{{\\volumetitle}}{{{volume_title}}}

\\title{{{doc_title}}}
\\renewcommand{{\\subtitle}}{{Volume {volume_num_roman}: {volume_title}}}
\\author{{The Inquiry Institute}}
\\date{{{year}}}

\\begin{{document}}

% Title page (Britannica-style)
\\maketitle

% Table of contents
\\tableofcontents

\\cleardoublepage

% Start two-column layout for entries
\\twocolumn

"""
    
    # Add each entry
    for entry in entries:
        # Determine article class based on word count
        # Article class determines layout, not the other way around
        canonical_text = entry.get('canonical', '')
        if canonical_text and canonical_text != "[CANONICAL TEXT TO BE GENERATED]":
            # Rough word count estimate (split on whitespace)
            word_count = len(canonical_text.split())
            
            # Article class detection (by word count):
            # Class I (Constellation): 800-1200 words → spanning title, fresh page
            # Class II (Major): 450-600 words → spanning title, may share page
            # Class III (Minor): 220-300 words → run-in headword, shares page
            # Class IV/V: handled as marginalia only
            
            if word_count >= 800:
                article_class = 'constellation'  # Class I
                use_spanning = True
            elif word_count >= 450:
                article_class = 'major'  # Class II
                use_spanning = True
            elif word_count >= 220:
                article_class = 'minor'  # Class III
                use_spanning = False
            else:
                # Very short entries treated as minor
                article_class = 'minor'
                use_spanning = False
        else:
            # Placeholder entries are treated as major (will span)
            article_class = 'major'
            use_spanning = True
        
        # Apply layout based on article class
        if use_spanning:
            # Class I (Constellation) or Class II (Major): spanning title
            latex += f"\\entry{{{escape_simple(entry['title'])}}}\n\n"
        else:
            # Class III (Minor): run-in headword
            latex += f"\\shortentry{{{escape_simple(entry['title'])}}}\n"
        
        # Convert canonical text (skip if placeholder)
        if entry['canonical'] and entry['canonical'] != "[CANONICAL TEXT TO BE GENERATED]":
            # Remove duplicate title from canonical text
            canonical_latex = convert_canonical_to_latex(entry['canonical'], entry['title'])
            
            # Remove any remaining marginalia markup that might have slipped through
            canonical_latex = re.sub(r'\[role=marginalia[^\]]*\].*?', '', canonical_latex, flags=re.DOTALL)
            
            # Split canonical text into paragraphs for marginalia placement
            paragraphs = canonical_latex.split('\n\n')
            
            # Marginalia placement rules (Britannica-style):
            # 1. Density limit: max 1 per 250-300 words, max 2 per column
            # 2. End-of-article rule: no marginalia in final paragraph
            # 3. Prefer paragraph openings (first paragraph, definition paragraphs, transitions)
            # 4. Avoid dense technical paragraphs, lists, quotations
            
            if paragraphs:
                # Estimate word count for density checking
                word_count = len(canonical_text.split())
                max_marginalia = min(
                    max(1, word_count // 275),  # ~1 per 275 words
                    2  # Max 2 per column
                )
                
                # Filter marginalia to respect density limit
                available_marginalia = entry.get('marginalia', [])[:max_marginalia]
                
                # End-of-article rule: exclude final paragraph from marginalia
                # Marginalia can only attach to paragraphs before the last one
                paragraphs_with_marginalia = len(paragraphs) - 1  # Exclude final paragraph
                
                # First paragraph (preferred anchor point)
                latex += paragraphs[0]
                
                # Add first marginalia after first paragraph if available and within limits
                if available_marginalia and len(available_marginalia) > 0 and paragraphs_with_marginalia > 0:
                    marg = available_marginalia[0]
                    marg_content = escape_simple(marg['content'])
                    latex += f"\n\\marginalia{{{escape_simple(marg['author'])}}}{{{escape_simple(marg['type'])} ({marg['year']})}}{{{marg_content}}}\n"
                    available_marginalia = available_marginalia[1:]  # Remove used marginalia
                    paragraphs_with_marginalia -= 1
                
                # Rest of paragraphs (excluding final paragraph for marginalia)
                for i, para in enumerate(paragraphs[1:-1], start=1):  # Exclude last paragraph
                    latex += "\n\n" + para
                    
                    # Add marginalia after paragraph if available and within limits
                    # Prefer early paragraphs (first 2-3) for better reading rhythm
                    if available_marginalia and len(available_marginalia) > 0 and paragraphs_with_marginalia > 0:
                        # Prefer placing in first few paragraphs (better reading rhythm)
                        if i <= 2 or (i <= 3 and len(available_marginalia) > 0):
                            marg = available_marginalia[0]
                            marg_content = escape_simple(marg['content'])
                            latex += f"\n\\marginalia{{{escape_simple(marg['author'])}}}{{{escape_simple(marg['type'])} ({marg['year']})}}{{{marg_content}}}\n"
                            available_marginalia = available_marginalia[1:]
                            paragraphs_with_marginalia -= 1
                
                # Final paragraph (no marginalia per end-of-article rule)
                if len(paragraphs) > 1:
                    latex += "\n\n" + paragraphs[-1]
                
                # Add author signature at end of canonical text (Britannica-style)
                # After main text, before references/marginalia
                # Ensure signature doesn't orphan by keeping it with content
                # Author attribution is in a.{surname} format
                if entry.get('author'):
                    # Add small space before signature, but keep it with last paragraph
                    latex += "\n"  # Small break before signature
                    author_image = entry.get('author_image', '')
                    author_attribution = entry['author']  # Already in a.{surname} format
                    if author_image:
                        # Escape image path
                        image_path = escape_simple(author_image)
                        latex += f"\\authorsignature{{{escape_simple(author_attribution)}}}{{{image_path}}}\n"
                    else:
                        # No image, just attribution in a.{surname} format
                        latex += f"\\authorsignature{{{escape_simple(author_attribution)}}}{{}}\n"
            else:
                latex += canonical_latex
                # Add author signature even if single paragraph (in a.{surname} format)
                if entry.get('author'):
                    author_attribution = entry['author']  # Already in a.{surname} format
                    latex += f"\n\\authorsignature{{{escape_simple(author_attribution)}}}\n"
        else:
            # Placeholder - add note
            latex += "\\textit{[Canonical text to be generated]}\n\n"
            # Add author signature even if placeholder (in a.{surname} format)
            if entry.get('author'):
                author_image = entry.get('author_image', '')
                author_attribution = entry['author']  # Already in a.{surname} format
                if author_image:
                    image_path = escape_simple(author_image)
                    latex += f"\n\\authorsignature{{{escape_simple(author_attribution)}}}{{{image_path}}}\n"
                else:
                    latex += f"\n\\authorsignature{{{escape_simple(author_attribution)}}}{{}}\n"
        
        latex += "\n\\clearpage\n\n"
    
    latex += "\\end{document}\n"
    
    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(latex)
    
    print(f"✅ Converted {len(entries)} entries to LaTeX")

if __name__ == '__main__':
    if len(sys.argv) < 5 or len(sys.argv) > 6:
        print("Usage: python3 asciidoc-to-latex-converter-v3.py <input.adoc> <output.tex> <volume_num> <edition> [year]", file=sys.stderr)
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    volume_num = sys.argv[3]
    edition = sys.argv[4]
    year = sys.argv[5] if len(sys.argv) > 5 else "2026"
    
    convert_asciidoc_to_latex(input_file, output_file, volume_num, edition, year)
