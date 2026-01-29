// Volume and Entry Data Structure

export interface Entry {
  slug: string;
  title: string;
  author: string;
  type: 'major' | 'standard' | 'boundary' | 'closing';
}

export interface Volume {
  num: string;
  title: string;
  slug: string;
  entries: Entry[];
}

// Volume I: Mind - Adult Edition
export const volume01Adult: Volume = {
  num: 'I',
  title: 'Mind',
  slug: 'volume-01-mind',
  entries: [
    // Major Entries
    { slug: 'attention', title: 'Attention', author: 'William James', type: 'major' },
    { slug: 'consciousness', title: 'Consciousness', author: 'Henri Bergson', type: 'major' },
    { slug: 'experience', title: 'Experience', author: 'John Dewey', type: 'major' },
    { slug: 'intelligence', title: 'Intelligence', author: 'Jean Piaget', type: 'major' },
    // Standard Entries
    { slug: 'abstraction', title: 'Abstraction', author: 'A.N. Whitehead', type: 'standard' },
    { slug: 'affect', title: 'Affect', author: 'Baruch Spinoza', type: 'standard' },
    { slug: 'agency', title: 'Agency', author: 'Aristotle', type: 'standard' },
    { slug: 'awareness', title: 'Awareness', author: 'Edmund Husserl', type: 'standard' },
    { slug: 'belief', title: 'Belief', author: 'C.S. Peirce', type: 'standard' },
    { slug: 'cognition', title: 'Cognition', author: 'Ulric Neisser', type: 'standard' },
    { slug: 'dream', title: 'Dream', author: 'Sigmund Freud', type: 'standard' },
    { slug: 'emotion', title: 'Emotion', author: 'Charles Darwin', type: 'standard' },
    { slug: 'habit', title: 'Habit', author: 'William James', type: 'standard' },
    { slug: 'imagination', title: 'Imagination', author: 'S.T. Coleridge', type: 'standard' },
    { slug: 'memory', title: 'Memory', author: 'Henri Bergson', type: 'standard' },
    { slug: 'perception', title: 'Perception', author: 'M. Merleau-Ponty', type: 'standard' },
    { slug: 'reason', title: 'Reason', author: 'Immanuel Kant', type: 'standard' },
    { slug: 'self', title: 'Self', author: 'Hannah Arendt', type: 'standard' },
    { slug: 'sensation', title: 'Sensation', author: 'Ernst Weber', type: 'standard' },
    { slug: 'sleep', title: 'Sleep', author: 'Aristotle', type: 'standard' },
    { slug: 'thought', title: 'Thought', author: 'John Dewey', type: 'standard' },
    { slug: 'will', title: 'Will', author: 'A. Schopenhauer', type: 'standard' },
    // Boundary Entries
    { slug: 'animal-mind', title: 'Animal Mind', author: 'J. von Uexküll', type: 'boundary' },
    { slug: 'artificial-mind', title: 'Artificial Mind', author: 'Alan Turing', type: 'boundary' },
    { slug: 'collective-mind', title: 'Collective Mind', author: 'Émile Durkheim', type: 'boundary' },
    { slug: 'mind-body-problem', title: 'Mind–Body Problem', author: 'René Descartes', type: 'boundary' },
    // Closing Entries
    { slug: 'ignorance-mental', title: 'Ignorance', author: 'Socrates', type: 'closing' },
    { slug: 'uncertainty-subjective', title: 'Uncertainty', author: 'Blaise Pascal', type: 'closing' },
    { slug: 'not-knowing', title: 'Not-Knowing', author: 'Nicholas of Cusa', type: 'closing' },
  ],
};

// Volume I: Mind - Children's Edition (same entries, different authors/content)
export const volume01Children: Volume = {
  ...volume01Adult,
  entries: volume01Adult.entries.map(entry => ({ ...entry })),
};

export function getVolume(edition: 'adult' | 'children', volumeNum: string): Volume | null {
  const volumeMap: Record<string, Volume> = {
    'I': edition === 'adult' ? volume01Adult : volume01Children,
  };
  
  return volumeMap[volumeNum] || null;
}

export function getAllVolumes(): Array<{ num: string; title: string; slug: string }> {
  return [
    { num: 'I', title: 'Mind', slug: 'volume-01-mind' },
    { num: 'II', title: 'Language & Meaning', slug: 'volume-02-language-meaning' },
    { num: 'III', title: 'Nature', slug: 'volume-03-nature' },
    { num: 'IV', title: 'Measure', slug: 'volume-04-measure' },
    { num: 'V', title: 'Society', slug: 'volume-05-society' },
    { num: 'VI', title: 'Art & Form', slug: 'volume-06-art-form' },
    { num: 'VII', title: 'Knowledge', slug: 'volume-07-knowledge' },
    { num: 'VIII', title: 'History', slug: 'volume-08-history' },
    { num: 'IX', title: 'Ethics', slug: 'volume-09-ethics' },
    { num: 'X', title: 'Machines', slug: 'volume-10-machines' },
    { num: 'XI', title: 'Futures', slug: 'volume-11-futures' },
    { num: 'XII', title: 'Limits', slug: 'volume-12-limits' },
  ];
}
