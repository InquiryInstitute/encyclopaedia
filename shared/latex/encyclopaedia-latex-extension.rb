# AsciiDoctor Extension for Encyclopædia LaTeX Output
# Handles canonical text and marginalia conversion

require 'asciidoctor/extensions'

Asciidoctor::Extensions.register do
  treeprocessor do
    process do |document|
      # This will be called during document processing
      # We'll handle marginalia conversion here
      document
    end
  end

  block_macro do
    named :marginalia
    process do |parent, target, attrs|
      author = attrs['author'] || 'Unknown'
      type = attrs['type'] || 'note'
      year = attrs['year'] || ''
      content = attrs['content'] || ''
      
      note_type = year.empty? ? type : "#{type} (#{year})"
      
      # Return LaTeX command
      %(\\marginalia{#{author}}{#{note_type}}{#{content}})
    end
  end
end
