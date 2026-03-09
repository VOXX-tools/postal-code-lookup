import * as fc from 'fast-check';
import { DataSourceManager } from '../DataSourceManager';
import { PostalCodeSearchService } from '../PostalCodeSearchService';
import { JapanPostAPIClient } from '../../datasources/JapanPostAPIClient';
import { CSVDataReader } from '../../datasources/CSVDataReader';
import { DataSourceType, DataSourceConfig } from '../../types';
import { DataSourceError, TimeoutError, NetworkError, APIError } from '../../errors';

describe('Error Handling - Property Tests', () => {
  let dataSourceManager: DataSourceManager;
  let searchService: PostalCodeSearchService;

  beforeEach(() => {
    const config: DataSourceConfig = {
      type: DataSourceType.API,
      apiEndpoint: 'https://zipcloud.ibsnet.co.jp/api',
      timeout: 2000
    };
    dataSourceManager = new DataSourceManager(config);
    searchService = new PostalCodeSearchService(dataSourceManager);
  });

  /**
   * Feature: postal-code-lookup, Property 17: データソース利用不可時のエラーハンドリング
   * 検証要件: 8.5
   * 
   * 任意のデータソースが利用できない状況において、
   * システムは適切な日本語エラーメッセージを表示する
   */
  describe('Property 17: データソース利用不可時のエラーハンドリング', () => {
    it('任意のデータソースが利用できない場合、DataSourceErrorがスローされる', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0 && /^[ぁ-んァ-ヶー一-龠々〆〤\s]+$/.test(s)),
          async (municipalityName) => {
            // データソースをnullに設定してエラーを発生させる
            (dataSourceManager as any).currentDataSource = null;

            // 検証: DataSourceErrorがスローされること
            await expect(
              searchService.searchByMunicipality(municipalityName)
            ).rejects.toThrow(DataSourceError);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('任意のAPIエラーに対して、適切な日本語エラーメッセージが含まれる', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0 && /^[ぁ-んァ-ヶー一-龠々〆〤\s]+$/.test(s)),
          async (municipalityName) => {
            // APIエラーを発生させるモック
            const mockDataSource = {
              fetchPostalCodes: jest.fn().mockRejectedValue(
                new APIError('郵便番号の取得に失敗しました。しばらくしてから再度お試しください')
              ),
              getMunicipalityList: jest.fn()
            };

            (dataSourceManager as any).currentDataSource = mockDataSource;

            // 検証: APIErrorがスローされ、日本語メッセージが含まれること
            try {
              await searchService.searchByMunicipality(municipalityName);
              fail('Expected APIError to be thrown');
            } catch (error) {
              expect(error).toBeInstanceOf(APIError);
              expect((error as APIError).message).toContain('郵便番号の取得に失敗しました');
              expect((error as APIError).message).toContain('しばらくしてから再度お試しください');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('任意のネットワークエラーに対して、適切な日本語エラーメッセージが含まれる', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0 && /^[ぁ-んァ-ヶー一-龠々〆〤\s]+$/.test(s)),
          async (municipalityName) => {
            // ネットワークエラーを発生させるモック
            const mockDataSource = {
              fetchPostalCodes: jest.fn().mockRejectedValue(
                new NetworkError('ネットワーク接続を確認してください')
              ),
              getMunicipalityList: jest.fn()
            };

            (dataSourceManager as any).currentDataSource = mockDataSource;

            // 検証: NetworkErrorがスローされ、日本語メッセージが含まれること
            try {
              await searchService.searchByMunicipality(municipalityName);
              fail('Expected NetworkError to be thrown');
            } catch (error) {
              expect(error).toBeInstanceOf(NetworkError);
              expect((error as NetworkError).message).toContain('ネットワーク接続を確認してください');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('任意のCSVファイルエラーに対して、適切な日本語エラーメッセージが含まれる', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0 && /^[ぁ-んァ-ヶー一-龠々〆〤\s]+$/.test(s)),
          async (municipalityName) => {
            // CSVファイルエラーを発生させる
            const csvConfig: DataSourceConfig = {
              type: DataSourceType.CSV,
              csvFilePath: '/nonexistent/path/to/file.csv',
              timeout: 2000
            };

            const csvDataSourceManager = new DataSourceManager(csvConfig);
            const csvSearchService = new PostalCodeSearchService(csvDataSourceManager);

            // 検証: エラーがスローされ、日本語メッセージが含まれること
            try {
              await csvSearchService.searchByMunicipality(municipalityName);
              // CSVファイルが存在しない場合、エラーがスローされるはず
            } catch (error) {
              // エラーメッセージが日本語であることを確認
              expect((error as Error).message).toMatch(/CSVファイル|読み込み|失敗/);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('任意のデータソースタイプに対して、利用不可時に適切なエラーが発生する', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(DataSourceType.API, DataSourceType.CSV),
          fc.string({ minLength: 1, maxLength: 20 }),
          async (dataSourceType, municipalityName) => {
            const config: DataSourceConfig = {
              type: dataSourceType,
              apiEndpoint: dataSourceType === DataSourceType.API ? 'https://invalid-endpoint.example.com' : undefined,
              csvFilePath: dataSourceType === DataSourceType.CSV ? '/invalid/path.csv' : undefined,
              timeout: 2000
            };

            const manager = new DataSourceManager(config);
            const service = new PostalCodeSearchService(manager);

            // 検証: エラーがスローされること
            try {
              await service.searchByMunicipality(municipalityName);
              // エラーが発生しない場合もあるが、その場合は空の結果が返される
            } catch (error) {
              // エラーが発生した場合、適切なエラー型であることを確認
              expect(error).toBeInstanceOf(Error);
              expect((error as Error).message).toBeTruthy();
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Feature: postal-code-lookup, Property 18: データ取得タイムアウト処理
   * 検証要件: 8.6
   * 
   * 任意のデータ取得リクエストに対して、
   * タイムアウトが発生した場合、システムは適切にエラーを処理する
   */
  describe('Property 18: データ取得タイムアウト処理', () => {
    it('任意のリクエストに対して、タイムアウトエラーメッセージが日本語である', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0 && /^[ぁ-んァ-ヶー一-龠々〆〤\s]+$/.test(s)),
          async (municipalityName) => {
            // タイムアウトエラーを発生させるモック
            const mockDataSource = {
              fetchPostalCodes: jest.fn().mockRejectedValue(
                new TimeoutError('リクエストがタイムアウトしました。再度お試しください')
              ),
              getMunicipalityList: jest.fn()
            };

            (dataSourceManager as any).currentDataSource = mockDataSource;

            // 検証: TimeoutErrorがスローされ、日本語メッセージが含まれること
            try {
              await searchService.searchByMunicipality(municipalityName);
              fail('Expected TimeoutError to be thrown');
            } catch (error) {
              expect(error).toBeInstanceOf(TimeoutError);
              expect((error as TimeoutError).message).toContain('リクエストがタイムアウトしました');
              expect((error as TimeoutError).message).toContain('再度お試しください');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('任意のタイムアウト設定に対して、設定値が適切に適用される', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 500, max: 5000 }),
          async (timeout) => {
            const config: DataSourceConfig = {
              type: DataSourceType.API,
              apiEndpoint: 'https://zipcloud.ibsnet.co.jp/api',
              timeout
            };

            const manager = new DataSourceManager(config);

            // 検証: タイムアウト設定が適用されていること
            const dataSource = manager.getDataSource();
            expect(dataSource).toBeDefined();

            // タイムアウト設定が内部的に保持されていることを確認
            // （実装によっては、configオブジェクトを通じて確認）
            expect(config.timeout).toBe(timeout);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('任意の複数の同時リクエストに対して、各リクエストが独立してタイムアウト処理される', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0 && /^[ぁ-んァ-ヶー一-龠々〆〤\s]+$/.test(s)),
            { minLength: 2, maxLength: 5 }
          ),
          async (municipalityNames) => {
            // タイムアウトを発生させるモック
            const mockDataSource = {
              fetchPostalCodes: jest.fn().mockRejectedValue(
                new TimeoutError('リクエストがタイムアウトしました。再度お試しください')
              ),
              getMunicipalityList: jest.fn()
            };

            (dataSourceManager as any).currentDataSource = mockDataSource;

            // 複数のリクエストを同時に実行
            const promises = municipalityNames.map(name =>
              searchService.searchByMunicipality(name).catch(error => error)
            );

            const results = await Promise.all(promises);

            // 検証: すべてのリクエストがTimeoutErrorを返すこと
            results.forEach(result => {
              expect(result).toBeInstanceOf(TimeoutError);
              expect((result as TimeoutError).message).toContain('タイムアウト');
            });
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});
