// Claude Codeでコーデ提案をするために、Firebaseから服・コーデのデータと画像を
// ローカル(ai-closet-data/)に取得してくる開発用スクリプト。アプリ本体には含まれない。
//
// 使い方: node scripts/fetch-closet-data.mjs
// 事前準備: プロジェクトルートに serviceAccountKey.json を置いておくこと

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

const ROOT = path.resolve(import.meta.dirname, '..')
const KEY_PATH = path.join(ROOT, 'serviceAccountKey.json')
const OUT_DIR = path.join(ROOT, 'ai-closet-data')

if (!existsSync(KEY_PATH)) {
  console.error('serviceAccountKey.json が見つかりません。プロジェクトルートに配置してください。')
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(KEY_PATH, 'utf-8'))
initializeApp({ credential: cert(serviceAccount) })

const db = getFirestore()
const auth = getAuth()

async function getOnlyUserUid() {
  const result = await auth.listUsers(10)
  if (result.users.length === 0) throw new Error('ユーザーが見つかりません')
  if (result.users.length > 1) {
    console.warn(`複数ユーザーが見つかったため最初の1件を使用します: ${result.users[0].email}`)
  }
  return result.users[0].uid
}

async function downloadPhoto(url, destPath) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`画像取得失敗 (${res.status}): ${url}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  writeFileSync(destPath, buffer)
}

async function main() {
  const uid = await getOnlyUserUid()
  console.log(`uid: ${uid}`)

  mkdirSync(OUT_DIR, { recursive: true })
  const itemsDir = path.join(OUT_DIR, 'items')
  mkdirSync(itemsDir, { recursive: true })

  const [itemsSnap, outfitsSnap, categoriesSnap] = await Promise.all([
    db.collection('users').doc(uid).collection('items').get(),
    db.collection('users').doc(uid).collection('outfits').get(),
    db.collection('users').doc(uid).collection('categories').get(),
  ])

  const categories = categoriesSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
  const categoryName = (id) => categories.find((c) => c.id === id)?.name ?? id

  const items = []
  for (const doc of itemsSnap.docs) {
    const data = doc.data()
    const photoPaths = []
    for (let i = 0; i < (data.photos ?? []).length; i++) {
      const ext = '.jpg'
      const fileName = `${doc.id}_${i}${ext}`
      const destPath = path.join(itemsDir, fileName)
      await downloadPhoto(data.photos[i], destPath)
      photoPaths.push(path.join('ai-closet-data', 'items', fileName))
    }
    items.push({
      id: doc.id,
      name: data.name ?? null,
      category: categoryName(data.category),
      brand: data.brand ?? null,
      tags: data.tags ?? [],
      memo: data.memo ?? null,
      photoPaths,
    })
  }

  const outfits = outfitsSnap.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      name: data.name ?? null,
      itemIds: data.itemIds ?? [],
      tags: data.tags ?? [],
      wornDates: data.wornDates ?? [],
    }
  })

  writeFileSync(path.join(OUT_DIR, 'items.json'), JSON.stringify(items, null, 2))
  writeFileSync(path.join(OUT_DIR, 'outfits.json'), JSON.stringify(outfits, null, 2))

  console.log(`完了: ${items.length}件のアイテム, ${outfits.length}件のコーデを ai-closet-data/ に保存しました`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
