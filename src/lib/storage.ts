import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '../firebase/config'

const MAX_DIMENSION = 1200
const JPEG_QUALITY = 0.8

async function resizeImage(file: File): Promise<Blob> {
  const imageBitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(imageBitmap.width, imageBitmap.height))
  const width = Math.round(imageBitmap.width * scale)
  const height = Math.round(imageBitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(imageBitmap, 0, 0, width, height)

  return await new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob ?? file),
      'image/jpeg',
      JPEG_QUALITY,
    )
  })
}

export async function uploadItemPhoto(uid: string, itemId: string, file: File): Promise<string> {
  const resized = await resizeImage(file)
  const fileName = `${crypto.randomUUID()}.jpg`
  const storageRef = ref(storage, `users/${uid}/items/${itemId}/${fileName}`)
  await uploadBytes(storageRef, resized, { contentType: 'image/jpeg' })
  return getDownloadURL(storageRef)
}

export async function deleteItemPhoto(photoUrl: string) {
  try {
    await deleteObject(ref(storage, photoUrl))
  } catch {
    // 既に削除済み・URLが無効な場合は無視する
  }
}
