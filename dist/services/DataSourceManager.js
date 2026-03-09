"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSourceManager = void 0;
const types_1 = require("../types");
const CSVDataReader_1 = require("../datasources/CSVDataReader");
const JapanPostAPIClient_1 = require("../datasources/JapanPostAPIClient");
const errors_1 = require("../errors");
/**
 * データソースマネージャー
 * データソースの選択と管理を行う
 */
class DataSourceManager {
    constructor(config) {
        this.currentDataSource = null;
        this.config = config;
        this.initializeDataSource();
    }
    /**
     * データソースを初期化
     */
    initializeDataSource() {
        this.setDataSource(this.config.type);
    }
    /**
     * 現在のデータソースを取得
     * @returns データソース
     * @throws {DataSourceError} データソースが設定されていない場合
     */
    getDataSource() {
        if (!this.currentDataSource) {
            throw new errors_1.DataSourceError('データソースが設定されていません');
        }
        return this.currentDataSource;
    }
    /**
     * データソースを設定
     * @param type データソースタイプ
     * @throws {DataSourceError} データソースの設定に失敗した場合
     */
    setDataSource(type) {
        try {
            switch (type) {
                case types_1.DataSourceType.API:
                    this.currentDataSource = this.createAPIDataSource();
                    break;
                case types_1.DataSourceType.CSV:
                    this.currentDataSource = this.createCSVDataSource();
                    break;
                default:
                    throw new errors_1.DataSourceError(`サポートされていないデータソースタイプ: ${type}`);
            }
            // 設定を更新
            this.config.type = type;
        }
        catch (error) {
            if (error instanceof errors_1.DataSourceError) {
                throw error;
            }
            throw new errors_1.DataSourceError(`データソースの設定に失敗しました: ${error.message}`);
        }
    }
    /**
     * APIデータソースを作成
     * @returns APIクライアント
     * @throws {DataSourceError} API設定が不正な場合
     */
    createAPIDataSource() {
        if (!this.config.apiEndpoint) {
            throw new errors_1.DataSourceError('APIエンドポイントが設定されていません');
        }
        return new JapanPostAPIClient_1.JapanPostAPIClient(this.config);
    }
    /**
     * CSVデータソースを作成
     * @returns CSVデータリーダー
     * @throws {DataSourceError} CSV設定が不正な場合
     */
    createCSVDataSource() {
        if (!this.config.csvFilePath) {
            throw new errors_1.DataSourceError('CSVファイルパスが設定されていません');
        }
        return new CSVDataReader_1.CSVDataReader(this.config.csvFilePath);
    }
    /**
     * データソースの有効性を確認
     * @returns 有効かどうか
     */
    validateDataSource() {
        try {
            const dataSource = this.getDataSource();
            return dataSource !== null;
        }
        catch {
            return false;
        }
    }
    /**
     * 現在のデータソースタイプを取得
     * @returns データソースタイプ
     */
    getCurrentDataSourceType() {
        return this.config.type;
    }
    /**
     * 設定を取得
     * @returns データソース設定
     */
    getConfig() {
        return { ...this.config };
    }
}
exports.DataSourceManager = DataSourceManager;
//# sourceMappingURL=DataSourceManager.js.map