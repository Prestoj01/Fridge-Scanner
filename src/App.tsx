import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { lazy, Suspense } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Loading } from './components/Loading'
import { Stepper } from './components/Stepper'
import { useScanFlow } from './hooks/useScanFlow'

const UploadScreen = lazy(() => import('./screens/UploadScreen'))
const ReviewScreen = lazy(() => import('./screens/ReviewScreen'))
const RecipesScreen = lazy(() => import('./screens/RecipesScreen'))

export default function App() {
  const flow = useScanFlow()

  return (
    <MotionConfig reducedMotion="user">
      <div className="app">
        <Header />
        <main className="app-main">
          <div className="container">
            <Stepper current={flow.step} />
            <ErrorBoundary>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={flow.step}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
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
        </main>
        <Footer />
      </div>
    </MotionConfig>
  )
}
