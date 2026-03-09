/**
 * ErrorHandler ユニットテスト
 */

import { ErrorHandler, ErrorResponse } from '../ErrorHandler';
import {
  NetworkError,
  APIError,
  ValidationError,
  TimeoutError,
  CSVFileError,
  DataSourceError,
  PostalCodeError
} from '../../errors';

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler();
  });

  describe('handleError', () => {
    it('NetworkErrorを適切に処理する', () => {
      const error = new NetworkError();
      const response = errorHandler.handleError(error);

      expect(response.errorCode).toBe('NETWORK_ERROR');
      expect(response.errorMessage).toBe('ネットワーク接続を確認してください');
      expect(response.timestamp).toBeInstanceOf(Date);
    });

    it('APIErrorを適切に処理する', () => {
      const error = new APIError();
      const response = errorHandler.handleError(error);

      expect(response.errorCode).toBe('API_ERROR');
      expect(response.errorMessage).toBe('郵便番号の取得に失敗しました。しばらくしてから再度お試しください');
      expect(response.timestamp).toBeInstanceOf(Date);
    });

    it('ValidationErrorを適切に処理する', () => {
      const error = new ValidationError('市区町村名を入力してください');
      const response = errorHandler.handleError(error);

      expect(response.errorCode).toBe('VALIDATION_ERROR');
      expect(response.errorMessage).toBe('市区町村名を入力してください');
      expect(response.timestamp).toBeInstanceOf(Date);
    });

    it('TimeoutErrorを適切に処理する', () => {
      const error = new TimeoutError();
      const response = errorHandler.handleError(error);

      expect(response.errorCode).toBe('TIMEOUT_ERROR');
      expect(response.errorMessage).toBe('リクエストがタイムアウトしました。再度お試しください');
      expect(response.timestamp).toBeInstanceOf(Date);
    });

    it('CSVFileErrorを適切に処理する', () => {
      const error = new CSVFileError();
      const response = errorHandler.handleError(error);

      expect(response.errorCode).toBe('CSV_FILE_ERROR');
      expect(response.errorMessage).toBe('CSVファイルの読み込みに失敗しました');
      expect(response.timestamp).toBeInstanceOf(Date);
    });

    it('DataSourceErrorを適切に処理する', () => {
      const error = new DataSourceError();
      const response = errorHandler.handleError(error);

      expect(response.errorCode).toBe('DATA_SOURCE_ERROR');
      expect(response.errorMessage).toBe('データソースが利用できません');
      expect(response.timestamp).toBeInstanceOf(Date);
    });

    it('PostalCodeErrorを適切に処理する', () => {
      const error = new PostalCodeError('カスタムエラーメッセージ');
      const response = errorHandler.handleError(error);

      expect(response.errorCode).toBe('POSTAL_CODE_ERROR');
      expect(response.errorMessage).toBe('カスタムエラーメッセージ');
      expect(response.timestamp).toBeInstanceOf(Date);
    });

    it('未知のエラーを適切に処理する', () => {
      const error = new Error('未知のエラー');
      const response = errorHandler.handleError(error);

      expect(response.errorCode).toBe('UNKNOWN_ERROR');
      expect(response.errorMessage).toBe('エラーが発生しました。再度お試しください');
      expect(response.timestamp).toBeInstanceOf(Date);
    });

    it('カスタムメッセージを持つNetworkErrorを処理する', () => {
      const error = new NetworkError('カスタムネットワークエラー');
      const response = errorHandler.handleError(error);

      expect(response.errorCode).toBe('NETWORK_ERROR');
      expect(response.errorMessage).toBe('カスタムネットワークエラー');
    });

    it('カスタムメッセージを持つAPIErrorを処理する', () => {
      const error = new APIError('カスタムAPIエラー');
      const response = errorHandler.handleError(error);

      expect(response.errorCode).toBe('API_ERROR');
      expect(response.errorMessage).toBe('カスタムAPIエラー');
    });
  });

  describe('ログ記録機能', () => {
    it('エラーをログに記録する', () => {
      const error = new NetworkError();
      errorHandler.handleError(error);

      const logs = errorHandler.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].errorCode).toBe('NETWORK_ERROR');
    });

    it('複数のエラーをログに記録する', () => {
      errorHandler.handleError(new NetworkError());
      errorHandler.handleError(new APIError());
      errorHandler.handleError(new ValidationError('テスト'));

      const logs = errorHandler.getLogs();
      expect(logs).toHaveLength(3);
      expect(logs[0].errorCode).toBe('NETWORK_ERROR');
      expect(logs[1].errorCode).toBe('API_ERROR');
      expect(logs[2].errorCode).toBe('VALIDATION_ERROR');
    });

    it('ログをクリアできる', () => {
      errorHandler.handleError(new NetworkError());
      errorHandler.handleError(new APIError());

      expect(errorHandler.getLogs()).toHaveLength(2);

      errorHandler.clearLogs();

      expect(errorHandler.getLogs()).toHaveLength(0);
    });

    it('特定のエラーコードでログをフィルタリングできる', () => {
      errorHandler.handleError(new NetworkError());
      errorHandler.handleError(new APIError());
      errorHandler.handleError(new NetworkError());
      errorHandler.handleError(new ValidationError('テスト'));

      const networkLogs = errorHandler.getLogsByErrorCode('NETWORK_ERROR');
      expect(networkLogs).toHaveLength(2);
      expect(networkLogs.every(log => log.errorCode === 'NETWORK_ERROR')).toBe(true);
    });

    it('日付範囲でログをフィルタリングできる', () => {
      const startDate = new Date();
      
      errorHandler.handleError(new NetworkError());
      
      // 少し待機
      const middleDate = new Date(Date.now() + 10);
      
      errorHandler.handleError(new APIError());
      
      const endDate = new Date(Date.now() + 20);

      const logs = errorHandler.getLogsByDateRange(startDate, endDate);
      expect(logs.length).toBeGreaterThan(0);
      expect(logs.every(log => log.timestamp >= startDate && log.timestamp <= endDate)).toBe(true);
    });

    it('ログの配列は元の配列のコピーである', () => {
      errorHandler.handleError(new NetworkError());
      
      const logs1 = errorHandler.getLogs();
      const logs2 = errorHandler.getLogs();

      expect(logs1).not.toBe(logs2); // 異なる配列インスタンス
      expect(logs1).toEqual(logs2); // 同じ内容
    });
  });

  describe('エラーメッセージの日本語対応', () => {
    it('すべてのエラータイプが日本語メッセージを持つ', () => {
      const errors = [
        new NetworkError(),
        new APIError(),
        new ValidationError('テスト'),
        new TimeoutError(),
        new CSVFileError(),
        new DataSourceError()
      ];

      errors.forEach(error => {
        const response = errorHandler.handleError(error);
        // 日本語文字が含まれていることを確認
        expect(response.errorMessage).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
      });
    });

    it('NetworkErrorのデフォルトメッセージが正しい', () => {
      const error = new NetworkError();
      const response = errorHandler.handleError(error);
      expect(response.errorMessage).toBe('ネットワーク接続を確認してください');
    });

    it('APIErrorのデフォルトメッセージが正しい', () => {
      const error = new APIError();
      const response = errorHandler.handleError(error);
      expect(response.errorMessage).toBe('郵便番号の取得に失敗しました。しばらくしてから再度お試しください');
    });

    it('TimeoutErrorのデフォルトメッセージが正しい', () => {
      const error = new TimeoutError();
      const response = errorHandler.handleError(error);
      expect(response.errorMessage).toBe('リクエストがタイムアウトしました。再度お試しください');
    });

    it('CSVFileErrorのデフォルトメッセージが正しい', () => {
      const error = new CSVFileError();
      const response = errorHandler.handleError(error);
      expect(response.errorMessage).toBe('CSVファイルの読み込みに失敗しました');
    });

    it('DataSourceErrorのデフォルトメッセージが正しい', () => {
      const error = new DataSourceError();
      const response = errorHandler.handleError(error);
      expect(response.errorMessage).toBe('データソースが利用できません');
    });

    it('未知のエラーのデフォルトメッセージが正しい', () => {
      const error = new Error('test');
      const response = errorHandler.handleError(error);
      expect(response.errorMessage).toBe('エラーが発生しました。再度お試しください');
    });
  });

  describe('タイムスタンプ', () => {
    it('エラー処理時に現在時刻のタイムスタンプが設定される', () => {
      const beforeTime = new Date();
      const error = new NetworkError();
      const response = errorHandler.handleError(error);
      const afterTime = new Date();

      expect(response.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(response.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('各エラーに独立したタイムスタンプが設定される', () => {
      const response1 = errorHandler.handleError(new NetworkError());
      
      // 少し待機
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      return delay(10).then(() => {
        const response2 = errorHandler.handleError(new APIError());
        
        expect(response2.timestamp.getTime()).toBeGreaterThanOrEqual(response1.timestamp.getTime());
      });
    });
  });
});
