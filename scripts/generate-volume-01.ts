#!/usr/bin/env tsx
/**
 * Generate all Volume I (Mind) entries using ask-faculty
 * 
 * This script processes all entries in Volume I and generates
 * canonical content for both Adult and Children's editions.
 * 
 * Usage:
 *   tsx scripts/generate-volume-01.ts [--edition adult|children] [--entry attention]
 * 
 * If no arguments, generates all entries for both editions.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_KEY must be set');
  process.exit(1);
}

interface EntryMetadata {
  slug: string;
  title: string;
  facultyId: string;
  author: string;
  type: 'major' | 'standard' | 'boundary' | 'closing';
  wordTarget: string;
  topics: string[];
  filePath: string;
}

/**
 * Parse entry metadata from AsciiDoc file
 */
function parseEntryFile(filePath: string, edition: 'adult' | 'children'): EntryMetadata | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const slug = path.basename(filePath, '.adoc');
  
  // Extract metadata
  const titleMatch = content.match(/^=== (.+)$/m);
  const facultyMatch = content.match(/:faculty-id:\s*(.+)/);
  const authorMatch = content.match(/:canonical-author:\s*(.+)/);
  const typeMatch = content.match(/:entry-type:\s*(.+)/);
  const wordTargetMatch = content.match(/:word-target:\s*(.+)/);
  
  // Extract topics from the placeholder section
  const topicsMatch = content.match(/Topics to cover:\n([\s\S]*?)(?====|\[role=)/);
  const topics: string[] = [];
  if (topicsMatch) {
    topicsMatch[1].split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('-')) {
        topics.push(trimmed.replace(/^-\s*/, '').trim());
      }
    });
  }
  
  // Determine word target based on type and edition
  const entryType = (typeMatch?.[1]?.trim() || 'standard') as 'major' | 'standard' | 'boundary' | 'closing';
  const wordTarget = wordTargetMatch?.[1]?.trim() || getWordTarget(entryType, edition === 'children');
  
  return {
    slug,
    title: titleMatch?.[1] || slug,
    facultyId: facultyMatch?.[1]?.trim() || '',
    author: authorMatch?.[1]?.trim() || '',
    type: entryType,
    wordTarget,
    topics,
    filePath,
  };
}

/**
 * Get word target based on entry type and edition
 */
function getWordTarget(entryType: string, isChildren: boolean): string {
  if (isChildren) {
    switch (entryType) {
      case 'major': return '750-1500';
      case 'standard': return '500-1000';
      case 'boundary': return '750-1250';
      case 'closing': return '250-500';
      default: return '500-1000';
    }
  } else {
    switch (entryType) {
      case 'major': return '4000-6000';
      case 'standard': return '2000-3000';
      case 'boundary': return '3000-4000';
      case 'closing': return '1000-2000';
      default: return '2000-3000';
    }
  }
}

/**
 * Generate entry content using ask-faculty
 */
