import { ChevronLeft } from 'lucide-react'
import { AnimatePresence, LazyMotion, MotionConfig, m, useReducedMotion } from 'motion/react'
import { Suspense, useEffect } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Footer } from './components/Footer'
import { Icon } from './components/Icon'
import { Header } from './components/Header'
import { PageWipe } from './components/PageWipe'
import { SavedProvider } from './components/SavedProvider'
import { ShoppingProvider } from './components/ShoppingProvider'
import { StatusLine } from './components/StatusLine'
import { Stepper } from './components/Stepper'
import { Ticker } from './components/Ticker'
import { useHashView } from './hooks/useHashView'
import { useRotatingLine } from './hooks/useRotatingLine'
import RecipesScreen from './screens/RecipesScreen'
import ReviewScreen from './screens/ReviewScreen'
import UploadScreen from './screens/UploadScreen'
import { useScanFlow } from './hooks/useScanFlow'
import { preloadViews, SavedScreen, SharedScreen, ShoppingScreen } from './lib/lazyViews'
import { statusState } from './lib/status'

const loadMotionFeatures = () => import('./lib/motionFeatures').then((module) => module.default)

export default function App() {
  return (
    // `strict` fails loudly if a full `motion.*` component sneaks back in.
    <LazyMotion features={loadMotionFeatures} strict>
      <SavedProvider>
        <ShoppingProvider>
          <Kitchen />
        </ShoppingProvider>
      </SavedProvider>
    </LazyMotion>
  )
}

function Kitchen() {
  const flow = useScanFlow()
  const { view, hash, open } = useHashView()

  // Each step and page starts at the top; the page wipe hides the jump.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [flow.step, view])

  // Fetch the other pages once the first screen has settled.
  useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(preloadViews, { timeout: 4000 })
      return () => {
        window.cancelIdleCallback(id)
      }
    }
    const id = window.setTimeout(preloadViews, 2000)
    return () => {
      window.clearTimeout(id)
    }
  }, [])

  const calm = useReducedMotion() ?? false
  const status = statusState({
    aiEnabled: flow.aiEnabled,
    step: flow.step,
    photoCount: flow.photos.length,
    ingredientCount: flow.ingredients.length,
    recipeCount: flow.recipes.length,
    detectedCount: flow.detectedCount,
    detection: flow.detection,
    generation: flow.generation,
  })
  const caption = useRotatingLine(status.lines)

  return (
    <MotionConfig reducedMotion="user">
      <div className="app">
        <PageWipe step={flow.step} />
        <Header />
        <Ticker names={flow.ingredients.map((item) => item.name)} />
        <main className="app-main">
          <div className="container">
            {view === 'saved' ? (
              <ErrorBoundary>
                <Suspense fallback={null}>
                  <SavedScreen
                    onClose={() => {
                      open('flow')
                    }}
                  />
                </Suspense>
              </ErrorBoundary>
            ) : view === 'shared' ? (
              <ErrorBoundary>
                <Suspense fallback={null}>
                  <SharedScreen
                    hash={hash}
                    onClose={() => {
                      open('flow')
                    }}
                  />
                </Suspense>
              </ErrorBoundary>
            ) : view === 'list' ? (
              <ErrorBoundary>
                <Suspense fallback={null}>
                  <ShoppingScreen
                    onClose={() => {
                      open('flow')
                    }}
                  />
                </Suspense>
              </ErrorBoundary>
            ) : (
              <>
                <Stepper current={flow.step} />
                <div className="back-slot">
                  <AnimatePresence initial={false}>
                    {flow.step !== 'upload' && (
                      <m.button
                        key="back"
                        type="button"
                        className="button button--ghost back-link"
                        onClick={flow.goBack}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                      >
                        <Icon icon={ChevronLeft} />
                        {flow.step === 'review' ? 'Back' : 'Ingredients'}
                      </m.button>
                    )}
                  </AnimatePresence>
                </div>
                <StatusLine text={caption} tone={status.tone} />
                <ErrorBoundary>
                  <AnimatePresence mode="wait" initial={false}>
                    <m.div
                      key={flow.step}
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 1 }}
                      exit={calm ? { opacity: 0 } : { opacity: 0, y: -24, filter: 'blur(8px)' }}
                      transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
                    >
                      <>
                        {flow.step === 'upload' && (
                          <UploadScreen
                            aiEnabled={flow.aiEnabled}
                            photos={flow.photos}
                            detection={flow.detection}
                            onAddPhotos={flow.addPhotos}
                            onRemovePhoto={flow.removePhoto}
                            onDetect={() => void flow.detect()}
                            onEnterManually={flow.enterManually}
                            savedNames={flow.ingredients.map((item) => item.name)}
                            onClearSaved={flow.clearIngredients}
                          />
                        )}
                        {flow.step === 'review' && (
                          <ReviewScreen
                            ingredients={flow.ingredients}
                            detectedCount={flow.detectedCount}
                            preferences={flow.preferences}
                            onAddIngredient={flow.addIngredient}
                            onRemoveIngredient={flow.removeIngredient}
                            onPreferencesChange={flow.setPreferences}
                            onFindRecipes={() => void flow.findRecipes()}
                          />
                        )}
                        {flow.step === 'recipes' && (
                          <RecipesScreen
                            recipes={flow.recipes}
                            ingredientNames={flow.ingredients.map((item) => item.name)}
                            generation={flow.generation}
                            onRetry={() => void flow.findRecipes()}
                            onUseLibrary={flow.showLibraryRecipes}
                            onBack={flow.goBack}
                            onReset={flow.reset}
                            refining={flow.refining}
                            refineNote={flow.refineNote}
                            onSwap={(id) => void flow.swapRecipe(id)}
                            onMore={() => void flow.moreRecipes()}
                          />
                        )}
                      </>
                    </m.div>
                  </AnimatePresence>
                </ErrorBoundary>
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </MotionConfig>
  )
}
