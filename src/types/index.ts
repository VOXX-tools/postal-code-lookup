/**
 * 市区町村データ
 */
export interface Municipality {
  /** 都道府県名 (例: "東京都") */
  prefectureName: string;
  /** 市区町村名 (例: "千代田区") */
  municipalityName: string;
  /** 完全名称 (例: "東京都千代田区") */
  fullName: string;
}

/**
 * 郵便番号データ
 */
export interface PostalCodeData {
  /** 郵便番号 (例: "100-0001") */
  postalCode: string;
  /** 都道府県名 */
  prefectureName: string;
  /** 市区町村名 */
  municipalityName: string;
  /** 町域名 (例: "千代田") */
  townName: string;
}

/**
 * 検索リクエスト
 */
export interface SearchRequest {
  /** 検索する市区町村名 */
  municipalityName: string;
  /** 都道府県名を含むか */
  includePrefix: boolean;
}

/**
 * 検索レスポンス
 */
export interface SearchResponse {
  /** 検索成功フラグ */
  success: boolean;
  /** 郵便番号リスト */
  postalCodes: string[];
  /** カンマ区切り形式の出力 */
  formattedOutput: string;
  /** エラーメッセージ (失敗時) */
  errorMessage?: string;
}

/**
 * 郵便番号検索結果
 */
export interface PostalCodeResult {
  /** 郵便番号リスト */
  postalCodes: string[];
  /** 市区町村名 */
  municipalityName: string;
  /** 都道府県名 (オプション) */
  prefectureName?: string;
}

/**
 * 入力検証結果
 */
export interface ValidationResult {
  /** 有効かどうか */
  isValid: boolean;
  /** エラーメッセージ (無効時) */
  errorMessage?: string;
}

/**
 * オートコンプリートリクエスト
 */
export interface AutocompleteRequest {
  /** 入力文字列 */
  input: string;
  /** 最大候補数 */
  maxResults: number;
}

/**
 * オートコンプリートレスポンス
 */
export interface AutocompleteResponse {
  /** 候補リスト */
  suggestions: string[];
  /** さらに候補があるか */
  hasMore: boolean;
}

/**
 * データソースタイプ
 */
export enum DataSourceType {
  API = 'API',
  CSV = 'CSV'
}

/**
 * データソース設定
 */
export interface DataSourceConfig {
  /** データソースタイプ */
  type: DataSourceType;
  /** API URL (API使用時) */
  apiEndpoint?: string;
  /** CSVファイルパス (CSV使用時) */
  csvFilePath?: string;
  /** タイムアウト時間 (ミリ秒) */
  timeout: number;
}

/**
 * エラーレスポンス
 */
export interface ErrorResponse {
  /** エラーコード */
  errorCode: string;
  /** エラーメッセージ (日本語) */
  errorMessage: string;
  /** エラー発生時刻 */
  timestamp: Date;
}

/**
 * データソースインターフェース
 */
export interface IDataSource {
  /**
   * 市区町村名で郵便番号を取得
   * @param municipalityName 市区町村名
   * @returns 郵便番号リスト
   */
  fetchPostalCodes(municipalityName: string): Promise<string[]>;

  /**
   * 市区町村リストを取得
   * @returns 市区町村リスト
   */
  getMunicipalityList(): Promise<Municipality[]>;
}

/**
 * 郵便番号検索サービスインターフェース
 */
export interface IPostalCodeSearchService {
  /**
   * 市区町村名で検索
   * @param municipalityName 市区町村名
   * @returns 検索結果
   */
  searchByMunicipality(municipalityName: string): Promise<PostalCodeResult>;

  /**
   * 市区町村名を検証
   * @param name 市区町村名
   * @returns 検証結果
   */
  validateMunicipalityName(name: string): ValidationResult;
}

/**
 * オートコンプリートサービスインターフェース
 */
export interface IAutocompleteService {
  /**
   * 候補リストを取得
   * @param input 入力文字列
   * @returns 候補リスト
   */
  getSuggestions(input: string): Promise<string[]>;

  /**
   * 候補をフィルタリング
   * @param input 入力文字列
   * @param allMunicipalities すべての市区町村リスト
   * @returns フィルタリングされた候補リスト
   */
  filterSuggestions(input: string, allMunicipalities: Municipality[]): Municipality[];
}

/**
 * データソースマネージャーインターフェース
 */
export interface IDataSourceManager {
  /**
   * 現在のデータソースを取得
   * @returns データソース
   */
  getDataSource(): IDataSource;

  /**
   * データソースを設定
   * @param type データソースタイプ
   */
  setDataSource(type: DataSourceType): void;
}
