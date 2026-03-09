/**
 * システム定数
 * 郵便番号検索システムで使用される定数値
 */

/**
 * エラーメッセージ
 */
export const ERROR_MESSAGES = {
  EMPTY_INPUT: '市区町村名を入力してください',
  INVALID_CHARACTERS: '無効な文字が含まれています',
  MUNICIPALITY_NOT_FOUND: '指定された市区町村が見つかりません',
  API_FAILURE: '郵便番号の取得に失敗しました。しばらくしてから再度お試しください',
  NETWORK_ERROR: 'ネットワーク接続を確認してください',
  TIMEOUT: 'リクエストがタイムアウトしました。再度お試しください',
  CSV_FILE_ERROR: 'CSVファイルの読み込みに失敗しました',
  NO_RESULTS: '該当する郵便番号が見つかりませんでした',
  DATA_SOURCE_UNAVAILABLE: 'データソースが利用できません',
  UNKNOWN_ERROR: 'エラーが発生しました。再度お試しください',
} as const;

/**
 * エラーコード
 */
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CSV_FILE_ERROR: 'CSV_FILE_ERROR',
  DATA_SOURCE_ERROR: 'DATA_SOURCE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * タイムアウト設定 (ミリ秒)
 */
export const TIMEOUTS = {
  API_REQUEST: 2000, // 2秒
  AUTOCOMPLETE: 2000, // 2秒
  DEFAULT: 5000, // 5秒
} as const;

/**
 * オートコンプリート設定
 */
export const AUTOCOMPLETE_CONFIG = {
  MAX_RESULTS: 10, // 最大候補数
  MIN_INPUT_LENGTH: 1, // 最小入力文字数
} as const;

/**
 * 郵便番号フォーマット
 */
export const POSTAL_CODE_FORMAT = {
  PATTERN: /^\d{3}-\d{4}$/, // XXX-XXXX形式
  SEPARATOR: ',', // カンマ区切り
} as const;

/**
 * 入力検証パターン
 */
export const VALIDATION_PATTERNS = {
  // 日本語文字（ひらがな、カタカナ、漢字）と一部の記号のみ許可
  VALID_CHARACTERS: /^[ぁ-んァ-ヶー一-龠々〆〤\s]+$/,
  // 郵便番号パターン
  POSTAL_CODE: /^\d{3}-?\d{4}$/,
} as const;

/**
 * データソース設定
 */
export const DATA_SOURCE_CONFIG = {
  DEFAULT_TYPE: 'API' as const,
  DEFAULT_TIMEOUT: TIMEOUTS.API_REQUEST,
} as const;
