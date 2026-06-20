import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PhotoUploader } from '../components/PhotoUploader'
import { TagInput } from '../components/TagInput'
import { useAuth } from '../hooks/useAuth'
import { useCategories } from '../hooks/useCategories'
import { createItem, newItemId } from '../lib/items'
import { uploadItemPhoto } from '../lib/storage'

export function ItemNewPage() {
  const { user } = useAuth()
  const { categories } = useCategories(user?.uid)
  const navigate = useNavigate()

  const [files, setFiles] = useState<File[]>([])
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0)
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [store, setStore] = useState('')
  const [price, setPrice] = useState('')
  const [memo, setMemo] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!category && categories.length > 0) setCategory(categories[0].id)
  }, [categories, category])

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files])
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url))
  }, [previews])

  const handleAddFiles = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles].slice(0, 3))
  }

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setMainPhotoIndex((prev) => (prev === index ? 0 : prev > index ? prev - 1 : prev))
  }

  const handleSubmit = async () => {
    if (!user) return
    if (files.length === 0) {
      setError('写真を1枚以上登録してください')
      return
    }
    if (!category) {
      setError('カテゴリを選択してください')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const itemId = newItemId(user.uid)
      const photos = await Promise.all(files.map((file) => uploadItemPhoto(user.uid, itemId, file)))
      await createItem(user.uid, itemId, {
        photos,
        mainPhotoIndex,
        category,
        brand: brand || undefined,
        store: store || undefined,
        price: price ? Number(price) : undefined,
        memo: memo || undefined,
        tags,
      })
      navigate(`/items/${itemId}`)
    } catch {
      setError('登録に失敗しました。もう一度お試しください')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <h2 className="text-lg font-bold text-gray-800">服の新規登録</h2>

      <PhotoUploader
        photos={previews}
        mainPhotoIndex={mainPhotoIndex}
        onAddFiles={handleAddFiles}
        onRemove={handleRemove}
        onSetMain={setMainPhotoIndex}
      />

      <label className="flex flex-col gap-1 text-sm text-gray-600">
        カテゴリ
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-600">
        ブランド
        <input
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-600">
        購入店舗
        <input
          type="text"
          value={store}
          onChange={(e) => setStore(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-600">
        購入金額(円)
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-600">
        メモ
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          className="rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-gray-600">
        タグ
        <TagInput tags={tags} onChange={setTags} />
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {submitting ? '登録中...' : '登録する'}
      </button>
    </div>
  )
}
