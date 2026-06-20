import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../firebase/config'
import { seedCategoriesIfEmpty } from '../lib/categories'
import type { Category } from '../types'

export function useCategories(uid: string | undefined) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    seedCategoriesIfEmpty(uid)
  }, [uid])

  useEffect(() => {
    if (!uid) return
    setLoading(true)
    const q = query(collection(db, 'users', uid, 'categories'), orderBy('order', 'asc'))
    const unsubscribe = onSnapshot(q, (snap) => {
      setCategories(
        snap.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
          order: d.data().order ?? 0,
        })),
      )
      setLoading(false)
    })
    return unsubscribe
  }, [uid])

  return { categories, loading }
}
