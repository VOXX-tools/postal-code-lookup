import { IAutocompleteService, IDataSourceManager, Municipality } from '../types';
/**
 * オートコンプリートサービス
 * 市区町村名の候補を提供するビジネスロジック
 */
export declare class AutocompleteService implements IAutocompleteService {
    private dataSourceManager;
    private municipalityCache;
    private cacheTimestamp;
    private readonly CACHE_DURATION;
    constructor(dataSourceManager: IDataSourceManager);
    /**
     * 候補リストを取得
     * @param input 入力文字列
     * @returns 候補リスト
     */
    getSuggestions(input: string): Promise<string[]>;
    /**
     * 候補をフィルタリング
     * @param input 入力文字列
     * @param allMunicipalities すべての市区町村リスト
     * @returns フィルタリングされた候補リスト
     */
    filterSuggestions(input: string, allMunicipalities: Municipality[]): Municipality[];
    /**
     * 候補の表示形式を整形
     * @param municipality 市区町村データ
     * @returns 整形された候補文字列
     */
    formatSuggestion(municipality: Municipality): string;
    /**
     * 市区町村リストをキャッシュ付きで取得
     * @returns 市区町村リスト
     */
    private getMunicipalitiesWithCache;
    /**
     * 重複を除去
     * @param municipalities 市区町村リスト
     * @returns 重複を除去した市区町村リスト
     */
    private removeDuplicates;
    /**
     * キャッシュをクリア
     */
    clearCache(): void;
}
//# sourceMappingURL=AutocompleteService.d.ts.map