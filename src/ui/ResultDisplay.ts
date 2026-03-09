/**
 * ResultDisplayコンポーネント
 * 検索結果を表示するコンポーネント
 */
export interface ResultDisplayProps {
  /** 郵便番号リスト */
  postalCodes: string[];
  /** エラーメッセージ */
  error: string | null;
  /** ローディング状態 */
  isLoading: boolean;
}

/**
 * ResultDisplayコンポーネント
 */
export class ResultDisplay {
  private props: ResultDisplayProps;
  private container: HTMLElement | null = null;
  private resultElement: HTMLElement | null = null;
  private errorElement: HTMLElement | null = null;
  private loadingElement: HTMLElement | null = null;

  constructor(props: ResultDisplayProps) {
    this.props = props;
  }

  /**
   * コンポーネントをレンダリング
   * @param parentElement 親要素
   */
  render(parentElement: HTMLElement): void {
    // コンテナを作成
    this.container = document.createElement('div');
    this.container.className = 'result-container';
    this.container.setAttribute('data-testid', 'result-container');

    // ローディング表示を作成
    this.loadingElement = document.createElement('div');
    this.loadingElement.className = 'loading';
    this.loadingElement.setAttribute('data-testid', 'loading-indicator');
    this.loadingElement.textContent = '検索中...';
    this.loadingElement.style.display = 'none';

    // エラー表示を作成
    this.errorElement = document.createElement('div');
    this.errorElement.className = 'error';
    this.errorElement.setAttribute('data-testid', 'error-message');
    this.errorElement.style.display = 'none';

    // 結果表示を作成
    this.resultElement = document.createElement('div');
    this.resultElement.className = 'result';
    this.resultElement.setAttribute('data-testid', 'search-result');
    this.resultElement.style.display = 'none';

    // コンテナに追加
    this.container.appendChild(this.loadingElement);
    this.container.appendChild(this.errorElement);
    this.container.appendChild(this.resultElement);

    // 親要素に追加
    parentElement.appendChild(this.container);

    // 初期状態を表示
    this.updateDisplay();
  }

  /**
   * 郵便番号をカンマ区切り形式に変換
   * @param codes 郵便番号リスト
   * @returns カンマ区切り形式の文字列
   */
  formatPostalCodes(codes: string[]): string {
    // 重複を除去
    const uniqueCodes = Array.from(new Set(codes));

    // ソート（昇順）
    uniqueCodes.sort();

    // カンマ区切りで結合
    return uniqueCodes.join(',');
  }

  /**
   * エラーメッセージを表示
   * @param message エラーメッセージ
   */
  displayError(message: string): void {
    if (!this.errorElement) {
      return;
    }

    // エラーメッセージを設定
    this.errorElement.textContent = message;
    this.errorElement.style.display = 'block';

    // 他の要素を非表示
    if (this.resultElement) {
      this.resultElement.style.display = 'none';
    }
    if (this.loadingElement) {
      this.loadingElement.style.display = 'none';
    }
  }

  /**
   * ローディング状態を表示
   */
  private displayLoading(): void {
    if (!this.loadingElement) {
      return;
    }

    // ローディングを表示
    this.loadingElement.style.display = 'block';

    // 他の要素を非表示
    if (this.resultElement) {
      this.resultElement.style.display = 'none';
    }
    if (this.errorElement) {
      this.errorElement.style.display = 'none';
    }
  }

  /**
   * 検索結果を表示
   * @param postalCodes 郵便番号リスト
   */
  private displayResult(postalCodes: string[]): void {
    if (!this.resultElement) {
      return;
    }

    // 結果が0件の場合
    if (postalCodes.length === 0) {
      this.displayError('該当する郵便番号が見つかりませんでした');
      return;
    }

    // 郵便番号をカンマ区切り形式に変換
    const formattedCodes = this.formatPostalCodes(postalCodes);

    // 結果を表示
    this.resultElement.innerHTML = `
      <div class="result-label">検索結果:</div>
      <div class="result-value" data-testid="postal-codes-output">${formattedCodes}</div>
    `;
    this.resultElement.style.display = 'block';

    // 他の要素を非表示
    if (this.errorElement) {
      this.errorElement.style.display = 'none';
    }
    if (this.loadingElement) {
      this.loadingElement.style.display = 'none';
    }
  }

  /**
   * 表示を更新
   */
  private updateDisplay(): void {
    // ローディング中
    if (this.props.isLoading) {
      this.displayLoading();
      return;
    }

    // エラーがある場合
    if (this.props.error) {
      this.displayError(this.props.error);
      return;
    }

    // 結果がある場合
    if (this.props.postalCodes.length > 0) {
      this.displayResult(this.props.postalCodes);
      return;
    }

    // 何も表示しない（初期状態）
    if (this.resultElement) {
      this.resultElement.style.display = 'none';
    }
    if (this.errorElement) {
      this.errorElement.style.display = 'none';
    }
    if (this.loadingElement) {
      this.loadingElement.style.display = 'none';
    }
  }

  /**
   * プロパティを更新
   */
  updateProps(props: Partial<ResultDisplayProps>): void {
    this.props = { ...this.props, ...props };
    this.updateDisplay();
  }

  /**
   * 表示をクリア
   */
  clear(): void {
    this.props = {
      postalCodes: [],
      error: null,
      isLoading: false
    };
    this.updateDisplay();
  }

  /**
   * コンポーネントを破棄
   */
  destroy(): void {
    if (this.container && this.container.parentElement) {
      this.container.parentElement.removeChild(this.container);
    }
    this.container = null;
    this.resultElement = null;
    this.errorElement = null;
    this.loadingElement = null;
  }
}
