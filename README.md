# Fridge Scanner

Snap a photo of your fridge or pantry and get healthy recipes, with steps, from the ingredients you already have.

> **Status:** foundation only. The app flow, layout, and tooling are in place. Ingredient detection and recipe generation are not wired up yet.

## Planned features

- Upload or take photos of a fridge or pantry
- Detect ingredients from the photos
- Review and correct the detected ingredient list
- Get healthy recipe suggestions with step-by-step instructions
- Runs at $0: static frontend on GitHub Pages plus a free-tier API

## Tech stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (strict)
- Plain CSS, mobile-first
- React state only, no state library
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)
- ESLint + Prettier
- Hosted on GitHub Pages

## Local setup

Requires Node.js 22 or newer.

```bash
npm install
cp .env.example .env   # optional, VITE_API_URL is unused for now
npm run dev
```

Then open <http://localhost:5173/fridge-scanner/>.

## Scripts

| Command                | What it does                       |
| ---------------------- | ---------------------------------- |
| `npm run dev`          | Start the dev server               |
| `npm run build`        | Type-check and build to `dist/`    |
| `npm run preview`      | Serve the production build locally |
| `npm test`             | Run the tests once                 |
| `npm run test:watch`   | Run the tests in watch mode        |
| `npm run lint`         | Lint with ESLint                   |
| `npm run format`       | Format with Prettier               |
| `npm run format:check` | Check formatting without writing   |

## Project structure

```
src/
  components/   Shared UI: Header, Footer, Stepper, EmptyState, Loading, ErrorBoundary
  screens/      One component per step: Upload, Review, Recipes
  hooks/        useScanFlow, which owns the flow state
  lib/          Pure helpers: step order, ingredient list, config
  types/        Shared TypeScript types
  test/         Vitest setup
```

## License

[MIT](LICENSE)
