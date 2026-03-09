/**
 * カスタムエラークラス
 * 郵便番号検索システムで使用されるエラー型
 */
/**
 * ベースエラークラス
 */
export declare class PostalCodeError extends Error {
    constructor(message: string);
}
/**
 * ネットワークエラー
 */
export declare class NetworkError extends PostalCodeError {
    constructor(message?: string);
}
/**
 * APIエラー
 */
export declare class APIError extends PostalCodeError {
    constructor(message?: string);
}
/**
 * 入力検証エラー
 */
export declare class ValidationError extends PostalCodeError {
    constructor(message: string);
}
/**
 * タイムアウトエラー
 */
export declare class TimeoutError extends PostalCodeError {
    constructor(message?: string);
}
/**
 * CSVファイルエラー
 */
export declare class CSVFileError extends PostalCodeError {
    constructor(message?: string);
}
/**
 * データソースエラー
 */
export declare class DataSourceError extends PostalCodeError {
    constructor(message?: string);
}
//# sourceMappingURL=index.d.ts.map