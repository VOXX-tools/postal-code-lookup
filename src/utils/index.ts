/**
 * ユーティリティ関数
 * 郵便番号検索システムで使用される共通関数
 */

import { POSTAL_CODE_FORMAT, VALIDATION_PATTERNS } from '../constants';

/**
 * 郵便番号リストをカンマ区切り形式に変換
 * @param postalCodes 郵便番号リスト
 * @returns カンマ区切り形式の文字列
 */
export function formatPostalCodes(postalCodes: string[]): string {
  return postalCodes.join(POSTAL_CODE_FORMAT.SEPARATOR);
}

/**
 * 入力文字列をサニタイズ
 * @param input 入力文字列
 * @returns サニタイズされた文字列
 */
export function sanitizeInput(input: string): string {
  // トリム処理
  let sanitized = input.trim();

  // 複数の空白を単一の空白に変換
  sanitized = sanitized.replace(/\s+/g, ' ');

  return sanitized;
}

/**
 * 入力文字列が有効な文字のみを含むか検証
 * @param input 入力文字列
 * @returns 有効な場合true
 */
export function isValidCharacters(input: string): boolean {
  if (!input || input.length === 0) {
    return false;
  }
  return VALIDATION_PATTERNS.VALID_CHARACTERS.test(input);
}

/**
 * 郵便番号が正しい形式か検証
 * @param postalCode 郵便番号
 * @returns 正しい形式の場合true
 */
export function isValidPostalCodeFormat(postalCode: string): boolean {
  return POSTAL_CODE_FORMAT.PATTERN.test(postalCode);
}

/**
 * 郵便番号を標準形式（XXX-XXXX）に変換
 * @param postalCode 郵便番号（ハイフンあり/なし）
 * @returns 標準形式の郵便番号
 */
export function normalizePostalCode(postalCode: string): string {
  // ハイフンを削除
  const digits = postalCode.replace(/-/g, '');

  // 7桁でない場合はそのまま返す
  if (digits.length !== 7) {
    return postalCode;
  }

  // XXX-XXXX形式に変換
  return `${digits.substring(0, 3)}-${digits.substring(3)}`;
}

/**
 * 市区町村名から都道府県名を抽出
 * @param fullName 完全名称（例: "東京都千代田区"）
 * @returns 都道府県名と市区町村名のタプル
 */
export function extractPrefectureAndMunicipality(
  fullName: string
): { prefecture: string; municipality: string } {
  // 都道府県パターン
  const prefecturePattern = /(.*?[都道府県])(.*)/;
  const match = fullName.match(prefecturePattern);

  if (match) {
    return {
      prefecture: match[1],
      municipality: match[2],
    };
  }

  // 都道府県名が含まれていない場合
  return {
    prefecture: '',
    municipality: fullName,
  };
}

/**
 * 配列から重複を除去
 * @param array 配列
 * @returns 重複を除去した配列
 */
export function removeDuplicates<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * 文字列が部分一致するか判定
 * @param target 対象文字列
 * @param query 検索文字列
 * @returns 部分一致する場合true
 */
export function includesIgnoreCase(target: string, query: string): boolean {
  return target.toLowerCase().includes(query.toLowerCase());
}

/**
 * タイムアウト付きPromise
 * @param promise Promise
 * @param timeoutMs タイムアウト時間（ミリ秒）
 * @param errorMessage タイムアウト時のエラーメッセージ
 * @returns タイムアウト付きPromise
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'リクエストがタイムアウトしました'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}
