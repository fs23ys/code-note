import { collection, onSnapshot, orderBy, query, type Timestamp } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../firebase/config'
import type { ClosetItem } from '../types'

function toMillis(value: Timestamp | undefined) {
  return value ? value.toMillis() : Date.now()
}

export function useItems(uid: string | undefined) {
  const [items, setItems] = useState<ClosetItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    setLoading(true)
    const q = query(collection(db, 'users', uid, 'items'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snap) => {
      setItems(
        snap.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            photos: data.photos ?? [],
            mainPhotoIndex: data.mainPhotoIndex ?? 0,
            name: data.name,
            category: data.category ?? '',
            brand: data.brand,
            store: data.store,
            price: data.price,
            memo: data.memo,
            tags: data.tags ?? [],
            createdAt: toMillis(data.createdAt),
            updatedAt: toMillis(data.updatedAt),
          } satisfies ClosetItem
        }),
      )
      setLoading(false)
    })
    return unsubscribe
  }, [uid])

  return { items, loading }
}
