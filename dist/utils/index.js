"use strict";
/**
 * ユーティリティ関数
 * 郵便番号検索システムで使用される共通関数
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPostalCodes = formatPostalCodes;
exports.sanitizeInput = sanitizeInput;
exports.isValidCharacters = isValidCharacters;
exports.isValidPostalCodeFormat = isValidPostalCodeFormat;
exports.normalizePostalCode = normalizePostalCode;
exports.extractPrefectureAndMunicipality = extractPrefectureAndMunicipality;
exports.removeDuplicates = removeDuplicates;
exports.includesIgnoreCase = includesIgnoreCase;
exports.withTimeout = withTimeout;
const constants_1 = require("../constants");
/**
 * 郵便番号リストをカンマ区切り形式に変換
 * @param postalCodes 郵便番号リスト
 * @returns カンマ区切り形式の文字列
 */
function formatPostalCodes(postalCodes) {
    return postalCodes.join(constants_1.POSTAL_CODE_FORMAT.SEPARATOR);
}
/**
 * 入力文字列をサニタイズ
 * @param input 入力文字列
 * @returns サニタイズされた文字列
 */
function sanitizeInput(input) {
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
function isValidCharacters(input) {
    if (!input || input.length === 0) {
        return false;
    }
    return constants_1.VALIDATION_PATTERNS.VALID_CHARACTERS.test(input);
}
/**
 * 郵便番号が正しい形式か検証
 * @param postalCode 郵便番号
 * @returns 正しい形式の場合true
 */
function isValidPostalCodeFormat(postalCode) {
    return constants_1.POSTAL_CODE_FORMAT.PATTERN.test(postalCode);
}
/**
 * 郵便番号を標準形式（XXX-XXXX）に変換
 * @param postalCode 郵便番号（ハイフンあり/なし）
 * @returns 標準形式の郵便番号
 */
function normalizePostalCode(postalCode) {
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
function extractPrefectureAndMunicipality(fullName) {
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
function removeDuplicates(array) {
    return Array.from(new Set(array));
}
/**
 * 文字列が部分一致するか判定
 * @param target 対象文字列
 * @param query 検索文字列
 * @returns 部分一致する場合true
 */
function includesIgnoreCase(target, query) {
    return target.toLowerCase().includes(query.toLowerCase());
}
/**
 * タイムアウト付きPromise
 * @param promise Promise
 * @param timeoutMs タイムアウト時間（ミリ秒）
 * @param errorMessage タイムアウト時のエラーメッセージ
 * @returns タイムアウト付きPromise
 */
function withTimeout(promise, timeoutMs, errorMessage = 'リクエストがタイムアウトしました') {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(errorMessage)), timeoutMs)),
    ]);
}
//# sourceMappingURL=index.js.map