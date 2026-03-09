/**
 * 郵便番号検索システム - メインエントリーポイント
 * 
 * このファイルは、すべてのコンポーネントを統合し、
 * アプリケーションを初期化します。
 */

import { DataSourceManager } from './services/DataSourceManager';
import { PostalCodeSearchService } from './services/PostalCodeSearchService';
import { AutocompleteService } from './services/AutocompleteService';
import { SearchForm } from './ui/SearchForm';
import { DataSourceType, DataSourceConfig } from './types';
import path from 'path';

/**
 * アプリケーション設定
 */
const config: DataSourceConfig = {
  // デフォルトはCSVデータソース（開発環境用）
  type: process.env.DATA_SOURCE_TYPE === 'API' ? DataSourceType.API : DataSourceType.CSV,
  
  // API設定
  apiEndpoint: process.env.API_ENDPOINT || 'https://zipcloud.ibsnet.co.jp/api',
  
  // CSV設定
  csvFilePath: process.env.CSV_FILE_PATH || path.join(__dirname, '../data/postal-codes.csv'),
  
  // タイムアウト設定（ミリ秒）
  timeout: parseInt(process.env.REQUEST_TIMEOUT || '2000', 10)
};

/**
 * アプリケーションの初期化
 */
function initializeApp(): void {
  console.log('郵便番号検索システムを初期化しています...');
  console.log(`データソース: ${config.type}`);
  
  if (config.type === DataSourceType.API) {
    console.log(`API エンドポイント: ${config.apiEndpoint}`);
  } else {
    console.log(`CSV ファイルパス: ${config.csvFilePath}`);
  }
  
  console.log(`タイムアウト: ${config.timeout}ms`);
  
  // データソースマネージャーの初期化
  const dataSourceManager = new DataSourceManager(config);
  
  // サービスの初期化
  const searchService = new PostalCodeSearchService(dataSourceManager);
  const autocompleteService = new AutocompleteService(dataSourceManager);
  
  // UIコンポーネントの初期化
  const searchForm = new SearchForm(searchService, autocompleteService);
  
  console.log('初期化完了！');
  console.log('アプリケーションの準備ができました。');
  
  // ブラウザ環境の場合、DOMにマウント
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      const appContainer = document.getElementById('app');
      if (appContainer) {
        searchForm.mount(appContainer);
        console.log('UIがマウントされました。');
      } else {
        console.error('アプリケーションコンテナ (#app) が見つかりません。');
      }
    });
  }
}

/**
 * エラーハンドリング
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('未処理のPromise拒否:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('未処理の例外:', error);
  process.exit(1);
});

// アプリケーションの起動
initializeApp();

// エクスポート（テスト用）
export { config, initializeApp };
