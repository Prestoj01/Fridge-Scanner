/** Splits text into words. Words wrapped in *asterisks* are marked for emphasis. */
export interface Word {
  word: string
  emphasis: boolean
}

export function splitWords(text: string): Word[] {
  const words: Word[] = []
  for (const part of text.split(/(\*[^*]+\*)/)) {
    if (part === '') continue
    const emphasis = part.length > 2 && part.startsWith('*') && part.endsWith('*')
    const clean = emphasis ? part.slice(1, -1) : part
    for (const word of clean.split(/\s+/)) {
      if (word !== '') words.push({ word, emphasis })
    }
  }
  return words
}
