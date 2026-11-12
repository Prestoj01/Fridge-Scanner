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
    <div className="app">
      <Header />
      <main className="app-main">
        <div className="container">
          <Stepper current={flow.step} />
          <ErrorBoundary>
            <Suspense fallback={<Loading />}>
              {flow.step === 'upload' && (
                <UploadScreen
                  photos={flow.photos}
                  onAddPhotos={flow.addPhotos}
                  onRemovePhoto={flow.removePhoto}
                  onNext={flow.goNext}
                />
              )}
              {flow.step === 'review' && (
                <ReviewScreen
                  ingredients={flow.ingredients}
                  onAddIngredient={flow.addIngredient}
                  onRemoveIngredient={flow.removeIngredient}
                  onBack={flow.goBack}
                  onNext={flow.goNext}
                />
              )}
              {flow.step === 'recipes' && (
                <RecipesScreen recipes={flow.recipes} onBack={flow.goBack} onReset={flow.reset} />
              )}
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
      <Footer />
    </div>
  )
}
