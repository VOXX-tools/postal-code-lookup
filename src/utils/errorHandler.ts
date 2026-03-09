/**
 * エラーハンドラー
 * システム全体のエラー処理を統一的に管理
 */

import { ErrorResponse } from '../types';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants';
import {
  NetworkError,
  APIError,
  ValidationError,
  TimeoutError,
  CSVFileError,
  DataSourceError,
} from '../errors';

/**
 * エラーハンドラークラス
 */
export class ErrorHandler {
  /**
   * エラーを処理してErrorResponseを生成
   * @param error エラーオブジェクト
   * @returns エラーレスポンス
   */
  static handleError(error: Error): ErrorResponse {
    if (error instanceof NetworkError) {
      return {
        errorCode: ERROR_CODES.NETWORK_ERROR,
        errorMessage: error.message,
        timestamp: new Date(),
      };
    }

    if (error instanceof APIError) {
      return {
        errorCode: ERROR_CODES.API_ERROR,
        errorMessage: error.message,
        timestamp: new Date(),
      };
    }

    if (error instanceof ValidationError) {
      return {
        errorCode: ERROR_CODES.VALIDATION_ERROR,
        errorMessage: error.message,
        timestamp: new Date(),
      };
    }

    if (error instanceof TimeoutError) {
      return {
        errorCode: ERROR_CODES.TIMEOUT_ERROR,
        errorMessage: error.message,
        timestamp: new Date(),
      };
    }

    if (error instanceof CSVFileError) {
      return {
        errorCode: ERROR_CODES.CSV_FILE_ERROR,
        errorMessage: error.message,
        timestamp: new Date(),
      };
    }

    if (error instanceof DataSourceError) {
      return {
        errorCode: ERROR_CODES.DATA_SOURCE_ERROR,
        errorMessage: error.message,
        timestamp: new Date(),
      };
    }

    // デフォルトエラー
    return {
      errorCode: ERROR_CODES.UNKNOWN_ERROR,
      errorMessage: ERROR_MESSAGES.UNKNOWN_ERROR,
      timestamp: new Date(),
    };
  }

  /**
   * エラーをログに記録
   * @param error エラーオブジェクト
   * @param context 追加のコンテキスト情報
   */
  static logError(error: Error, context?: Record<string, unknown>): void {
    const errorResponse = this.handleError(error);

    console.error('Error occurred:', {
      ...errorResponse,
      context,
      stack: error.stack,
    });
  }
}
