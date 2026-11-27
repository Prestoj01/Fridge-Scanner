import { m, useReducedMotion } from 'motion/react'
import { Fragment } from 'react'
import { splitWords } from '../lib/text'

interface RevealTextProps {
  /** Text to reveal. Wrap words in *asterisks* to set them in italic. */
  text: string
  /** Seconds before the first word starts. */
  delay?: number
}

/**
 * Reveals text word by word, each word rising out of a soft blur. Words are
 * keyed by position and content, so when the text changes only the changed
 * words animate again.
 */
export function RevealText({ text, delay = 0 }: RevealTextProps) {
  const words = splitWords(text)
  // Reduced motion: show the words at once (motion only disables transforms itself).
  const calm = useReducedMotion() ?? false
  return (
    <>
      {words.map(({ word, emphasis }, index) => (
        <Fragment key={`${String(index)}-${word}`}>
          <m.span
            className="reveal-word"
            initial={calm ? false : { opacity: 0, y: '0.45em', filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: '0em', filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: delay + index * 0.07 }}
          >
            {emphasis ? <em>{word}</em> : word}
          </m.span>
          {index < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </>
  )
}
