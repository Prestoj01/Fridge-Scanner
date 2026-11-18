import { AnimatePresence, MotionConfig, motion, useAnimate } from 'motion/react'
import { lazy, Suspense, useEffect } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Loading } from './components/Loading'
import { Mascot } from './components/Mascot'
import { Stepper } from './components/Stepper'
import { useRotatingLine } from './hooks/useRotatingLine'
import { useScanFlow } from './hooks/useScanFlow'
import { mascotState } from './lib/mascot'

const UploadScreen = lazy(() => import('./screens/UploadScreen'))
const ReviewScreen = lazy(() => import('./screens/ReviewScreen'))
const RecipesScreen = lazy(() => import('./screens/RecipesScreen'))

export default function App() {
  const flow = useScanFlow()
  const chilly = mascotState({
    aiEnabled: flow.aiEnabled,
    step: flow.step,
    photoCount: flow.photos.length,
    ingredientCount: flow.ingredients.length,
    recipeCount: flow.recipes.length,
    detectedCount: flow.detectedCount,
    detection: flow.detection,
    generation: flow.generation,
  })
  const line = useRotatingLine(chilly.lines)

  // The door gives a little thunk whenever the step changes.
  const [door, animateDoor] = useAnimate<HTMLDivElement>()
  useEffect(() => {
    void animateDoor(door.current, { scale: [1, 0.985, 1.008, 1] }, { duration: 0.45 })
  }, [flow.step, animateDoor, door])

  return (
    <MotionConfig reducedMotion="user">
      <div className="app">
        <Header />
        <main className="app-main">
          <div className="container">
            <Mascot mood={chilly.mood} line={line} />
            <div className="door" ref={door}>
              <Stepper current={flow.step} />
              <ErrorBoundary>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={flow.step}
                    className="door__swing"
                    initial={{ rotateY: -40, x: -24, opacity: 0 }}
                    animate={{ rotateY: 0, x: 0, opacity: 1 }}
                    exit={{ rotateY: 40, x: 24, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 26 }}
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
                          onBack={flow.goBack}
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
          </div>
        </main>
        <Footer />
      </div>
    </MotionConfig>
  )
}
