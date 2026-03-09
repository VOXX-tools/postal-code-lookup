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
export declare class ResultDisplay {
    private props;
    private container;
    private resultElement;
    private errorElement;
    private loadingElement;
    constructor(props: ResultDisplayProps);
    /**
     * コンポーネントをレンダリング
     * @param parentElement 親要素
     */
    render(parentElement: HTMLElement): void;
    /**
     * 郵便番号をカンマ区切り形式に変換
     * @param codes 郵便番号リスト
     * @returns カンマ区切り形式の文字列
     */
    formatPostalCodes(codes: string[]): string;
    /**
     * エラーメッセージを表示
     * @param message エラーメッセージ
     */
    displayError(message: string): void;
    /**
     * ローディング状態を表示
     */
    private displayLoading;
    /**
     * 検索結果を表示
     * @param postalCodes 郵便番号リスト
     */
    private displayResult;
    /**
     * 表示を更新
     */
    private updateDisplay;
    /**
     * プロパティを更新
     */
    updateProps(props: Partial<ResultDisplayProps>): void;
    /**
     * 表示をクリア
     */
    clear(): void;
    /**
     * コンポーネントを破棄
     */
    destroy(): void;
}
//# sourceMappingURL=ResultDisplay.d.ts.map