#!/usr/bin/env tsx
/**
 * Generate all articles for all volumes with peer review workflow
 * Pushes after each volume completes
 * 
 * Usage:
 *   tsx scripts/generate-all-volumes.ts [--volume 1] [--edition adult|children|both]
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_KEY must be set');
  process.exit(1);
}

interface EntryFile {
  filePath: string;
  slug: string;
  facultyId: string;
  author: string;
  type: 'major' | 'standard' | 'boundary' | 'closing';
  edition: 'adult' | 'children';
  volume: number;
}

/**
 * Parse entry metadata from AsciiDoc file
 */
function parseEntryFile(filePath: string, edition: 'adult' | 'children', volume: number): EntryFile | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const slug = path.basename(filePath, '.adoc');
  
  // Extract metadata
  const facultyMatch = content.match(/:faculty-id:\s*(.+)/);
  const authorMatch = content.match(/:canonical-author:\s*(.+)/);
  const typeMatch = content.match(/:entry-type:\s*(.+)/);
  
  // Check if already generated
  const hasPlaceholder = content.includes('[CANONICAL TEXT TO BE GENERATED]');
  
  if (!facultyMatch || !authorMatch || !hasPlaceholder) {
    return null; // Skip if missing metadata or already generated
  }
  
  const entryType = (typeMatch?.[1]?.trim() || 'standard') as 'major' | 'standard' | 'boundary' | 'closing';
  
  return {
    filePath,
    slug,
    facultyId: facultyMatch[1].trim(),
    author: authorMatch[1].trim(),
    type: entryType,
    edition,
    volume,
  };
}

/**
 * Find all entry files for a volume
 */
function findVolumeEntries(volume: number, edition: 'adult' | 'children'): EntryFile[] {
  const volNum = String(volume).padStart(2, '0');
  const volumeSlug = `volume-${volNum}-${getVolumeSlug(volume)}`;
  
  const entriesDir = path.join(
    __dirname,
    '..',
    'editions',
    edition,
    'volumes',
    volumeSlug,
    'entries'
  );
  
  if (!fs.existsSync(entriesDir)) {
    return [];
  }
  
  const entryFiles: EntryFile[] = [];
  const files = fs.readdirSync(entriesDir).filter(f => f.endsWith('.adoc'));
  
  for (const file of files) {
    const filePath = path.join(entriesDir, file);
    const entry = parseEntryFile(filePath, edition, volume);
    if (entry) {
      entryFiles.push(entry);
    }
  }
  
  return entryFiles;
}

/**
 * Get volume slug from volume number
 */
function getVolumeSlug(volume: number): string {
  const slugs: Record<number, string> = {
    1: 'mind',
    2: 'language-meaning',
    3: 'nature',
    4: 'measure',
    5: 'society',
    6: 'art-form',
    7: 'knowledge',
    8: 'history',
    9: 'ethics',
    10: 'machines',
    11: 'futures',
    12: 'limits',
  };
  return slugs[volume] || 'unknown';
}

/**
 * Generate article using generate-with-review script
 */
function generateArticle(entry: EntryFile): boolean {
  try {
    console.log(`\n📝 Generating: ${entry.slug} by ${entry.author} (${entry.facultyId})`);
    
    const cmd = [
      'tsx',
      path.join(__dirname, 'generate-with-review.ts'),
      '--entry', entry.slug,
      '--faculty', entry.facultyId,
      '--edition', entry.edition,
      '--volume', String(entry.volume),
      '--type', entry.type,
    ].join(' ');
    
    execSync(cmd, {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      env: {
        ...process.env,
        SUPABASE_URL,
        SUPABASE_KEY: SUPABASE_KEY!,
      },
    });
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to generate ${entry.slug}:`, error);
    return false;
  }
}

/**
 * Push current changes to git
 */
function pushToGit(volume: number, edition: string): void {
  try {
    console.log(`\n📤 Pushing Volume ${volume} (${edition}) to git...`);
    
    execSync('git add -A', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    });
    
    execSync(`git commit -m "📚 Generate Volume ${volume} articles (${edition})"`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    });
    
    execSync('git push origin main', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    });
    
    console.log(`✅ Pushed Volume ${volume} (${edition})`);
  } catch (error) {
    console.error(`⚠️  Git push failed:`, error);
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  let targetVolume: number | null = null;
  let targetEdition: 'adult' | 'children' | 'both' = 'both';
  
  // Parse arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, '');
    const value = args[i + 1];
    
    if (key === 'volume' && value) {
      targetVolume = parseInt(value);
    } else if (key === 'edition' && value) {
      targetEdition = value as 'adult' | 'children' | 'both';
    }
  }
  
  const volumes = targetVolume ? [targetVolume] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const editions: ('adult' | 'children')[] = targetEdition === 'both' ? ['adult', 'children'] : [targetEdition];
  
  console.log('📚 Generating all articles for volumes:', volumes.join(', '));
  console.log('📖 Editions:', editions.join(', '));
  console.log('');
  
  for (const volume of volumes) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📖 VOLUME ${volume}: ${getVolumeSlug(volume).toUpperCase()}`);
    console.log('='.repeat(60));
    
    for (const edition of editions) {
      console.log(`\n📚 ${edition.toUpperCase()} EDITION`);
      
      const entries = findVolumeEntries(volume, edition);
      console.log(`Found ${entries.length} entries to generate\n`);
      
      let successCount = 0;
      let failCount = 0;
      
      for (const entry of entries) {
        const success = generateArticle(entry);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
        
        // Small delay between articles
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      console.log(`\n✅ Volume ${volume} (${edition}): ${successCount} generated, ${failCount} failed`);
      
      // Push after each volume/edition
      pushToGit(volume, edition);
      
      // Delay before next edition
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n🎉 All volumes processed!');
}

main().catch(console.error);
