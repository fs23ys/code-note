import { collection, onSnapshot, orderBy, query, type Timestamp } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../firebase/config'
import type { Outfit } from '../types'

function toMillis(value: Timestamp | undefined) {
  return value ? value.toMillis() : Date.now()
}

export function useOutfits(uid: string | undefined) {
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    setLoading(true)
    const q = query(collection(db, 'users', uid, 'outfits'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snap) => {
      setOutfits(
        snap.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            name: data.name,
            itemIds: data.itemIds ?? [],
            tags: data.tags ?? [],
            memo: data.memo,
            wornDates: data.wornDates ?? [],
            createdAt: toMillis(data.createdAt),
            updatedAt: toMillis(data.updatedAt),
          } satisfies Outfit
        }),
      )
      setLoading(false)
    })
    return unsubscribe
  }, [uid])

  return { outfits, loading }
}
