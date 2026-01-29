#!/usr/bin/env node
/**
 * Update all entry files and volumes.ts with locked faculty assignments
 * Supports multiple perspectives per topic
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Locked Faculty Assignments - All Deceased
const ASSIGNMENTS: Record<string, Record<string, string[]>> = {
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

function getFacultyName(facultyId: string): string {
  return FACULTY_NAMES[facultyId] || facultyId.replace('a.', '').replace(/-/g, ' ');
}

function getEntrySlug(baseSlug: string, facultyId: string, index: number): string {
  if (index === 0) return baseSlug;
  const suffix = facultyId.replace('a.', '').replace(/\./g, '-');
  return `${baseSlug}-${suffix}`;
}

function updateEntryFile(
  volumeSlug: string,
  entrySlug: string,
  facultyId: string,
  authorName: string,
  edition: 'adult' | 'children',
  dryRun: boolean
): void {
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

  const dir = path.dirname(entryPath);
  if (!fs.existsSync(dir)) {
    if (!dryRun) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const title = entrySlug.split('-').map(w => 
    w.charAt(0).toUpperCase() + w.slice(1)
  ).join(' ');

  const stubContent = `// Entry: ${entrySlug} (${volumeSlug})
// Canonical Author: ${authorName}
// Type: Major Entry
// Faculty ID: ${facultyId}

[[entry-${entrySlug}]]
=== ${title}
:canonical-author: ${authorName}
:faculty-id: ${facultyId}
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
 targets="entry:${entrySlug}",
 scope="local"]
====
[MARGINALIA TO BE GENERATED]
====
`;

  if (fs.existsSync(entryPath)) {
    let content = fs.readFileSync(entryPath, 'utf-8');
    let modified = false;

    // Update faculty-id
    const facultyIdPattern = /^:faculty-id:\s*.+$/m;
    if (facultyIdPattern.test(content)) {
      content = content.replace(facultyIdPattern, `:faculty-id: ${facultyId}`);
      modified = true;
    }

    // Update canonical-author
    const authorPattern = /^:canonical-author:\s*.+$/m;
    if (authorPattern.test(content)) {
      content = content.replace(authorPattern, `:canonical-author: ${authorName}`);
      modified = true;
    }

    if (modified && !dryRun) {
      fs.writeFileSync(entryPath, content, 'utf-8');
      console.log(`✅ Updated: ${entryPath}`);
    } else if (dryRun && modified) {
      console.log(`[DRY RUN] Would update: ${entryPath}`);
    }
  } else {
    if (!dryRun) {
      fs.writeFileSync(entryPath, stubContent, 'utf-8');
      console.log(`✅ Created: ${entryPath}`);
    } else {
      console.log(`[DRY RUN] Would create: ${entryPath}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }

  console.log('📚 Applying locked faculty assignments...\n');

  let totalEntries = 0;

  for (const [volumeSlug, entries] of Object.entries(ASSIGNMENTS)) {
    console.log(`\n📖 ${volumeSlug}:`);
    
    for (const [baseEntrySlug, facultyIds] of Object.entries(entries)) {
      console.log(`  ${baseEntrySlug}: ${facultyIds.length} perspective(s)`);
      
      for (let i = 0; i < facultyIds.length; i++) {
        const facultyId = facultyIds[i];
        const authorName = getFacultyName(facultyId);
        const entrySlug = getEntrySlug(baseEntrySlug, facultyId, i);
        
        // Update both editions
        for (const edition of ['adult', 'children'] as const) {
          updateEntryFile(volumeSlug, entrySlug, facultyId, authorName, edition, dryRun);
          totalEntries++;
        }
      }
    }
  }

  console.log(`\n✅ Processed ${totalEntries} entry files`);
  
  if (!dryRun) {
    console.log('\n📝 Next steps:');
    console.log('   1. Update volumes.ts with multi-perspective entries');
    console.log('   2. Verify all faculty exist in Supabase');
    console.log('   3. Run generate-with-review.ts to generate articles');
  }
}

main().catch(console.error);
