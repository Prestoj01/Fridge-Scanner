import { STEPS, stepIndex } from '../lib/steps'
import type { StepId } from '../types'

interface StepperProps {
  current: StepId
}

export function Stepper({ current }: StepperProps) {
  const currentIndex = stepIndex(current)

  return (
    <nav aria-label="Progress">
      <ol className="stepper">
        {STEPS.map((step, index) => {
          const state =
            index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming'
          return (
            <li
              key={step.id}
              className={`stepper__item stepper__item--${state}`}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <span className="stepper__number" aria-hidden="true">
                {index + 1}
              </span>
              <span className="stepper__label">{step.label}</span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
