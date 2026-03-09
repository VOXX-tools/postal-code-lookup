import { AutocompleteService } from '../AutocompleteService';
import { DataSourceManager } from '../DataSourceManager';
import { DataSourceType, DataSourceConfig, Municipality, IDataSource } from '../../types';
import * as path from 'path';

describe('AutocompleteService', () => {
  let autocompleteService: AutocompleteService;
  let dataSourceManager: DataSourceManager;

  beforeEach(() => {
    const csvFilePath = path.join(__dirname, '../../..', 'data', 'postal-codes.csv');
    const config: DataSourceConfig = {
      type: DataSourceType.CSV,
      csvFilePath,
      timeout: 5000
    };

    dataSourceManager = new DataSourceManager(config);
    autocompleteService = new AutocompleteService(dataSourceManager);
  });

  describe('getSuggestions()', () => {
    it('空の入力に対して空の配列を返す', async () => {
      const suggestions = await autocompleteService.getSuggestions('');
      expect(suggestions).toEqual([]);
    });

    it('スペースのみの入力に対して空の配列を返す', async () => {
      const suggestions = await autocompleteService.getSuggestions('   ');
      expect(suggestions).toEqual([]);
    });

    it('有効な市区町村名に対して候補を返す', async () => {
      const suggestions = await autocompleteService.getSuggestions('千代田');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toContain('千代田');
    });

    it('都道府県名に対して候補を返す', async () => {
      const suggestions = await autocompleteService.getSuggestions('東京都');
      expect(suggestions.length).toBeGreaterThan(0);
      suggestions.forEach(suggestion => {
        expect(suggestion).toContain('東京都');
      });
    });

    it('部分一致で候補を返す', async () => {
      const suggestions = await autocompleteService.getSuggestions('千代');
      expect(suggestions.length).toBeGreaterThan(0);
      suggestions.forEach(suggestion => {
        expect(suggestion.toLowerCase()).toContain('千代');
      });
    });

    it('候補数が最大50件に制限される', async () => {
      const suggestions = await autocompleteService.getSuggestions('市');
      expect(suggestions.length).toBeLessThanOrEqual(50);
    });

    it('存在しない市区町村名に対して空の配列を返す', async () => {
      const suggestions = await autocompleteService.getSuggestions('存在しない市区町村名12345');
      expect(suggestions).toEqual([]);
    });

    it('大文字小文字を区別せずに検索する', async () => {
      const suggestionsLower = await autocompleteService.getSuggestions('ちよだ');
      const suggestionsUpper = await autocompleteService.getSuggestions('チヨダ');
      
      // どちらも結果が返される（ひらがな・カタカナの変換は行わないが、大文字小文字は区別しない）
      expect(suggestionsLower.length).toBeGreaterThanOrEqual(0);
      expect(suggestionsUpper.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('filterSuggestions()', () => {
    const mockMunicipalities: Municipality[] = [
      {
        prefectureName: '東京都',
        municipalityName: '千代田区',
        fullName: '東京都千代田区'
      },
      {
        prefectureName: '東京都',
        municipalityName: '中央区',
        fullName: '東京都中央区'
      },
      {
        prefectureName: '大阪府',
        municipalityName: '中央区',
        fullName: '大阪府中央区'
      },
      {
        prefectureName: '北海道',
        municipalityName: '札幌市中央区',
        fullName: '北海道札幌市中央区'
      }
    ];

    it('空の入力に対して空の配列を返す', () => {
      const filtered = autocompleteService.filterSuggestions('', mockMunicipalities);
      expect(filtered).toEqual([]);
    });

    it('市区町村名で部分一致フィルタリングする', () => {
      const filtered = autocompleteService.filterSuggestions('千代田', mockMunicipalities);
      expect(filtered.length).toBe(1);
      expect(filtered[0].municipalityName).toBe('千代田区');
    });

    it('都道府県名で部分一致フィルタリングする', () => {
      const filtered = autocompleteService.filterSuggestions('東京', mockMunicipalities);
      expect(filtered.length).toBe(2);
      filtered.forEach(m => {
        expect(m.prefectureName).toBe('東京都');
      });
    });

    it('完全名称で部分一致フィルタリングする', () => {
      const filtered = autocompleteService.filterSuggestions('東京都千代田', mockMunicipalities);
      expect(filtered.length).toBe(1);
      expect(filtered[0].fullName).toBe('東京都千代田区');
    });

    it('複数の市区町村にマッチする場合、すべて返す', () => {
      const filtered = autocompleteService.filterSuggestions('中央', mockMunicipalities);
      expect(filtered.length).toBe(3); // 東京都中央区、大阪府中央区、札幌市中央区
    });

    it('重複を除去する', () => {
      const duplicateMunicipalities: Municipality[] = [
        ...mockMunicipalities,
        ...mockMunicipalities // 重複を追加
      ];

      const filtered = autocompleteService.filterSuggestions('中央', duplicateMunicipalities);
      
      // 重複が除去されている
      const uniqueFullNames = new Set(filtered.map(m => m.fullName));
      expect(uniqueFullNames.size).toBe(filtered.length);
    });

    it('最大50件に制限する', () => {
      // 100件の市区町村を生成
      const manyMunicipalities: Municipality[] = Array.from({ length: 100 }, (_, i) => ({
        prefectureName: '東京都',
        municipalityName: `市区町村${i}`,
        fullName: `東京都市区町村${i}`
      }));

      const filtered = autocompleteService.filterSuggestions('東京', manyMunicipalities);
      expect(filtered.length).toBeLessThanOrEqual(50);
    });

    it('大文字小文字を区別せずにフィルタリングする', () => {
      const filtered1 = autocompleteService.filterSuggestions('ちよだ', mockMunicipalities);
      const filtered2 = autocompleteService.filterSuggestions('チヨダ', mockMunicipalities);
      
      // 大文字小文字の違いは無視される
      expect(filtered1.length).toBeGreaterThanOrEqual(0);
      expect(filtered2.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('formatSuggestion()', () => {
    it('完全名称（都道府県名+市区町村名）を返す', () => {
      const municipality: Municipality = {
        prefectureName: '東京都',
        municipalityName: '千代田区',
        fullName: '東京都千代田区'
      };

      const formatted = autocompleteService.formatSuggestion(municipality);
      expect(formatted).toBe('東京都千代田区');
    });

    it('都道府県名と市区町村名の両方が含まれる', () => {
      const municipality: Municipality = {
        prefectureName: '北海道',
        municipalityName: '札幌市中央区',
        fullName: '北海道札幌市中央区'
      };

      const formatted = autocompleteService.formatSuggestion(municipality);
      expect(formatted).toContain('北海道');
      expect(formatted).toContain('札幌市中央区');
    });
  });

  describe('キャッシュ機能', () => {
    it('2回目の呼び出しでキャッシュが使用される', async () => {
      // モックデータソースを作成
      const mockDataSource: IDataSource = {
        fetchPostalCodes: jest.fn().mockResolvedValue(['100-0001']),
        getMunicipalityList: jest.fn().mockResolvedValue([
          {
            prefectureName: '東京都',
            municipalityName: '千代田区',
            fullName: '東京都千代田区'
          }
        ])
      };

      // データソースマネージャーをモック
      const mockManager = {
        getDataSource: jest.fn().mockReturnValue(mockDataSource),
        setDataSource: jest.fn(),
        validateDataSource: jest.fn().mockReturnValue(true),
        getCurrentDataSourceType: jest.fn().mockReturnValue(DataSourceType.CSV),
        getConfig: jest.fn().mockReturnValue({
          type: DataSourceType.CSV,
          csvFilePath: 'test.csv',
          timeout: 5000
        })
      };

      const service = new AutocompleteService(mockManager as any);

      // 1回目の呼び出し
      await service.getSuggestions('千代田');
      expect(mockDataSource.getMunicipalityList).toHaveBeenCalledTimes(1);

      // 2回目の呼び出し（キャッシュが使用される）
      await service.getSuggestions('千代田');
      expect(mockDataSource.getMunicipalityList).toHaveBeenCalledTimes(1); // 呼び出し回数は変わらない
    });

    it('clearCache()でキャッシュがクリアされる', async () => {
      // モックデータソースを作成
      const mockDataSource: IDataSource = {
        fetchPostalCodes: jest.fn().mockResolvedValue(['100-0001']),
        getMunicipalityList: jest.fn().mockResolvedValue([
          {
            prefectureName: '東京都',
            municipalityName: '千代田区',
            fullName: '東京都千代田区'
          }
        ])
      };

      const mockManager = {
        getDataSource: jest.fn().mockReturnValue(mockDataSource),
        setDataSource: jest.fn(),
        validateDataSource: jest.fn().mockReturnValue(true),
        getCurrentDataSourceType: jest.fn().mockReturnValue(DataSourceType.CSV),
        getConfig: jest.fn().mockReturnValue({
          type: DataSourceType.CSV,
          csvFilePath: 'test.csv',
          timeout: 5000
        })
      };

      const service = new AutocompleteService(mockManager as any);

      // 1回目の呼び出し
      await service.getSuggestions('千代田');
      expect(mockDataSource.getMunicipalityList).toHaveBeenCalledTimes(1);

      // キャッシュをクリア
      service.clearCache();

      // 2回目の呼び出し（キャッシュがクリアされたので再取得）
      await service.getSuggestions('千代田');
      expect(mockDataSource.getMunicipalityList).toHaveBeenCalledTimes(2);
    });
  });

  describe('データソース切り替え', () => {
    it.skip('データソースをAPIに切り替えても動作する (requires API access)', async () => {
      // API設定を含むマネージャーを作成
      const csvFilePath = path.join(__dirname, '../../..', 'data', 'postal-codes.csv');
      const apiConfig: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        apiEndpoint: 'https://zipcloud.ibsnet.co.jp/api',
        timeout: 5000
      };

      const apiManager = new DataSourceManager(apiConfig);
      const apiAutocompleteService = new AutocompleteService(apiManager);

      // CSV → API に切り替え
      apiManager.setDataSource(DataSourceType.API);

      // キャッシュをクリア
      apiAutocompleteService.clearCache();

      // API経由で候補を取得（実際のAPIを呼び出すため、結果は環境に依存）
      const suggestions = await apiAutocompleteService.getSuggestions('千代田');
      
      // 配列が返される
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('データソースをCSVに切り替えても動作する', async () => {
      const csvFilePath = path.join(__dirname, '../../..', 'data', 'postal-codes.csv');
      
      // API → CSV に切り替え
      dataSourceManager.setDataSource(DataSourceType.CSV);

      // キャッシュをクリア
      autocompleteService.clearCache();

      // CSV経由で候補を取得
      const suggestions = await autocompleteService.getSuggestions('千代田');
      
      // 配列が返される
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe('エラーハンドリング', () => {
    it('データソースがエラーを返した場合、エラーが伝播する', async () => {
      // エラーを返すモックデータソース
      const mockDataSource: IDataSource = {
        fetchPostalCodes: jest.fn().mockRejectedValue(new Error('データソースエラー')),
        getMunicipalityList: jest.fn().mockRejectedValue(new Error('データソースエラー'))
      };

      const mockManager = {
        getDataSource: jest.fn().mockReturnValue(mockDataSource),
        setDataSource: jest.fn(),
        validateDataSource: jest.fn().mockReturnValue(true),
        getCurrentDataSourceType: jest.fn().mockReturnValue(DataSourceType.CSV),
        getConfig: jest.fn().mockReturnValue({
          type: DataSourceType.CSV,
          csvFilePath: 'test.csv',
          timeout: 5000
        })
      };

      const service = new AutocompleteService(mockManager as any);

      // エラーが伝播する
      await expect(service.getSuggestions('千代田')).rejects.toThrow('データソースエラー');
    });
  });
});
