"use strict";
/**
 * エラーハンドラー
 * システム全体のエラー処理を統一的に管理
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const constants_1 = require("../constants");
const errors_1 = require("../errors");
/**
 * エラーハンドラークラス
 */
class ErrorHandler {
    /**
     * エラーを処理してErrorResponseを生成
     * @param error エラーオブジェクト
     * @returns エラーレスポンス
     */
    static handleError(error) {
        if (error instanceof errors_1.NetworkError) {
            return {
                errorCode: constants_1.ERROR_CODES.NETWORK_ERROR,
                errorMessage: error.message,
                timestamp: new Date(),
            };
        }
        if (error instanceof errors_1.APIError) {
            return {
                errorCode: constants_1.ERROR_CODES.API_ERROR,
                errorMessage: error.message,
                timestamp: new Date(),
            };
        }
        if (error instanceof errors_1.ValidationError) {
            return {
                errorCode: constants_1.ERROR_CODES.VALIDATION_ERROR,
                errorMessage: error.message,
                timestamp: new Date(),
            };
        }
        if (error instanceof errors_1.TimeoutError) {
            return {
                errorCode: constants_1.ERROR_CODES.TIMEOUT_ERROR,
                errorMessage: error.message,
                timestamp: new Date(),
            };
        }
        if (error instanceof errors_1.CSVFileError) {
            return {
                errorCode: constants_1.ERROR_CODES.CSV_FILE_ERROR,
                errorMessage: error.message,
                timestamp: new Date(),
            };
        }
        if (error instanceof errors_1.DataSourceError) {
            return {
                errorCode: constants_1.ERROR_CODES.DATA_SOURCE_ERROR,
                errorMessage: error.message,
                timestamp: new Date(),
            };
        }
        // デフォルトエラー
        return {
            errorCode: constants_1.ERROR_CODES.UNKNOWN_ERROR,
            errorMessage: constants_1.ERROR_MESSAGES.UNKNOWN_ERROR,
            timestamp: new Date(),
        };
    }
    /**
     * エラーをログに記録
     * @param error エラーオブジェクト
     * @param context 追加のコンテキスト情報
     */
    static logError(error, context) {
        const errorResponse = this.handleError(error);
        console.error('Error occurred:', {
            ...errorResponse,
            context,
            stack: error.stack,
        });
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=errorHandler.js.map