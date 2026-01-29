#!/usr/bin/env node
/**
 * Update volumes.ts with multi-perspective entries
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function generateEntryObjects(volumeSlug: string, baseSlug: string, facultyIds: string[]): string {
  const entries: string[] = [];
  
  for (let i = 0; i < facultyIds.length; i++) {
    const facultyId = facultyIds[i];
    const authorName = getFacultyName(facultyId);
    const entrySlug = getEntrySlug(baseSlug, facultyId, i);
    const title = baseSlug.split('-').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');
    
    // Determine type (major for multi-perspective entries)
    const type = 'major';
    
    entries.push(`    { slug: '${entrySlug}', title: '${title}', author: '${authorName}', type: '${type}' }`);
  }
  
  return entries.join(',\n');
}

// This script generates the TypeScript code for volumes.ts
// We'll need to manually integrate it or create a more sophisticated merge

console.log('// Generated entry objects for multi-perspective topics:\n');

for (const [volumeSlug, entries] of Object.entries(ASSIGNMENTS)) {
  console.log(`\n// ${volumeSlug}:`);
  for (const [baseSlug, facultyIds] of Object.entries(entries)) {
    console.log(`\n// ${baseSlug}:`);
    console.log(generateEntryObjects(volumeSlug, baseSlug, facultyIds));
  }
}
