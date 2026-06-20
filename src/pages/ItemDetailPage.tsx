import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PhotoUploader } from '../components/PhotoUploader'
import { TagInput } from '../components/TagInput'
import { useAuth } from '../hooks/useAuth'
import { useCategories } from '../hooks/useCategories'
import { useItems } from '../hooks/useItems'
import { deleteItem, updateItem } from '../lib/items'
import { deleteItemPhoto, uploadItemPhoto } from '../lib/storage'

export function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>()
  const { user } = useAuth()
  const { items, loading } = useItems(user?.uid)
  const { categories } = useCategories(user?.uid)
  const navigate = useNavigate()

  const item = useMemo(() => items.find((i) => i.id === itemId), [items, itemId])

  const [editing, setEditing] = useState(false)
  const [existingPhotos, setExistingPhotos] = useState<string[]>([])
  const [removedPhotos, setRemovedPhotos] = useState<string[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
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
    if (!item) return
    setExistingPhotos(item.photos)
    setRemovedPhotos([])
    setNewFiles([])
    setMainPhotoIndex(item.mainPhotoIndex)
    setCategory(item.category)
    setBrand(item.brand ?? '')
    setStore(item.store ?? '')
    setPrice(item.price !== undefined ? String(item.price) : '')
    setMemo(item.memo ?? '')
    setTags(item.tags)
  }, [item])

  const newPreviews = useMemo(() => newFiles.map((file) => URL.createObjectURL(file)), [newFiles])
  useEffect(() => {
    return () => newPreviews.forEach((url) => URL.revokeObjectURL(url))
  }, [newPreviews])

  const combinedPhotos = [...existingPhotos, ...newPreviews]

  const handleAddFiles = (files: File[]) => {
    setNewFiles((prev) => [...prev, ...files].slice(0, 3 - existingPhotos.length))
  }

  const handleRemove = (index: number) => {
    if (index < existingPhotos.length) {
      setRemovedPhotos((prev) => [...prev, existingPhotos[index]])
      setExistingPhotos((prev) => prev.filter((_, i) => i !== index))
    } else {
      const newIndex = index - existingPhotos.length
      setNewFiles((prev) => prev.filter((_, i) => i !== newIndex))
    }
    setMainPhotoIndex((prev) => (prev === index ? 0 : prev > index ? prev - 1 : prev))
  }

  const handleCancelEdit = () => {
    if (!item) return
    setExistingPhotos(item.photos)
    setRemovedPhotos([])
    setNewFiles([])
    setMainPhotoIndex(item.mainPhotoIndex)
    setCategory(item.category)
    setBrand(item.brand ?? '')
    setStore(item.store ?? '')
    setPrice(item.price !== undefined ? String(item.price) : '')
    setMemo(item.memo ?? '')
    setTags(item.tags)
    setError('')
    setEditing(false)
  }

  const handleSave = async () => {
    if (!user || !item) return
    if (combinedPhotos.length === 0) {
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
      const uploadedUrls = await Promise.all(
        newFiles.map((file) => uploadItemPhoto(user.uid, item.id, file)),
      )
      const photos = [...existingPhotos, ...uploadedUrls]
      await updateItem(user.uid, item.id, {
        photos,
        mainPhotoIndex,
        category,
        brand: brand || undefined,
        store: store || undefined,
        price: price ? Number(price) : undefined,
        memo: memo || undefined,
        tags,
      })
      await Promise.all(removedPhotos.map((url) => deleteItemPhoto(url)))
      setEditing(false)
    } catch {
      setError('保存に失敗しました。もう一度お試しください')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!user || !item) return
    if (!window.confirm('この服を削除しますか?')) return
    await Promise.all(item.photos.map((url) => deleteItemPhoto(url)))
    await deleteItem(user.uid, item.id)
    navigate('/items')
  }

  if (loading) return <p className="text-sm text-gray-400">読み込み中...</p>
  if (!item) return <p className="text-sm text-gray-400">アイテムが見つかりません</p>

  const categoryName = categories.find((c) => c.id === item.category)?.name ?? item.category

  if (!editing) {
    return (
      <div className="flex max-w-xl flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          {item.photos.map((url, index) => (
            <div
              key={url + index}
              className={`h-28 w-28 overflow-hidden rounded-lg border-2 ${
                index === item.mainPhotoIndex ? 'border-indigo-500' : 'border-gray-200'
              }`}
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-gray-400">カテゴリ</dt>
          <dd className="text-gray-800">{categoryName}</dd>
          <dt className="text-gray-400">ブランド</dt>
          <dd className="text-gray-800">{item.brand || '-'}</dd>
          <dt className="text-gray-400">購入店舗</dt>
          <dd className="text-gray-800">{item.store || '-'}</dd>
          <dt className="text-gray-400">購入金額</dt>
          <dd className="text-gray-800">{item.price !== undefined ? `${item.price.toLocaleString()}円` : '-'}</dd>
          <dt className="text-gray-400">メモ</dt>
          <dd className="whitespace-pre-wrap text-gray-800">{item.memo || '-'}</dd>
        </dl>

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-indigo-100 px-3 py-1 text-xs text-indigo-700">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            編集する
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
          >
            削除する
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <h2 className="text-lg font-bold text-gray-800">服の編集</h2>

      <PhotoUploader
        photos={combinedPhotos}
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

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? '保存中...' : '保存する'}
        </button>
        <button
          type="button"
          onClick={handleCancelEdit}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}
