#!/usr/bin/env ruby
# AsciiDoc to LaTeX Converter for The Encyclopædia
# Handles canonical text and marginalia roles

require 'asciidoctor'
require 'fileutils'

if ARGV.length < 2
  puts "Usage: #{$0} <input.adoc> <output.tex>"
  exit 1
end

input_file = ARGV[0]
output_file = ARGV[1]

# Read AsciiDoc file
doc = Asciidoctor.load_file input_file, safe: :unsafe, backend: 'latex'

# Convert to LaTeX
latex_content = doc.convert

# Post-process to handle marginalia and canonical blocks
# This is a simplified approach - we'll enhance it

# Write output
File.write(output_file, latex_content)

puts "✅ Converted #{input_file} to #{output_file}"
