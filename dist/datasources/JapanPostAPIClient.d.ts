import { IDataSource, Municipality, DataSourceConfig } from '../types';
/**
 * 日本郵便公式APIクライアント
 * HTTPS通信を使用してAPIから郵便番号データを取得
 */
export declare class JapanPostAPIClient implements IDataSource {
    private axiosInstance;
    private config;
    private municipalityCache;
    constructor(config: DataSourceConfig);
    /**
     * 市区町村名で郵便番号を取得
     * @param municipalityName 市区町村名
     * @returns 郵便番号リスト
     */
    fetchPostalCodes(municipalityName: string): Promise<string[]>;
    /**
     * 市区町村リストを取得
     * @returns 市区町村リスト
     */
    getMunicipalityList(): Promise<Municipality[]>;
    /**
     * APIエラーをハンドリング
     * @param error エラーオブジェクト
     */
    private handleAPIError;
    /**
     * 郵便番号をハイフン付き7桁形式に変換
     * @param code 郵便番号
     * @returns ハイフン付き郵便番号 (XXX-XXXX)
     */
    private formatPostalCode;
    /**
     * APIリクエストを構築
     * @param params リクエストパラメータ
     * @returns リクエストURL
     */
    private buildAPIRequest;
}
//# sourceMappingURL=JapanPostAPIClient.d.ts.map