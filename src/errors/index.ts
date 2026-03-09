/**
 * カスタムエラークラス
 * 郵便番号検索システムで使用されるエラー型
 */

/**
 * ベースエラークラス
 */
export class PostalCodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PostalCodeError';
    Object.setPrototypeOf(this, PostalCodeError.prototype);
  }
}

/**
 * ネットワークエラー
 */
export class NetworkError extends PostalCodeError {
  constructor(message: string = 'ネットワーク接続を確認してください') {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * APIエラー
 */
export class APIError extends PostalCodeError {
  constructor(
    message: string = '郵便番号の取得に失敗しました。しばらくしてから再度お試しください'
  ) {
    super(message);
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * 入力検証エラー
 */
export class ValidationError extends PostalCodeError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * タイムアウトエラー
 */
export class TimeoutError extends PostalCodeError {
  constructor(message: string = 'リクエストがタイムアウトしました。再度お試しください') {
    super(message);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * CSVファイルエラー
 */
export class CSVFileError extends PostalCodeError {
  constructor(message: string = 'CSVファイルの読み込みに失敗しました') {
    super(message);
    this.name = 'CSVFileError';
    Object.setPrototypeOf(this, CSVFileError.prototype);
  }
}

/**
 * データソースエラー
 */
export class DataSourceError extends PostalCodeError {
  constructor(message: string = 'データソースが利用できません') {
    super(message);
    this.name = 'DataSourceError';
    Object.setPrototypeOf(this, DataSourceError.prototype);
  }
}
