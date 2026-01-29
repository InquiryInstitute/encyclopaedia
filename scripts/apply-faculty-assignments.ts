#!/usr/bin/env tsx
/**
 * Apply Locked Faculty Assignments
 * 
 * Updates all entry files and volumes.ts with the definitive faculty assignments.
 * All faculty must be deceased.
 * 
 * Usage:
 *   tsx scripts/apply-faculty-assignments.ts [--dry-run]
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Locked Faculty Assignments (All Deceased)
const FACULTY_ASSIGNMENTS: Record<string, Record<string, string[]>> = {
  'volume-01-mind': {
    'consciousness': ['a.husserl', 'a.darwin', 'a.turing', 'a.eckhart'],
    'mind': ['a.james', 'a.dewey', 'a.merleau-ponty', 'a.durkheim'],
    'attention': ['a.james', 'a.simon'],
    'self': ['a.freud', 'a.ricoeur', 'a.nagarjuna'],
  },
  'volume-02-language-meaning': {
    'language': ['a.saussure', 'a.wittgenstein', 'a.miller', 'a.valery'],
    'meaning': ['a.frege', 'a.wittgenstein', 'a.frankl', 'a.eliade'],
    'symbol': ['a.peirce', 'a.otto', 'a.cassirer'],
  },
  'volume-03-nature': {
    'nature': ['a.aristotle', 'a.darwin', 'a.bertalanffy', 'a.mumford'],
    'life': ['a.schrodinger', 'a.prigogine', 'a.bergson'],
    'evolution': ['a.darwin', 'a.waddington', 'a.huxley'],
  },
  'volume-04-measure': {
    'time': ['a.einstein', 'a.james', 'a.braudel', 'a.eliade'],
    'number': ['a.euclid', 'a.pythagoras', 'a.smith'],
    'probability': ['a.laplace', 'a.bayes', 'a.popper'],
  },
  'volume-05-society': {
    'agency': ['a.sartre', 'a.weber', 'a.arendt'],
    'power': ['a.machiavelli', 'a.marx', 'a.cassirer'],
    'culture': ['a.tylor', 'a.burckhardt', 'a.mcluhan'],
  },
  'volume-06-art-form': {
    'art': ['a.alberti', 'a.kandinsky', 'a.duchamp'],
    'beauty': ['a.plato', 'a.hume', 'a.adorno'],
    'form': ['a.wolfflin', 'a.godel', 'a.thompson'],
  },
  'volume-07-knowledge': {
    'knowledge': ['a.kant', 'a.bacon', 'a.polanyi', 'a.confucius'],
    'truth': ['a.aristotle', 'a.hegel', 'a.james', 'a.nietzsche'],
  },
  'volume-08-history': {
    'history': ['a.herodotus', 'a.marx', 'a.collingwood', 'a.berlin'],
    'memory': ['a.bergson', 'a.halbwachs', 'a.warburg'],
  },
  'volume-09-ethics': {
    'ethics': ['a.aristotle', 'a.kant', 'a.mill', 'a.noddings'],
    'justice': ['a.rawls', 'a.aristotle', 'a.arendt'],
  },
  'volume-10-machines': {
    'technology': ['a.bacon', 'a.wiener', 'a.ellul', 'a.shelley'],
    'machine': ['a.descartes', 'a.wiener', 'a.turing'],
  },
  'volume-11-futures': {
    'future': ['a.asimov', 'a.wells', 'a.zamyatin'],
    'risk': ['a.pascal', 'a.heidegger', 'a.schmitt'],
  },
  'volume-12-limits': {
    'limit': ['a.socrates', 'a.heisenberg', 'a.levinas'],
    'freedom': ['a.mill', 'a.fromm', 'a.spinoza'],
    'meaning': ['a.tillich', 'a.camus'],
  },
};

// Map faculty IDs to full names
const FACULTY_NAMES: Record<string, string> = {
  'a.husserl': 'Edmund Husserl',
  'a.darwin': 'Charles Darwin',
  'a.turing': 'Alan Turing',
  'a.eckhart': 'Meister Eckhart',
  'a.james': 'William James',
  'a.dewey': 'John Dewey',
  'a.merleau-ponty': 'Maurice Merleau-Ponty',
  'a.durkheim': 'Émile Durkheim',
  'a.simon': 'Herbert A. Simon',
  'a.freud': 'Sigmund Freud',
  'a.ricoeur': 'Paul Ricoeur',
  'a.nagarjuna': 'Nāgārjuna',
  'a.saussure': 'Ferdinand de Saussure',
  'a.wittgenstein': 'Ludwig Wittgenstein',
  'a.miller': 'George A. Miller',
  'a.valery': 'Paul Valéry',
  'a.frege': 'Gottlob Frege',
  'a.frankl': 'Viktor Frankl',
  'a.eliade': 'Mircea Eliade',
  'a.peirce': 'Charles Sanders Peirce',
  'a.otto': 'Rudolf Otto',
  'a.cassirer': 'Ernst Cassirer',
  'a.aristotle': 'Aristotle',
  'a.bertalanffy': 'Ludwig von Bertalanffy',
  'a.mumford': 'Lewis Mumford',
  'a.schrodinger': 'Erwin Schrödinger',
  'a.prigogine': 'Ilya Prigogine',
  'a.bergson': 'Henri Bergson',
  'a.waddington': 'Conrad Hal Waddington',
  'a.huxley': 'Julian Huxley',
  'a.einstein': 'Albert Einstein',
  'a.braudel': 'Fernand Braudel',
  'a.euclid': 'Euclid',
  'a.pythagoras': 'Pythagoras',
  'a.smith': 'Adam Smith',
  'a.laplace': 'Pierre-Simon Laplace',
  'a.bayes': 'Thomas Bayes',
  'a.popper': 'Karl Popper',
  'a.sartre': 'Jean-Paul Sartre',
  'a.weber': 'Max Weber',
  'a.arendt': 'Hannah Arendt',
  'a.machiavelli': 'Niccolò Machiavelli',
  'a.marx': 'Karl Marx',
  'a.tylor': 'Edward Burnett Tylor',
  'a.burckhardt': 'Jacob Burckhardt',
  'a.mcluhan': 'Marshall McLuhan',
  'a.alberti': 'Leon Battista Alberti',
  'a.kandinsky': 'Wassily Kandinsky',
  'a.duchamp': 'Marcel Duchamp',
  'a.plato': 'Plato',
  'a.hume': 'David Hume',
  'a.adorno': 'Theodor W. Adorno',
  'a.wolfflin': 'Heinrich Wölfflin',
  'a.godel': 'Kurt Gödel',
  'a.thompson': 'D\'Arcy Wentworth Thompson',
  'a.kant': 'Immanuel Kant',
  'a.bacon': 'Francis Bacon',
  'a.polanyi': 'Michael Polanyi',
  'a.confucius': 'Confucius',
  'a.hegel': 'G. W. F. Hegel',
  'a.nietzsche': 'Friedrich Nietzsche',
  'a.herodotus': 'Herodotus',
  'a.collingwood': 'R. G. Collingwood',
  'a.berlin': 'Isaiah Berlin',
  'a.halbwachs': 'Maurice Halbwachs',
  'a.warburg': 'Aby Warburg',
  'a.mill': 'John Stuart Mill',
  'a.noddings': 'Nel Noddings',
  'a.rawls': 'John Rawls',
  'a.wiener': 'Norbert Wiener',
  'a.ellul': 'Jacques Ellul',
  'a.shelley': 'Mary Shelley',
  'a.descartes': 'René Descartes',
  'a.asimov': 'Isaac Asimov',
  'a.wells': 'H. G. Wells',
  'a.zamyatin': 'Yevgeny Zamyatin',
  'a.pascal': 'Blaise Pascal',
  'a.heidegger': 'Martin Heidegger',
  'a.schmitt': 'Carl Schmitt',
  'a.socrates': 'Socrates',
  'a.heisenberg': 'Werner Heisenberg',
  'a.levinas': 'Emmanuel Levinas',
  'a.fromm': 'Erich Fromm',
  'a.spinoza': 'Baruch Spinoza',
  'a.tillich': 'Paul Tillich',
  'a.camus': 'Albert Camus',
};

interface EntryUpdate {
  volume: string;
  entry: string;
  authors: string[];
  filePath: string;
}

/**
 * Find all entry files that need updating
 */
