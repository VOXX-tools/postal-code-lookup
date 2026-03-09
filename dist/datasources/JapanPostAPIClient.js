"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JapanPostAPIClient = void 0;
const axios_1 = __importDefault(require("axios"));
const errors_1 = require("../errors");
/**
 * 日本郵便公式APIクライアント
 * HTTPS通信を使用してAPIから郵便番号データを取得
 */
class JapanPostAPIClient {
    constructor(config) {
        this.municipalityCache = null;
        this.config = config;
        // HTTPS通信を確保
        const apiEndpoint = config.apiEndpoint || 'https://zipcloud.ibsnet.co.jp/api';
        this.axiosInstance = axios_1.default.create({
            baseURL: apiEndpoint,
            timeout: config.timeout || 5000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    /**
     * 市区町村名で郵便番号を取得
     * @param municipalityName 市区町村名
     * @returns 郵便番号リスト
     */
    async fetchPostalCodes(municipalityName) {
        try {
            // 市区町村名から郵便番号を検索
            // 注: 実際のAPIエンドポイントは日本郵便の仕様に合わせて調整が必要
            const response = await this.axiosInstance.get('/search', {
                params: {
                    address: municipalityName
                }
            });
            if (response.data && response.data.results) {
                const postalCodes = response.data.results.map((result) => {
                    // ハイフン付き7桁形式に変換
                    const code = result.zipcode || '';
                    return this.formatPostalCode(code);
                });
                // 重複を除去
                return Array.from(new Set(postalCodes));
            }
            return [];
        }
        catch (error) {
            this.handleAPIError(error);
            return []; // handleAPIErrorが例外をスローするため、ここには到達しない
        }
    }
    /**
     * 市区町村リストを取得
     * @returns 市区町村リスト
     */
    async getMunicipalityList() {
        // キャッシュがあれば返す
        if (this.municipalityCache !== null) {
            return this.municipalityCache;
        }
        try {
            // 全市区町村リストを取得
            // 注: 実際のAPIエンドポイントは日本郵便の仕様に合わせて調整が必要
            const response = await this.axiosInstance.get('/municipalities');
            if (response.data && response.data.municipalities) {
                this.municipalityCache = response.data.municipalities.map((item) => ({
                    prefectureName: item.prefecture || '',
                    municipalityName: item.municipality || '',
                    fullName: `${item.prefecture || ''}${item.municipality || ''}`
                }));
                return this.municipalityCache;
            }
            return [];
        }
        catch (error) {
            this.handleAPIError(error);
            return []; // handleAPIErrorが例外をスローするため、ここには到達しない
        }
    }
    /**
     * APIエラーをハンドリング
     * @param error エラーオブジェクト
     */
    handleAPIError(error) {
        if (axios_1.default.isAxiosError(error)) {
            const axiosError = error;
            // タイムアウトエラー
            if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
                throw new errors_1.TimeoutError();
            }
            // ネットワークエラー
            if (!axiosError.response) {
                throw new errors_1.NetworkError();
            }
            // APIエラー（ステータスコードが4xx, 5xx）
            if (axiosError.response.status >= 400) {
                throw new errors_1.APIError(`APIエラー: ${axiosError.response.status} - ${axiosError.response.statusText}`);
            }
        }
        // その他のエラー
        throw new errors_1.APIError(error.message);
    }
    /**
     * 郵便番号をハイフン付き7桁形式に変換
     * @param code 郵便番号
     * @returns ハイフン付き郵便番号 (XXX-XXXX)
     */
    formatPostalCode(code) {
        // ハイフンを除去
        const cleaned = code.replace(/-/g, '');
        // 7桁でない場合はそのまま返す
        if (cleaned.length !== 7) {
            return code;
        }
        // XXX-XXXX形式に変換
        return `${cleaned.substring(0, 3)}-${cleaned.substring(3)}`;
    }
    /**
     * APIリクエストを構築
     * @param params リクエストパラメータ
     * @returns リクエストURL
     */
    buildAPIRequest(params) {
        const queryString = Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
        return `${this.config.apiEndpoint}?${queryString}`;
    }
}
exports.JapanPostAPIClient = JapanPostAPIClient;
//# sourceMappingURL=JapanPostAPIClient.js.map