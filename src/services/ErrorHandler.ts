/**
 * ErrorHandler
 * エラーハンドリングとログ記録を担当するクラス
 */

import {
  PostalCodeError,
  NetworkError,
  APIError,
  ValidationError,
  TimeoutError,
  CSVFileError,
  DataSourceError
} from '../errors';

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
export class ErrorHandler {
  private logs: ErrorResponse[] = [];

  /**
   * エラーを処理し、適切なエラーレスポンスを返す
   * @param error - 処理するエラー
   * @returns エラーレスポンス
   */
  handleError(error: Error): ErrorResponse {
    let errorResponse: ErrorResponse;

    if (error instanceof NetworkError) {
      errorResponse = {
        errorCode: 'NETWORK_ERROR',
        errorMessage: error.message || 'ネットワーク接続を確認してください',
        timestamp: new Date()
      };
    } else if (error instanceof APIError) {
      errorResponse = {
        errorCode: 'API_ERROR',
        errorMessage: error.message || '郵便番号の取得に失敗しました。しばらくしてから再度お試しください',
        timestamp: new Date()
      };
    } else if (error instanceof ValidationError) {
      errorResponse = {
        errorCode: 'VALIDATION_ERROR',
        errorMessage: error.message,
        timestamp: new Date()
      };
    } else if (error instanceof TimeoutError) {
      errorResponse = {
        errorCode: 'TIMEOUT_ERROR',
        errorMessage: error.message || 'リクエストがタイムアウトしました。再度お試しください',
        timestamp: new Date()
      };
    } else if (error instanceof CSVFileError) {
      errorResponse = {
        errorCode: 'CSV_FILE_ERROR',
        errorMessage: error.message || 'CSVファイルの読み込みに失敗しました',
        timestamp: new Date()
      };
    } else if (error instanceof DataSourceError) {
      errorResponse = {
        errorCode: 'DATA_SOURCE_ERROR',
        errorMessage: error.message || 'データソースが利用できません',
        timestamp: new Date()
      };
    } else if (error instanceof PostalCodeError) {
      errorResponse = {
        errorCode: 'POSTAL_CODE_ERROR',
        errorMessage: error.message,
        timestamp: new Date()
      };
    } else {
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
  private logError(errorResponse: ErrorResponse): void {
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
  getLogs(): ErrorResponse[] {
    return [...this.logs];
  }

  /**
   * エラーログをクリアする
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * 特定のエラーコードのログを取得する
   * @param errorCode - 検索するエラーコード
   * @returns 該当するエラーログの配列
   */
  getLogsByErrorCode(errorCode: string): ErrorResponse[] {
    return this.logs.filter(log => log.errorCode === errorCode);
  }

  /**
   * 指定期間内のエラーログを取得する
   * @param startDate - 開始日時
   * @param endDate - 終了日時
   * @returns 該当するエラーログの配列
   */
  getLogsByDateRange(startDate: Date, endDate: Date): ErrorResponse[] {
    return this.logs.filter(
      log => log.timestamp >= startDate && log.timestamp <= endDate
    );
  }
}
