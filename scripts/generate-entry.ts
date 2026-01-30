#!/usr/bin/env tsx
/**
 * Generate Encyclopædia Entries using ask-faculty
 * 
 * This script calls the ask-faculty edge function to generate
 * canonical article content for encyclopaedia entries.
 * 
 * Usage:
 *   tsx scripts/generate-entry.ts \
 *     --entry "attention" \
 *     --faculty "a.james" \
 *     --edition "adult" \
 *     --volume 1 \
 *     --type "major"
 * 
 * Or generate from outline:
 *   tsx scripts/generate-entry.ts --from-outline editions/adult/volumes/volume-01-mind/volume.adoc
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

interface EntryConfig {
  entry: string;          // Entry slug (e.g., "attention")
  faculty: string;        // Faculty ID (e.g., "a.james")
  edition: 'adult' | 'children';
  volume: number;
  entryType: 'major' | 'standard' | 'boundary' | 'closing';
  topics?: string[];      // Topics to cover
  wordTarget?: string;    // e.g., "4000-6000"
}

interface OutlineEntry {
  slug: string;
  title: string;
  faculty: string;
  type: string;
  lengthTarget: string;
}

/**
 * Parse entry metadata from an AsciiDoc entry stub file
 */
function parseEntryStub(filePath: string): EntryConfig | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract metadata from AsciiDoc attributes
  const facultyMatch = content.match(/:faculty-id:\s*(.+)/);
  const typeMatch = content.match(/:entry-type:\s*(.+)/);
  const wordTargetMatch = content.match(/:word-target:\s*(.+)/);
  const topicsMatch = content.match(/Topics to cover:\n([\s\S]*?)(?=====|\n\n\[role=)/);
  
  const slug = path.basename(filePath, '.adoc');
  
  return {
    entry: slug,
    faculty: facultyMatch?.[1]?.trim() || '',
    edition: filePath.includes('/adult/') ? 'adult' : 'children',
    volume: 1, // TODO: Extract from path
    entryType: (typeMatch?.[1]?.trim() || 'standard') as any,
    topics: topicsMatch?.[1]?.split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim()),
    wordTarget: wordTargetMatch?.[1]?.trim(),
  };
}

/**
 * Generate entry content using ask-faculty
 */
