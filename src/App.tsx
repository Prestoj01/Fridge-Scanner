import { ChevronLeft } from 'lucide-react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { lazy, Suspense } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Footer } from './components/Footer'
import { Icon } from './components/Icon'
import { Header } from './components/Header'
import { Loading } from './components/Loading'
import { OrbStage } from './components/OrbStage'
import { Stepper } from './components/Stepper'
import { useRotatingLine } from './hooks/useRotatingLine'
import { useScanFlow } from './hooks/useScanFlow'
import { orbState } from './lib/orb'

const UploadScreen = lazy(() => import('./screens/UploadScreen'))
const ReviewScreen = lazy(() => import('./screens/ReviewScreen'))
const RecipesScreen = lazy(() => import('./screens/RecipesScreen'))

export default function App() {
  const flow = useScanFlow()
  const orb = orbState({
    aiEnabled: flow.aiEnabled,
    step: flow.step,
    photoCount: flow.photos.length,
    ingredientCount: flow.ingredients.length,
    recipeCount: flow.recipes.length,
    detectedCount: flow.detectedCount,
    detection: flow.detection,
    generation: flow.generation,
  })
  const caption = useRotatingLine(orb.lines)

  return (
    <MotionConfig reducedMotion="user">
      <div className="app">
        <Header />
        <main className="app-main">
          <div className="container">
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
            <OrbStage
              mood={orb.mood}
              caption={caption}
              size={flow.step === 'upload' ? 'hero' : 'compact'}
            />
            <ErrorBoundary>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={flow.step}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -24, filter: 'blur(8px)' }}
                  transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
                >
                  <Suspense fallback={<Loading />}>
                    {flow.step === 'upload' && (
                      <UploadScreen
                        aiEnabled={flow.aiEnabled}
                        photos={flow.photos}
                        detection={flow.detection}
                        onAddPhotos={flow.addPhotos}
                        onRemovePhoto={flow.removePhoto}
                        onDetect={() => void flow.detect()}
                        onEnterManually={flow.enterManually}
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
                        generation={flow.generation}
                        onRetry={() => void flow.findRecipes()}
                        onUseLibrary={flow.showLibraryRecipes}
                        onBack={flow.goBack}
                        onReset={flow.reset}
                      />
                    )}
                  </Suspense>
                </motion.div>
              </AnimatePresence>
            </ErrorBoundary>
          </div>
        </main>
        <Footer />
      </div>
    </MotionConfig>
  )
}
