import {
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { ClosetItem, ClosetItemInput } from '../types'

function itemsCol(uid: string) {
  return collection(db, 'users', uid, 'items')
}

/** Storageへの画像アップロード前にIDを確定させるための新規ドキュメントID発行 */
export function newItemId(uid: string) {
  return doc(itemsCol(uid)).id
}

export async function createItem(uid: string, itemId: string, input: ClosetItemInput) {
  await setDoc(doc(itemsCol(uid), itemId), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateItem(uid: string, itemId: string, input: Partial<ClosetItemInput>) {
  await updateDoc(doc(itemsCol(uid), itemId), {
    ...input,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteItem(uid: string, itemId: string) {
  await deleteDoc(doc(itemsCol(uid), itemId))
}

/** カテゴリ削除時に、使用中のアイテムを別カテゴリへ一括で付け替える */
export async function reassignItemsCategory(
  uid: string,
  items: ClosetItem[],
  fromCategory: string,
  toCategory: string,
) {
  const targets = items.filter((item) => item.category === fromCategory)
  if (targets.length === 0) return
  const batch = writeBatch(db)
  targets.forEach((item) => {
    batch.update(doc(itemsCol(uid), item.id), { category: toCategory, updatedAt: serverTimestamp() })
  })
  await batch.commit()
}
