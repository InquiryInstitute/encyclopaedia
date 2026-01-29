# AsciiDoc to LaTeX Converter for The Encyclopædia
# Maps AsciiDoc roles to LaTeX macros

require 'asciidoctor'

module Asciidoctor
  module Converter
    class EncyclopaediaLatexConverter < BaseConverter
      register_for 'latex'

      def convert_document(node)
        result = []
        result << "\\documentclass{encyclopaedia}"
        result << ""
        result << "\\title{#{node.doctitle || 'The Encyclopædia'}}"
        result << "\\author{The Inquiry Institute}"
        result << "\\date{#{node.attr('year', '2026')}}"
        result << ""
        result << "\\begin{document}"
        result << ""
        result << "\\maketitle"
        result << ""
        
        # Process content
        result << node.content
        
        result << ""
        result << "\\end{document}"
        result.join("\n")
      end

      def convert_section(node)
        title = node.title
        level = node.level
        
        case level
        when 1
          # Volume title - full width
          "\\twocolumn[\\chapter*{#{title}}]"
        when 2
          # Major section - full width
          "\\twocolumn[\\section*{#{title}}]"
        when 3
          # Entry title - full width
          "\\twocolumn[\\section*{#{title}}]"
        else
          # Subsections in two-column
          "\\subsection*{#{title}}\n#{node.content}"
        end
      end

      def convert_paragraph(node)
        # Check for canonical role
        if node.role == 'canonical'
          # Regular paragraph in two-column
          node.content
        else
          node.content
        end
      end

      def convert_open(node)
        # Handle [role=canonical] blocks
        if node.role == 'canonical'
          node.content
        elsif node.role == 'marginalia'
          # Extract marginalia attributes
          author = node.attr('author', 'Unknown')
          type = node.attr('type', 'note')
          year = node.attr('year', '')
          note_type = year ? "#{type} (#{year})" : type
          
          # Convert marginalia content
          content = node.content.strip
          
          "\\marginalia{#{author}}{#{note_type}}{#{content}}"
        else
          node.content
        end
      end

      def convert_listing(node)
        # Code blocks - keep simple for now
        "\\begin{verbatim}\n#{node.content}\\end{verbatim}"
      end

      def convert_quote(node)
        # Block quotes
        "\\begin{quote}\n#{node.content}\\end{quote}"
      end
    end
  end
end
