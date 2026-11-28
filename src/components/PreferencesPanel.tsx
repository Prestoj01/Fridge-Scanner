import { Minus, Plus } from 'lucide-react'
import {
  ALLERGENS,
  CUISINES,
  MAX_SERVINGS,
  TIME_LIMITS,
  type Allergen,
  type Cuisine,
  type Diet,
  type Goal,
  type Preferences,
} from '../types'
import { Icon } from './Icon'
import { Segmented } from './Segmented'

interface PreferencesPanelProps {
  preferences: Preferences
  onChange: (preferences: Preferences) => void
}

const DIETS: readonly { value: Diet; label: string }[] = [
  { value: 'any', label: 'Anything' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
]

const GOAL_OPTIONS: readonly { value: Goal; label: string }[] = [
  { value: 'balanced', label: 'Balanced' },
  { value: 'high-protein', label: 'High protein' },
  { value: 'low-carb', label: 'Low carb' },
  { value: 'light', label: 'Light' },
]

const TIMES: readonly { value: number; label: string }[] = [
  { value: 0, label: 'Any' },
  ...TIME_LIMITS.map((minutes) => ({ value: minutes, label: `${String(minutes)} min` })),
]

const ALLERGEN_LABELS: Record<Allergen, string> = {
  dairy: 'Dairy',
  eggs: 'Eggs',
  gluten: 'Gluten',
  nuts: 'Nuts',
  fish: 'Fish',
  soy: 'Soy',
}

const CUISINE_LABELS: Record<Cuisine, string> = {
  any: 'Any',
  italian: 'Italian',
  mexican: 'Mexican',
  asian: 'Asian',
  mediterranean: 'Mediterranean',
  american: 'American',
  indian: 'Indian',
}

/** Diet, health goal, time, foods to avoid, cuisine, and servings for the next batch of recipes. */
export function PreferencesPanel({ preferences, onChange }: PreferencesPanelProps) {
  const update = (patch: Partial<Preferences>) => {
    onChange({ ...preferences, ...patch })
  }

  const toggleAvoid = (allergen: Allergen) => {
    const avoid = preferences.avoid.includes(allergen)
      ? preferences.avoid.filter((item) => item !== allergen)
      : ALLERGENS.filter((item) => item === allergen || preferences.avoid.includes(item))
    update({ avoid })
  }

  return (
    <section className="preferences" aria-labelledby="preferences-heading">
      <h3 id="preferences-heading" className="preferences__title">
        How do you want to eat?
      </h3>

      <Segmented
        legend="Diet"
        name="diet"
        options={DIETS}
        value={preferences.diet}
        onChange={(diet) => {
          update({ diet })
        }}
      />

      <Segmented
        legend="Goal"
        name="goal"
        options={GOAL_OPTIONS}
        value={preferences.goal}
        onChange={(goal) => {
          update({ goal })
        }}
      />

      <Segmented
        legend="Ready in"
        name="time"
        options={TIMES}
        value={preferences.maxMinutes ?? 0}
        onChange={(minutes) => {
          update({ maxMinutes: minutes === 0 ? null : minutes })
        }}
      />

      <fieldset className="toggles">
        <legend>Leave out</legend>
        <div className="toggles__options">
          {ALLERGENS.map((allergen) => (
            <label key={allergen} className="toggle">
              <input
                type="checkbox"
                checked={preferences.avoid.includes(allergen)}
                onChange={() => {
                  toggleAvoid(allergen)
                }}
              />
              <span>{ALLERGEN_LABELS[allergen]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="toggles">
        <legend>Cuisine</legend>
        <div className="toggles__options">
          {CUISINES.map((cuisine) => (
            <label key={cuisine} className="toggle">
              <input
                type="radio"
                name="cuisine"
                checked={preferences.cuisine === cuisine}
                onChange={() => {
                  update({ cuisine })
                }}
              />
              <span>{CUISINE_LABELS[cuisine]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="stepper-input">
        <span className="stepper-input__label" id="servings-label">
          Servings
        </span>
        <div className="stepper-input__control" role="group" aria-labelledby="servings-label">
          <button
            type="button"
            aria-label="Fewer servings"
            disabled={preferences.servings <= 1}
            onClick={() => {
              update({ servings: preferences.servings - 1 })
            }}
          >
            <Icon icon={Minus} size={16} />
          </button>
          <output className="tabular" aria-live="polite">
            {preferences.servings}
          </output>
          <button
            type="button"
            aria-label="More servings"
            disabled={preferences.servings >= MAX_SERVINGS}
            onClick={() => {
              update({ servings: preferences.servings + 1 })
            }}
          >
            <Icon icon={Plus} size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}
