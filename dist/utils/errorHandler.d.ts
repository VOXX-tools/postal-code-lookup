/**
 * エラーハンドラー
 * システム全体のエラー処理を統一的に管理
 */
import { ErrorResponse } from '../types';
/**
 * エラーハンドラークラス
 */
export declare class ErrorHandler {
    /**
     * エラーを処理してErrorResponseを生成
     * @param error エラーオブジェクト
     * @returns エラーレスポンス
     */
    static handleError(error: Error): ErrorResponse;
    /**
     * エラーをログに記録
     * @param error エラーオブジェクト
     * @param context 追加のコンテキスト情報
     */
    static logError(error: Error, context?: Record<string, unknown>): void;
}
//# sourceMappingURL=errorHandler.d.ts.map