import { Camera, ImagePlus, X } from 'lucide-react'
import { AnimatePresence, m, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { Cover } from '../components/Cover'
import { Icon } from '../components/Icon'
import { RevealText } from '../components/RevealText'
import { Notice } from '../components/Notice'
import { ResumeCard } from '../components/ResumeCard'
import { pastedImages } from '../lib/clipboard'
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
  /** Ingredient names remembered from the last visit. */
  savedNames: readonly string[]
  onClearSaved: () => void
}

function Resume({ savedNames, onEnterManually, onClearSaved }: UploadScreenProps) {
  return savedNames.length > 0 ? (
    <ResumeCard names={savedNames} onContinue={onEnterManually} onClear={onClearSaved} />
  ) : null
}

export default function UploadScreen(props: UploadScreenProps) {
  return props.aiEnabled ? <PhotoUpload {...props} /> : <OfflineStart {...props} />
}

/** Without a backend, photos cannot be read, so lead with typing instead. */
function OfflineStart(props: UploadScreenProps) {
  const { onEnterManually } = props
  return (
    <section className="screen" aria-labelledby="upload-heading">
      <Cover />
      <Resume {...props} />
      <header className="screen__header">
        <h2 id="upload-heading">
          <RevealText text="Turn what you have into a *healthy meal*" />
        </h2>
        <p className="screen__intro">
          List the ingredients in your fridge or pantry and get recipes with step-by-step
          instructions.
        </p>
      </header>
      <Notice>Photo scanning is not connected on this site, so type your ingredients.</Notice>
      <div className="screen__actions">
        <button type="button" className="button button--primary" onClick={onEnterManually}>
          Type your ingredients
        </button>
      </div>
    </section>
  )
}

function PhotoUpload(props: UploadScreenProps) {
  const { photos, detection, onAddPhotos, onRemovePhoto, onDetect, onEnterManually } = props
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const calm = useReducedMotion() ?? false
  const busy = detection.status === 'loading'
  const full = photos.length >= API_LIMITS.maxImages

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onAddPhotos(Array.from(event.target.files ?? []))
    // Allow picking the same file again after removing it.
    event.target.value = ''
  }

  const openPicker = () => inputRef.current?.click()

  // Paste a photo or screenshot anywhere on the page (Ctrl+V / ⌘V).
  useEffect(() => {
    if (busy || full) return
    const handlePaste = (event: ClipboardEvent) => {
      const files = pastedImages(event.clipboardData)
      if (files.length === 0) return
      event.preventDefault()
      onAddPhotos(files)
    }
    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [busy, full, onAddPhotos])

  const dropHandlers = {
    onDragOver: (event: DragEvent) => {
      event.preventDefault()
      if (!busy && !full) setDragging(true)
    },
    onDragLeave: () => {
      setDragging(false)
    },
    onDrop: (event: DragEvent) => {
      event.preventDefault()
      setDragging(false)
      if (!busy) onAddPhotos(Array.from(event.dataTransfer.files))
    },
  }

  return (
    <section className="screen" aria-labelledby="upload-heading">
      <Cover busy={busy} />
      {photos.length === 0 && <Resume {...props} />}
      <header className="screen__header">
        <h2 id="upload-heading">
          <RevealText text="Photograph your fridge to *find recipes*" />
        </h2>
        <p className="screen__intro">
          Open the door wide and make sure the shelves are well lit. Add the pantry too if you like.
        </p>
      </header>

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
        <button
          type="button"
          className={`dropzone${dragging ? ' dropzone--over' : ''}`}
          onClick={openPicker}
          {...dropHandlers}
        >
          <span className="dropzone__visual">
            <span className="dropzone__icon">
              <Icon icon={Camera} size={32} />
            </span>
          </span>
          <span className="dropzone__title">Add photos</span>
          <span className="dropzone__hint">
            Take a photo or choose up to {API_LIMITS.maxImages} from your library
          </span>
          <span className="dropzone__hint dropzone__hint--desktop">
            You can also drop photos here or paste them
          </span>
        </button>
      ) : (
        <div
          className={`photo-panel${busy ? ' photo-panel--scanning' : ''}${dragging ? ' photo-panel--over' : ''}`}
          aria-busy={busy}
          {...dropHandlers}
        >
          <p className="photo-panel__count tabular">
            {photos.length} of {API_LIMITS.maxImages} photos
          </p>
          <ul className="photo-grid">
            <AnimatePresence mode="popLayout">
              {photos.map((photo) => (
                <m.li
                  key={photo.id}
                  layout
                  className="photo-tile"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <m.span
                    className="photo-tile__frame"
                    initial={calm ? false : { clipPath: 'circle(0% at 50% 50%)' }}
                    animate={{ clipPath: 'circle(75% at 50% 50%)' }}
                    transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
                  >
                    <img src={photo.url} alt={photo.name} />
                  </m.span>
                  <button
                    type="button"
                    className="photo-tile__remove"
                    aria-label={`Remove ${photo.name}`}
                    disabled={busy}
                    onClick={() => {
                      onRemovePhoto(photo.id)
                    }}
                  >
                    <Icon icon={X} />
                  </button>
                </m.li>
              ))}
            </AnimatePresence>
            {!full && (
              <m.li layout key="add">
                <button
                  type="button"
                  className="photo-tile photo-tile--add"
                  disabled={busy}
                  onClick={openPicker}
                >
                  <Icon icon={ImagePlus} size={24} />
                  Add more
                </button>
              </m.li>
            )}
          </ul>
        </div>
      )}

      {detection.status === 'error' && <Notice tone="error">{detection.message}</Notice>}

      <div className="screen__actions">
        {photos.length > 0 && (
          <button
            type="button"
            className="button button--primary"
            disabled={busy}
            aria-busy={busy}
            onClick={onDetect}
          >
            {busy ? (
              <>
                <span className="spinner" aria-hidden="true" />
                <span role="status">Looking for ingredients…</span>
              </>
            ) : detection.status === 'error' ? (
              'Try again'
            ) : (
              'Detect ingredients'
            )}
          </button>
        )}
        <button
          type="button"
          className="button button--ghost"
          disabled={busy}
          onClick={onEnterManually}
        >
          Type ingredients instead
        </button>
      </div>
    </section>
  )
}
