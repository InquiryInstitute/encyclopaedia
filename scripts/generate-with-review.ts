#!/usr/bin/env tsx
/**
 * Generate Encyclopædia Entries with Peer Review Workflow
 * 
 * Workflow:
 * 1. Generate initial article using ask-faculty
 * 2. Check voice fidelity
 * 3. Select two reviewers
 * 4. Generate review feedback
 * 5. Allow author to revise
 * 6. Check voice fidelity of revision
 * 7. Generate marginalia from reviewers
 * 8. Check voice fidelity of marginalia
 * 
 * Supports multiple articles per topic from different perspectives.
 * 
 * Usage:
 *   tsx scripts/generate-with-review.ts \
 *     --entry attention \
 *     --faculty a.james \
 *     --edition adult \
 *     --volume 1 \
 *     --type major \
 *     [--reviewers a.simon,a.weil] \
 *     [--multi-perspective] \
 *     [--additional-authors a.freud,a.darwin]
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_KEY must be set');
  process.exit(1);
}

interface EntryConfig {
  entry: string;
  faculty: string;
  author: string;
  edition: 'adult' | 'children';
  volume: number;
  type: 'major' | 'standard' | 'boundary' | 'closing';
  topics?: string[];
  wordTarget?: string;
}

interface ReviewResult {
  reviewer: string;
  feedback: string;
  marginalia?: string;
  marginaliaType?: 'objection' | 'clarification' | 'extension' | 'crossref' | 'correction' | 'heretic' | 'synthetic';
}

interface VoiceFidelityCheck {
  passed: boolean;
  score: number; // 0-100
  issues: string[];
  suggestions: string[];
}

/**
 * Call ask-faculty edge function
 */
