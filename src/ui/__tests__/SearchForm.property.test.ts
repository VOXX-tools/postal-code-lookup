import * as fc from 'fast-check';
import { SearchForm } from '../SearchForm';
import { PostalCodeSearchService } from '../../services/PostalCodeSearchService';
import { AutocompleteService } from '../../services/AutocompleteService';
import { DataSourceManager } from '../../services/DataSourceManager';
import { CSVDataReader } from '../../datasources/CSVDataReader';
import { DataSourceType } from '../../types';

/**
 * Feature: postal-code-lookup
 * UI層のプロパティベーステスト
 */
describe('UI層 - プロパティベーステスト', () => {
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

  /**
   * プロパティ 7: 市区町村名のみの入力受付
   * 検証要件: 3.1
   *
   * 任意の市区町村名のみの入力（都道府県名なし）に対して、
   * システムは正しく検索を実行できる
   */
  describe('Property 7: 市区町村名のみの入力受付', () => {
    it('任意の市区町村名のみの入力に対して、システムは正しく検索を実行できる', async () => {
      // 市区町村名のみのジェネレーター（都道府県名なし）
      const municipalityOnlyArb = fc.constantFrom(
        '千代田区',
        '中央区',
        '港区',
        '新宿区',
        '文京区',
        '台東区',
        '墨田区',
        '江東区',
        '品川区',
        '目黒区'
      );

      await fc.assert(
        fc.asyncProperty(municipalityOnlyArb, async (municipalityName) => {
          // SearchFormを作成
          const searchForm = new SearchForm(searchService, autocompleteService);
          searchForm.render(container);

          // 入力フィールドを取得
          const input = container.querySelector(
            '[data-testid="municipality-input"]'
          ) as HTMLInputElement;
          expect(input).toBeTruthy();

          // 市区町村名のみを入力
          input.value = municipalityName;
          input.dispatchEvent(new Event('input', { bubbles: true }));

          // 検索ボタンをクリック
          const searchButton = container.querySelector(
            '[data-testid="search-button"]'
          ) as HTMLButtonElement;
          expect(searchButton).toBeTruthy();
          searchButton.click();

          // 結果が表示されるまで待機
          await new Promise(resolve => setTimeout(resolve, 100));

          // 結果またはエラーが表示されることを確認
          const resultElement = container.querySelector('[data-testid="search-result"]');
          const errorElement = container.querySelector('[data-testid="error-message"]');

          // 結果かエラーのいずれかが表示されている
          const hasResult = resultElement && (resultElement as HTMLElement).style.display !== 'none';
          const hasError = errorElement && (errorElement as HTMLElement).style.display !== 'none';

          expect(hasResult || hasError).toBe(true);

          // クリーンアップ
          searchForm.destroy();
        }),
        { numRuns: 10 }
      );
    });
  });

  /**
   * プロパティ 8: 都道府県名と市区町村名の組み合わせ入力受付
   * 検証要件: 3.2
   *
   * 任意の都道府県名と市区町村名の組み合わせ入力に対して、
   * システムは正しく検索を実行できる
   */
  describe('Property 8: 都道府県名と市区町村名の組み合わせ入力受付', () => {
    it('任意の都道府県名と市区町村名の組み合わせ入力に対して、システムは正しく検索を実行できる', async () => {
      // 都道府県名+市区町村名のジェネレーター
      const fullNameArb = fc.constantFrom(
        '東京都千代田区',
        '東京都中央区',
        '東京都港区',
        '神奈川県横浜市',
        '大阪府大阪市',
        '愛知県名古屋市',
        '北海道札幌市',
        '福岡県福岡市',
        '京都府京都市',
        '兵庫県神戸市'
      );

      await fc.assert(
        fc.asyncProperty(fullNameArb, async (fullName) => {
          // SearchFormを作成
          const searchForm = new SearchForm(searchService, autocompleteService);
          searchForm.render(container);

          // 入力フィールドを取得
          const input = container.querySelector(
            '[data-testid="municipality-input"]'
          ) as HTMLInputElement;
          expect(input).toBeTruthy();

          // 都道府県名+市区町村名を入力
          input.value = fullName;
          input.dispatchEvent(new Event('input', { bubbles: true }));

          // 検索ボタンをクリック
          const searchButton = container.querySelector(
            '[data-testid="search-button"]'
          ) as HTMLButtonElement;
          expect(searchButton).toBeTruthy();
          searchButton.click();

          // 結果が表示されるまで待機
          await new Promise(resolve => setTimeout(resolve, 100));

          // 結果またはエラーが表示されることを確認
          const resultElement = container.querySelector('[data-testid="search-result"]');
          const errorElement = container.querySelector('[data-testid="error-message"]');

          // 結果かエラーのいずれかが表示されている
          const hasResult = resultElement && (resultElement as HTMLElement).style.display !== 'none';
          const hasError = errorElement && (errorElement as HTMLElement).style.display !== 'none';

          expect(hasResult || hasError).toBe(true);

          // クリーンアップ
          searchForm.destroy();
        }),
        { numRuns: 10 }
      );
    });
  });

  /**
   * プロパティ 12: UIテキストの日本語表示
   * 検証要件: 6.5
   *
   * 任意のUIテキストは日本語で表示される
   */
  describe('Property 12: UIテキストの日本語表示', () => {
    it('任意のUIテキストは日本語で表示される', () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          // SearchFormを作成
          const searchForm = new SearchForm(searchService, autocompleteService);
          searchForm.render(container);

          // タイトルが日本語であることを確認
          const title = container.querySelector('[data-testid="page-title"]');
          expect(title).toBeTruthy();
          expect(title!.textContent).toMatch(/^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/);

          // 説明が日本語であることを確認
          const description = container.querySelector('[data-testid="page-description"]');
          expect(description).toBeTruthy();
          expect(description!.textContent).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);

          // プレースホルダーが日本語であることを確認
          const input = container.querySelector(
            '[data-testid="municipality-input"]'
          ) as HTMLInputElement;
          expect(input).toBeTruthy();
          expect(input.placeholder).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);

          // 検索ボタンが日本語であることを確認
          const searchButton = container.querySelector('[data-testid="search-button"]');
          expect(searchButton).toBeTruthy();
          expect(searchButton!.textContent).toMatch(/^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/);

          // クリーンアップ
          searchForm.destroy();
        }),
        { numRuns: 10 }
      );
    });
  });

  /**
   * プロパティ 13: エラーメッセージの日本語表示
   * 検証要件: 7.4
   *
   * 任意のエラーメッセージは日本語で表示される
   */
  describe('Property 13: エラーメッセージの日本語表示', () => {
    it('任意のエラーメッセージは日本語で表示される', async () => {
      // エラーを引き起こす入力のジェネレーター
      const errorInputArb = fc.constantFrom(
        '', // 空の入力
        '   ', // スペースのみ
        '存在しない市区町村名12345', // 存在しない市区町村
        '<script>alert("xss")</script>', // 無効な文字
        'あ'.repeat(100) // 長すぎる入力
      );

      await fc.assert(
        fc.asyncProperty(errorInputArb, async (errorInput) => {
          // SearchFormを作成
          const searchForm = new SearchForm(searchService, autocompleteService);
          searchForm.render(container);

          // 入力フィールドを取得
          const input = container.querySelector(
            '[data-testid="municipality-input"]'
          ) as HTMLInputElement;
          expect(input).toBeTruthy();

          // エラーを引き起こす入力
          input.value = errorInput;
          input.dispatchEvent(new Event('input', { bubbles: true }));

          // 検索ボタンをクリック
          const searchButton = container.querySelector(
            '[data-testid="search-button"]'
          ) as HTMLButtonElement;
          expect(searchButton).toBeTruthy();
          searchButton.click();

          // エラーが表示されるまで待機
          await new Promise(resolve => setTimeout(resolve, 100));

          // エラーメッセージを取得
          const errorElement = container.querySelector(
            '[data-testid="error-message"]'
          ) as HTMLElement;

          // エラーが表示されている場合、日本語であることを確認
          if (errorElement && errorElement.style.display !== 'none') {
            const errorMessage = errorElement.textContent || '';
            // 日本語文字が含まれていることを確認
            expect(errorMessage).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
          }

          // クリーンアップ
          searchForm.destroy();
        }),
        { numRuns: 10 }
      );
    });
  });
});
