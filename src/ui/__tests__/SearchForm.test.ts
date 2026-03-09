import { SearchForm } from '../SearchForm';
import { PostalCodeSearchService } from '../../services/PostalCodeSearchService';
import { AutocompleteService } from '../../services/AutocompleteService';
import { DataSourceManager } from '../../services/DataSourceManager';
import { CSVDataReader } from '../../datasources/CSVDataReader';
import { DataSourceType } from '../../types';

/**
 * SearchFormコンポーネントのユニットテスト
 */
describe('SearchForm', () => {
  let dataSourceManager: DataSourceManager;
  let searchService: PostalCodeSearchService;
  let autocompleteService: AutocompleteService;
  let container: HTMLElement;

  beforeEach(async () => {
    // テスト用のコンテナを作成
    container = document.createElement('div');
    document.body.appendChild(container);

    // データソースマネージャーを初期化
    dataSourceManager = new DataSourceManager({
      type: DataSourceType.CSV,
      csvFilePath: 'data/postal-codes.csv',
      timeout: 5000
    });

    // サービスを初期化
    searchService = new PostalCodeSearchService(dataSourceManager);
    autocompleteService = new AutocompleteService(dataSourceManager);
  });

  afterEach(() => {
    // コンテナをクリーンアップ
    if (container && container.parentElement) {
      container.parentElement.removeChild(container);
    }
  });

  describe('UI要素の存在確認', () => {
    it('タイトルが表示される', () => {
      const searchForm = new SearchForm(searchService, autocompleteService);
      searchForm.render(container);

      const title = container.querySelector('[data-testid="page-title"]');
      expect(title).toBeTruthy();
      expect(title!.textContent).toBe('郵便番号検索');

      searchForm.destroy();
    });

    it('説明が表示される', () => {
      const searchForm = new SearchForm(searchService, autocompleteService);
      searchForm.render(container);

      const description = container.querySelector('[data-testid="page-description"]');
      expect(description).toBeTruthy();
      expect(description!.textContent).toBe('市区町村名を入力して、郵便番号を検索できます');

      searchForm.destroy();
    });

    it('入力フィールドが存在する', () => {
      const searchForm = new SearchForm(searchService, autocompleteService);
      searchForm.render(container);

      const input = container.querySelector('[data-testid="municipality-input"]');
      expect(input).toBeTruthy();
      expect(input!.getAttribute('type')).toBe('text');

      searchForm.destroy();
    });

    it('検索ボタンが存在する', () => {
      const searchForm = new SearchForm(searchService, autocompleteService);
      searchForm.render(container);

      const button = container.querySelector('[data-testid="search-button"]');
      expect(button).toBeTruthy();
      expect(button!.textContent).toBe('検索');

      searchForm.destroy();
    });

    it('結果表示エリアが存在する', () => {
      const searchForm = new SearchForm(searchService, autocompleteService);
      searchForm.render(container);

      const resultContainer = container.querySelector('[data-testid="result-container"]');
      expect(resultContainer).toBeTruthy();

      searchForm.destroy();
    });

    it('オートコンプリート候補リストが存在する', () => {
      const searchForm = new SearchForm(searchService, autocompleteService);
      searchForm.render(container);

      const suggestions = container.querySelector('[data-testid="autocomplete-suggestions"]');
      expect(suggestions).toBeTruthy();

      searchForm.destroy();
    });
  });

  describe('特定のエラーメッセージ表示', () => {
    it('空の入力で検索すると「市区町村名を入力してください」と表示される', async () => {
      const searchForm = new SearchForm(searchService, autocompleteService);
      searchForm.render(container);

      // 検索ボタンをクリック（入力なし）
      const searchButton = container.querySelector(
        '[data-testid="search-button"]'
      ) as HTMLButtonElement;
      searchButton.click();

      // エラーが表示されるまで待機
      await new Promise(resolve => setTimeout(resolve, 100));

      // エラーメッセージを確認
      const errorElement = container.querySelector(
        '[data-testid="error-message"]'
      ) as HTMLElement;
      expect(errorElement).toBeTruthy();
      expect(errorElement.style.display).not.toBe('none');
      expect(errorElement.textContent).toBe('市区町村名を入力してください');

      searchForm.destroy();
    });

    it('スペースのみの入力で検索すると「市区町村名を入力してください」と表示される', async () => {
      const searchForm = new SearchForm(searchService, autocompleteService);
      searchForm.render(container);

      // スペースのみを入力
      const input = container.querySelector(
        '[data-testid="municipality-input"]'
      ) as HTMLInputElement;
      input.value = '   ';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // 検索ボタンをクリック
      const searchButton = container.querySelector(
        '[data-testid="search-button"]'
      ) as HTMLButtonElement;
      searchButton.click();

      // エラーが表示されるまで待機
      await new Promise(resolve => setTimeout(resolve, 100));

      // エラーメッセージを確認
      const errorElement = container.querySelector(
        '[data-testid="error-message"]'
      ) as HTMLElement;
      expect(errorElement).toBeTruthy();
      expect(errorElement.style.display).not.toBe('none');
      expect(errorElement.textContent).toBe('市区町村名を入力してください');

      searchForm.destroy();
    });

    it('存在しない市区町村名で検索すると「指定された市区町村が見つかりません」と表示される', async () => {
      const searchForm = new SearchForm(searchService, autocompleteService);
      searchForm.render(container);

      // 存在しない市区町村名を入力
      const input = container.querySelector(
        '[data-testid="municipality-input"]'
      ) as HTMLInputElement;
      input.value = '存在しない市区町村名12345';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // 検索ボタンをクリック
      const searchButton = container.querySelector(
        '[data-testid="search-button"]'
      ) as HTMLButtonElement;
      searchButton.click();

      // エラーが表示されるまで待機
      await new Promise(resolve => setTimeout(resolve, 100));

      // エラーメッセージを確認
      const errorElement = container.querySelector(
        '[data-testid="error-message"]'
      ) as HTMLElement;
      expect(errorElement).toBeTruthy();
      expect(errorElement.style.display).not.toBe('none');
      expect(errorElement.textContent).toBe('指定された市区町村が見つかりません');

      searchForm.destroy();
    });

    it('無効な文字を含む入力で検索すると「無効な文字が含まれています」と表示される', async () => {
      const searchForm = new SearchForm(searchService, autocompleteService);
      searchForm.render(container);

      // 無効な文字を含む入力
      const input = container.querySelector(
        '[data-testid="municipality-input"]'
      ) as HTMLInputElement;
      input.value = '<script>alert("xss")</script>';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // 検索ボタンをクリック
      const searchButton = container.querySelector(
        '[data-testid="search-button"]'
      ) as HTMLButtonElement;
      searchButton.click();

      // エラーが表示されるまで待機
      await new Promise(resolve => setTimeout(resolve, 100));

      // エラーメッセージを確認
      const errorElement = container.querySelector(
        '[data-testid="error-message"]'
      ) as HTMLElement;
      expect(errorElement).toBeTruthy();
      expect(errorElement.style.display).not.toBe('none');
      expect(errorElement.textContent).toBe('無効な文字が含まれています');

      searchForm.destroy();
    });

    it('長すぎる入力で検索すると「市区町村名が長すぎます（50文字以内）」と表示される', async () => {
      const searchForm = new SearchForm(searchService, autocompleteService);
      searchForm.render(container);

      // 長すぎる入力（51文字以上）
      const input = container.querySelector(
        '[data-testid="municipality-input"]'
      ) as HTMLInputElement;
      input.value = 'あ'.repeat(51);
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // 検索ボタンをクリック
      const searchButton = container.querySelector(
        '[data-testid="search-button"]'
      ) as HTMLButtonElement;
      searchButton.click();

      // エラーが表示されるまで待機
      await new Promise(resolve => setTimeout(resolve, 100));

      // エラーメッセージを確認
      const errorElement = container.querySelector(
        '[data-testid="error-message"]'
      ) as HTMLElement;
      expect(errorElement).toBeTruthy();
      expect(errorElement.style.display).not.toBe('none');
      expect(errorElement.textContent).toBe('市区町村名が長すぎます（50文字以内）');

      searchForm.destroy();
    });
  });

  describe('検索機能', () => {
    it('有効な市区町村名で検索すると結果が表示される', async () => {
      const searchForm = new SearchForm(searchService, autocompleteService);
      searchForm.render(container);

      // 有効な市区町村名を入力
      const input = container.querySelector(
        '[data-testid="municipality-input"]'
      ) as HTMLInputElement;
      input.value = '千代田区';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // 検索ボタンをクリック
      const searchButton = container.querySelector(
        '[data-testid="search-button"]'
      ) as HTMLButtonElement;
      searchButton.click();

      // 結果が表示されるまで待機
      await new Promise(resolve => setTimeout(resolve, 100));

      // 結果が表示されることを確認
      const resultElement = container.querySelector(
        '[data-testid="search-result"]'
      ) as HTMLElement;
      expect(resultElement).toBeTruthy();
      expect(resultElement.style.display).not.toBe('none');

      // 郵便番号が表示されることを確認
      const postalCodesOutput = container.querySelector(
        '[data-testid="postal-codes-output"]'
      );
      expect(postalCodesOutput).toBeTruthy();
      expect(postalCodesOutput!.textContent).toBeTruthy();

      searchForm.destroy();
    });

    it('検索中はローディングインジケーターが表示される', async () => {
      const searchForm = new SearchForm(searchService, autocompleteService);
      searchForm.render(container);

      // 有効な市区町村名を入力
      const input = container.querySelector(
        '[data-testid="municipality-input"]'
      ) as HTMLInputElement;
      input.value = '千代田区';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // 検索ボタンをクリック
      const searchButton = container.querySelector(
        '[data-testid="search-button"]'
      ) as HTMLButtonElement;
      searchButton.click();

      // ローディングインジケーターが表示されることを確認（即座に）
      const loadingElement = container.querySelector(
        '[data-testid="loading-indicator"]'
      ) as HTMLElement;
      expect(loadingElement).toBeTruthy();

      // 結果が表示されるまで待機
      await new Promise(resolve => setTimeout(resolve, 100));

      searchForm.destroy();
    });
  });

  describe('オートコンプリート機能', () => {
    it('入力すると候補が表示される', async () => {
      const searchForm = new SearchForm(searchService, autocompleteService);
      searchForm.render(container);

      // 入力
      const input = container.querySelector(
        '[data-testid="municipality-input"]'
      ) as HTMLInputElement;
      input.value = '千代田';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // 候補が表示されるまで待機
      await new Promise(resolve => setTimeout(resolve, 100));

      // 候補リストが表示されることを確認
      const suggestions = container.querySelector(
        '[data-testid="autocomplete-suggestions"]'
      ) as HTMLElement;
      expect(suggestions).toBeTruthy();

      searchForm.destroy();
    });

    it('空の入力では候補が表示されない', async () => {
      const searchForm = new SearchForm(searchService, autocompleteService);
      searchForm.render(container);

      // 空の入力
      const input = container.querySelector(
        '[data-testid="municipality-input"]'
      ) as HTMLInputElement;
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // 少し待機
      await new Promise(resolve => setTimeout(resolve, 100));

      // 候補リストが非表示であることを確認
      const suggestions = container.querySelector(
        '[data-testid="autocomplete-suggestions"]'
      ) as HTMLElement;
      expect(suggestions).toBeTruthy();
      expect(suggestions.style.display).toBe('none');

      searchForm.destroy();
    });
  });

  describe('リセット機能', () => {
    it('reset()を呼ぶとフォームがクリアされる', async () => {
      const searchForm = new SearchForm(searchService, autocompleteService);
      searchForm.render(container);

      // 入力して検索
      const input = container.querySelector(
        '[data-testid="municipality-input"]'
      ) as HTMLInputElement;
      input.value = '千代田区';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      const searchButton = container.querySelector(
        '[data-testid="search-button"]'
      ) as HTMLButtonElement;
      searchButton.click();

      await new Promise(resolve => setTimeout(resolve, 100));

      // リセット
      searchForm.reset();

      // 入力がクリアされることを確認
      expect(input.value).toBe('');

      // 結果が非表示になることを確認
      const resultElement = container.querySelector(
        '[data-testid="search-result"]'
      ) as HTMLElement;
      expect(resultElement.style.display).toBe('none');

      searchForm.destroy();
    });
  });
});
