import { IPostalCodeSearchService, PostalCodeResult, ValidationResult, IDataSourceManager } from '../types';
/**
 * 郵便番号検索サービス
 * 市区町村名から郵便番号を検索するビジネスロジック
 */
export declare class PostalCodeSearchService implements IPostalCodeSearchService {
    private dataSourceManager;
    constructor(dataSourceManager: IDataSourceManager);
    /**
     * 市区町村名で検索
     * @param municipalityName 市区町村名
     * @returns 検索結果
     * @throws {ValidationError} 入力が無効な場合
     */
    searchByMunicipality(municipalityName: string): Promise<PostalCodeResult>;
    /**
     * 市区町村名を検証
     * @param name 市区町村名
     * @returns 検証結果
     */
    validateMunicipalityName(name: string): ValidationResult;
    /**
     * 入力をサニタイズ（XSS対策）
     * @param input 入力文字列
     * @returns サニタイズされた文字列
     */
    sanitizeInput(input: string): string;
    /**
     * 出力形式を整形（カンマ区切り形式）
     * @param postalCodes 郵便番号リスト
     * @returns カンマ区切り形式の文字列
     */
    formatOutput(postalCodes: string[]): string;
    /**
     * 都道府県名と市区町村名を分離
     * @param input 入力文字列
     * @returns 都道府県名と市区町村名
     */
    private extractPrefectureAndMunicipality;
    /**
     * 市区町村名の存在を確認
     * @param municipalityName 市区町村名
     * @returns 存在するかどうか
     */
    checkMunicipalityExists(municipalityName: string): Promise<boolean>;
}
//# sourceMappingURL=PostalCodeSearchService.d.ts.map