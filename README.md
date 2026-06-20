# Code Note - クローゼット管理アプリ

自分専用のクローゼット管理Webアプリ。服の登録・コーデ作成・ルールベースのコーデ自動提案ができる。詳細仕様は [closet-app-spec.md](./closet-app-spec.md) を参照。

## 技術スタック

React + Vite + TypeScript / Tailwind CSS / Firebase (Authentication, Firestore, Storage) / Netlify (Hosting)

## セットアップ

```bash
npm install
cp .env.example .env.local   # Firebaseプロジェクトの値を設定する
npm run dev
```

## スクリプト

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 型チェック + 本番ビルド |
| `npm run lint` | ESLint実行 |
| `npm run test` | Vitestによる単体テスト実行(コーデ自動提案ロジックなど) |
| `npm run preview` | ビルド結果のローカル確認 |

## デプロイ

### サイト本体(Netlify)

GitHubリポジトリをNetlifyに連携し、Git pushで自動デプロイされる。ビルド設定は [netlify.toml](./netlify.toml) を参照(`npm run build` → `dist/` を公開)。Netlify側の環境変数に `.env.local` と同じ `VITE_FIREBASE_*` の値を設定する必要がある。

### Firestore / Storage セキュリティルール

```bash
npm install -g firebase-tools   # 未インストールの場合
firebase login
firebase deploy --only firestore:rules,storage
```

`.firebaserc` の `default` に自分のFirebaseプロジェクトIDを設定してから実行する。
