import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useCategories } from '../hooks/useCategories'
import { useItems } from '../hooks/useItems'
import {
  addCategory,
  deleteCategory,
  reorderCategories,
  updateCategory,
} from '../lib/categories'
import { reassignItemsCategory } from '../lib/items'
import { UNCATEGORIZED_NAME } from '../types'

export function SettingsPage() {
  const { user } = useAuth()
  const { categories } = useCategories(user?.uid)
  const { items } = useItems(user?.uid)

  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleAdd = async () => {
    if (!user || !newName.trim()) return
    await addCategory(user.uid, newName.trim(), categories.length)
    setNewName('')
  }

  const startEdit = (id: string, name: string) => {
    setEditingId(id)
    setEditingName(name)
  }

  const handleEditSave = async () => {
    if (!user || !editingId || !editingName.trim()) return
    await updateCategory(user.uid, editingId, editingName.trim())
    setEditingId(null)
  }

  const moveCategory = async (index: number, direction: -1 | 1) => {
    if (!user) return
    const target = index + direction
    if (target < 0 || target >= categories.length) return
    const reordered = [...categories]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(target, 0, moved)
    await reorderCategories(user.uid, reordered)
  }

  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (!user) return
    const usingItems = items.filter((item) => item.category === categoryId)
    if (usingItems.length > 0) {
      const ok = window.confirm(
        `このカテゴリは${usingItems.length}件のアイテムで使用中です。削除すると「${UNCATEGORIZED_NAME}」に変更されます。削除しますか?`,
      )
      if (!ok) return
    } else if (!window.confirm(`「${categoryName}」を削除しますか?`)) {
      return
    }

    const uncategorized = categories.find((c) => c.name === UNCATEGORIZED_NAME && c.id !== categoryId)
    await reassignItemsCategory(user.uid, items, categoryId, uncategorized?.id ?? UNCATEGORIZED_NAME)
    await deleteCategory(user.uid, categoryId)
  }

  return (
    <div className="flex max-w-md flex-col gap-4">
      <h2 className="text-lg font-bold text-gray-800">設定 - カテゴリ管理</h2>

      <ul className="flex flex-col gap-2">
        {categories.map((category, index) => (
          <li
            key={category.id}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
          >
            {editingId === category.id ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
              />
            ) : (
              <span className="flex-1 text-sm text-gray-800">{category.name}</span>
            )}

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveCategory(index, -1)}
                disabled={index === 0}
                className="px-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveCategory(index, 1)}
                disabled={index === categories.length - 1}
                className="px-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
              >
                ↓
              </button>
              {editingId === category.id ? (
                <button
                  type="button"
                  onClick={handleEditSave}
                  className="rounded bg-indigo-600 px-2 py-1 text-xs text-white"
                >
                  保存
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => startEdit(category.id, category.name)}
                  className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600"
                >
                  編集
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(category.id, category.name)}
                className="rounded bg-red-50 px-2 py-1 text-xs text-red-600"
              >
                削除
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="新しいカテゴリ名"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          追加
        </button>
      </div>
    </div>
  )
}