function findEntriesToUpdate(): EntryUpdate[] {
  const updates: EntryUpdate[] = [];
  const editions = ['adult', 'children'];
  
  for (const [volumeSlug, assignments] of Object.entries(FACULTY_ASSIGNMENTS)) {
    for (const [entrySlug, facultyIds] of Object.entries(assignments)) {
      for (const edition of editions) {
        const volNum = volumeSlug.replace('volume-', '').split('-')[0];
        const entryPath = path.join(
          __dirname,
          '..',
          'editions',
          edition,
          'volumes',
          volumeSlug,
          'entries',
          `${entrySlug}.adoc`
        );
        
        // Check if file exists or if we need to create multiple versions
        if (fs.existsSync(entryPath)) {
          // Single entry file - will be updated with first author
          updates.push({
            volume: volumeSlug,
            entry: entrySlug,
            authors: facultyIds,
            filePath: entryPath,
          });
        } else if (facultyIds.length > 1) {
          // Multiple authors - create separate files
          for (let i = 0; i < facultyIds.length; i++) {
            const facultyId = facultyIds[i];
            const suffix = i === 0 ? '' : `-${facultyId.replace('a.', '')}`;
            const multiEntryPath = path.join(
              __dirname,
              '..',
              'editions',
              edition,
              'volumes',
              volumeSlug,
              'entries',
              `${entrySlug}${suffix}.adoc`
            );
            
            updates.push({
              volume: volumeSlug,
              entry: `${entrySlug}${suffix}`,
              authors: [facultyId],
              filePath: multiEntryPath,
            });
          }
        }
      }
    }
  }
  
  return updates;
}

