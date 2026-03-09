# 郵便番号検索ツール - デプロイガイド

## 🌐 Netlify へのデプロイ（推奨）

### 前提条件
- GitHubアカウント
- Netlifyアカウント（無料）

### 手順

#### 1. GitHubリポジトリの作成

1. [GitHub](https://github.com) にログイン
2. 「New repository」をクリック
3. リポジトリ名を入力（例：`postal-code-lookup`）
4. 「Private」を選択（社内ツールのため）
5. 「Create repository」をクリック

#### 2. コードをGitHubにプッシュ

ターミナルで以下のコマンドを実行：

```bash
cd ~/my-tool

# Gitリポジトリを初期化
git init

# .gitignoreファイルを作成
cat > .gitignore << 'EOF'
node_modules/
.DS_Store
*.log
EOF

# ファイルをステージング
git add .

# コミット
git commit -m "Initial commit: 郵便番号検索ツール"

# GitHubリポジトリと接続（URLは自分のリポジトリに置き換え）
git remote add origin https://github.com/[あなたのユーザー名]/postal-code-lookup.git

# プッシュ
git branch -M main
git push -u origin main
```

#### 3. Netlify でデプロイ

1. [Netlify](https://www.netlify.com/) にアクセス
2. 「Sign up」でアカウント作成（GitHubアカウントで連携可能）
3. 「Add new site」→「Import an existing project」をクリック
4. 「GitHub」を選択
5. 作成したリポジトリを選択
6. デプロイ設定：
   - **Base directory**: `dist/public`
   - **Build command**: （空欄のまま）
   - **Publish directory**: `.`（ドット）
7. 「Deploy site」をクリック

#### 4. デプロイ完了

数分後、Netlifyが自動的にURLを生成します：
```
https://[ランダムな文字列].netlify.app
```

このURLを社内メンバーに共有してください。

### カスタムドメインの設定（オプション）

Netlifyの管理画面から独自ドメインを設定できます：
1. 「Domain settings」をクリック
2. 「Add custom domain」で独自ドメインを追加

---

## 🔐 アクセス制限（オプション）

社内のみアクセス可能にする場合：

### 方法1: Netlify のパスワード保護（有料プラン）
Netlify Pro プラン（月$19）でパスワード保護が可能

### 方法2: Basic認証の追加

`dist/public/_headers` ファイルを作成：

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
```

---

## 📊 その他のデプロイオプション

### AWS S3 + CloudFront
- 高速、スケーラブル
- 月額数ドル程度
- 設定がやや複雑

### Vercel
- Netlifyと同様に簡単
- 無料プランあり
- GitHubと連携

### GitHub Pages
- 完全無料
- Publicリポジトリのみ（Privateは有料）

---

## 🔄 更新方法

コードを更新した場合：

```bash
cd ~/my-tool

# 変更をコミット
git add .
git commit -m "更新内容の説明"

# プッシュ
git push origin main
```

Netlifyが自動的に再デプロイします（約1-2分）。

---

## 📞 トラブルシューティング

### CSVファイルが読み込めない
- `dist/public/data/postal-codes.csv` が存在することを確認
- ファイルサイズが大きい場合、Netlifyの制限（100MB）を超えていないか確認

### 404エラーが出る
- `netlify.toml` ファイルが `dist/public/` に存在することを確認
- Netlifyの設定で Publish directory が正しいか確認

### デプロイが失敗する
- GitHubリポジトリに全ファイルがプッシュされているか確認
- Netlifyのビルドログを確認

---

## ✅ デプロイ完了チェックリスト

- [ ] GitHubリポジトリ作成
- [ ] コードをプッシュ
- [ ] Netlifyでデプロイ
- [ ] URLにアクセスして動作確認
- [ ] 社内メンバーにURL共有
- [ ] （オプション）カスタムドメイン設定
- [ ] （オプション）アクセス制限設定