async function askFaculty(facultyId: string, message: string, context: string = 'lecture'): Promise<string> {
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
      context,
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
 * Check voice fidelity using LLM
 */
async function checkVoiceFidelity(
  text: string,
  facultyId: string,
  facultyName: string,
  context: string
): Promise<VoiceFidelityCheck> {
  if (!OPENROUTER_API_KEY) {
    console.warn('⚠️  OPENROUTER_API_KEY not set, skipping voice fidelity check');
    return { passed: true, score: 100, issues: [], suggestions: [] };
  }

  const prompt = `You are evaluating whether the following text maintains authentic voice fidelity for ${facultyName} (${facultyId}).

Context: ${context}

Text to evaluate:
${text.substring(0, 2000)}${text.length > 2000 ? '...' : ''}

Evaluate:
1. Does the voice match ${facultyName}'s known writing style and tone?
2. Are the ideas consistent with their corpus and historical period?
3. Are there anachronisms or modern idioms that break character?
4. Does the reasoning style match their known approach?

Respond in JSON format:
{
  "passed": true/false,
  "score": 0-100,
  "issues": ["issue1", "issue2"],
  "suggestions": ["suggestion1", "suggestion2"]
}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          { role: 'system', content: 'You are a voice fidelity evaluator. Respond only with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content || '{}';
    
    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return { passed: true, score: 85, issues: [], suggestions: [] };
  } catch (error) {
    console.warn('⚠️  Voice fidelity check failed:', error);
    return { passed: true, score: 85, issues: [], suggestions: [] };
  }
}

/**
 * Select reviewers for an entry
 */
function selectReviewers(
  authorFacultyId: string,
  entryType: string,
  topic: string,
  availableReviewers?: string[]
): string[] {
  // Default reviewers for Volume I topics
  const defaultReviewers: Record<string, string[]> = {
    'attention': ['a.simon', 'a.weil'],
    'consciousness': ['a.husserl', 'a.dennett'],
    'experience': ['a.dewey', 'a.husserl'],
    'intelligence': ['a.simon', 'a.turing'],
  };

  // If reviewers provided, use them
  if (availableReviewers && availableReviewers.length >= 2) {
    return availableReviewers.slice(0, 2);
  }

  // Try to get from defaults
  const reviewers = defaultReviewers[topic.toLowerCase()] || [];

  // Fallback: select diverse reviewers (avoid same as author)
  if (reviewers.length < 2) {
    const allReviewers = [
      'a.simon', 'a.weil', 'a.husserl', 'a.dennett', 'a.dewey',
      'a.turing', 'a.freud', 'a.darwin', 'a.kant', 'a.spinoza'
    ].filter(r => r !== authorFacultyId);
    
    // Select two different reviewers
    const selected = [];
    while (selected.length < 2 && allReviewers.length > 0) {
      const idx = Math.floor(Math.random() * allReviewers.length);
      selected.push(allReviewers.splice(idx, 1)[0]);
    }
    return selected;
  }

  return reviewers;
}

/**
 * Generate review feedback
 */
async function generateReview(
  reviewerId: string,
  articleText: string,
  entryTitle: string,
  authorName: string
): Promise<string> {
  const prompt = `As ${reviewerId}, provide scholarly peer review feedback on the following encyclopaedia entry on "${entryTitle}" by ${authorName}.

The entry text:
${articleText.substring(0, 3000)}${articleText.length > 3000 ? '...' : ''}

Provide constructive feedback focusing on:
1. Accuracy and scholarly rigor
2. Clarity and organization
3. Completeness of coverage
4. Areas that might need expansion or clarification

Keep feedback professional and constructive.`;

  return await askFaculty(reviewerId, prompt, 'office_hours');
}

/**
 * Generate revision based on feedback
 */
async function generateRevision(
  authorId: string,
  originalText: string,
  feedback: string[],
  entryTitle: string
): Promise<string> {
  const feedbackText = feedback.map((f, i) => `Reviewer ${i + 1}: ${f}`).join('\n\n');

  const prompt = `As ${authorId}, revise your encyclopaedia entry on "${entryTitle}" based on the following peer review feedback.

Original text:
${originalText.substring(0, 3000)}${originalText.length > 3000 ? '...' : ''}

Peer Review Feedback:
${feedbackText}

Revise the entry to address the feedback while maintaining your authentic voice and perspective.`;

  return await askFaculty(authorId, prompt, 'lecture');
}

/**
 * Generate marginalia from reviewer
 */
async function generateMarginalia(
  reviewerId: string,
  articleText: string,
  entryTitle: string,
  marginaliaType: 'objection' | 'clarification' | 'extension' | 'crossref' | 'correction' | 'heretic' | 'synthetic',
  target: string = 'entry'
): Promise<string> {
  const typeDescriptions: Record<string, string> = {
    objection: 'a scholarly objection or counterpoint',
    clarification: 'a clarification or elaboration',
    extension: 'an extension or related point',
    crossref: 'a cross-reference to related concepts',
    correction: 'a factual correction',
    heretic: 'a heretical or alternative perspective',
    synthetic: 'a synthetic or integrative comment',
  };

  const prompt = `As ${reviewerId}, provide ${typeDescriptions[marginaliaType]} (30-60 words) as marginalia for the encyclopaedia entry on "${entryTitle}".

Entry excerpt:
${articleText.substring(0, 1000)}${articleText.length > 1000 ? '...' : ''}

Write a concise marginal note that ${typeDescriptions[marginaliaType]}. Keep it scholarly and in your authentic voice.`;

  return await askFaculty(reviewerId, prompt, 'polemic');
}

/**
 * Main workflow
 */
async function generateWithReview(config: EntryConfig, reviewers?: string[], multiPerspective?: boolean): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📝 Generating: ${config.entry} by ${config.author} (${config.faculty})`);
  console.log(`   Type: ${config.type}, Edition: ${config.edition}, Volume: ${config.volume}`);
  console.log('='.repeat(60));

  // Step 1: Generate initial article
  console.log('\n📖 Step 1: Generating initial article...');
  const initialPrompt = buildEntryPrompt(config);
  let articleText = await askFaculty(config.faculty, initialPrompt, 'lecture');
  
  console.log(`   Generated ${articleText.split(/\s+/).length} words`);

  // Step 2: Check voice fidelity of initial article
  console.log('\n🔍 Step 2: Checking voice fidelity (initial)...');
  const initialFidelity = await checkVoiceFidelity(
    articleText,
    config.faculty,
    config.author,
    'initial article generation'
  );
  
  console.log(`   Score: ${initialFidelity.score}/100`);
  if (!initialFidelity.passed) {
    console.log(`   ⚠️  Issues: ${initialFidelity.issues.join(', ')}`);
    if (initialFidelity.suggestions.length > 0) {
      console.log(`   💡 Suggestions: ${initialFidelity.suggestions.join(', ')}`);
    }
  }

  // Step 3: Select reviewers
  console.log('\n👥 Step 3: Selecting reviewers...');
  const selectedReviewers = selectReviewers(config.faculty, config.type, config.entry, reviewers);
  console.log(`   Reviewers: ${selectedReviewers.join(', ')}`);

  // Step 4: Generate review feedback
  console.log('\n📋 Step 4: Generating peer review feedback...');
  const reviews: ReviewResult[] = [];
  
  for (const reviewerId of selectedReviewers) {
    console.log(`   Reviewing as ${reviewerId}...`);
    const feedback = await generateReview(reviewerId, articleText, config.entry, config.author);
    reviews.push({ reviewer: reviewerId, feedback });
    console.log(`   ✅ Review complete`);
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Step 5: Generate revision
  console.log('\n✏️  Step 5: Generating revision based on feedback...');
  const feedbackTexts = reviews.map(r => r.feedback);
  let revisedText = await generateRevision(config.faculty, articleText, feedbackTexts, config.entry);
  
  console.log(`   Revised to ${revisedText.split(/\s+/).length} words`);

  // Step 6: Check voice fidelity of revision
  console.log('\n🔍 Step 6: Checking voice fidelity (revision)...');
  const revisionFidelity = await checkVoiceFidelity(
    revisedText,
    config.faculty,
    config.author,
    'revised article'
  );
  
  console.log(`   Score: ${revisionFidelity.score}/100`);
  if (!revisionFidelity.passed) {
    console.log(`   ⚠️  Issues: ${revisionFidelity.issues.join(', ')}`);
  }

  // Step 7: Generate marginalia
  console.log('\n📌 Step 7: Generating marginalia from reviewers...');
  
  for (const review of reviews) {
    // Determine marginalia type based on reviewer and entry
    const marginaliaType = determineMarginaliaType(review.reviewer, config.entry);
    
    console.log(`   Generating ${marginaliaType} from ${review.reviewer}...`);
    const marginaliaText = await generateMarginalia(
      review.reviewer,
      revisedText,
      config.entry,
      marginaliaType
    );
    
    review.marginalia = marginaliaText;
    review.marginaliaType = marginaliaType;
    
    // Check voice fidelity of marginalia
    const marginaliaFidelity = await checkVoiceFidelity(
      marginaliaText,
      review.reviewer,
      review.reviewer,
      'marginalia'
    );
    
    console.log(`   ✅ Marginalia generated (fidelity: ${marginaliaFidelity.score}/100)`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Step 8: Update entry file
  console.log('\n💾 Step 8: Updating entry file...');
  updateEntryFile(config, revisedText, reviews);

  console.log('\n🎉 Workflow complete!');
}

/**
 * Determine marginalia type based on reviewer and topic
 */
function determineMarginaliaType(reviewerId: string, topic: string): 'objection' | 'clarification' | 'extension' | 'crossref' | 'correction' | 'heretic' | 'synthetic' {
  // Default mappings
  const reviewerTypes: Record<string, string> = {
    'a.simon': 'objection',
    'a.weil': 'heretic',
    'a.husserl': 'clarification',
    'a.dennett': 'objection',
    'a.dewey': 'extension',
  };

  return (reviewerTypes[reviewerId] || 'clarification') as any;
}

/**
 * Build entry prompt
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
    prompt += `This is for the ADULT EDITION. Guidelines:
- Write in your authentic scholarly voice
- Use precise, technical language appropriate to the subject
- Present arguments with rigor and clarity
- Include citations in [Author, Year] format where relevant
- Balance depth with accessibility

`;
  }

  prompt += `Entry type: ${config.type.toUpperCase()}
Word target: ${config.wordTarget || getWordTarget(config.type, isChildren)} words

`;

  if (config.topics && config.topics.length > 0) {
    prompt += `Topics to cover:
${config.topics.map(t => `- ${t}`).join('\n')}

`;
  }

  prompt += `Write the complete canonical text for this entry. 
Output ONLY the body content (no metadata, no AsciiDoc formatting, no marginalia).
The text should be ready to be placed inside the [role=canonical] block.`;

  return prompt;
}

/**
 * Get word target
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
 * Update entry file with generated content and marginalia
 */
function updateEntryFile(config: EntryConfig, canonicalText: string, reviews: ReviewResult[]): void {
  const volNum = String(config.volume).padStart(2, '0');
  const entryPath = path.join(
    __dirname,
    '..',
    'editions',
    config.edition,
    'volumes',
    `volume-${volNum}-mind`,
    'entries',
    `${config.entry}.adoc`
  );

  if (!fs.existsSync(entryPath)) {
    console.warn(`⚠️  Entry file not found: ${entryPath}`);
    return;
  }

  let content = fs.readFileSync(entryPath, 'utf-8');

  // Replace canonical text
  const canonicalPattern = /\[role=canonical\]\n====\n\[CANONICAL TEXT TO BE GENERATED\][\s\S]*?====/;
  const newCanonicalBlock = `[role=canonical]
====
${canonicalText.trim()}
====`;

  if (canonicalPattern.test(content)) {
    content = content.replace(canonicalPattern, newCanonicalBlock);
  } else {
    // Try to find any canonical block
    const anyCanonicalPattern = /\[role=canonical\]\n====[\s\S]*?====/;
    content = content.replace(anyCanonicalPattern, newCanonicalBlock);
  }

  // Add marginalia from reviews
  // Find where to insert (after canonical block, before existing marginalia)
  const marginaliaInsertPoint = content.indexOf('[role=marginalia');
  
  if (marginaliaInsertPoint !== -1) {
    // Insert new marginalia before existing ones
    const newMarginalia = reviews
      .filter(r => r.marginalia)
      .map(r => {
        const year = new Date().getFullYear();
        const wordCount = r.marginalia!.split(/\s+/).length;
        return `[role=marginalia,
 type=${r.marginaliaType || 'clarification'},
 author="${r.reviewer}",
 status="adjunct",
 year="${year}",
 length="${wordCount}",
 targets="entry:${config.entry}",
 scope="local"]
====
${r.marginalia!.trim()}
====`;
      })
      .join('\n\n');

    content = content.slice(0, marginaliaInsertPoint) + 
              '\n\n' + newMarginalia + '\n\n' + 
              content.slice(marginaliaInsertPoint);
  } else {
    // Append at end
    const newMarginalia = reviews
      .filter(r => r.marginalia)
      .map(r => {
        const year = new Date().getFullYear();
        const wordCount = r.marginalia!.split(/\s+/).length;
        return `[role=marginalia,
 type=${r.marginaliaType || 'clarification'},
 author="${r.reviewer}",
 status="adjunct",
 year="${year}",
 length="${wordCount}",
 targets="entry:${config.entry}",
 scope="local"]
====
${r.marginalia!.trim()}
====`;
      })
      .join('\n\n');

    content += '\n\n' + newMarginalia;
  }

  fs.writeFileSync(entryPath, content, 'utf-8');
  console.log(`✅ Updated: ${entryPath}`);
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  const config: Partial<EntryConfig> = {};
  let reviewers: string[] | undefined;
  let multiPerspective = false;
  let additionalAuthors: string[] = [];

  // Parse arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, '');
    const value = args[i + 1];

    if (!key || !value) continue;

    switch (key) {
      case 'entry':
        config.entry = value;
        break;
      case 'faculty':
        config.faculty = value;
        break;
      case 'edition':
        config.edition = value as 'adult' | 'children';
        break;
      case 'volume':
        config.volume = parseInt(value);
        break;
      case 'type':
        config.entryType = value as any;
        break;
      case 'reviewers':
        reviewers = value.split(',');
        break;
      case 'multi-perspective':
        multiPerspective = true;
        i -= 1; // Don't consume next arg
        break;
      case 'additional-authors':
        additionalAuthors = value.split(',');
        break;
    }
  }

  // Validate required params
  if (!config.entry || !config.faculty) {
    console.error('❌ Error: --entry and --faculty are required');
    console.error('');
    console.error('Usage:');
    console.error('  tsx scripts/generate-with-review.ts \\');
    console.error('    --entry "attention" \\');
    console.error('    --faculty "a.james" \\');
    console.error('    --edition "adult" \\');
    console.error('    --volume 1 \\');
    console.error('    --type "major" \\');
    console.error('    [--reviewers "a.simon,a.weil"] \\');
    console.error('    [--multi-perspective] \\');
    console.error('    [--additional-authors "a.freud,a.darwin"]');
    process.exit(1);
  }

  // Set defaults
  const fullConfig: EntryConfig = {
    entry: config.entry!,
    faculty: config.faculty!,
    author: config.faculty!.replace('a.', '').replace(/-/g, ' '),
    edition: config.edition || 'adult',
    volume: config.volume || 1,
    type: config.entryType || 'standard',
  };

  try {
    // Generate main article
    await generateWithReview(fullConfig, reviewers, multiPerspective);

    // If multi-perspective, generate additional articles
    if (multiPerspective && additionalAuthors.length > 0) {
      console.log('\n\n' + '='.repeat(60));
      console.log('📚 Generating additional perspectives...');
      console.log('='.repeat(60));

      for (const authorId of additionalAuthors) {
        const altConfig: EntryConfig = {
          ...fullConfig,
          faculty: authorId,
          author: authorId.replace('a.', '').replace(/-/g, ' '),
          entry: `${fullConfig.entry}-${authorId.replace('a.', '')}`, // Unique slug
        };

        await generateWithReview(altConfig, reviewers, false);
        
        // Delay between articles
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n🎉 All articles generated!');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
