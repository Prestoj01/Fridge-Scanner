import { Check } from 'lucide-react'
import { STEPS, stepIndex } from '../lib/steps'
import type { StepId } from '../types'
import { Icon } from './Icon'

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
              <span className="stepper__dot" aria-hidden="true">
                {state === 'done' ? <Icon icon={Check} size={16} /> : index + 1}
              </span>
              {step.label}
              {state === 'done' && <span className="visually-hidden"> (done)</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
