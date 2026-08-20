// Fashion-flavoured words for auto-generated handles. Kept ASCII/lowercase so
// the result is a safe, URL-friendly username the user can later change.
const WORDS = [
  'sastre',
  'lino',
  'ante',
  'tweed',
  'saten',
  'denim',
  'estilo',
  'percha',
  'textil',
  'hilo',
  'ambar',
  'indigo',
];

/** Random handle-style username, e.g. "estilo-4821". `random` is injectable for tests. */
export function generateUsername(random: () => number = Math.random): string {
  const word = WORDS[Math.floor(random() * WORDS.length)] ?? 'estilo';
  const number = 1000 + Math.floor(random() * 9000);
  return `${word}-${number}`;
}
