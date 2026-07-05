import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Outfit, OutfitInput } from '../types'

function outfitsCol(uid: string) {
  return collection(db, 'users', uid, 'outfits')
}

export async function createOutfit(uid: string, input: OutfitInput) {
  const ref = await addDoc(outfitsCol(uid), {
    ...input,
    order: Date.now(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateOutfit(uid: string, outfitId: string, input: Partial<OutfitInput>) {
  await updateDoc(doc(outfitsCol(uid), outfitId), {
    ...input,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteOutfit(uid: string, outfitId: string) {
  await deleteDoc(doc(outfitsCol(uid), outfitId))
}

export async function reorderOutfits(uid: string, orderedOutfits: Outfit[]) {
  const batch = writeBatch(db)
  orderedOutfits.forEach((outfit, index) => {
    batch.update(doc(outfitsCol(uid), outfit.id), { order: index })
  })
  await batch.commit()
}
