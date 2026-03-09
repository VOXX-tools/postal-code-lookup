import * as fc from 'fast-check';
import axios from 'axios';
import { JapanPostAPIClient } from '../JapanPostAPIClient';
import { DataSourceConfig, DataSourceType } from '../../types';
import { APIError, NetworkError, TimeoutError } from '../../errors';

// Axiosをモック
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('JapanPostAPIClient - Property Tests', () => {
  let client: JapanPostAPIClient;
  let config: DataSourceConfig;

  beforeEach(() => {
    config = {
      type: DataSourceType.API,
      apiEndpoint: 'https://zipcloud.ibsnet.co.jp/api',
      timeout: 5000
    };

    // axios.createのモック
    mockedAxios.create = jest.fn().mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
      defaults: {},
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() }
      }
    } as any);

    client = new JapanPostAPIClient(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Feature: postal-code-lookup, Property 15: 日本郵便APIからのデータ取得
   * 検証要件: 8.2
   * 
   * 任意の日本郵便公式APIを使用する設定において、
   * システムはAPIから最新の郵便番号情報を取得する
   */
  describe('Property 15: 日本郵便APIからのデータ取得', () => {
    it('任意の有効な市区町村名に対して、APIから郵便番号データを取得できる', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          async (municipalityName) => {
            // APIレスポンスをモック
            const mockResponse = {
              data: {
                results: [
                  {
                    zipcode: '1000001',
                    address1: '東京都',
                    address2: municipalityName,
                    address3: '千代田'
                  },
                  {
                    zipcode: '100-0002',
                    address1: '東京都',
                    address2: municipalityName,
                    address3: '皇居外苑'
                  }
                ]
              }
            };

            const mockAxiosInstance = (client as any).axiosInstance;
            mockAxiosInstance.get = jest.fn().mockResolvedValue(mockResponse);

            // 郵便番号を取得
            const postalCodes = await client.fetchPostalCodes(municipalityName);

            // 検証: 郵便番号が取得できること
            expect(Array.isArray(postalCodes)).toBe(true);
            expect(postalCodes.length).toBeGreaterThan(0);

            // 検証: すべての郵便番号がハイフン付き7桁形式であること
            postalCodes.forEach(code => {
              expect(code).toMatch(/^\d{3}-\d{4}$/);
            });

            // 検証: APIが呼び出されたこと
            expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search', {
              params: { address: municipalityName }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('任意のAPIエンドポイントに対して、HTTPS通信を使用する', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.webUrl({ validSchemes: ['https'] }),
          async (apiEndpoint) => {
            const httpsConfig: DataSourceConfig = {
              type: DataSourceType.API,
              apiEndpoint,
              timeout: 5000
            };

            // axios.createのモックを再設定
            const mockInstance = {
              get: jest.fn(),
              defaults: { baseURL: apiEndpoint },
              interceptors: {
                request: { use: jest.fn(), eject: jest.fn() },
                response: { use: jest.fn(), eject: jest.fn() }
              }
            };
            mockedAxios.create = jest.fn().mockReturnValue(mockInstance as any);

            const httpsClient = new JapanPostAPIClient(httpsConfig);

            // 検証: HTTPSエンドポイントが設定されていること
            expect(mockedAxios.create).toHaveBeenCalledWith(
              expect.objectContaining({
                baseURL: expect.stringContaining('https://')
              })
            );
          }
        ),
        { numRuns: 50 }
      );
    });

    it('任意のタイムアウト設定に対して、適切にタイムアウトエラーを処理する', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 100, max: 5000 }),
          fc.string({ minLength: 1, maxLength: 20 }),
          async (timeout, municipalityName) => {
            const timeoutConfig: DataSourceConfig = {
              type: DataSourceType.API,
              apiEndpoint: 'https://zipcloud.ibsnet.co.jp/api',
              timeout
            };

            // axios.createのモックを再設定
            const mockInstance = {
              get: jest.fn().mockRejectedValue({
                isAxiosError: true,
                code: 'ECONNABORTED',
                message: 'timeout of ' + timeout + 'ms exceeded'
              }),
              defaults: {},
              interceptors: {
                request: { use: jest.fn(), eject: jest.fn() },
                response: { use: jest.fn(), eject: jest.fn() }
              }
            };
            mockedAxios.create = jest.fn().mockReturnValue(mockInstance as any);
            (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);

            const timeoutClient = new JapanPostAPIClient(timeoutConfig);

            // 検証: タイムアウトエラーがスローされること
            await expect(
              timeoutClient.fetchPostalCodes(municipalityName)
            ).rejects.toThrow(TimeoutError);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('任意のネットワークエラーに対して、適切にエラーを処理する', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          async (municipalityName) => {
            // axios.createのモックを再設定
            const mockInstance = {
              get: jest.fn().mockRejectedValue({
                isAxiosError: true,
                message: 'Network Error',
                response: undefined
              }),
              defaults: {},
              interceptors: {
                request: { use: jest.fn(), eject: jest.fn() },
                response: { use: jest.fn(), eject: jest.fn() }
              }
            };
            mockedAxios.create = jest.fn().mockReturnValue(mockInstance as any);
            (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);

            const networkClient = new JapanPostAPIClient(config);

            // 検証: ネットワークエラーがスローされること
            await expect(
              networkClient.fetchPostalCodes(municipalityName)
            ).rejects.toThrow(NetworkError);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('任意のAPIエラー（4xx, 5xx）に対して、適切にエラーを処理する', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 400, max: 599 }),
          fc.string({ minLength: 1, maxLength: 20 }),
          async (statusCode, municipalityName) => {
            const mockAxiosInstance = (client as any).axiosInstance;

            // APIエラーをモック
            mockAxiosInstance.get = jest.fn().mockRejectedValue({
              isAxiosError: true,
              response: {
                status: statusCode,
                statusText: 'Error'
              }
            });

            // 検証: APIエラーがスローされること
            await expect(
              client.fetchPostalCodes(municipalityName)
            ).rejects.toThrow(APIError);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('任意のリクエストに対して、市区町村リストを取得できる', async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(null), async () => {
          // 市区町村リストのモックレスポンス
          const mockResponse = {
            data: {
              municipalities: [
                {
                  prefecture: '東京都',
                  municipality: '千代田区'
                },
                {
                  prefecture: '東京都',
                  municipality: '中央区'
                },
                {
                  prefecture: '神奈川県',
                  municipality: '横浜市'
                }
              ]
            }
          };

          const mockAxiosInstance = (client as any).axiosInstance;
          mockAxiosInstance.get = jest.fn().mockResolvedValue(mockResponse);

          // 市区町村リストを取得
          const municipalities = await client.getMunicipalityList();

          // 検証: 市区町村リストが取得できること
          expect(Array.isArray(municipalities)).toBe(true);
          expect(municipalities.length).toBeGreaterThan(0);

          // 検証: 各市区町村が必要なプロパティを持つこと
          municipalities.forEach(municipality => {
            expect(municipality).toHaveProperty('prefectureName');
            expect(municipality).toHaveProperty('municipalityName');
            expect(municipality).toHaveProperty('fullName');
            expect(typeof municipality.prefectureName).toBe('string');
            expect(typeof municipality.municipalityName).toBe('string');
            expect(typeof municipality.fullName).toBe('string');
          });
        }),
        { numRuns: 50 }
      );
    });

    it('任意の郵便番号形式に対して、ハイフン付き7桁形式に正規化する', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.array(
            fc.record({
              zipcode: fc.oneof(
                fc.constant('1000001'), // ハイフンなし
                fc.constant('100-0001'), // ハイフンあり
                fc.constant('1000002'),
                fc.constant('100-0002')
              )
            }),
            { minLength: 1, maxLength: 10 }
          ),
          async (municipalityName, results) => {
            const mockResponse = {
              data: { results }
            };

            const mockAxiosInstance = (client as any).axiosInstance;
            mockAxiosInstance.get = jest.fn().mockResolvedValue(mockResponse);

            const postalCodes = await client.fetchPostalCodes(municipalityName);

            // 検証: すべての郵便番号がハイフン付き7桁形式であること
            postalCodes.forEach(code => {
              expect(code).toMatch(/^\d{3}-\d{4}$/);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
