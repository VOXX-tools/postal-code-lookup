# デプロイ手順書

このドキュメントは、郵便番号検索システムのデプロイ手順を説明します。

## 前提条件

- Node.js 14.x 以上がインストールされていること
- npm 6.x 以上がインストールされていること
- 本番環境へのアクセス権限があること

## デプロイ手順

### 1. 環境変数の設定

`.env` ファイルを作成し、環境変数を設定します:

```bash
cp .env.example .env
```

`.env` ファイルを編集:

```bash
# 本番環境用の設定
DATA_SOURCE_TYPE=CSV
CSV_FILE_PATH=./data/postal-codes.csv
REQUEST_TIMEOUT=2000
PORT=3000
NODE_ENV=production
```

### 2. 依存関係のインストール

```bash
npm ci
```

### 3. ビルド

```bash
npm run build
```

### 4. テストの実行

デプロイ前にすべてのテストが成功することを確認:

```bash
npm test
```

### 5. 本番環境へのデプロイ

#### オプションA: 手動デプロイ

```bash
# ビルド成果物を本番サーバーにコピー
scp -r dist/ user@production-server:/var/www/postal-code-lookup/
scp -r data/ user@production-server:/var/www/postal-code-lookup/
scp package.json user@production-server:/var/www/postal-code-lookup/
scp .env user@production-server:/var/www/postal-code-lookup/

# 本番サーバーで依存関係をインストール
ssh user@production-server
cd /var/www/postal-code-lookup
npm ci --production

# アプリケーションを起動
npm start
```

#### オプションB: Docker デプロイ

```bash
# Dockerイメージをビルド
docker build -t postal-code-lookup:latest .

# コンテナを起動
docker run -d \
  --name postal-code-lookup \
  -p 3000:3000 \
  -e DATA_SOURCE_TYPE=CSV \
  -e CSV_FILE_PATH=/app/data/postal-codes.csv \
  -v $(pwd)/data:/app/data \
  postal-code-lookup:latest
```

### 6. 動作確認

デプロイ後、以下を確認:

```bash
# ヘルスチェック
curl http://localhost:3000/health

# 検索機能のテスト
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"municipalityName":"札幌市中央区"}'
```

## ロールバック手順

問題が発生した場合のロールバック:

```bash
# 前のバージョンに戻す
cd /var/www/postal-code-lookup
git checkout <previous-version-tag>
npm ci --production
npm run build
npm start
```

## 監視とログ

### ログの確認

```bash
# アプリケーションログ
tail -f /var/log/postal-code-lookup/app.log

# エラーログ
tail -f /var/log/postal-code-lookup/error.log
```

### 監視項目

- アプリケーションの稼働状態
- 応答時間（2秒以内）
- エラー率
- メモリ使用量
- CPU使用率

## トラブルシューティング

### アプリケーションが起動しない

```bash
# ログを確認
cat /var/log/postal-code-lookup/error.log

# 環境変数を確認
cat .env

# ポートが使用中でないか確認
lsof -i :3000
```

### 検索が遅い

```bash
# データソースを確認
echo $DATA_SOURCE_TYPE

# CSVファイルのサイズを確認
ls -lh data/postal-codes.csv

# メモリ使用量を確認
free -h
```

### データが見つからない

```bash
# CSVファイルの存在を確認
ls -la data/postal-codes.csv

# ファイルの内容を確認
head -n 5 data/postal-codes.csv
```

## セキュリティチェックリスト

デプロイ前に以下を確認:

- [ ] HTTPS通信が有効になっている
- [ ] 環境変数に機密情報が含まれていない
- [ ] ファイアウォールが適切に設定されている
- [ ] 不要なポートが閉じられている
- [ ] ログに機密情報が出力されていない
- [ ] 入力サニタイゼーションが有効になっている
- [ ] XSS対策が実装されている

## パフォーマンスチェックリスト

- [ ] 検索応答時間が2秒以内
- [ ] オートコンプリート応答時間が2秒以内
- [ ] メモリ使用量が適切な範囲内
- [ ] CPU使用率が適切な範囲内

## バックアップ

### データのバックアップ

```bash
# CSVファイルのバックアップ
cp data/postal-codes.csv data/postal-codes.csv.backup.$(date +%Y%m%d)

# 定期バックアップの設定（cron）
0 2 * * * cp /var/www/postal-code-lookup/data/postal-codes.csv /backup/postal-codes.csv.$(date +\%Y\%m\%d)
```

## 更新手順

新しいバージョンへの更新:

```bash
# 最新のコードを取得
git pull origin main

# 依存関係を更新
npm ci

# ビルド
npm run build

# テスト
npm test

# アプリケーションを再起動
npm restart
```

## サポート

問題が発生した場合は、以下の情報を含めてサポートチームに連絡してください:

- エラーメッセージ
- ログファイル
- 環境変数の設定（機密情報を除く）
- 再現手順
