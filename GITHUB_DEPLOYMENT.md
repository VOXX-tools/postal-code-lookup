# GitHub公開手順（初心者向け）

## 📋 目次
1. [事前準備](#事前準備)
2. [GitHubリポジトリの作成](#gitHubリポジトリの作成)
3. [ローカルでGitの設定](#ローカルでgitの設定)
4. [GitHubにコードをアップロード](#githubにコードをアップロード)
5. [GitHub Pagesで公開](#github-pagesで公開)
6. [社内メンバーへの共有](#社内メンバーへの共有)

---

## 事前準備

### 必要なもの
- ✅ GitHubアカウント（既にお持ちのようです）
- ✅ Gitコマンド（Macには標準でインストール済み）

### Gitの初期設定（初回のみ）

ターミナルで以下のコマンドを実行してください：

```bash
# あなたの名前を設定
git config --global user.name "あなたの名前"

# あなたのメールアドレスを設定（GitHubに登録したメールアドレス）
git config --global user.email "your-email@example.com"
```

---

## GitHubリポジトリの作成

### ステップ1: GitHubにログイン
1. ブラウザで https://github.com/orgs/VOXX-tools/repositories にアクセス
2. 右上の **「New repository」** ボタンをクリック

### ステップ2: リポジトリ情報を入力
以下の情報を入力してください：

- **Repository name**: `postal-code-lookup` （または好きな名前）
- **Description**: `日本の郵便番号検索ツール`
- **Public/Private**: 
  - **Public**: 誰でもアクセス可能（推奨）
  - **Private**: VOXX-toolsメンバーのみアクセス可能
- **Initialize this repository with**: 
  - ❌ **チェックを入れない**（既にローカルにコードがあるため）

### ステップ3: リポジトリを作成
- **「Create repository」** ボタンをクリック

---

## ローカルでGitの設定

ターミナルで以下のコマンドを順番に実行してください：

### ステップ1: プロジェクトディレクトリに移動
```bash
cd ~/my-tool
```

### ステップ2: Gitリポジトリを初期化
```bash
git init
```

### ステップ3: .gitignoreファイルを作成
不要なファイルをGitHubにアップロードしないようにします：

```bash
cat > .gitignore << 'EOF'
# 依存関係
node_modules/

# ビルド出力（distは公開するので除外しない）
# dist/

# ログファイル
*.log
npm-debug.log*

# 環境変数
.env
.env.local

# OS固有のファイル
.DS_Store
Thumbs.db

# エディタ設定
.vscode/
.idea/

# テストカバレッジ
coverage/

# Kiro設定（プロジェクト固有）
.kiro/
EOF
```

### ステップ4: すべてのファイルをステージング
```bash
git add .
```

### ステップ5: 最初のコミット
```bash
git commit -m "Initial commit: 郵便番号検索ツール"
```

---

## GitHubにコードをアップロード

### ステップ1: GitHubリポジトリのURLを確認
GitHubのリポジトリページに表示されているURLをコピーします。
例: `https://github.com/VOXX-tools/postal-code-lookup.git`

### ステップ2: リモートリポジトリを追加
```bash
# 以下のコマンドで、YOUR-REPO-NAMEを実際のリポジトリ名に置き換えてください
git remote add origin https://github.com/VOXX-tools/YOUR-REPO-NAME.git
```

例：
```bash
git remote add origin https://github.com/VOXX-tools/postal-code-lookup.git
```

### ステップ3: ブランチ名を変更（必要に応じて）
```bash
git branch -M main
```

### ステップ4: GitHubにプッシュ
```bash
git push -u origin main
```

**注意**: 初回プッシュ時にGitHubのユーザー名とパスワード（またはPersonal Access Token）を求められる場合があります。

---

## GitHub Pagesで公開

### ステップ1: GitHubリポジトリページにアクセス
ブラウザで `https://github.com/VOXX-tools/YOUR-REPO-NAME` にアクセス

### ステップ2: Settingsを開く
リポジトリページの上部にある **「Settings」** タブをクリック

### ステップ3: Pagesの設定
1. 左サイドバーの **「Pages」** をクリック
2. **「Source」** セクションで以下を選択：
   - **Branch**: `main`
   - **Folder**: `/dist/public` （または `/` を選択して後で調整）
3. **「Save」** ボタンをクリック

### ステップ4: 公開URLを確認
数分後、ページ上部に以下のようなメッセージが表示されます：
```
Your site is published at https://voxx-tools.github.io/YOUR-REPO-NAME/
```

このURLが郵便番号検索ツールの公開URLです！

---

## 社内メンバーへの共有

### 公開URLの共有
社内メンバーに以下のURLを共有してください：

```
https://voxx-tools.github.io/YOUR-REPO-NAME/app.html
```

**注意**: `/app.html` を忘れずに追加してください。

### アクセス方法
- **Publicリポジトリの場合**: 誰でもURLにアクセス可能
- **Privateリポジトリの場合**: VOXX-toolsメンバーのみアクセス可能

---

## 🔄 更新方法（今後の変更時）

コードを変更した後、以下のコマンドでGitHubに反映できます：

```bash
# 変更をステージング
git add .

# コミット（変更内容を簡潔に記述）
git commit -m "変更内容の説明"

# GitHubにプッシュ
git push
```

GitHub Pagesは自動的に更新されます（数分かかる場合があります）。

---

## ❓ トラブルシューティング

### 問題1: `git push` でエラーが出る
**原因**: 認証情報が必要
**解決策**: Personal Access Tokenを作成
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 「Generate new token」をクリック
3. `repo` にチェックを入れて生成
4. トークンをコピーして、パスワードの代わりに使用

### 問題2: GitHub Pagesが表示されない
**原因**: ファイルパスが間違っている
**解決策**: 
- Settings → Pages で `/` を選択
- URLに `/dist/public/app.html` を追加してアクセス

### 問題3: CSVファイルが読み込めない
**原因**: ファイルパスが相対パスになっている
**解決策**: `app.html` 内のCSVパスを確認
```javascript
// 正しいパス
const response = await fetch('../data/postal-codes.csv');
```

---

## 📞 サポート

問題が発生した場合は、以下の情報を確認してください：
- GitHubリポジトリURL
- エラーメッセージのスクリーンショット
- 実行したコマンドとその結果

---

## ✅ チェックリスト

公開前に以下を確認してください：

- [ ] Gitの初期設定完了
- [ ] GitHubリポジトリ作成完了
- [ ] ローカルでGit初期化完了
- [ ] GitHubにコードをプッシュ完了
- [ ] GitHub Pages設定完了
- [ ] 公開URLで動作確認完了
- [ ] 社内メンバーに共有完了

---

**次のステップ**: この手順書に従って、ターミナルで1つずつコマンドを実行してください。
