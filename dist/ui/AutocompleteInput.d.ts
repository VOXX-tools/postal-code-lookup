/**
 * AutocompleteInputコンポーネント
 * オートコンプリート機能を持つ入力フィールド
 */
export interface AutocompleteInputProps {
    /** 入力値 */
    value: string;
    /** 候補リスト */
    suggestions: string[];
    /** 入力変更時のコールバック */
    onChange: (value: string) => void;
    /** 候補選択時のコールバック */
    onSelect: (value: string) => void;
    /** プレースホルダー */
    placeholder: string;
}
/**
 * AutocompleteInputコンポーネント
 */
export declare class AutocompleteInput {
    private props;
    private container;
    private inputElement;
    private suggestionsElement;
    private selectedIndex;
    constructor(props: AutocompleteInputProps);
    /**
     * コンポーネントをレンダリング
     * @param parentElement 親要素
     */
    render(parentElement: HTMLElement): void;
    /**
     * 入力変更ハンドラー
     */
    private handleInputChange;
    /**
     * キーボードイベントハンドラー
     */
    private handleKeyDown;
    /**
     * 候補選択ハンドラー
     */
    private handleSuggestionSelect;
    /**
     * 候補をハイライト
     */
    private highlightSuggestion;
    /**
     * 候補リストを更新
     */
    updateSuggestions(): void;
    /**
     * 候補リストを表示
     */
    private showSuggestions;
    /**
     * 候補リストを非表示
     */
    private hideSuggestions;
    /**
     * プロパティを更新
     */
    updateProps(props: Partial<AutocompleteInputProps>): void;
    /**
     * コンポーネントを破棄
     */
    destroy(): void;
}
//# sourceMappingURL=AutocompleteInput.d.ts.map