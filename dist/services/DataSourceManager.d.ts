import { IDataSourceManager, IDataSource, DataSourceType, DataSourceConfig } from '../types';
/**
 * データソースマネージャー
 * データソースの選択と管理を行う
 */
export declare class DataSourceManager implements IDataSourceManager {
    private currentDataSource;
    private config;
    constructor(config: DataSourceConfig);
    /**
     * データソースを初期化
     */
    private initializeDataSource;
    /**
     * 現在のデータソースを取得
     * @returns データソース
     * @throws {DataSourceError} データソースが設定されていない場合
     */
    getDataSource(): IDataSource;
    /**
     * データソースを設定
     * @param type データソースタイプ
     * @throws {DataSourceError} データソースの設定に失敗した場合
     */
    setDataSource(type: DataSourceType): void;
    /**
     * APIデータソースを作成
     * @returns APIクライアント
     * @throws {DataSourceError} API設定が不正な場合
     */
    private createAPIDataSource;
    /**
     * CSVデータソースを作成
     * @returns CSVデータリーダー
     * @throws {DataSourceError} CSV設定が不正な場合
     */
    private createCSVDataSource;
    /**
     * データソースの有効性を確認
     * @returns 有効かどうか
     */
    validateDataSource(): boolean;
    /**
     * 現在のデータソースタイプを取得
     * @returns データソースタイプ
     */
    getCurrentDataSourceType(): DataSourceType;
    /**
     * 設定を取得
     * @returns データソース設定
     */
    getConfig(): DataSourceConfig;
}
//# sourceMappingURL=DataSourceManager.d.ts.map