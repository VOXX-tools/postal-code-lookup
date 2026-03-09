/**
 * システム定数
 * 郵便番号検索システムで使用される定数値
 */
/**
 * エラーメッセージ
 */
export declare const ERROR_MESSAGES: {
    readonly EMPTY_INPUT: "市区町村名を入力してください";
    readonly INVALID_CHARACTERS: "無効な文字が含まれています";
    readonly MUNICIPALITY_NOT_FOUND: "指定された市区町村が見つかりません";
    readonly API_FAILURE: "郵便番号の取得に失敗しました。しばらくしてから再度お試しください";
    readonly NETWORK_ERROR: "ネットワーク接続を確認してください";
    readonly TIMEOUT: "リクエストがタイムアウトしました。再度お試しください";
    readonly CSV_FILE_ERROR: "CSVファイルの読み込みに失敗しました";
    readonly NO_RESULTS: "該当する郵便番号が見つかりませんでした";
    readonly DATA_SOURCE_UNAVAILABLE: "データソースが利用できません";
    readonly UNKNOWN_ERROR: "エラーが発生しました。再度お試しください";
};
/**
 * エラーコード
 */
export declare const ERROR_CODES: {
    readonly NETWORK_ERROR: "NETWORK_ERROR";
    readonly API_ERROR: "API_ERROR";
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly TIMEOUT_ERROR: "TIMEOUT_ERROR";
    readonly CSV_FILE_ERROR: "CSV_FILE_ERROR";
    readonly DATA_SOURCE_ERROR: "DATA_SOURCE_ERROR";
    readonly UNKNOWN_ERROR: "UNKNOWN_ERROR";
};
/**
 * タイムアウト設定 (ミリ秒)
 */
export declare const TIMEOUTS: {
    readonly API_REQUEST: 2000;
    readonly AUTOCOMPLETE: 2000;
    readonly DEFAULT: 5000;
};
/**
 * オートコンプリート設定
 */
export declare const AUTOCOMPLETE_CONFIG: {
    readonly MAX_RESULTS: 10;
    readonly MIN_INPUT_LENGTH: 1;
};
/**
 * 郵便番号フォーマット
 */
export declare const POSTAL_CODE_FORMAT: {
    readonly PATTERN: RegExp;
    readonly SEPARATOR: ",";
};
/**
 * 入力検証パターン
 */
export declare const VALIDATION_PATTERNS: {
    readonly VALID_CHARACTERS: RegExp;
    readonly POSTAL_CODE: RegExp;
};
/**
 * データソース設定
 */
export declare const DATA_SOURCE_CONFIG: {
    readonly DEFAULT_TYPE: "API";
    readonly DEFAULT_TIMEOUT: 2000;
};
//# sourceMappingURL=index.d.ts.map