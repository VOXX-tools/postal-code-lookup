"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchForm = void 0;
const AutocompleteInput_1 = require("./AutocompleteInput");
const ResultDisplay_1 = require("./ResultDisplay");
/**
 * SearchFormコンポーネント
 */
class SearchForm {
    constructor(searchService, autocompleteService) {
        this.container = null;
        this.autocompleteInput = null;
        this.resultDisplay = null;
        this.searchButton = null;
        // 状態管理
        this.currentInput = '';
        this.currentSuggestions = [];
        this.isLoading = false;
        this.props = { searchService, autocompleteService };
    }
    /**
     * コンポーネントをレンダリング
     * @param parentElement 親要素
     */
    render(parentElement) {
        // コンテナを作成
        this.container = document.createElement('div');
        this.container.className = 'search-form';
        this.container.setAttribute('data-testid', 'search-form');
        // タイトルを作成
        const title = document.createElement('h1');
        title.textContent = '郵便番号検索';
        title.setAttribute('data-testid', 'page-title');
        this.container.appendChild(title);
        // 説明を作成
        const description = document.createElement('p');
        description.textContent = '市区町村名を入力して、郵便番号を検索できます';
        description.setAttribute('data-testid', 'page-description');
        this.container.appendChild(description);
        // 入力エリアを作成
        const inputArea = document.createElement('div');
        inputArea.className = 'input-area';
        // AutocompleteInputを作成
        this.autocompleteInput = new AutocompleteInput_1.AutocompleteInput({
            value: this.currentInput,
            suggestions: this.currentSuggestions,
            onChange: this.handleInputChange.bind(this),
            onSelect: this.handleSuggestionSelect.bind(this),
            placeholder: '市区町村名を入力してください（例：千代田区、東京都千代田区）'
        });
        this.autocompleteInput.render(inputArea);
        // 検索ボタンを作成
        this.searchButton = document.createElement('button');
        this.searchButton.type = 'button';
        this.searchButton.className = 'search-button';
        this.searchButton.textContent = '検索';
        this.searchButton.setAttribute('data-testid', 'search-button');
        this.searchButton.addEventListener('click', this.handleSearch.bind(this));
        inputArea.appendChild(this.searchButton);
        this.container.appendChild(inputArea);
        // ResultDisplayを作成
        this.resultDisplay = new ResultDisplay_1.ResultDisplay({
            postalCodes: [],
            error: null,
            isLoading: false
        });
        this.resultDisplay.render(this.container);
        // 親要素に追加
        parentElement.appendChild(this.container);
    }
    /**
     * 入力変更ハンドラー
     * @param input 入力値
     */
    async handleInputChange(input) {
        this.currentInput = input;
        // 空の入力の場合は候補をクリア
        if (!input || input.trim() === '') {
            this.currentSuggestions = [];
            this.updateAutocompleteInput();
            return;
        }
        try {
            // オートコンプリート候補を取得
            const suggestions = await this.props.autocompleteService.getSuggestions(input);
            this.currentSuggestions = suggestions;
            this.updateAutocompleteInput();
        }
        catch (error) {
            // エラーが発生した場合は候補をクリア
            console.error('オートコンプリート取得エラー:', error);
            this.currentSuggestions = [];
            this.updateAutocompleteInput();
        }
    }
    /**
     * 候補選択ハンドラー
     * @param suggestion 選択された候補
     */
    handleSuggestionSelect(suggestion) {
        // 入力値を更新
        this.currentInput = suggestion;
        // 候補をクリア
        this.currentSuggestions = [];
        // AutocompleteInputを更新
        this.updateAutocompleteInput();
        // 自動的に検索を実行
        this.handleSearch();
    }
    /**
     * 検索ハンドラー
     */
    async handleSearch() {
        // 空の入力チェック
        if (!this.currentInput || this.currentInput.trim() === '') {
            this.updateResultDisplay({
                postalCodes: [],
                error: '市区町村名を入力してください',
                isLoading: false
            });
            return;
        }
        // ローディング開始
        this.isLoading = true;
        this.updateResultDisplay({
            postalCodes: [],
            error: null,
            isLoading: true
        });
        // 検索ボタンを無効化
        if (this.searchButton) {
            this.searchButton.disabled = true;
        }
        try {
            // 郵便番号を検索
            const result = await this.props.searchService.searchByMunicipality(this.currentInput);
            // 結果を表示
            this.updateResultDisplay({
                postalCodes: result.postalCodes,
                error: null,
                isLoading: false
            });
        }
        catch (error) {
            // エラーを表示
            const errorMessage = error instanceof Error ? error.message : 'エラーが発生しました';
            this.updateResultDisplay({
                postalCodes: [],
                error: errorMessage,
                isLoading: false
            });
        }
        finally {
            // ローディング終了
            this.isLoading = false;
            // 検索ボタンを有効化
            if (this.searchButton) {
                this.searchButton.disabled = false;
            }
        }
    }
    /**
     * AutocompleteInputを更新
     */
    updateAutocompleteInput() {
        if (this.autocompleteInput) {
            this.autocompleteInput.updateProps({
                value: this.currentInput,
                suggestions: this.currentSuggestions
            });
        }
    }
    /**
     * ResultDisplayを更新
     */
    updateResultDisplay(props) {
        if (this.resultDisplay) {
            this.resultDisplay.updateProps(props);
        }
    }
    /**
     * フォームをリセット
     */
    reset() {
        this.currentInput = '';
        this.currentSuggestions = [];
        this.isLoading = false;
        this.updateAutocompleteInput();
        if (this.resultDisplay) {
            this.resultDisplay.clear();
        }
    }
    /**
     * コンポーネントをマウント（renderのエイリアス）
     * @param parentElement 親要素
     */
    mount(parentElement) {
        this.render(parentElement);
    }
    /**
     * コンポーネントを破棄
     */
    destroy() {
        if (this.autocompleteInput) {
            this.autocompleteInput.destroy();
            this.autocompleteInput = null;
        }
        if (this.resultDisplay) {
            this.resultDisplay.destroy();
            this.resultDisplay = null;
        }
        if (this.container && this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
        this.container = null;
        this.searchButton = null;
    }
}
exports.SearchForm = SearchForm;
//# sourceMappingURL=SearchForm.js.map