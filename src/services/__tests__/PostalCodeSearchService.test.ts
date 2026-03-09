import { PostalCodeSearchService } from '../PostalCodeSearchService';
import { DataSourceManager } from '../DataSourceManager';
import { DataSourceType, DataSourceConfig, IDataSource } from '../../types';
import { ValidationError } from '../../errors';
import * as path from 'path';

describe('PostalCodeSearchService', () => {
  let searchService: PostalCodeSearchService;
  let dataSourceManager: DataSourceManager;

  beforeEach(() => {
    const csvFilePath = path.join(__dirname, '../../..', 'data', 'postal-codes.csv');
    const config: DataSourceConfig = {
      type: DataSourceType.CSV,
      csvFilePath,
      timeout: 5000
    };

    dataSourceManager = new DataSourceManager(config);
    searchService = new PostalCodeSearchService(dataSourceManager);
  });

  describe('searchByMunicipality()', () => {
    it('有効な市区町村名で検索すると郵便番号が返される', async () => {
      const result = await searchService.searchByMunicipality('千代田区');
      
      expect(result.postalCodes).toBeDefined();
      expect(result.postalCodes.length).toBeGreaterThan(0);
      expect(result.municipalityName).toBeDefined();
    });

    it('空の入力で検索するとValidationErrorがスローされる', async () => {
      await expect(searchService.searchByMunicipality('')).rejects.toThrow(ValidationError);
      await expect(searchService.searchByMunicipality('')).rejects.toThrow('市区町村名を入力してください');
    });

    it('スペースのみの入力で検索するとValidationErrorがスローされる', async () => {
      await expect(searchService.searchByMunicipality('   ')).rejects.toThrow(ValidationError);
      await expect(searchService.searchByMunicipality('   ')).rejects.toThrow('市区町村名を入力してください');
    });

    it('存在しない市区町村名で検索するとValidationErrorがスローされる', async () => {
      await expect(searchService.searchByMunicipality('存在しない市区町村名12345')).rejects.toThrow(ValidationError);
      await expect(searchService.searchByMunicipality('存在しない市区町村名12345')).rejects.toThrow('指定された市区町村が見つかりません');
    });

    it('無効な文字を含む入力で検索するとValidationErrorがスローされる', async () => {
      await expect(searchService.searchByMunicipality('<script>alert("xss")</script>')).rejects.toThrow(ValidationError);
      await expect(searchService.searchByMunicipality('<script>alert("xss")</script>')).rejects.toThrow('無効な文字が含まれています');
    });

    it('51文字以上の入力で検索するとValidationErrorがスローされる', async () => {
      const longInput = 'あ'.repeat(51);
      await expect(searchService.searchByMunicipality(longInput)).rejects.toThrow(ValidationError);
      await expect(searchService.searchByMunicipality(longInput)).rejects.toThrow('市区町村名が長すぎます（50文字以内）');
    });

    it('都道府県名と市区町村名の組み合わせで検索できる', async () => {
      const result = await searchService.searchByMunicipality('東京都千代田区');
      
      expect(result.postalCodes).toBeDefined();
      expect(result.postalCodes.length).toBeGreaterThan(0);
      expect(result.prefectureName).toBe('東京都');
      expect(result.municipalityName).toBeDefined();
    });

    it('前後のスペースがトリムされる', async () => {
      const result = await searchService.searchByMunicipality('  千代田区  ');
      
      expect(result.postalCodes).toBeDefined();
      expect(result.postalCodes.length).toBeGreaterThan(0);
    });
  });

  describe('validateMunicipalityName()', () => {
    it('有効な市区町村名はtrueを返す', () => {
      const result = searchService.validateMunicipalityName('千代田区');
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('空の入力はfalseを返し、エラーメッセージを含む', () => {
      const result = searchService.validateMunicipalityName('');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('市区町村名を入力してください');
    });

    it('スペースのみの入力はfalseを返す', () => {
      const result = searchService.validateMunicipalityName('   ');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('市区町村名を入力してください');
    });

    it('51文字以上の入力はfalseを返す', () => {
      const longInput = 'あ'.repeat(51);
      const result = searchService.validateMunicipalityName(longInput);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('市区町村名が長すぎます（50文字以内）');
    });

    it('無効な文字を含む入力はfalseを返す', () => {
      const result = searchService.validateMunicipalityName('<script>');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('無効な文字が含まれています');
    });

    it('日本語文字は有効', () => {
      const result = searchService.validateMunicipalityName('東京都千代田区');
      expect(result.isValid).toBe(true);
    });

    it('英数字は有効', () => {
      const result = searchService.validateMunicipalityName('Tokyo123');
      expect(result.isValid).toBe(true);
    });

    it('ハイフンは有効', () => {
      const result = searchService.validateMunicipalityName('千代田-区');
      expect(result.isValid).toBe(true);
    });

    it('スペースは有効', () => {
      const result = searchService.validateMunicipalityName('千代田 区');
      expect(result.isValid).toBe(true);
    });

    it('長音記号（ー）は有効', () => {
      const result = searchService.validateMunicipalityName('ニューヨーク');
      expect(result.isValid).toBe(true);
    });
  });

  describe('sanitizeInput()', () => {
    it('HTMLタグが除去される', () => {
      const sanitized = searchService.sanitizeInput('<div>千代田区</div>');
      expect(sanitized).toBe('千代田区');
    });

    it('スクリプトタグが除去される', () => {
      const sanitized = searchService.sanitizeInput('<script>alert("xss")</script>千代田区');
      // スクリプトタグと危険な文字が除去される
      expect(sanitized).toBe('alert(xss)千代田区');
    });

    it('javascript:プロトコルが除去される', () => {
      const sanitized = searchService.sanitizeInput('javascript:alert("xss")千代田区');
      // javascript:と危険な文字が除去される
      expect(sanitized).toBe('alert(xss)千代田区');
    });

    it('イベントハンドラが除去される', () => {
      const sanitized = searchService.sanitizeInput('onclick=alert("xss")千代田区');
      // イベントハンドラと危険な文字が除去される
      expect(sanitized).toBe('alert(xss)千代田区');
    });

    it('危険な文字が除去される', () => {
      const sanitized = searchService.sanitizeInput('<>"\'&千代田区');
      expect(sanitized).toBe('千代田区');
    });

    it('前後のスペースがトリムされる', () => {
      const sanitized = searchService.sanitizeInput('  千代田区  ');
      expect(sanitized).toBe('千代田区');
    });

    it('連続するスペースが1つに変換される', () => {
      const sanitized = searchService.sanitizeInput('千代田    区');
      expect(sanitized).toBe('千代田 区');
    });

    it('通常の日本語文字列はそのまま返される', () => {
      const sanitized = searchService.sanitizeInput('東京都千代田区');
      expect(sanitized).toBe('東京都千代田区');
    });
  });

  describe('formatOutput()', () => {
    it('郵便番号がカンマ区切りで返される', () => {
      const formatted = searchService.formatOutput(['100-0001', '100-0002', '100-0003']);
      expect(formatted).toBe('100-0001,100-0002,100-0003');
    });

    it('重複が除去される', () => {
      const formatted = searchService.formatOutput(['100-0001', '100-0002', '100-0001']);
      expect(formatted).toBe('100-0001,100-0002');
    });

    it('昇順にソートされる', () => {
      const formatted = searchService.formatOutput(['100-0003', '100-0001', '100-0002']);
      expect(formatted).toBe('100-0001,100-0002,100-0003');
    });

    it('空の配列は空文字列を返す', () => {
      const formatted = searchService.formatOutput([]);
      expect(formatted).toBe('');
    });

    it('1件の郵便番号はそのまま返される', () => {
      const formatted = searchService.formatOutput(['100-0001']);
      expect(formatted).toBe('100-0001');
    });
  });

  describe('checkMunicipalityExists()', () => {
    it('存在する市区町村名はtrueを返す', async () => {
      const exists = await searchService.checkMunicipalityExists('千代田');
      expect(exists).toBe(true);
    });

    it('存在しない市区町村名はfalseを返す', async () => {
      const exists = await searchService.checkMunicipalityExists('存在しない市区町村名12345');
      expect(exists).toBe(false);
    });

    it('部分一致で検索する', async () => {
      const exists = await searchService.checkMunicipalityExists('千代');
      expect(exists).toBe(true);
    });

    it('データソースエラー時はfalseを返す', async () => {
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

      const service = new PostalCodeSearchService(mockManager as any);
      const exists = await service.checkMunicipalityExists('千代田');
      
      expect(exists).toBe(false);
    });
  });

  describe('データソース切り替え', () => {
    it.skip('データソースをAPIに切り替えても検索できる (requires API access)', async () => {
      // API設定を含むマネージャーを作成
      const csvFilePath = path.join(__dirname, '../../..', 'data', 'postal-codes.csv');
      const apiConfig: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        apiEndpoint: 'https://zipcloud.ibsnet.co.jp/api',
        timeout: 5000
      };

      const apiManager = new DataSourceManager(apiConfig);
      const apiSearchService = new PostalCodeSearchService(apiManager);

      // API に切り替え
      apiManager.setDataSource(DataSourceType.API);

      // API経由で検索（実際のAPIを呼び出すため、結果は環境に依存）
      const result = await apiSearchService.searchByMunicipality('千代田区');
      
      expect(result.postalCodes).toBeDefined();
      expect(Array.isArray(result.postalCodes)).toBe(true);
    });

    it('データソースをCSVに切り替えても検索できる', async () => {
      // CSV に切り替え
      dataSourceManager.setDataSource(DataSourceType.CSV);

      // CSV経由で検索
      const result = await searchService.searchByMunicipality('千代田区');
      
      expect(result.postalCodes).toBeDefined();
      expect(result.postalCodes.length).toBeGreaterThan(0);
    });
  });

  describe('0件の検索結果シナリオ', () => {
    it('0件の結果の場合、ValidationErrorがスローされる', async () => {
      // 0件を返すモックデータソース
      const mockDataSource: IDataSource = {
        fetchPostalCodes: jest.fn().mockResolvedValue([]),
        getMunicipalityList: jest.fn().mockResolvedValue([])
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

      const service = new PostalCodeSearchService(mockManager as any);

      await expect(service.searchByMunicipality('存在しない市区町村')).rejects.toThrow(ValidationError);
      await expect(service.searchByMunicipality('存在しない市区町村')).rejects.toThrow('指定された市区町村が見つかりません');
    });
  });

  describe('特定のエラーメッセージ', () => {
    it('空の入力: 「市区町村名を入力してください」', async () => {
      await expect(searchService.searchByMunicipality('')).rejects.toThrow('市区町村名を入力してください');
    });

    it('長すぎる入力: 「市区町村名が長すぎます（50文字以内）」', async () => {
      const longInput = 'あ'.repeat(51);
      await expect(searchService.searchByMunicipality(longInput)).rejects.toThrow('市区町村名が長すぎます（50文字以内）');
    });

    it('無効な文字: 「無効な文字が含まれています」', async () => {
      await expect(searchService.searchByMunicipality('<script>')).rejects.toThrow('無効な文字が含まれています');
    });

    it('0件の結果: 「指定された市区町村が見つかりません」', async () => {
      // 0件を返すモックデータソース
      const mockDataSource: IDataSource = {
        fetchPostalCodes: jest.fn().mockResolvedValue([]),
        getMunicipalityList: jest.fn().mockResolvedValue([])
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

      const service = new PostalCodeSearchService(mockManager as any);

      await expect(service.searchByMunicipality('存在しない')).rejects.toThrow('指定された市区町村が見つかりません');
    });
  });
});
