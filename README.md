# Code Note - クローゼット管理アプリ

自分専用のクローゼット管理Webアプリ。服の登録・コーデ作成・ルールベースのコーデ自動提案ができる。詳細仕様は [closet-app-spec.md](./closet-app-spec.md) を参照。

## 技術スタック

React + Vite + TypeScript / Tailwind CSS / Firebase (Authentication, Firestore, Storage) / GitHub Pages (Hosting)

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

### サイト本体(GitHub Pages)

`main` ブランチへのpushで [.github/workflows/deploy.yml](./.github/workflows/deploy.yml) が自動実行され、`npm run build` の成果物(`dist/`)がGitHub Pagesに公開される。初回のみ以下の手動設定が必要。

1. リポジトリの Settings → Pages → Source を「GitHub Actions」にする
2. Settings → Secrets and variables → Actions に、`.env.local` と同じ `VITE_FIREBASE_*` の値をリポジトリシークレットとして登録する(`VITE_FIREBASE_API_KEY` など6つ)
3. Firebaseコンソール → Authentication → Settings → 承認済みドメイン に `<GitHubユーザー名>.github.io` を追加する(Googleログインを許可するため)

公開URLは `https://<GitHubユーザー名>.github.io/code-note/`。SPAのルーティング(React Router)に対応するため、ビルド後に `dist/index.html` を `dist/404.html` としても複製している([package.json](./package.json) の `postbuild`)。

### Firestore / Storage セキュリティルール

```bash
npm install -g firebase-tools   # 未インストールの場合
firebase login
firebase deploy --only firestore:rules,storage
```

`.firebaserc` の `default` に自分のFirebaseプロジェクトIDを設定してから実行する。
