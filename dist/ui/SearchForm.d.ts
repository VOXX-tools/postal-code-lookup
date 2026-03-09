import { IPostalCodeSearchService, IAutocompleteService } from '../types';
/**
 * SearchFormコンポーネント
 * 検索フォーム全体を管理するコンポーネント
 */
export interface SearchFormProps {
    /** 郵便番号検索サービス */
    searchService: IPostalCodeSearchService;
    /** オートコンプリートサービス */
    autocompleteService: IAutocompleteService;
}
/**
 * SearchFormコンポーネント
 */
export declare class SearchForm {
    private props;
    private container;
    private autocompleteInput;
    private resultDisplay;
    private searchButton;
    private currentInput;
    private currentSuggestions;
    private isLoading;
    constructor(searchService: IPostalCodeSearchService, autocompleteService: IAutocompleteService);
    /**
     * コンポーネントをレンダリング
     * @param parentElement 親要素
     */
    render(parentElement: HTMLElement): void;
    /**
     * 入力変更ハンドラー
     * @param input 入力値
     */
    private handleInputChange;
    /**
     * 候補選択ハンドラー
     * @param suggestion 選択された候補
     */
    private handleSuggestionSelect;
    /**
     * 検索ハンドラー
     */
    private handleSearch;
    /**
     * AutocompleteInputを更新
     */
    private updateAutocompleteInput;
    /**
     * ResultDisplayを更新
     */
    private updateResultDisplay;
    /**
     * フォームをリセット
     */
    reset(): void;
    /**
     * コンポーネントをマウント（renderのエイリアス）
     * @param parentElement 親要素
     */
    mount(parentElement: HTMLElement): void;
    /**
     * コンポーネントを破棄
     */
    destroy(): void;
}
//# sourceMappingURL=SearchForm.d.ts.map