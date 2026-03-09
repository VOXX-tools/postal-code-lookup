"use strict";
/**
 * 郵便番号検索システム - メインエントリーポイント
 *
 * このファイルは、すべてのコンポーネントを統合し、
 * アプリケーションを初期化します。
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.initializeApp = initializeApp;
const DataSourceManager_1 = require("./services/DataSourceManager");
const PostalCodeSearchService_1 = require("./services/PostalCodeSearchService");
const AutocompleteService_1 = require("./services/AutocompleteService");
const SearchForm_1 = require("./ui/SearchForm");
const types_1 = require("./types");
const path_1 = __importDefault(require("path"));
/**
 * アプリケーション設定
 */
const config = {
    // デフォルトはCSVデータソース（開発環境用）
    type: process.env.DATA_SOURCE_TYPE === 'API' ? types_1.DataSourceType.API : types_1.DataSourceType.CSV,
    // API設定
    apiEndpoint: process.env.API_ENDPOINT || 'https://zipcloud.ibsnet.co.jp/api',
    // CSV設定
    csvFilePath: process.env.CSV_FILE_PATH || path_1.default.join(__dirname, '../data/postal-codes.csv'),
    // タイムアウト設定（ミリ秒）
    timeout: parseInt(process.env.REQUEST_TIMEOUT || '2000', 10)
};
exports.config = config;
/**
 * アプリケーションの初期化
 */
function initializeApp() {
    console.log('郵便番号検索システムを初期化しています...');
    console.log(`データソース: ${config.type}`);
    if (config.type === types_1.DataSourceType.API) {
        console.log(`API エンドポイント: ${config.apiEndpoint}`);
    }
    else {
        console.log(`CSV ファイルパス: ${config.csvFilePath}`);
    }
    console.log(`タイムアウト: ${config.timeout}ms`);
    // データソースマネージャーの初期化
    const dataSourceManager = new DataSourceManager_1.DataSourceManager(config);
    // サービスの初期化
    const searchService = new PostalCodeSearchService_1.PostalCodeSearchService(dataSourceManager);
    const autocompleteService = new AutocompleteService_1.AutocompleteService(dataSourceManager);
    // UIコンポーネントの初期化
    const searchForm = new SearchForm_1.SearchForm(searchService, autocompleteService);
    console.log('初期化完了！');
    console.log('アプリケーションの準備ができました。');
    // ブラウザ環境の場合、DOMにマウント
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        document.addEventListener('DOMContentLoaded', () => {
            const appContainer = document.getElementById('app');
            if (appContainer) {
                searchForm.mount(appContainer);
                console.log('UIがマウントされました。');
            }
            else {
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
//# sourceMappingURL=index.js.map