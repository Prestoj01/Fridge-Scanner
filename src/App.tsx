import { MotionConfig } from 'motion/react'
import { lazy, Suspense } from 'react'
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

  return (
    <MotionConfig reducedMotion="user">
      <div className="app">
        <Header />
        <main className="app-main">
          <div className="container">
            <Mascot mood={chilly.mood} line={line} />
            <div className="door">
              <Stepper current={flow.step} />
              <ErrorBoundary>
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
              </ErrorBoundary>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </MotionConfig>
  )
}
