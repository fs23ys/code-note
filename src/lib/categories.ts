import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { DEFAULT_CATEGORY_NAMES, type Category } from '../types'

function categoriesCol(uid: string) {
  return collection(db, 'users', uid, 'categories')
}

export async function seedCategoriesIfEmpty(uid: string) {
  const snap = await getDocs(query(categoriesCol(uid)))
  if (!snap.empty) return

  const batch = writeBatch(db)
  DEFAULT_CATEGORY_NAMES.forEach((name, index) => {
    const ref = doc(categoriesCol(uid))
    batch.set(ref, { name, order: index })
  })
  await batch.commit()
}

export async function addCategory(uid: string, name: string, order: number) {
  await addDoc(categoriesCol(uid), { name, order })
}

export async function updateCategory(uid: string, categoryId: string, name: string) {
  await updateDoc(doc(categoriesCol(uid), categoryId), { name })
}

export async function reorderCategories(uid: string, categories: Category[]) {
  const batch = writeBatch(db)
  categories.forEach((category, index) => {
    batch.update(doc(categoriesCol(uid), category.id), { order: index })
  })
  await batch.commit()
}

export async function deleteCategory(uid: string, categoryId: string) {
  await deleteDoc(doc(categoriesCol(uid), categoryId))
}
