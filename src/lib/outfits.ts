import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { OutfitInput } from '../types'

function outfitsCol(uid: string) {
  return collection(db, 'users', uid, 'outfits')
}

export async function createOutfit(uid: string, input: OutfitInput) {
  const ref = await addDoc(outfitsCol(uid), {
    ...input,
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
