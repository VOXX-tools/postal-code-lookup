/**
 * ErrorHandler
 * エラーハンドリングとログ記録を担当するクラス
 */
/**
 * エラーレスポンス型
 */
export interface ErrorResponse {
    errorCode: string;
    errorMessage: string;
    timestamp: Date;
}
/**
 * エラーハンドラークラス
 * すべてのエラータイプに対する日本語メッセージを定義し、
 * エラーログ記録機能を提供します
 */
export declare class ErrorHandler {
    private logs;
    /**
     * エラーを処理し、適切なエラーレスポンスを返す
     * @param error - 処理するエラー
     * @returns エラーレスポンス
     */
    handleError(error: Error): ErrorResponse;
    /**
     * エラーログを記録する
     * @param errorResponse - 記録するエラーレスポンス
     */
    private logError;
    /**
     * 記録されたエラーログを取得する
     * @returns エラーログの配列
     */
    getLogs(): ErrorResponse[];
    /**
     * エラーログをクリアする
     */
    clearLogs(): void;
    /**
     * 特定のエラーコードのログを取得する
     * @param errorCode - 検索するエラーコード
     * @returns 該当するエラーログの配列
     */
    getLogsByErrorCode(errorCode: string): ErrorResponse[];
    /**
     * 指定期間内のエラーログを取得する
     * @param startDate - 開始日時
     * @param endDate - 終了日時
     * @returns 該当するエラーログの配列
     */
    getLogsByDateRange(startDate: Date, endDate: Date): ErrorResponse[];
}
//# sourceMappingURL=ErrorHandler.d.ts.map