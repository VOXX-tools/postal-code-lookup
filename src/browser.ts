/**
 * ブラウザ用エントリーポイント
 */

import { DataSourceManager } from './services/DataSourceManager';
import { PostalCodeSearchService } from './services/PostalCodeSearchService';
import { AutocompleteService } from './services/AutocompleteService';
import { SearchForm } from './ui/SearchForm';
import { DataSourceType, DataSourceConfig } from './types';

/**
 * アプリケーション設定（ブラウザ用）
 */
const config: DataSourceConfig = {
  type: DataSourceType.CSV,
  csvFilePath: './data/postal-codes.csv',
  timeout: 2000
};

/**
 * DOMContentLoaded時にアプリケーションを初期化
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('郵便番号検索システムを初期化しています...');
  
  try {
    // データソースマネージャーの初期化
    const dataSourceManager = new DataSourceManager(config);
    
    // サービスの初期化
    const searchService = new PostalCodeSearchService(dataSourceManager);
    const autocompleteService = new AutocompleteService(dataSourceManager);
    
    // UIコンポーネントの初期化
    const searchForm = new SearchForm(searchService, autocompleteService);
    
    // DOMにマウント
    const appContainer = document.getElementById('app');
    if (appContainer) {
      searchForm.render(appContainer);
      console.log('アプリケーションの準備ができました。');
    } else {
      console.error('アプリケーションコンテナ (#app) が見つかりません。');
    }
  } catch (error) {
    console.error('初期化エラー:', error);
  }
});
