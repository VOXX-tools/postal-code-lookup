/**
 * ユーティリティ関数
 * 郵便番号検索システムで使用される共通関数
 */
/**
 * 郵便番号リストをカンマ区切り形式に変換
 * @param postalCodes 郵便番号リスト
 * @returns カンマ区切り形式の文字列
 */
export declare function formatPostalCodes(postalCodes: string[]): string;
/**
 * 入力文字列をサニタイズ
 * @param input 入力文字列
 * @returns サニタイズされた文字列
 */
export declare function sanitizeInput(input: string): string;
/**
 * 入力文字列が有効な文字のみを含むか検証
 * @param input 入力文字列
 * @returns 有効な場合true
 */
export declare function isValidCharacters(input: string): boolean;
/**
 * 郵便番号が正しい形式か検証
 * @param postalCode 郵便番号
 * @returns 正しい形式の場合true
 */
export declare function isValidPostalCodeFormat(postalCode: string): boolean;
/**
 * 郵便番号を標準形式（XXX-XXXX）に変換
 * @param postalCode 郵便番号（ハイフンあり/なし）
 * @returns 標準形式の郵便番号
 */
export declare function normalizePostalCode(postalCode: string): string;
/**
 * 市区町村名から都道府県名を抽出
 * @param fullName 完全名称（例: "東京都千代田区"）
 * @returns 都道府県名と市区町村名のタプル
 */
export declare function extractPrefectureAndMunicipality(fullName: string): {
    prefecture: string;
    municipality: string;
};
/**
 * 配列から重複を除去
 * @param array 配列
 * @returns 重複を除去した配列
 */
export declare function removeDuplicates<T>(array: T[]): T[];
/**
 * 文字列が部分一致するか判定
 * @param target 対象文字列
 * @param query 検索文字列
 * @returns 部分一致する場合true
 */
export declare function includesIgnoreCase(target: string, query: string): boolean;
/**
 * タイムアウト付きPromise
 * @param promise Promise
 * @param timeoutMs タイムアウト時間（ミリ秒）
 * @param errorMessage タイムアウト時のエラーメッセージ
 * @returns タイムアウト付きPromise
 */
export declare function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage?: string): Promise<T>;
//# sourceMappingURL=index.d.ts.map