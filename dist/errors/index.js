"use strict";
/**
 * カスタムエラークラス
 * 郵便番号検索システムで使用されるエラー型
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSourceError = exports.CSVFileError = exports.TimeoutError = exports.ValidationError = exports.APIError = exports.NetworkError = exports.PostalCodeError = void 0;
/**
 * ベースエラークラス
 */
class PostalCodeError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PostalCodeError';
        Object.setPrototypeOf(this, PostalCodeError.prototype);
    }
}
exports.PostalCodeError = PostalCodeError;
/**
 * ネットワークエラー
 */
class NetworkError extends PostalCodeError {
    constructor(message = 'ネットワーク接続を確認してください') {
        super(message);
        this.name = 'NetworkError';
        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}
exports.NetworkError = NetworkError;
/**
 * APIエラー
 */
class APIError extends PostalCodeError {
    constructor(message = '郵便番号の取得に失敗しました。しばらくしてから再度お試しください') {
        super(message);
        this.name = 'APIError';
        Object.setPrototypeOf(this, APIError.prototype);
    }
}
exports.APIError = APIError;
/**
 * 入力検証エラー
 */
class ValidationError extends PostalCodeError {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
exports.ValidationError = ValidationError;
/**
 * タイムアウトエラー
 */
class TimeoutError extends PostalCodeError {
    constructor(message = 'リクエストがタイムアウトしました。再度お試しください') {
        super(message);
        this.name = 'TimeoutError';
        Object.setPrototypeOf(this, TimeoutError.prototype);
    }
}
exports.TimeoutError = TimeoutError;
/**
 * CSVファイルエラー
 */
class CSVFileError extends PostalCodeError {
    constructor(message = 'CSVファイルの読み込みに失敗しました') {
        super(message);
        this.name = 'CSVFileError';
        Object.setPrototypeOf(this, CSVFileError.prototype);
    }
}
exports.CSVFileError = CSVFileError;
/**
 * データソースエラー
 */
class DataSourceError extends PostalCodeError {
    constructor(message = 'データソースが利用できません') {
        super(message);
        this.name = 'DataSourceError';
        Object.setPrototypeOf(this, DataSourceError.prototype);
    }
}
exports.DataSourceError = DataSourceError;
//# sourceMappingURL=index.js.map