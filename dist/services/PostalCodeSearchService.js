"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostalCodeSearchService = void 0;
const errors_1 = require("../errors");
/**
 * 郵便番号検索サービス
 * 市区町村名から郵便番号を検索するビジネスロジック
 */
class PostalCodeSearchService {
    constructor(dataSourceManager) {
        this.dataSourceManager = dataSourceManager;
    }
    /**
     * 市区町村名で検索
     * @param municipalityName 市区町村名
     * @returns 検索結果
     * @throws {ValidationError} 入力が無効な場合
     */
    async searchByMunicipality(municipalityName) {
        // 入力検証
        const validation = this.validateMunicipalityName(municipalityName);
        if (!validation.isValid) {
            throw new errors_1.ValidationError(validation.errorMessage || '無効な入力です');
        }
        // 入力をサニタイズ
        const sanitizedInput = this.sanitizeInput(municipalityName);
        // データソースから郵便番号を取得
        const dataSource = this.dataSourceManager.getDataSource();
        const postalCodes = await dataSource.fetchPostalCodes(sanitizedInput);
        // 結果が0件の場合
        if (postalCodes.length === 0) {
            throw new errors_1.ValidationError('指定された市区町村が見つかりません');
        }
        // 都道府県名と市区町村名を分離（可能な場合）
        const { prefectureName, municipalityName: extractedMunicipality } = this.extractPrefectureAndMunicipality(sanitizedInput);
        return {
            postalCodes,
            municipalityName: extractedMunicipality || sanitizedInput,
            prefectureName
        };
    }
    /**
     * 市区町村名を検証
     * @param name 市区町村名
     * @returns 検証結果
     */
    validateMunicipalityName(name) {
        // 空の入力チェック
        if (!name || name.trim() === '') {
            return {
                isValid: false,
                errorMessage: '市区町村名を入力してください'
            };
        }
        // 長さチェック（1文字以上、50文字以下）- トリム後の長さで判定
        const trimmedName = name.trim();
        if (trimmedName.length > 50) {
            return {
                isValid: false,
                errorMessage: '市区町村名が長すぎます（50文字以内）'
            };
        }
        // 無効な文字チェック（日本語、英数字、ハイフン、スペースのみ許可）
        const validPattern = /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBFa-zA-Z0-9\s\-ー]+$/;
        if (!validPattern.test(trimmedName)) {
            return {
                isValid: false,
                errorMessage: '無効な文字が含まれています'
            };
        }
        return {
            isValid: true
        };
    }
    /**
     * 入力をサニタイズ（XSS対策）
     * @param input 入力文字列
     * @returns サニタイズされた文字列
     */
    sanitizeInput(input) {
        // トリム
        let sanitized = input.trim();
        // HTMLタグを除去
        sanitized = sanitized.replace(/<[^>]*>/g, '');
        // スクリプトタグを除去
        sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        // javascript: プロトコルを除去
        sanitized = sanitized.replace(/javascript:/gi, '');
        // イベントハンドラを除去
        sanitized = sanitized.replace(/on\w+\s*=/gi, '');
        // 危険な文字を除去（<, >, ", ', &のみ）
        sanitized = sanitized.replace(/[<>"'&]/g, '');
        // 連続するスペースを1つに
        sanitized = sanitized.replace(/\s+/g, ' ');
        return sanitized;
    }
    /**
     * 出力形式を整形（カンマ区切り形式）
     * @param postalCodes 郵便番号リスト
     * @returns カンマ区切り形式の文字列
     */
    formatOutput(postalCodes) {
        // 重複を除去
        const uniqueCodes = Array.from(new Set(postalCodes));
        // ソート（昇順）
        uniqueCodes.sort();
        // カンマ区切りで結合
        return uniqueCodes.join(',');
    }
    /**
     * 都道府県名と市区町村名を分離
     * @param input 入力文字列
     * @returns 都道府県名と市区町村名
     */
    extractPrefectureAndMunicipality(input) {
        // 都道府県パターン
        const prefecturePattern = /(北海道|.+?[都道府県])/;
        const match = input.match(prefecturePattern);
        if (match) {
            const prefectureName = match[1];
            const municipalityName = input.substring(prefectureName.length);
            return {
                prefectureName,
                municipalityName: municipalityName || undefined
            };
        }
        return {
            municipalityName: input
        };
    }
    /**
     * 市区町村名の存在を確認
     * @param municipalityName 市区町村名
     * @returns 存在するかどうか
     */
    async checkMunicipalityExists(municipalityName) {
        try {
            const dataSource = this.dataSourceManager.getDataSource();
            const municipalities = await dataSource.getMunicipalityList();
            // 部分一致で検索
            return municipalities.some(m => m.municipalityName.includes(municipalityName) ||
                m.fullName.includes(municipalityName));
        }
        catch {
            return false;
        }
    }
}
exports.PostalCodeSearchService = PostalCodeSearchService;
//# sourceMappingURL=PostalCodeSearchService.js.map