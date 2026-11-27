import { foodKind } from '../lib/foodKind'
import { Food } from './food/Food'

interface ResumeCardProps {
  names: readonly string[]
  onContinue: () => void
  onClear: () => void
}

const PREVIEW = 3

/** Offers to pick up the ingredient list saved from the last visit. */
export function ResumeCard({ names, onContinue, onClear }: ResumeCardProps) {
  const shown = names.slice(0, PREVIEW)
  const more = names.length - shown.length
  return (
    <section className="resume" aria-labelledby="resume-heading">
      <div className="resume__foods" aria-hidden="true">
        {[...new Set(names.map(foodKind))].slice(0, 4).map((kind) => (
          <Food key={kind} kind={kind} size={40} shadow={false} />
        ))}
      </div>
      <div className="resume__text">
        <h3 id="resume-heading" className="kicker">
          From last time
        </h3>
        <p>
          {shown.join(', ')}
          {more > 0 && ` and ${String(more)} more`}
        </p>
      </div>
      <div className="resume__actions">
        <button type="button" className="button" onClick={onContinue}>
          Continue with these
        </button>
        <button type="button" className="button button--ghost" onClick={onClear}>
          Clear
        </button>
      </div>
    </section>
  )
}