async function generateEntryContent(config: EntryConfig): Promise<string> {
  console.log(`🎭 Generating ${config.edition} entry: ${config.entry}`);
  console.log(`   Faculty: ${config.faculty}`);
  console.log(`   Type: ${config.entryType}`);
  
  // Build the prompt for the faculty
  const prompt = buildEntryPrompt(config);
  
  // Call ask-faculty edge function
  const response = await fetch(`${SUPABASE_URL}/functions/v1/ask-faculty`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'apikey': SUPABASE_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      faculty_id: config.faculty,
      message: prompt,
      context: 'lecture', // Use lecture mode for authoritative voice
      use_rag: true,
      use_commonplace: true,
      temperature: 0.7,
      max_tokens: getMaxTokens(config.entryType),
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ask-faculty error: ${error}`);
  }
  
  const result = await response.json();
  return result.response;
}

/**
 * Build the prompt for generating an encyclopaedia entry
 */
function buildEntryPrompt(config: EntryConfig): string {
  const isChildren = config.edition === 'children';
  
  let prompt = `You are writing an encyclopaedia entry on "${config.entry}" for The Encyclopædia published by the Inquiry Institute.

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
    prompt += `This is for the ADULT EDITION. Follow the Inquiry-First Encyclopædia Article Template:

I. THE QUESTION THAT OPENS THIS ARTICLE
Begin with one carefully chosen, generative question—the question that makes the article necessary. This question should not be fully answerable. It should orient the reader toward wonder, not mastery. Ideally, it should feel slightly uncomfortable.

II. WHAT IS COMMONLY SAID
Briefly summarize the prevailing or conventional account of the topic. What do textbooks, popular explanations, or authorities usually claim? What definitions or frameworks are most widely accepted? What assumptions are typically left unstated? Be neutral, concise, and non-dogmatic.

III. QUESTIONS BENEATH THE ANSWER
Expose the assumptions hiding inside the common account. What must be true for this explanation to hold? What does this view emphasize—and what does it ignore? Who benefits from framing the topic this way? When did this understanding emerge, and why then? This section should multiply questions, not resolve them.

IV. COMPETING WAYS OF SEEING
Present 2–4 alternative interpretations, traditions, or frameworks, each introduced as a question. How does this topic appear from different perspectives? How is it understood differently across cultures or disciplines? What happens if we reverse a core assumption? Do not declare a winner. Let tension remain visible. Contradiction is a feature, not a flaw.

V. WHAT REMAINS UNANSWERED
Name what is not known, unresolved, or actively debated. This may include open scientific problems, philosophical disagreements, ethical ambiguities, missing voices or perspectives, or questions we lack the tools to ask properly (yet). This section signals that knowledge is alive, not complete.

VI. QUESTIONS FOR THE READER
Invite the reader into the inquiry directly. Which explanation feels most convincing to you, and why? What assumptions do you bring to this topic? What experience in your own life complicates what you've read? What question would you add to this article?

VII. PATHS FOR FURTHER INQUIRY
Instead of a bibliography, offer directions of exploration. "To pursue this question historically, see..." "To approach this scientifically, investigate..." "To challenge this framing, compare it with..." "To deepen this inquiry, ask..." You may optionally include references, but framed as tools, not authorities.

GUIDING PRINCIPLE: An encyclopædia should not be the place where questions go to die. It should be the place where better questions are learned.

Write in your authentic scholarly voice. Use precise, technical language appropriate to the subject. Present arguments with rigor and clarity. Include citations in [Author, Year] format where relevant. Balance depth with accessibility.

`;
  }

  prompt += `Entry type: ${config.entryType.toUpperCase()}
Word target: ${config.wordTarget || getWordTarget(config.entryType, isChildren)}

`;

  if (config.topics && config.topics.length > 0) {
    prompt += `Topics to cover:
${config.topics.map(t => `- ${t}`).join('\n')}

`;
  }

  prompt += `Write the complete canonical text for this entry following the Inquiry-First template above.
Output ONLY the body content (no metadata, no AsciiDoc formatting, no marginalia).
The text should be ready to be placed inside the [role=canonical] block.
Use markdown formatting for structure (## for section headers, **bold** for emphasis, etc.).`;

  return prompt;
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
 * Update an entry file with generated content
 */
function updateEntryFile(filePath: string, content: string): void {
  let fileContent = fs.readFileSync(filePath, 'utf-8');
  
  // Replace the placeholder content in [role=canonical] block
  const placeholderPattern = /\[role=canonical\]\n====\n\[CANONICAL TEXT TO BE GENERATED\][\s\S]*?====/;
  
  const newBlock = `[role=canonical]
====
${content}
====`;
  
  if (placeholderPattern.test(fileContent)) {
    fileContent = fileContent.replace(placeholderPattern, newBlock);
  } else {
    console.warn('⚠️ Could not find placeholder pattern in file');
    // Try to replace any [role=canonical] block
    const anyCanonicalPattern = /\[role=canonical\]\n====[\s\S]*?====/;
    fileContent = fileContent.replace(anyCanonicalPattern, newBlock);
  }
  
  fs.writeFileSync(filePath, fileContent, 'utf-8');
  console.log(`✅ Updated: ${filePath}`);
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Check for --from-outline mode
  const fromOutlineIdx = args.indexOf('--from-outline');
  if (fromOutlineIdx !== -1) {
    const outlinePath = args[fromOutlineIdx + 1];
    console.log(`📖 Processing outline: ${outlinePath}`);
    // TODO: Parse volume.adoc and generate all entries
    console.log('❌ --from-outline mode not yet implemented');
    process.exit(1);
  }
  
  // Parse individual entry arguments
  const params: Partial<EntryConfig> = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, '');
    const value = args[i + 1];
    
    if (!key || !value) continue;
    
    switch (key) {
      case 'entry':
        params.entry = value;
        break;
      case 'faculty':
        params.faculty = value;
        break;
      case 'edition':
        params.edition = value as 'adult' | 'children';
        break;
      case 'volume':
        params.volume = parseInt(value);
        break;
      case 'type':
        params.entryType = value as any;
        break;
    }
  }
  
  // Validate required params
  if (!params.entry || !params.faculty) {
    console.error('❌ Error: --entry and --faculty are required');
    console.error('');
    console.error('Usage:');
    console.error('  tsx scripts/generate-entry.ts \\');
    console.error('    --entry "attention" \\');
    console.error('    --faculty "a.james" \\');
    console.error('    --edition "adult" \\');
    console.error('    --volume 1 \\');
    console.error('    --type "major"');
    process.exit(1);
  }
  
  // Set defaults
  const config: EntryConfig = {
    entry: params.entry,
    faculty: params.faculty,
    edition: params.edition || 'adult',
    volume: params.volume || 1,
    entryType: params.entryType || 'standard',
  };
  
  // Determine file path
  const volNum = String(config.volume).padStart(2, '0');
  const entryPath = path.join(
    __dirname,
    '..',
    'editions',
    config.edition,
    'volumes',
    `volume-${volNum}-mind`, // TODO: Map volume number to name
    'entries',
    `${config.entry}.adoc`
  );
  
  // Load existing entry metadata if available
  const existingConfig = parseEntryStub(entryPath);
  if (existingConfig) {
    config.topics = existingConfig.topics;
    config.wordTarget = existingConfig.wordTarget;
    if (!params.entryType) {
      config.entryType = existingConfig.entryType;
    }
  }
  
  try {
    // Generate content
    const content = await generateEntryContent(config);
    
    console.log(`\n📝 Generated ${content.split(/\s+/).length} words\n`);
    
    // Update file if it exists
    if (fs.existsSync(entryPath)) {
      updateEntryFile(entryPath, content);
    } else {
      // Output to console
      console.log('--- Generated Content ---');
      console.log(content);
      console.log('--- End Content ---');
    }
    
    console.log('\n🎉 Done!');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
