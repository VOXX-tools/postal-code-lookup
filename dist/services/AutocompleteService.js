"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutocompleteService = void 0;
/**
 * オートコンプリートサービス
 * 市区町村名の候補を提供するビジネスロジック
 */
class AutocompleteService {
    constructor(dataSourceManager) {
        this.municipalityCache = null;
        this.cacheTimestamp = 0;
        this.CACHE_DURATION = 5 * 60 * 1000; // 5分間キャッシュ
        this.dataSourceManager = dataSourceManager;
    }
    /**
     * 候補リストを取得
     * @param input 入力文字列
     * @returns 候補リスト
     */
    async getSuggestions(input) {
        // 空の入力の場合は空配列を返す
        if (!input || input.trim() === '') {
            return [];
        }
        // 入力をトリム
        const trimmedInput = input.trim();
        // 市区町村リストを取得（キャッシュを使用）
        const municipalities = await this.getMunicipalitiesWithCache();
        // 候補をフィルタリング
        const filteredSuggestions = this.filterSuggestions(trimmedInput, municipalities);
        // 候補を整形して返す
        return filteredSuggestions.map(m => this.formatSuggestion(m));
    }
    /**
     * 候補をフィルタリング
     * @param input 入力文字列
     * @param allMunicipalities すべての市区町村リスト
     * @returns フィルタリングされた候補リスト
     */
    filterSuggestions(input, allMunicipalities) {
        // 入力が空の場合は空配列を返す
        if (!input || input.trim() === '') {
            return [];
        }
        const trimmedInput = input.trim().toLowerCase();
        // 部分一致で検索
        const matches = allMunicipalities.filter(municipality => {
            // 市区町村名での部分一致
            const municipalityMatch = municipality.municipalityName
                .toLowerCase()
                .includes(trimmedInput);
            // 完全名称（都道府県名+市区町村名）での部分一致
            const fullNameMatch = municipality.fullName
                .toLowerCase()
                .includes(trimmedInput);
            // 都道府県名での部分一致
            const prefectureMatch = municipality.prefectureName
                .toLowerCase()
                .includes(trimmedInput);
            return municipalityMatch || fullNameMatch || prefectureMatch;
        });
        // 重複を除去（fullNameでユニーク化）
        const uniqueMatches = this.removeDuplicates(matches);
        // 最大50件に制限
        return uniqueMatches.slice(0, 50);
    }
    /**
     * 候補の表示形式を整形
     * @param municipality 市区町村データ
     * @returns 整形された候補文字列
     */
    formatSuggestion(municipality) {
        // 都道府県名と市区町村名の両方を含める
        return municipality.fullName;
    }
    /**
     * 市区町村リストをキャッシュ付きで取得
     * @returns 市区町村リスト
     */
    async getMunicipalitiesWithCache() {
        const now = Date.now();
        // キャッシュが有効な場合はキャッシュを返す
        if (this.municipalityCache &&
            now - this.cacheTimestamp < this.CACHE_DURATION) {
            return this.municipalityCache;
        }
        // データソースから取得
        const dataSource = this.dataSourceManager.getDataSource();
        const municipalities = await dataSource.getMunicipalityList();
        // キャッシュを更新
        this.municipalityCache = municipalities;
        this.cacheTimestamp = now;
        return municipalities;
    }
    /**
     * 重複を除去
     * @param municipalities 市区町村リスト
     * @returns 重複を除去した市区町村リスト
     */
    removeDuplicates(municipalities) {
        const seen = new Set();
        const result = [];
        for (const municipality of municipalities) {
            if (!seen.has(municipality.fullName)) {
                seen.add(municipality.fullName);
                result.push(municipality);
            }
        }
        return result;
    }
    /**
     * キャッシュをクリア
     */
    clearCache() {
        this.municipalityCache = null;
        this.cacheTimestamp = 0;
    }
}
exports.AutocompleteService = AutocompleteService;
//# sourceMappingURL=AutocompleteService.js.map