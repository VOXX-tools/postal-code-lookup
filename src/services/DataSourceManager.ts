import {
  IDataSourceManager,
  IDataSource,
  DataSourceType,
  DataSourceConfig
} from '../types';
import { CSVDataReader } from '../datasources/CSVDataReader';
import { JapanPostAPIClient } from '../datasources/JapanPostAPIClient';
import { DataSourceError } from '../errors';

/**
 * データソースマネージャー
 * データソースの選択と管理を行う
 */
export class DataSourceManager implements IDataSourceManager {
  private currentDataSource: IDataSource | null = null;
  private config: DataSourceConfig;

  constructor(config: DataSourceConfig) {
    this.config = config;
    this.initializeDataSource();
  }

  /**
   * データソースを初期化
   */
  private initializeDataSource(): void {
    this.setDataSource(this.config.type);
  }

  /**
   * 現在のデータソースを取得
   * @returns データソース
   * @throws {DataSourceError} データソースが設定されていない場合
   */
  getDataSource(): IDataSource {
    if (!this.currentDataSource) {
      throw new DataSourceError('データソースが設定されていません');
    }

    return this.currentDataSource;
  }

  /**
   * データソースを設定
   * @param type データソースタイプ
   * @throws {DataSourceError} データソースの設定に失敗した場合
   */
  setDataSource(type: DataSourceType): void {
    try {
      switch (type) {
        case DataSourceType.API:
          this.currentDataSource = this.createAPIDataSource();
          break;

        case DataSourceType.CSV:
          this.currentDataSource = this.createCSVDataSource();
          break;

        default:
          throw new DataSourceError(`サポートされていないデータソースタイプ: ${type}`);
      }

      // 設定を更新
      this.config.type = type;
    } catch (error) {
      if (error instanceof DataSourceError) {
        throw error;
      }
      throw new DataSourceError(
        `データソースの設定に失敗しました: ${(error as Error).message}`
      );
    }
  }

  /**
   * APIデータソースを作成
   * @returns APIクライアント
   * @throws {DataSourceError} API設定が不正な場合
   */
  private createAPIDataSource(): IDataSource {
    if (!this.config.apiEndpoint) {
      throw new DataSourceError('APIエンドポイントが設定されていません');
    }

    return new JapanPostAPIClient(this.config);
  }

  /**
   * CSVデータソースを作成
   * @returns CSVデータリーダー
   * @throws {DataSourceError} CSV設定が不正な場合
   */
  private createCSVDataSource(): IDataSource {
    if (!this.config.csvFilePath) {
      throw new DataSourceError('CSVファイルパスが設定されていません');
    }

    return new CSVDataReader(this.config.csvFilePath);
  }

  /**
   * データソースの有効性を確認
   * @returns 有効かどうか
   */
  validateDataSource(): boolean {
    try {
      const dataSource = this.getDataSource();
      return dataSource !== null;
    } catch {
      return false;
    }
  }

  /**
   * 現在のデータソースタイプを取得
   * @returns データソースタイプ
   */
  getCurrentDataSourceType(): DataSourceType {
    return this.config.type;
  }

  /**
   * 設定を取得
   * @returns データソース設定
   */
  getConfig(): DataSourceConfig {
    return { ...this.config };
  }
}