/**
 * Update entry file with new faculty assignment
 */
function updateEntryFile(update: EntryUpdate, dryRun: boolean): void {
  const { filePath, entry, authors } = update;
  const primaryAuthor = authors[0];
  const authorName = FACULTY_NAMES[primaryAuthor] || primaryAuthor.replace('a.', '').replace(/-/g, ' ');
  
  if (!fs.existsSync(filePath)) {
    if (dryRun) {
      console.log(`[DRY RUN] Would create: ${filePath}`);
    } else {
      // Create stub entry file
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const stubContent = `// Entry: ${entry} (${update.volume})
// Canonical Author: ${authorName}
// Type: Major Entry
// Faculty ID: ${primaryAuthor}

[[entry-${entry}]]
=== ${entry.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
:canonical-author: ${authorName}
:faculty-id: ${primaryAuthor}
:status: canonical
:entry-type: major
:length-target: 8–12 pages
:word-target: 4000–6000

[role=canonical]
====
[CANONICAL TEXT TO BE GENERATED]
====

[role=marginalia,
 type=objection,
 author="Reviewer",
 status="adjunct",
 year="2026",
 length="42",
 targets="entry:${entry}",
 scope="local"]
====
[MARGINALIA TO BE GENERATED]
====
`;

      fs.writeFileSync(filePath, stubContent, 'utf-8');
      console.log(`✅ Created: ${filePath}`);
    }
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Update faculty-id
  const facultyIdPattern = /^:faculty-id:\s*.+$/m;
  if (facultyIdPattern.test(content)) {
    content = content.replace(facultyIdPattern, `:faculty-id: ${primaryAuthor}`);
    modified = true;
  } else {
    // Add if missing
    const titleMatch = content.match(/^(=== .+)$/m);
    if (titleMatch) {
      const insertPoint = content.indexOf(titleMatch[0]) + titleMatch[0].length;
      content = content.slice(0, insertPoint) + 
                `\n:faculty-id: ${primaryAuthor}\n` + 
                content.slice(insertPoint);
      modified = true;
    }
  }
  
  // Update canonical-author
  const authorPattern = /^:canonical-author:\s*.+$/m;
  if (authorPattern.test(content)) {
    content = content.replace(authorPattern, `:canonical-author: ${authorName}`);
    modified = true;
  } else {
    // Add if missing
    const facultyMatch = content.match(/^:faculty-id:\s*.+$/m);
    if (facultyMatch) {
      const insertPoint = content.indexOf(facultyMatch[0]) + facultyMatch[0].length;
      content = content.slice(0, insertPoint) + 
                `\n:canonical-author: ${authorName}\n` + 
                content.slice(insertPoint);
      modified = true;
    }
  }
  
  if (modified && !dryRun) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Updated: ${filePath}`);
  } else if (dryRun && modified) {
    console.log(`[DRY RUN] Would update: ${filePath}`);
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }
  
  console.log('📚 Applying locked faculty assignments...\n');
  
  const updates = findEntriesToUpdate();
  console.log(`Found ${updates.length} entries to update\n`);
  
  for (const update of updates) {
    updateEntryFile(update, dryRun);
  }
  
  console.log(`\n✅ Processed ${updates.length} entries`);
  
  if (dryRun) {
    console.log('\n💡 Run without --dry-run to apply changes');
  } else {
    console.log('\n📝 Next steps:');
    console.log('   1. Update volumes.ts with new author assignments');
    console.log('   2. Verify all faculty exist in Supabase');
    console.log('   3. Run generate-with-review.ts to generate articles');
  }
}

main().catch(console.error);
