/** Placeholder shaped like a recipe card, shown while recipes load. */
export function RecipeSkeleton() {
  return (
    <div className="skeleton" aria-hidden="true">
      <div className="skeleton__line skeleton__line--title" />
      <div className="skeleton__line" />
      <div className="skeleton__line skeleton__line--short" />
    </div>
  )
}
