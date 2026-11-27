import { ChevronLeft } from 'lucide-react'
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react'
import { useEffect } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Footer } from './components/Footer'
import { Icon } from './components/Icon'
import { Header } from './components/Header'
import { PageWipe } from './components/PageWipe'
import { SavedProvider } from './components/SavedProvider'
import { StatusLine } from './components/StatusLine'
import { Stepper } from './components/Stepper'
import { Ticker } from './components/Ticker'
import { useHashView } from './hooks/useHashView'
import { useRotatingLine } from './hooks/useRotatingLine'
import RecipesScreen from './screens/RecipesScreen'
import ReviewScreen from './screens/ReviewScreen'
import SavedScreen from './screens/SavedScreen'
import UploadScreen from './screens/UploadScreen'
import { useScanFlow } from './hooks/useScanFlow'
import { statusState } from './lib/status'

export default function App() {
  return (
    <SavedProvider>
      <Kitchen />
    </SavedProvider>
  )
}

function Kitchen() {
  const flow = useScanFlow()
  const { view, open } = useHashView()

  // Each step and page starts at the top; the page wipe hides the jump.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [flow.step, view])

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
                <SavedScreen
                  onClose={() => {
                    open('flow')
                  }}
                />
              </ErrorBoundary>
            ) : (
              <>
                <Stepper current={flow.step} />
                <div className="back-slot">
                  <AnimatePresence initial={false}>
                    {flow.step !== 'upload' && (
                      <motion.button
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
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
                <StatusLine
                  text={caption}
                  busy={flow.detection.status === 'loading' || flow.generation.status === 'loading'}
                />
                <ErrorBoundary>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
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
                            diet={flow.diet}
                            onAddIngredient={flow.addIngredient}
                            onRemoveIngredient={flow.removeIngredient}
                            onDietChange={flow.setDiet}
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
                          />
                        )}
                      </>
                    </motion.div>
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
