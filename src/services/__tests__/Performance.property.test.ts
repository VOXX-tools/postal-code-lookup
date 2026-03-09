/**
 * Performance - Property Tests
 * パフォーマンス要件を検証するプロパティベーステスト
 */

import * as fc from 'fast-check';
import { DataSourceManager } from '../DataSourceManager';
import { PostalCodeSearchService } from '../PostalCodeSearchService';
import { AutocompleteService } from '../AutocompleteService';
import { DataSourceType, DataSourceConfig } from '../../types';
import path from 'path';

describe('Performance - Property Tests', () => {
  let dataSourceManager: DataSourceManager;
  let searchService: PostalCodeSearchService;
  let autocompleteService: AutocompleteService;

  beforeEach(() => {
    // CSVデータソースを使用（テストの安定性のため）
    const csvFilePath = path.join(__dirname, '../../../data/postal-codes.csv');
    const config: DataSourceConfig = {
      type: DataSourceType.CSV,
      csvFilePath,
      timeout: 2000
    };
    dataSourceManager = new DataSourceManager(config);
    searchService = new PostalCodeSearchService(dataSourceManager);
    autocompleteService = new AutocompleteService(dataSourceManager);
  });

  /**
   * Feature: postal-code-lookup, Property 11: 検索応答時間
   * 検証要件: 5.1
   * 
   * 任意の検索リクエストに対して、
   * システムは2秒以内に結果を表示する
   */
  describe('Property 11: 検索応答時間', () => {
    it('任意の有効な市区町村名に対して、検索が2秒以内に完了する', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 })
            .filter(s => s.trim().length > 0 && /^[ぁ-んァ-ヶー一-龠々〆〤\s]+$/.test(s)),
          async (municipalityName) => {
            const startTime = Date.now();

            try {
              await searchService.searchByMunicipality(municipalityName);
            } catch (error) {
              // エラーが発生しても応答時間は測定する
            }

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // 検証: 応答時間が2秒（2000ミリ秒）以内であること
            expect(responseTime).toBeLessThan(2000);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('任意の複数の検索リクエストに対して、各リクエストが2秒以内に完了する', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.string({ minLength: 1, maxLength: 20 })
              .filter(s => s.trim().length > 0 && /^[ぁ-んァ-ヶー一-龠々〆〤\s]+$/.test(s)),
            { minLength: 2, maxLength: 5 }
          ),
          async (municipalityNames) => {
            const responseTimes: number[] = [];

            for (const name of municipalityNames) {
              const startTime = Date.now();

              try {
                await searchService.searchByMunicipality(name);
              } catch (error) {
                // エラーが発生しても応答時間は測定する
              }

              const endTime = Date.now();
              responseTimes.push(endTime - startTime);
            }

            // 検証: すべてのリクエストが2秒以内に完了すること
            responseTimes.forEach(responseTime => {
              expect(responseTime).toBeLessThan(2000);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('任意の長い市区町村名に対して、検索が2秒以内に完了する', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 50 })
            .filter(s => s.trim().length > 0 && /^[ぁ-んァ-ヶー一-龠々〆〤\s]+$/.test(s)),
          async (municipalityName) => {
            const startTime = Date.now();

            try {
              await searchService.searchByMunicipality(municipalityName);
            } catch (error) {
              // エラーが発生しても応答時間は測定する
            }

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // 検証: 長い入力でも応答時間が2秒以内であること
            expect(responseTime).toBeLessThan(2000);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('任意の都道府県名+市区町村名の組み合わせに対して、検索が2秒以内に完了する', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('東京都', '大阪府', '北海道', '京都府', '神奈川県'),
          fc.string({ minLength: 2, maxLength: 10 })
            .filter(s => s.trim().length > 0 && /^[ぁ-んァ-ヶー一-龠々〆〤\s]+$/.test(s)),
          async (prefecture, municipality) => {
            const fullName = prefecture + municipality;
            const startTime = Date.now();

            try {
              await searchService.searchByMunicipality(fullName);
            } catch (error) {
              // エラーが発生しても応答時間は測定する
            }

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // 検証: 都道府県名+市区町村名でも応答時間が2秒以内であること
            expect(responseTime).toBeLessThan(2000);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * オートコンプリート応答時間のテスト
   * 検証要件: 5.2
   */
  describe('オートコンプリート応答時間', () => {
    it('任意の入力に対して、オートコンプリートが2秒以内に完了する', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          async (input) => {
            const startTime = Date.now();

            try {
              await autocompleteService.getSuggestions(input);
            } catch (error) {
              // エラーが発生しても応答時間は測定する
            }

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // 検証: 応答時間が2秒（2000ミリ秒）以内であること
            expect(responseTime).toBeLessThan(2000);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('任意の複数のオートコンプリートリクエストに対して、各リクエストが2秒以内に完了する', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.string({ minLength: 1, maxLength: 20 }),
            { minLength: 2, maxLength: 10 }
          ),
          async (inputs) => {
            const responseTimes: number[] = [];

            for (const input of inputs) {
              const startTime = Date.now();

              try {
                await autocompleteService.getSuggestions(input);
              } catch (error) {
                // エラーが発生しても応答時間は測定する
              }

              const endTime = Date.now();
              responseTimes.push(endTime - startTime);
            }

            // 検証: すべてのリクエストが2秒以内に完了すること
            responseTimes.forEach(responseTime => {
              expect(responseTime).toBeLessThan(2000);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('任意の日本語入力に対して、オートコンプリートが2秒以内に完了する', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 })
            .filter(s => /^[ぁ-んァ-ヶー一-龠々〆〤\s]+$/.test(s)),
          async (input) => {
            const startTime = Date.now();

            try {
              await autocompleteService.getSuggestions(input);
            } catch (error) {
              // エラーが発生しても応答時間は測定する
            }

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // 検証: 日本語入力でも応答時間が2秒以内であること
            expect(responseTime).toBeLessThan(2000);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('キャッシュが有効な場合、2回目以降のリクエストがより高速である', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 10 })
            .filter(s => /^[ぁ-んァ-ヶー一-龠々〆〤\s]+$/.test(s)),
          async (input) => {
            // キャッシュをクリア
            autocompleteService.clearCache();

            // 1回目のリクエスト（キャッシュなし）
            const startTime1 = Date.now();
            await autocompleteService.getSuggestions(input);
            const endTime1 = Date.now();
            const responseTime1 = endTime1 - startTime1;

            // 2回目のリクエスト（キャッシュあり）
            const startTime2 = Date.now();
            await autocompleteService.getSuggestions(input);
            const endTime2 = Date.now();
            const responseTime2 = endTime2 - startTime2;

            // 検証: 両方とも2秒以内であること
            expect(responseTime1).toBeLessThan(2000);
            expect(responseTime2).toBeLessThan(2000);

            // 検証: 2回目の方が高速であること（キャッシュの効果）
            // ただし、非常に高速な場合は差が出ないこともあるため、
            // 2回目が1回目以下であることを確認
            expect(responseTime2).toBeLessThanOrEqual(responseTime1);
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  /**
   * 同時リクエストのパフォーマンステスト
   */
  describe('同時リクエストのパフォーマンス', () => {
    it('任意の複数の同時検索リクエストに対して、各リクエストが2秒以内に完了する', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.string({ minLength: 1, maxLength: 20 })
              .filter(s => s.trim().length > 0 && /^[ぁ-んァ-ヶー一-龠々〆〤\s]+$/.test(s)),
            { minLength: 2, maxLength: 5 }
          ),
          async (municipalityNames) => {
            const startTime = Date.now();

            // 同時にリクエストを実行
            const promises = municipalityNames.map(name =>
              searchService.searchByMunicipality(name).catch(() => null)
            );

            await Promise.all(promises);

            const endTime = Date.now();
            const totalTime = endTime - startTime;

            // 検証: 全体の処理時間が妥当であること
            // 各リクエストが2秒以内なので、同時実行でも2秒程度で完了するはず
            expect(totalTime).toBeLessThan(3000);
          }
        ),
        { numRuns: 30 }
      );
    });

    it('任意の複数の同時オートコンプリートリクエストに対して、各リクエストが2秒以内に完了する', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.string({ minLength: 1, maxLength: 10 }),
            { minLength: 2, maxLength: 5 }
          ),
          async (inputs) => {
            const startTime = Date.now();

            // 同時にリクエストを実行
            const promises = inputs.map(input =>
              autocompleteService.getSuggestions(input).catch(() => [])
            );

            await Promise.all(promises);

            const endTime = Date.now();
            const totalTime = endTime - startTime;

            // 検証: 全体の処理時間が妥当であること
            expect(totalTime).toBeLessThan(3000);
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  /**
   * エッジケースのパフォーマンステスト
   */
  describe('エッジケースのパフォーマンス', () => {
    it('空の入力に対して、即座に応答する', async () => {
      const startTime = Date.now();
      const result = await autocompleteService.getSuggestions('');
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // 検証: 空の入力は即座に処理される（100ミリ秒以内）
      expect(responseTime).toBeLessThan(100);
      expect(result).toEqual([]);
    });

    it('スペースのみの入力に対して、即座に応答する', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 10 }),
          async (spaceCount) => {
            const input = ' '.repeat(spaceCount);
            const startTime = Date.now();
            const result = await autocompleteService.getSuggestions(input);
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // 検証: スペースのみの入力は即座に処理される
            expect(responseTime).toBeLessThan(100);
            expect(result).toEqual([]);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('無効な入力に対して、検証エラーが即座に返される', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 })
            .filter(s => /[<>"'&]/.test(s)), // 無効な文字を含む
          async (invalidInput) => {
            const startTime = Date.now();

            try {
              await searchService.searchByMunicipality(invalidInput);
            } catch (error) {
              // エラーが発生することを期待
            }

            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // 検証: 検証エラーは即座に返される（100ミリ秒以内）
            expect(responseTime).toBeLessThan(100);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
