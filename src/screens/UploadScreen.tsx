import { useRef, type ChangeEvent } from 'react'
import { EmptyState } from '../components/EmptyState'
import { Loading } from '../components/Loading'
import { Notice } from '../components/Notice'
import type { AsyncState, Photo } from '../types'
import { API_LIMITS } from '../types/api'

interface UploadScreenProps {
  aiEnabled: boolean
  photos: readonly Photo[]
  detection: AsyncState
  onAddPhotos: (files: readonly File[]) => void
  onRemovePhoto: (id: string) => void
  onDetect: () => void
  onEnterManually: () => void
}

export default function UploadScreen({
  aiEnabled,
  photos,
  detection,
  onAddPhotos,
  onRemovePhoto,
  onDetect,
  onEnterManually,
}: UploadScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const busy = detection.status === 'loading'
  const full = photos.length >= API_LIMITS.maxImages

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onAddPhotos(Array.from(event.target.files ?? []))
    // Allow picking the same file again after removing it.
    event.target.value = ''
  }

  const openPicker = () => inputRef.current?.click()

  return (
    <section className="screen" aria-labelledby="upload-heading">
      <h2 id="upload-heading">Snap your fridge</h2>
      <p className="screen__intro">
        Add up to {API_LIMITS.maxImages} photos of your fridge or pantry and we will work out what
        you can cook.
      </p>

      {!aiEnabled && (
        <Notice>
          <strong>Offline mode.</strong> Photo detection is not connected, so you can type your
          ingredients instead. Recipes come from the built-in library.
        </Notice>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="visually-hidden"
        aria-label="Choose photos"
        tabIndex={-1}
        onChange={handleChange}
      />

      {photos.length === 0 ? (
        <EmptyState
          icon="📷"
          title="No photos yet"
          description="Take a photo or choose one from your library. Open the door wide and make sure the shelves are well lit."
        >
          <button type="button" className="button button--primary" onClick={openPicker}>
            Add photos
          </button>
        </EmptyState>
      ) : (
        <>
          <ul className="photo-grid">
            {photos.map((photo) => (
              <li key={photo.id} className="photo-grid__item">
                <img src={photo.url} alt={photo.name} />
                <button
                  type="button"
                  className="photo-grid__remove"
                  aria-label={`Remove ${photo.name}`}
                  disabled={busy}
                  onClick={() => {
                    onRemovePhoto(photo.id)
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="button" disabled={busy || full} onClick={openPicker}>
            {full ? `Limit of ${String(API_LIMITS.maxImages)} photos reached` : 'Add more photos'}
          </button>
        </>
      )}

      {busy && <Loading label="Looking for ingredients…" />}
      {detection.status === 'error' && <Notice tone="error">{detection.message}</Notice>}

      <div className="screen__actions">
        <button type="button" className="button" disabled={busy} onClick={onEnterManually}>
          {aiEnabled ? 'Type ingredients instead' : 'Type ingredients'}
        </button>
        {aiEnabled && (
          <button
            type="button"
            className="button button--primary"
            disabled={photos.length === 0 || busy}
            onClick={onDetect}
          >
            {detection.status === 'error' ? 'Try again' : 'Detect ingredients'}
          </button>
        )}
      </div>
    </section>
  )
}
