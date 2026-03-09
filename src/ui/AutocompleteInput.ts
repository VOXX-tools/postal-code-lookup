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
export class AutocompleteInput {
  private props: AutocompleteInputProps;
  private container: HTMLElement | null = null;
  private inputElement: HTMLInputElement | null = null;
  private suggestionsElement: HTMLElement | null = null;
  private selectedIndex: number = -1;

  constructor(props: AutocompleteInputProps) {
    this.props = props;
  }

  /**
   * コンポーネントをレンダリング
   * @param parentElement 親要素
   */
  render(parentElement: HTMLElement): void {
    // コンテナを作成
    this.container = document.createElement('div');
    this.container.className = 'autocomplete-container';
    this.container.setAttribute('data-testid', 'autocomplete-container');

    // 入力フィールドを作成
    this.inputElement = document.createElement('input');
    this.inputElement.type = 'text';
    this.inputElement.className = 'autocomplete-input';
    this.inputElement.placeholder = this.props.placeholder;
    this.inputElement.value = this.props.value;
    this.inputElement.setAttribute('data-testid', 'municipality-input');

    // 入力変更イベント
    this.inputElement.addEventListener('input', this.handleInputChange.bind(this));

    // キーボードイベント
    this.inputElement.addEventListener('keydown', this.handleKeyDown.bind(this));

    // 候補リストを作成
    this.suggestionsElement = document.createElement('ul');
    this.suggestionsElement.className = 'autocomplete-suggestions';
    this.suggestionsElement.setAttribute('data-testid', 'autocomplete-suggestions');
    this.suggestionsElement.style.display = 'none';

    // コンテナに追加
    this.container.appendChild(this.inputElement);
    this.container.appendChild(this.suggestionsElement);

    // 親要素に追加
    parentElement.appendChild(this.container);

    // 初期候補を表示
    this.updateSuggestions();
  }

  /**
   * 入力変更ハンドラー
   */
  private handleInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    // 選択インデックスをリセット
    this.selectedIndex = -1;

    // 親コンポーネントに通知
    this.props.onChange(value);
  }

  /**
   * キーボードイベントハンドラー
   */
  private handleKeyDown(event: KeyboardEvent): void {
    const suggestions = this.props.suggestions;

    if (suggestions.length === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(
          this.selectedIndex + 1,
          suggestions.length - 1
        );
        this.highlightSuggestion();
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        this.highlightSuggestion();
        break;

      case 'Enter':
        event.preventDefault();
        if (this.selectedIndex >= 0 && this.selectedIndex < suggestions.length) {
          this.handleSuggestionSelect(suggestions[this.selectedIndex]);
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.hideSuggestions();
        break;
    }
  }

  /**
   * 候補選択ハンドラー
   */
  private handleSuggestionSelect(suggestion: string): void {
    // 親コンポーネントに通知
    this.props.onSelect(suggestion);

    // 候補リストを非表示
    this.hideSuggestions();

    // 選択インデックスをリセット
    this.selectedIndex = -1;
  }

  /**
   * 候補をハイライト
   */
  private highlightSuggestion(): void {
    if (!this.suggestionsElement) {
      return;
    }

    const items = this.suggestionsElement.querySelectorAll('li');
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('highlighted');
      } else {
        item.classList.remove('highlighted');
      }
    });
  }

  /**
   * 候補リストを更新
   */
  updateSuggestions(): void {
    if (!this.suggestionsElement) {
      return;
    }

    const suggestions = this.props.suggestions;

    // 候補リストをクリア
    this.suggestionsElement.innerHTML = '';

    // 候補がない場合は非表示
    if (suggestions.length === 0) {
      this.hideSuggestions();
      return;
    }

    // 候補を表示
    suggestions.forEach((suggestion, index) => {
      const item = document.createElement('li');
      item.className = 'autocomplete-suggestion-item';
      item.textContent = suggestion;
      item.setAttribute('data-testid', `suggestion-item-${index}`);

      // クリックイベント
      item.addEventListener('click', () => {
        this.handleSuggestionSelect(suggestion);
      });

      this.suggestionsElement!.appendChild(item);
    });

    // 候補リストを表示
    this.showSuggestions();
  }

  /**
   * 候補リストを表示
   */
  private showSuggestions(): void {
    if (this.suggestionsElement) {
      this.suggestionsElement.style.display = 'block';
    }
  }

  /**
   * 候補リストを非表示
   */
  private hideSuggestions(): void {
    if (this.suggestionsElement) {
      this.suggestionsElement.style.display = 'none';
    }
    this.selectedIndex = -1;
  }

  /**
   * プロパティを更新
   */
  updateProps(props: Partial<AutocompleteInputProps>): void {
    this.props = { ...this.props, ...props };

    // 入力値を更新
    if (this.inputElement && props.value !== undefined) {
      this.inputElement.value = props.value;
    }

    // 候補リストを更新
    if (props.suggestions !== undefined) {
      this.updateSuggestions();
    }
  }

  /**
   * コンポーネントを破棄
   */
  destroy(): void {
    if (this.container && this.container.parentElement) {
      this.container.parentElement.removeChild(this.container);
    }
    this.container = null;
    this.inputElement = null;
    this.suggestionsElement = null;
  }
}