async function generateEntryContent(metadata: EntryMetadata, edition: 'adult' | 'children'): Promise<string> {
  console.log(`\n🎭 Generating ${edition} entry: ${metadata.title}`);
  console.log(`   Faculty: ${metadata.facultyId} (${metadata.author})`);
  console.log(`   Type: ${metadata.type}`);
  console.log(`   Target: ${metadata.wordTarget} words`);
  
  const isChildren = edition === 'children';
  
  // Build the prompt
  let prompt = `You are writing an encyclopaedia entry on "${metadata.title}" for The Encyclopædia published by the Inquiry Institute.

`;

  if (isChildren) {
    prompt += `This is for the CHILDREN'S EDITION. Guidelines:
- Use shorter sentences (8-15 words typically)
- Provide concrete examples before abstract concepts
- Make transitions explicit ("First... then... but...")
- Address the reader directly ("You can notice...")
- End with an open question, not a definitive answer
- Do NOT simplify the ideas—preserve their depth and sophistication
- Do NOT use "fun facts" or condescending language

`;
  } else {
    prompt += `This is for the ADULT EDITION. Guidelines:
- Write in your authentic scholarly voice
- Use precise, technical language appropriate to the subject
- Present arguments with rigor and clarity
- Include citations in [Author, Year] format where relevant
- Balance depth with accessibility

`;
  }

  prompt += `Entry type: ${metadata.type.toUpperCase()}
Word target: ${metadata.wordTarget} words

`;

  if (metadata.topics.length > 0) {
    prompt += `Topics to cover:
${metadata.topics.map(t => `- ${t}`).join('\n')}

`;
  }

  prompt += `Write the complete canonical text for this entry. 
Output ONLY the body content (no metadata, no AsciiDoc formatting, no marginalia).
The text should be ready to be placed inside the [role=canonical] block.`;

  // Call ask-faculty edge function
  const endpoint = `${SUPABASE_URL}/functions/v1/ask-faculty`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'apikey': SUPABASE_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      faculty_id: metadata.facultyId,
      message: prompt,
      context: 'lecture', // Use lecture mode for authoritative voice
      use_rag: true,
      use_commonplace: true,
      temperature: 0.7,
      max_tokens: getMaxTokens(metadata.type),
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ask-faculty error (${response.status}): ${error}`);
  }
  
  const result = await response.json();
  return result.response || '';
}

/**
 * Get max tokens based on entry type
 */
function getMaxTokens(entryType: string): number {
  switch (entryType) {
    case 'major': return 8000;
    case 'standard': return 4000;
    case 'boundary': return 6000;
    case 'closing': return 2000;
    default: return 4000;
  }
}

/**
 * Update entry file with generated content
 */
function updateEntryFile(filePath: string, content: string): void {
  let fileContent = fs.readFileSync(filePath, 'utf-8');
  
  // Replace placeholder content in [role=canonical] block
  const placeholderPattern = /\[role=canonical\]\n====\n\[CANONICAL TEXT TO BE GENERATED\][\s\S]*?====/;
  
  const newBlock = `[role=canonical]
====
${content.trim()}
====`;
  
  if (placeholderPattern.test(fileContent)) {
    fileContent = fileContent.replace(placeholderPattern, newBlock);
    fs.writeFileSync(filePath, fileContent, 'utf-8');
    console.log(`✅ Updated: ${filePath}`);
  } else {
    // Try to replace any [role=canonical] block that contains placeholder text
    const anyCanonicalPattern = /\[role=canonical\]\n====[\s\S]*?====/;
    if (anyCanonicalPattern.test(fileContent)) {
      fileContent = fileContent.replace(anyCanonicalPattern, newBlock);
      fs.writeFileSync(filePath, fileContent, 'utf-8');
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.warn(`⚠️  Could not find canonical block in: ${filePath}`);
    }
  }
}

/**
 * Get all entry files for a volume
 */
function getEntryFiles(edition: 'adult' | 'children', volumeNum: number): string[] {
  const volNum = String(volumeNum).padStart(2, '0');
  const entriesDir = path.join(
    __dirname,
    '..',
    'editions',
    edition,
    'volumes',
    `volume-${volNum}-mind`,
    'entries'
  );
  
  if (!fs.existsSync(entriesDir)) {
    return [];
  }
  
  return fs.readdirSync(entriesDir)
    .filter(file => file.endsWith('.adoc'))
    .map(file => path.join(entriesDir, file));
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  let targetEdition: 'adult' | 'children' | 'both' = 'both';
  let targetEntry: string | null = null;
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, '');
    const value = args[i + 1];
    
    if (key === 'edition' && (value === 'adult' || value === 'children')) {
      targetEdition = value;
    } else if (key === 'entry') {
      targetEntry = value;
    }
  }
  
  const editions: ('adult' | 'children')[] = targetEdition === 'both' ? ['adult', 'children'] : [targetEdition];
  const volumeNum = 1;
  
  console.log('📚 Generating Volume I (Mind) entries');
  console.log(`   Editions: ${editions.join(', ')}`);
  if (targetEntry) {
    console.log(`   Entry: ${targetEntry}`);
  }
  console.log('');
  
  for (const edition of editions) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${edition.toUpperCase()} EDITION`);
    console.log('='.repeat(60));
    
    const entryFiles = getEntryFiles(edition, volumeNum);
    
    if (entryFiles.length === 0) {
      console.log(`⚠️  No entry files found for ${edition} edition`);
      continue;
    }
    
    // Filter to specific entry if requested
    const filesToProcess = targetEntry
      ? entryFiles.filter(f => path.basename(f, '.adoc') === targetEntry)
      : entryFiles;
    
    if (filesToProcess.length === 0) {
      console.log(`⚠️  No matching entry found: ${targetEntry}`);
      continue;
    }
    
    // Process each entry
    for (const filePath of filesToProcess) {
      const metadata = parseEntryFile(filePath, edition);
      
      if (!metadata) {
        console.warn(`⚠️  Could not parse: ${filePath}`);
        continue;
      }
      
      if (!metadata.facultyId) {
        console.warn(`⚠️  No faculty-id found in: ${filePath}`);
        continue;
      }
      
      try {
        // Generate content
        const content = await generateEntryContent(metadata, edition);
        
        const wordCount = content.split(/\s+/).length;
        console.log(`   ✅ Generated ${wordCount} words`);
        
        // Update file
        updateEntryFile(filePath, content);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`   ❌ Error generating ${metadata.title}:`, error instanceof Error ? error.message : error);
        // Continue with next entry
      }
    }
  }
  
  console.log('\n🎉 Done!');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
