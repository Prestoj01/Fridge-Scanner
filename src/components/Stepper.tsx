import { m } from 'motion/react'
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
              {state === 'current' && (
                <m.span
                  layoutId="stepper-pill"
                  className="stepper__pill"
                  transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                />
              )}
              <span className="stepper__number tabular">{String(index + 1).padStart(2, '0')}</span>
              <span className="stepper__label">{step.label}</span>
              {state === 'done' && <span className="visually-hidden"> (done)</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
