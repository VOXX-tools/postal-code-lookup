import axios, { AxiosError } from 'axios';
import { JapanPostAPIClient } from '../JapanPostAPIClient';
import { DataSourceConfig, DataSourceType } from '../../types';
import { APIError, NetworkError, TimeoutError } from '../../errors';

// Axiosをモック
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('JapanPostAPIClient - Unit Tests', () => {
  let client: JapanPostAPIClient;
  let config: DataSourceConfig;
  let mockAxiosInstance: any;

  beforeEach(() => {
    config = {
      type: DataSourceType.API,
      apiEndpoint: 'https://zipcloud.ibsnet.co.jp/api',
      timeout: 5000
    };

    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
      defaults: {
        baseURL: config.apiEndpoint
      },
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() }
      }
    };

    mockedAxios.create = jest.fn().mockReturnValue(mockAxiosInstance);
    mockedAxios.isAxiosError = jest.fn((_payload: any): _payload is AxiosError => true) as any;

    client = new JapanPostAPIClient(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('HTTPS通信を確保するためにHTTPSエンドポイントを使用する', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.stringContaining('https://')
        })
      );
    });

    it('設定されたタイムアウト値を使用する', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 5000
        })
      );
    });

    it('デフォルトのAPIエンドポイントを使用する（未指定時）', () => {
      const configWithoutEndpoint: DataSourceConfig = {
        type: DataSourceType.API,
        timeout: 5000
      };

      mockedAxios.create = jest.fn().mockReturnValue(mockAxiosInstance);
      new JapanPostAPIClient(configWithoutEndpoint);

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.stringContaining('https://')
        })
      );
    });
  });

  describe('fetchPostalCodes', () => {
    it('有効な市区町村名で郵便番号を取得できる', async () => {
      const mockResponse = {
        data: {
          results: [
            { zipcode: '1000001' },
            { zipcode: '100-0002' },
            { zipcode: '1000003' }
          ]
        }
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const postalCodes = await client.fetchPostalCodes('千代田区');

      expect(postalCodes).toEqual(['100-0001', '100-0002', '100-0003']);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search', {
        params: { address: '千代田区' }
      });
    });

    it('重複する郵便番号を除去する', async () => {
      const mockResponse = {
        data: {
          results: [
            { zipcode: '1000001' },
            { zipcode: '1000001' },
            { zipcode: '100-0002' }
          ]
        }
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const postalCodes = await client.fetchPostalCodes('千代田区');

      expect(postalCodes).toEqual(['100-0001', '100-0002']);
      expect(postalCodes.length).toBe(2);
    });

    it('結果が空の場合は空配列を返す', async () => {
      const mockResponse = {
        data: {
          results: []
        }
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const postalCodes = await client.fetchPostalCodes('存在しない市区町村');

      expect(postalCodes).toEqual([]);
    });

    it('resultsプロパティがない場合は空配列を返す', async () => {
      const mockResponse = {
        data: {}
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const postalCodes = await client.fetchPostalCodes('千代田区');

      expect(postalCodes).toEqual([]);
    });

    it('郵便番号をハイフン付き7桁形式に変換する', async () => {
      const mockResponse = {
        data: {
          results: [
            { zipcode: '1000001' }, // ハイフンなし
            { zipcode: '100-0002' } // ハイフンあり
          ]
        }
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const postalCodes = await client.fetchPostalCodes('千代田区');

      postalCodes.forEach(code => {
        expect(code).toMatch(/^\d{3}-\d{4}$/);
      });
    });
  });

  describe('getMunicipalityList', () => {
    it('市区町村リストを取得できる', async () => {
      const mockResponse = {
        data: {
          municipalities: [
            { prefecture: '東京都', municipality: '千代田区' },
            { prefecture: '東京都', municipality: '中央区' },
            { prefecture: '神奈川県', municipality: '横浜市' }
          ]
        }
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const municipalities = await client.getMunicipalityList();

      expect(municipalities).toHaveLength(3);
      expect(municipalities[0]).toEqual({
        prefectureName: '東京都',
        municipalityName: '千代田区',
        fullName: '東京都千代田区'
      });
    });

    it('2回目の呼び出しではキャッシュを使用する', async () => {
      const mockResponse = {
        data: {
          municipalities: [
            { prefecture: '東京都', municipality: '千代田区' }
          ]
        }
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      // 1回目の呼び出し
      await client.getMunicipalityList();
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);

      // 2回目の呼び出し（キャッシュを使用）
      await client.getMunicipalityList();
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1); // 呼び出し回数は変わらない
    });

    it('municipalitiesプロパティがない場合は空配列を返す', async () => {
      const mockResponse = {
        data: {}
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const municipalities = await client.getMunicipalityList();

      expect(municipalities).toEqual([]);
    });
  });

  describe('Error Handling - APIエラー', () => {
    it('タイムアウトエラー（ECONNABORTED）をTimeoutErrorとしてスローする', async () => {
      mockAxiosInstance.get.mockRejectedValue({
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      });

      await expect(client.fetchPostalCodes('千代田区')).rejects.toThrow(TimeoutError);
      await expect(client.fetchPostalCodes('千代田区')).rejects.toThrow(
        'リクエストがタイムアウトしました'
      );
    });

    it('タイムアウトエラー（ETIMEDOUT）をTimeoutErrorとしてスローする', async () => {
      mockAxiosInstance.get.mockRejectedValue({
        isAxiosError: true,
        code: 'ETIMEDOUT',
        message: 'timeout exceeded'
      });

      await expect(client.fetchPostalCodes('千代田区')).rejects.toThrow(TimeoutError);
    });

    it('ネットワークエラー（レスポンスなし）をNetworkErrorとしてスローする', async () => {
      mockAxiosInstance.get.mockRejectedValue({
        isAxiosError: true,
        message: 'Network Error',
        response: undefined
      });

      await expect(client.fetchPostalCodes('千代田区')).rejects.toThrow(NetworkError);
      await expect(client.fetchPostalCodes('千代田区')).rejects.toThrow(
        'ネットワーク接続を確認してください'
      );
    });

    it('400エラーをAPIErrorとしてスローする', async () => {
      mockAxiosInstance.get.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 400,
          statusText: 'Bad Request'
        }
      });

      await expect(client.fetchPostalCodes('千代田区')).rejects.toThrow(APIError);
      await expect(client.fetchPostalCodes('千代田区')).rejects.toThrow('APIエラー: 400');
    });

    it('404エラーをAPIErrorとしてスローする', async () => {
      mockAxiosInstance.get.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 404,
          statusText: 'Not Found'
        }
      });

      await expect(client.fetchPostalCodes('千代田区')).rejects.toThrow(APIError);
    });

    it('500エラーをAPIErrorとしてスローする', async () => {
      mockAxiosInstance.get.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 500,
          statusText: 'Internal Server Error'
        }
      });

      await expect(client.fetchPostalCodes('千代田区')).rejects.toThrow(APIError);
    });

    it('その他のエラーをAPIErrorとしてスローする', async () => {
      // axios.isAxiosErrorがfalseを返すようにモック
      (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(false);
      mockAxiosInstance.get.mockRejectedValue(new Error('Unknown error'));

      await expect(client.fetchPostalCodes('千代田区')).rejects.toThrow(APIError);
    });
  });

  describe('Error Handling - getMunicipalityList', () => {
    it('APIエラー時にエラーをスローする', async () => {
      mockAxiosInstance.get.mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 500,
          statusText: 'Internal Server Error'
        }
      });

      await expect(client.getMunicipalityList()).rejects.toThrow(APIError);
    });

    it('ネットワークエラー時にNetworkErrorをスローする', async () => {
      mockAxiosInstance.get.mockRejectedValue({
        isAxiosError: true,
        message: 'Network Error',
        response: undefined
      });

      await expect(client.getMunicipalityList()).rejects.toThrow(NetworkError);
    });
  });

  describe('Postal Code Formatting', () => {
    it('7桁の郵便番号をXXX-XXXX形式に変換する', async () => {
      const mockResponse = {
        data: {
          results: [{ zipcode: '1234567' }]
        }
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const postalCodes = await client.fetchPostalCodes('テスト');

      expect(postalCodes[0]).toBe('123-4567');
    });

    it('既にハイフン付きの郵便番号はそのまま使用する', async () => {
      const mockResponse = {
        data: {
          results: [{ zipcode: '123-4567' }]
        }
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const postalCodes = await client.fetchPostalCodes('テスト');

      expect(postalCodes[0]).toBe('123-4567');
    });

    it('7桁でない郵便番号はそのまま返す', async () => {
      const mockResponse = {
        data: {
          results: [{ zipcode: '12345' }]
        }
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const postalCodes = await client.fetchPostalCodes('テスト');

      expect(postalCodes[0]).toBe('12345');
    });
  });
});
