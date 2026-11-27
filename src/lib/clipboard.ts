/** Image files on the clipboard, with a readable name for screenshots. */
export function pastedImages(data: DataTransfer | null): File[] {
  if (!data) return []
  return Array.from(data.items)
    .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
    .flatMap((item) => {
      const file = item.getAsFile()
      if (!file) return []
      // Screenshots arrive as "image.png"; give them a clearer label.
      return file.name === '' || file.name === 'image.png'
        ? [new File([file], 'Pasted photo', { type: file.type })]
        : [file]
    })
}
