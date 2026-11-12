# Fridge Scanner

Snap a photo of your fridge or pantry and get healthy recipes, with steps, from the ingredients you already have.

**Live demo:** <https://prestoj01.github.io/Fridge-Scanner/>

## How it works

1. **Photos.** Add up to four photos. They are downscaled in the browser before upload.
2. **Ingredients.** A vision model lists the food it can see. You confirm, add, or remove items and can pick a diet.
3. **Recipes.** The model suggests healthy recipes that use what you have, shows what you would still need to buy, and gives step-by-step instructions.

The app also works with no backend at all. In **offline mode** you type your ingredients and recipes come from a built-in library, matched against what you have. If the AI service fails or hits its quota, the app offers the same library as a fallback.

## Architecture

```
Browser (GitHub Pages)                 Cloudflare Worker                Gemini API
React + TypeScript        POST /detect   validates input,     fetch      vision +
resizes photos       ──────────────────▶ rate limits,     ──────────────▶ JSON output
renders recipes      ◀────────────────── holds the API key ◀──────────────
                          POST /recipes
```

- The API key lives only in the Worker. It never reaches the browser.
- The Worker allows only listed origins, caps request sizes, rate limits per client, and validates everything the model returns before passing it on.
- Request and response types are shared between the app and the Worker ([src/types/api.ts](src/types/api.ts)).

Everything runs on free tiers: GitHub Pages, Cloudflare Workers, and the Gemini API.

## Tech stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (strict), plain CSS, React state only
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) for the API, with no runtime dependencies
- [Gemini API](https://aistudio.google.com/) for image understanding and recipe generation
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/), ESLint, Prettier
- GitHub Actions for CI and deployment to GitHub Pages

## Local setup

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open <http://localhost:5173/fridge-scanner/>. With no further setup the app runs in offline mode.

### Turning on AI features locally

1. Create a free API key at <https://aistudio.google.com/apikey>.
2. Give it to the local Worker:

   ```bash
   cp worker/.dev.vars.example worker/.dev.vars
   # then edit worker/.dev.vars and set GEMINI_API_KEY=your-key
   ```

3. Point the app at the local Worker:

   ```bash
   cp .env.example .env
   # then edit .env and set VITE_API_URL=http://localhost:8787
   ```

4. Run both, in two terminals:

   ```bash
   npm run worker:dev
   npm run dev
   ```

## Deployment

### 1. The API (Cloudflare Worker)

Needs a free [Cloudflare account](https://dash.cloudflare.com/sign-up).

```bash
npx wrangler login
npm run worker:deploy
npx wrangler secret put GEMINI_API_KEY --config worker/wrangler.toml
```

The deploy command prints the Worker URL, for example `https://fridge-scanner-api.<your-subdomain>.workers.dev`. Opening `<worker-url>/health` should show `"configured": true` once the secret is set.

If you fork this project, change `ALLOWED_ORIGINS` in [worker/wrangler.toml](worker/wrangler.toml) to your own GitHub Pages origin.

### 2. The site (GitHub Pages)

1. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Go to **Settings → Secrets and variables → Actions → Variables** and add a repository variable named `VITE_API_URL` with the Worker URL. Skip this to deploy in offline mode.
3. Push to `main`. The workflow in [.github/workflows/deploy.yml](.github/workflows/deploy.yml) lints, tests, builds, and deploys.

## Scripts

| Command                 | What it does                                |
| ----------------------- | ------------------------------------------- |
| `npm run dev`           | Start the web app                           |
| `npm run worker:dev`    | Start the API locally on port 8787          |
| `npm run build`         | Type-check and build the web app to `dist/` |
| `npm run preview`       | Serve the production build locally          |
| `npm test`              | Run all tests once                          |
| `npm run lint`          | Lint with ESLint                            |
| `npm run format`        | Format with Prettier                        |
| `npm run check`         | Lint, format check, test, and build         |
| `npm run worker:deploy` | Deploy the API to Cloudflare                |

## Project structure

```
src/
  components/   Shared UI: Header, Footer, Stepper, RecipeCard, Notice, EmptyState, Loading, ErrorBoundary
  screens/      One component per step: Upload, Review, Recipes
  hooks/        useScanFlow, which owns the flow state and async actions
  lib/          API client, image resizing, validation, recipe matching
  data/         Built-in recipe library
  types/        Shared types, including the API contract
worker/
  src/          Cloudflare Worker: routing, CORS, rate limit, prompts, Gemini client
```

## Privacy

Photos are resized and re-encoded in your browser, which also strips metadata such as location. They are sent to the Worker and on to the Gemini API only when you press **Detect ingredients**. The Worker does not store photos or ingredient lists, and asks the Gemini API not to store the request. Google's own handling of free-tier API data is described in the [Gemini API terms](https://ai.google.dev/gemini-api/terms).

## Limitations

- Detection only finds food that is visible. Items in drawers or opaque containers are missed, so the review step matters.
- Recipes are AI-generated suggestions. Check for allergens and use your own judgment on food safety.
- The free Gemini tier has daily limits. When they are reached, the app falls back to the built-in library.

## License

[MIT](LICENSE)
