"use strict";
/**
 * ErrorHandler
 * エラーハンドリングとログ記録を担当するクラス
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const errors_1 = require("../errors");
/**
 * エラーハンドラークラス
 * すべてのエラータイプに対する日本語メッセージを定義し、
 * エラーログ記録機能を提供します
 */
class ErrorHandler {
    constructor() {
        this.logs = [];
    }
    /**
     * エラーを処理し、適切なエラーレスポンスを返す
     * @param error - 処理するエラー
     * @returns エラーレスポンス
     */
    handleError(error) {
        let errorResponse;
        if (error instanceof errors_1.NetworkError) {
            errorResponse = {
                errorCode: 'NETWORK_ERROR',
                errorMessage: error.message || 'ネットワーク接続を確認してください',
                timestamp: new Date()
            };
        }
        else if (error instanceof errors_1.APIError) {
            errorResponse = {
                errorCode: 'API_ERROR',
                errorMessage: error.message || '郵便番号の取得に失敗しました。しばらくしてから再度お試しください',
                timestamp: new Date()
            };
        }
        else if (error instanceof errors_1.ValidationError) {
            errorResponse = {
                errorCode: 'VALIDATION_ERROR',
                errorMessage: error.message,
                timestamp: new Date()
            };
        }
        else if (error instanceof errors_1.TimeoutError) {
            errorResponse = {
                errorCode: 'TIMEOUT_ERROR',
                errorMessage: error.message || 'リクエストがタイムアウトしました。再度お試しください',
                timestamp: new Date()
            };
        }
        else if (error instanceof errors_1.CSVFileError) {
            errorResponse = {
                errorCode: 'CSV_FILE_ERROR',
                errorMessage: error.message || 'CSVファイルの読み込みに失敗しました',
                timestamp: new Date()
            };
        }
        else if (error instanceof errors_1.DataSourceError) {
            errorResponse = {
                errorCode: 'DATA_SOURCE_ERROR',
                errorMessage: error.message || 'データソースが利用できません',
                timestamp: new Date()
            };
        }
        else if (error instanceof errors_1.PostalCodeError) {
            errorResponse = {
                errorCode: 'POSTAL_CODE_ERROR',
                errorMessage: error.message,
                timestamp: new Date()
            };
        }
        else {
            // デフォルトエラー
            errorResponse = {
                errorCode: 'UNKNOWN_ERROR',
                errorMessage: 'エラーが発生しました。再度お試しください',
                timestamp: new Date()
            };
        }
        // エラーログを記録
        this.logError(errorResponse);
        return errorResponse;
    }
    /**
     * エラーログを記録する
     * @param errorResponse - 記録するエラーレスポンス
     */
    logError(errorResponse) {
        this.logs.push(errorResponse);
        // 開発環境ではコンソールにも出力
        if (process.env.NODE_ENV !== 'production') {
            console.error(`[${errorResponse.timestamp.toISOString()}] ${errorResponse.errorCode}: ${errorResponse.errorMessage}`);
        }
    }
    /**
     * 記録されたエラーログを取得する
     * @returns エラーログの配列
     */
    getLogs() {
        return [...this.logs];
    }
    /**
     * エラーログをクリアする
     */
    clearLogs() {
        this.logs = [];
    }
    /**
     * 特定のエラーコードのログを取得する
     * @param errorCode - 検索するエラーコード
     * @returns 該当するエラーログの配列
     */
    getLogsByErrorCode(errorCode) {
        return this.logs.filter(log => log.errorCode === errorCode);
    }
    /**
     * 指定期間内のエラーログを取得する
     * @param startDate - 開始日時
     * @param endDate - 終了日時
     * @returns 該当するエラーログの配列
     */
    getLogsByDateRange(startDate, endDate) {
        return this.logs.filter(log => log.timestamp >= startDate && log.timestamp <= endDate);
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=ErrorHandler.js.map