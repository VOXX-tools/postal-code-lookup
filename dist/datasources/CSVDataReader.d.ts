import { IDataSource, Municipality, PostalCodeData } from '../types';
/**
 * CSVデータリーダー
 * 日本郵便標準フォーマットのCSVファイルから郵便番号データを読み込む
 */
export declare class CSVDataReader implements IDataSource {
    private csvFilePath;
    private postalCodeData;
    private isLoaded;
    constructor(csvFilePath: string);
    /**
     * CSVファイルを読み込む
     * @param filePath CSVファイルパス
     */
    loadCSVFile(filePath?: string): Promise<void>;
    /**
     * CSVデータを解析
     * 日本郵便標準フォーマット: 郵便番号,都道府県名,市区町村名,町域名
     * @param csvContent CSV文字列
     * @returns 郵便番号データ配列
     */
    parseCSVData(csvContent: string): PostalCodeData[];
    /**
     * CSV行を解析
     * @param line CSV行
     * @returns 郵便番号データ
     */
    private parseCSVLine;
    /**
     * CSV行を分割（ダブルクォート対応）
     * @param line CSV行
     * @returns 分割された値の配列
     */
    private splitCSVLine;
    /**
     * 郵便番号を検証
     * @param postalCode 郵便番号
     * @returns 有効かどうか
     */
    private validatePostalCode;
    /**
     * 郵便番号をハイフン付き7桁形式に変換
     * @param code 郵便番号
     * @returns ハイフン付き郵便番号 (XXX-XXXX)
     */
    private formatPostalCode;
    /**
     * 有効な郵便番号行かどうかを判定
     * @param line CSV行
     * @returns 有効かどうか
     */
    private isValidPostalCodeLine;
    /**
     * CSVフォーマットを検証
     * @param data 郵便番号データ配列
     * @returns 有効かどうか
     */
    validateCSVFormat(data: PostalCodeData[]): boolean;
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
     * データがロードされているかを確認
     * @returns ロード済みかどうか
     */
    isDataLoaded(): boolean;
    /**
     * ロードされたデータ数を取得
     * @returns データ数
     */
    getDataCount(): number;
}
//# sourceMappingURL=CSVDataReader.d.ts.map