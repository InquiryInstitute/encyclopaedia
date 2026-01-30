#!/usr/bin/env tsx
/**
 * Generate missing Volume 1 entries using ask-faculty
 * 
 * Usage:
 *   npx tsx scripts/generate-volume-01-missing.ts
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

interface EntryInfo {
  file: string;
  entry: string;
  faculty: string;
  author: string;
  type: 'major' | 'standard' | 'boundary' | 'closing';
  topics?: string[];
}

const ENTRIES_TO_GENERATE: EntryInfo[] = [
  {
    file: 'editions/adult/volumes/volume-01-mind/entries/ignorance-mental.adoc',
    entry: 'Ignorance (Mental)',
    faculty: 'a.socrates',
    author: 'Socrates',
    type: 'closing',
    topics: [
      'The oracle and the examined life',
      'Knowing that one does not know',
      'Elenchus and the exposure of false knowledge',
      'Ignorance as the beginning of wisdom',
      'The gadfly and the unexamined life'
    ]
  },
  {
    file: 'editions/adult/volumes/volume-01-mind/entries/animal-mind.adoc',
    entry: 'Animal Mind',
    faculty: 'a.darwin',
    author: 'Charles Darwin',
    type: 'boundary',
    topics: [
      'Continuity between human and animal cognition',
      'Comparative psychology and ethology',
      'Instinct vs. intelligence in animals',
      'Tool use, communication, and social behavior',
      'The question of animal consciousness'
    ]
  },
  {
    file: 'editions/adult/volumes/volume-01-mind/entries/artificial-mind.adoc',
    entry: 'Artificial Mind',
    faculty: 'a.turing',
    author: 'Alan Turing',
    type: 'boundary',
    topics: [
      'The Turing Test and machine intelligence',
      'Computational theory of mind',
      'Can machines think?',
      'Symbolic vs. connectionist approaches',
      'The Chinese Room argument and responses',
      'Consciousness in artificial systems'
    ]
  },
  {
    file: 'editions/adult/volumes/volume-01-mind/entries/collective-mind.adoc',
    entry: 'Collective Mind',
    faculty: 'a.durkheim',
    author: 'Émile Durkheim',
    type: 'boundary',
    topics: [
      'Collective representations and social facts',
      'The mind as a social phenomenon',
      'Distributed cognition and group intelligence',
      'Collective consciousness vs. individual consciousness',
      'The emergence of shared mental states'
    ]
  }
];

/**
 * Call ask-faculty edge function
 */
async function askFaculty(facultyId: string, message: string): Promise<string> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/ask-faculty`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'apikey': SUPABASE_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      faculty_id: facultyId,
      message,
      context: 'lecture',
      use_rag: true,
      use_commonplace: true,
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ask-faculty error: ${error}`);
  }

  const result = await response.json();
  return result.response || '';
}

/**
 * Build the prompt for generating an encyclopaedia entry
 */
function buildEntryPrompt(entry: EntryInfo): string {
  let prompt = `You are writing an encyclopaedia entry on "${entry.entry}" for The Encyclopædia published by the Inquiry Institute.

This is for the ADULT EDITION. Follow the Inquiry-First Encyclopædia Article Template:

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

Entry type: ${entry.type.toUpperCase()}
Word target: ${entry.type === 'closing' ? '1000–2000' : entry.type === 'boundary' ? '3000–4000' : '2000–3000'}

`;

  if (entry.topics && entry.topics.length > 0) {
    prompt += `Topics to cover:
${entry.topics.map(t => `- ${t}`).join('\n')}

`;
  }

  prompt += `Write the complete canonical text for this entry following the Inquiry-First template above.
Output ONLY the body content (no metadata, no AsciiDoc formatting, no marginalia).
The text should be ready to be placed inside the [role=canonical] block.
Use markdown formatting for structure (## for section headers, **bold** for emphasis, etc.).`;

  return prompt;
}

/**
 * Update an entry file with generated content
 */
function updateEntryFile(filePath: string, content: string): void {
  const fullPath = path.join(__dirname, '..', filePath);
  let fileContent = fs.readFileSync(fullPath, 'utf-8');
  
  // Replace placeholder content in [role=canonical] block
  const placeholderPattern = /\[role=canonical\]\n====\n(\[CANONICAL TEXT TO BE GENERATED\]|.*?This entry will explore.*?|.*?Topics to cover:.*?)\n====/s;
  
  const newBlock = `[role=canonical]
====
${content}
====`;
  
  if (placeholderPattern.test(fileContent)) {
    fileContent = fileContent.replace(placeholderPattern, newBlock);
  } else {
    // Try to find any [role=canonical] block and replace its content
    const anyCanonicalPattern = /(\[role=canonical\]\n====\n)(.*?)(\n====)/s;
    if (anyCanonicalPattern.test(fileContent)) {
      fileContent = fileContent.replace(anyCanonicalPattern, `$1${content}$3`);
    } else {
      console.warn('⚠️  Could not find canonical block pattern in file');
      return;
    }
  }
  
  fs.writeFileSync(fullPath, fileContent, 'utf-8');
  console.log(`✅ Updated: ${filePath}`);
}

/**
 * Main function
 */
async function main() {
  console.log(`📚 Generating ${ENTRIES_TO_GENERATE.length} missing Volume 1 entries...\n`);
  
  for (const entry of ENTRIES_TO_GENERATE) {
    try {
      console.log(`\n🎭 Generating: ${entry.entry}`);
      console.log(`   Faculty: ${entry.faculty} (${entry.author})`);
      console.log(`   Type: ${entry.type}`);
      
      const prompt = buildEntryPrompt(entry);
      const content = await askFaculty(entry.faculty, prompt);
      
      if (!content || content.trim().length < 100) {
        console.warn(`⚠️  Generated content seems too short, skipping...`);
        continue;
      }
      
      updateEntryFile(entry.file, content.trim());
      console.log(`   ✅ Generated ${content.split(/\s+/).length} words`);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Error generating ${entry.entry}:`, error);
      continue;
    }
  }
  
  console.log(`\n✅ Completed generating Volume 1 entries`);
}

main().catch(console.error);
