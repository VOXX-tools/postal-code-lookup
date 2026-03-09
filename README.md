# 郵便番号検索システム

市区町村名から郵便番号を検索するWebアプリケーションです。指定された市区町村に属するすべての郵便番号をカンマ区切り形式で出力します。

## 特徴

- 🔍 **市区町村名による検索**: 市区町村名を入力するだけで、その地域のすべての郵便番号を一度に取得
- 💡 **オートコンプリート機能**: 入力中に候補が表示され、正確な名称を素早く選択可能
- 📊 **カンマ区切り出力**: 検索結果はコピー&ペーストしやすいカンマ区切り形式で表示
- 🔄 **複数データソース対応**: 日本郵便公式APIまたはCSVファイルから選択可能
- 🛡️ **セキュリティ対策**: XSS攻撃対策、入力サニタイゼーション、HTTPS通信
- ⚡ **高速応答**: 2秒以内の検索・オートコンプリート応答

## 必要要件

- Node.js 14.x 以上
- npm 6.x 以上

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd postal-code-lookup
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. データソースの設定

#### オプションA: CSVファイルを使用（推奨）

1. 日本郵便の郵便番号データをダウンロード:
   - [日本郵便 郵便番号データダウンロード](https://www.post.japanpost.jp/zipcode/download.html)

2. CSVファイルを `data/postal-codes.csv` に配置

3. 環境変数を設定:

```bash
export DATA_SOURCE_TYPE=CSV
export CSV_FILE_PATH=./data/postal-codes.csv
```

#### オプションB: 日本郵便APIを使用

```bash
export DATA_SOURCE_TYPE=API
export API_ENDPOINT=https://zipcloud.ibsnet.co.jp/api
```

### 4. アプリケーションのビルド

```bash
npm run build
```

### 5. アプリケーションの起動

```bash
npm start
```

ブラウザで `http://localhost:3000` を開いてアプリケーションにアクセスします。

## 使用方法

### 基本的な検索

1. 入力フィールドに市区町村名を入力（例: 「札幌市中央区」）
2. オートコンプリート候補から選択するか、そのまま入力を続ける
3. 「検索」ボタンをクリック
4. 結果がカンマ区切り形式で表示されます

### 入力形式

以下の形式で入力できます:

- **市区町村名のみ**: `千代田区`
- **都道府県名+市区町村名**: `東京都千代田区`

### 出力形式

検索結果は以下の形式で表示されます:

```
100-0001,100-0002,100-0003,100-0004,100-0005
```

## 環境変数

| 変数名 | 説明 | デフォルト値 | 必須 |
|--------|------|-------------|------|
| `DATA_SOURCE_TYPE` | データソースタイプ (`API` または `CSV`) | `CSV` | いいえ |
| `API_ENDPOINT` | 日本郵便APIのエンドポイント | `https://zipcloud.ibsnet.co.jp/api` | API使用時のみ |
| `CSV_FILE_PATH` | CSVファイルのパス | `./data/postal-codes.csv` | CSV使用時のみ |
| `REQUEST_TIMEOUT` | リクエストタイムアウト（ミリ秒） | `2000` | いいえ |

## 開発

### テストの実行

```bash
# すべてのテストを実行
npm test

# ユニットテストのみ
npm run test:unit

# プロパティベーステストのみ
npm run test:property

# 統合テスト
npm run test:integration

# カバレッジレポート
npm run test:coverage
```

### 開発サーバーの起動

```bash
npm run dev
```

### コードのリント

```bash
npm run lint
```

### コードのフォーマット

```bash
npm run format
```

## プロジェクト構造

```
postal-code-lookup/
├── src/
│   ├── datasources/          # データソース層
│   │   ├── JapanPostAPIClient.ts
│   │   ├── CSVDataReader.ts
│   │   └── __tests__/
│   ├── services/             # サービス層
│   │   ├── DataSourceManager.ts
│   │   ├── PostalCodeSearchService.ts
│   │   ├── AutocompleteService.ts
│   │   ├── ErrorHandler.ts
│   │   └── __tests__/
│   ├── ui/                   # UI層
│   │   ├── SearchForm.ts
│   │   ├── AutocompleteInput.ts
│   │   ├── ResultDisplay.ts
│   │   └── __tests__/
│   ├── types/                # 型定義
│   ├── errors/               # エラークラス
│   ├── __tests__/            # 統合テスト
│   └── index.ts              # エントリーポイント
├── data/                     # データファイル
│   └── postal-codes.csv
├── public/                   # 静的ファイル
│   └── index.html
├── dist/                     # ビルド出力
├── .kiro/                    # 仕様ドキュメント
│   └── specs/
│       └── postal-code-lookup/
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## アーキテクチャ

このアプリケーションは3層アーキテクチャで構成されています:

### データソース層
- **JapanPostAPIClient**: 日本郵便公式APIとの通信
- **CSVDataReader**: CSVファイルからのデータ読み込み

### サービス層
- **DataSourceManager**: データソースの管理と切り替え
- **PostalCodeSearchService**: 郵便番号検索のビジネスロジック
- **AutocompleteService**: オートコンプリート機能
- **ErrorHandler**: エラーハンドリング

### UI層
- **SearchForm**: 検索フォームコンポーネント
- **AutocompleteInput**: オートコンプリート入力コンポーネント
- **ResultDisplay**: 結果表示コンポーネント

## データソース設定ガイド

### CSVファイルフォーマット

日本郵便標準フォーマットに対応しています:

```csv
全国地方公共団体コード,郵便番号,郵便番号(カナ),都道府県名(カナ),市区町村名(カナ),町域名(カナ),都道府県名,市区町村名,町域名,...
01101,"060  ","0600000","ホッカイドウ","サッポロシチュウオウク","イカニケイサイガナイバアイ","北海道","札幌市中央区","以下に掲載がない場合",...
```

### APIエンドポイント

日本郵便公式APIを使用する場合:

- エンドポイント: `https://zipcloud.ibsnet.co.jp/api/search`
- メソッド: GET
- パラメータ: `zipcode` (郵便番号)

## セキュリティ

- ✅ HTTPS通信のみ使用
- ✅ 入力のサニタイゼーション
- ✅ XSS攻撃対策
- ✅ SQLインジェクション対策
- ✅ ディレクトリトラバーサル対策

## パフォーマンス

- 検索応答時間: 2秒以内
- オートコンプリート応答時間: 2秒以内
- 想定利用量: 1日100件未満

## トラブルシューティング

### CSVファイルが読み込めない

```bash
# ファイルパスを確認
ls -la data/postal-codes.csv

# 環境変数を確認
echo $CSV_FILE_PATH
```

### APIリクエストが失敗する

```bash
# ネットワーク接続を確認
curl https://zipcloud.ibsnet.co.jp/api/search?zipcode=1000001

# 環境変数を確認
echo $API_ENDPOINT
```

### テストが失敗する

```bash
# 依存関係を再インストール
rm -rf node_modules package-lock.json
npm install

# キャッシュをクリア
npm run test -- --clearCache
```

## ライセンス

MIT License

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## サポート

問題が発生した場合は、GitHubのissueを作成してください。

## 更新履歴

### v1.0.0 (2024-01-XX)
- 初回リリース
- 市区町村名による郵便番号検索機能
- オートコンプリート機能
- 複数データソース対応（API/CSV）
- セキュリティ対策実装
