"use strict";
/**
 * システム定数
 * 郵便番号検索システムで使用される定数値
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATA_SOURCE_CONFIG = exports.VALIDATION_PATTERNS = exports.POSTAL_CODE_FORMAT = exports.AUTOCOMPLETE_CONFIG = exports.TIMEOUTS = exports.ERROR_CODES = exports.ERROR_MESSAGES = void 0;
/**
 * エラーメッセージ
 */
exports.ERROR_MESSAGES = {
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
};
/**
 * エラーコード
 */
exports.ERROR_CODES = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    API_ERROR: 'API_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    CSV_FILE_ERROR: 'CSV_FILE_ERROR',
    DATA_SOURCE_ERROR: 'DATA_SOURCE_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};
/**
 * タイムアウト設定 (ミリ秒)
 */
exports.TIMEOUTS = {
    API_REQUEST: 2000, // 2秒
    AUTOCOMPLETE: 2000, // 2秒
    DEFAULT: 5000, // 5秒
};
/**
 * オートコンプリート設定
 */
exports.AUTOCOMPLETE_CONFIG = {
    MAX_RESULTS: 10, // 最大候補数
    MIN_INPUT_LENGTH: 1, // 最小入力文字数
};
/**
 * 郵便番号フォーマット
 */
exports.POSTAL_CODE_FORMAT = {
    PATTERN: /^\d{3}-\d{4}$/, // XXX-XXXX形式
    SEPARATOR: ',', // カンマ区切り
};
/**
 * 入力検証パターン
 */
exports.VALIDATION_PATTERNS = {
    // 日本語文字（ひらがな、カタカナ、漢字）と一部の記号のみ許可
    VALID_CHARACTERS: /^[ぁ-んァ-ヶー一-龠々〆〤\s]+$/,
    // 郵便番号パターン
    POSTAL_CODE: /^\d{3}-?\d{4}$/,
};
/**
 * データソース設定
 */
exports.DATA_SOURCE_CONFIG = {
    DEFAULT_TYPE: 'API',
    DEFAULT_TIMEOUT: exports.TIMEOUTS.API_REQUEST,
};
//# sourceMappingURL=index.js.map