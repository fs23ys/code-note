import { useRef } from 'react'

const MAX_PHOTOS = 3

interface PhotoUploaderProps {
  photos: string[]
  mainPhotoIndex: number
  onAddFiles: (files: File[]) => void
  onRemove: (index: number) => void
  onSetMain: (index: number) => void
  uploading?: boolean
}

export function PhotoUploader({
  photos,
  mainPhotoIndex,
  onAddFiles,
  onRemove,
  onSetMain,
  uploading,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return
    const remaining = MAX_PHOTOS - photos.length
    const files = Array.from(fileList).slice(0, remaining)
    if (files.length > 0) onAddFiles(files)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {photos.map((url, index) => (
          <div
            key={url + index}
            className={`relative h-28 w-28 overflow-hidden rounded-lg border-2 ${
              index === mainPhotoIndex ? 'border-indigo-500' : 'border-gray-200'
            }`}
          >
            <img src={url} alt={`写真${index + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white"
            >
              ×
            </button>
            {index !== mainPhotoIndex && (
              <button
                type="button"
                onClick={() => onSetMain(index)}
                className="absolute bottom-0 left-0 right-0 bg-black/50 py-0.5 text-[10px] text-white"
              >
                メインにする
              </button>
            )}
            {index === mainPhotoIndex && (
              <span className="absolute bottom-0 left-0 right-0 bg-indigo-500/80 py-0.5 text-center text-[10px] text-white">
                メイン
              </span>
            )}
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-xs text-gray-400 hover:border-indigo-400 hover:text-indigo-500 disabled:opacity-50"
          >
            <span className="text-2xl">+</span>
            {uploading ? 'アップロード中...' : '写真を追加'}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="mt-1 text-xs text-gray-400">写真は1〜3枚まで登録できます</p>
    </div>
  )
}
