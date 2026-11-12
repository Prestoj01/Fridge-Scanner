import { useRef, type ChangeEvent } from 'react'
import { EmptyState } from '../components/EmptyState'
import type { Photo } from '../types'

interface UploadScreenProps {
  photos: readonly Photo[]
  onAddPhotos: (files: readonly File[]) => void
  onRemovePhoto: (id: string) => void
  onNext: () => void
}

export default function UploadScreen({
  photos,
  onAddPhotos,
  onRemovePhoto,
  onNext,
}: UploadScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null)

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
        Add one or more photos of your fridge or pantry. Photos stay on your device for now.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="visually-hidden"
        aria-label="Choose photos"
        onChange={handleChange}
      />

      {photos.length === 0 ? (
        <EmptyState
          icon="📷"
          title="No photos yet"
          description="Take a photo or choose one from your library to get started."
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
                  onClick={() => {
                    onRemovePhoto(photo.id)
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="button" onClick={openPicker}>
            Add more photos
          </button>
        </>
      )}

      <div className="screen__actions">
        <button
          type="button"
          className="button button--primary"
          disabled={photos.length === 0}
          onClick={onNext}
        >
          Review ingredients
        </button>
      </div>
    </section>
  )
}
