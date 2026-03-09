import * as fs from 'fs';
import { CSVDataReader } from '../CSVDataReader';
import { CSVFileError } from '../../errors';

// fsモジュールをモック
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('CSVDataReader - Unit Tests', () => {
  let reader: CSVDataReader;
  const testCsvPath = '/test/postal_codes.csv';

  beforeEach(() => {
    reader = new CSVDataReader(testCsvPath);
    jest.clearAllMocks();
  });

  describe('loadCSVFile', () => {
    it('有効なCSVファイルを読み込める', async () => {
      const csvContent = `
1000001,東京都,千代田区,千代田
1000002,東京都,千代田区,皇居外苑
      `.trim();

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(csvContent);

      await reader.loadCSVFile();

      expect(mockedFs.existsSync).toHaveBeenCalledWith(testCsvPath);
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(testCsvPath, 'utf-8');
      expect(reader.isDataLoaded()).toBe(true);
      expect(reader.getDataCount()).toBe(2);
    });

    it('存在しないファイルに対してCSVFileErrorをスローする', async () => {
      mockedFs.existsSync.mockReturnValue(false);

      await expect(reader.loadCSVFile()).rejects.toThrow(CSVFileError);
      await expect(reader.loadCSVFile()).rejects.toThrow('CSVファイルが見つかりません');
    });

    it('ファイル読み込みエラー時にCSVFileErrorをスローする', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      await expect(reader.loadCSVFile()).rejects.toThrow(CSVFileError);
      await expect(reader.loadCSVFile()).rejects.toThrow('CSVファイルの読み込みに失敗しました');
    });

    it('別のファイルパスを指定して読み込める', async () => {
      const anotherPath = '/test/another.csv';
      const csvContent = '1000001,東京都,千代田区,千代田';

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(csvContent);

      await reader.loadCSVFile(anotherPath);

      expect(mockedFs.existsSync).toHaveBeenCalledWith(anotherPath);
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(anotherPath, 'utf-8');
    });
  });

  describe('parseCSVData', () => {
    it('標準的なCSVデータを解析できる', () => {
      const csvContent = `
1000001,東京都,千代田区,千代田
1000002,東京都,千代田区,皇居外苑
1040001,東京都,中央区,銀座
      `.trim();

      const data = reader.parseCSVData(csvContent);

      expect(data).toHaveLength(3);
      expect(data[0]).toEqual({
        postalCode: '100-0001',
        prefectureName: '東京都',
        municipalityName: '千代田区',
        townName: '千代田'
      });
    });

    it('ヘッダー行をスキップする', () => {
      const csvContent = `
郵便番号,都道府県,市区町村,町域
1000001,東京都,千代田区,千代田
1000002,東京都,千代田区,皇居外苑
      `.trim();

      const data = reader.parseCSVData(csvContent);

      expect(data).toHaveLength(2);
      expect(data[0].postalCode).toBe('100-0001');
    });

    it('ダブルクォートで囲まれた値を正しく解析する', () => {
      const csvContent = `
"1000001","東京都","千代田区","千代田"
"1000002","東京都","千代田区","皇居外苑"
      `.trim();

      const data = reader.parseCSVData(csvContent);

      expect(data).toHaveLength(2);
      expect(data[0].postalCode).toBe('100-0001');
      expect(data[0].prefectureName).toBe('東京都');
    });

    it('カンマを含む値を正しく解析する', () => {
      const csvContent = `
"1000001","東京都","千代田区","丸の内,一丁目"
      `.trim();

      const data = reader.parseCSVData(csvContent);

      expect(data).toHaveLength(1);
      expect(data[0].townName).toBe('丸の内,一丁目');
    });

    it('空行をスキップする', () => {
      const csvContent = `
1000001,東京都,千代田区,千代田

1000002,東京都,千代田区,皇居外苑

      `.trim();

      const data = reader.parseCSVData(csvContent);

      expect(data).toHaveLength(2);
    });

    it('無効な郵便番号を含む行をスキップする', () => {
      const csvContent = `
1000001,東京都,千代田区,千代田
12345,東京都,千代田区,無効
1000002,東京都,千代田区,皇居外苑
abc-defg,東京都,千代田区,無効
      `.trim();

      const data = reader.parseCSVData(csvContent);

      expect(data).toHaveLength(2);
      expect(data[0].postalCode).toBe('100-0001');
      expect(data[1].postalCode).toBe('100-0002');
    });

    it('フィールド数が不足している行をスキップする', () => {
      const csvContent = `
1000001,東京都,千代田区,千代田
1000002,東京都
1000003,東京都,中央区,銀座
      `.trim();

      const data = reader.parseCSVData(csvContent);

      expect(data).toHaveLength(2);
    });

    it('空のCSVに対してCSVFileErrorをスローする', () => {
      const csvContent = '';

      expect(() => reader.parseCSVData(csvContent)).toThrow(CSVFileError);
      expect(() => reader.parseCSVData(csvContent)).toThrow(
        '有効なデータが見つかりませんでした'
      );
    });

    it('有効なデータがない場合にCSVFileErrorをスローする', () => {
      const csvContent = `
invalid,data,here
12345,東京都,千代田区,千代田
      `.trim();

      expect(() => reader.parseCSVData(csvContent)).toThrow(CSVFileError);
    });
  });

  describe('fetchPostalCodes', () => {
    beforeEach(() => {
      const csvContent = `
1000001,東京都,千代田区,千代田
1000002,東京都,千代田区,皇居外苑
1040001,東京都,中央区,銀座
2200001,神奈川県,横浜市,中区
      `.trim();

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(csvContent);
    });

    it('市区町村名で郵便番号を取得できる', async () => {
      const postalCodes = await reader.fetchPostalCodes('千代田区');

      expect(postalCodes).toHaveLength(2);
      expect(postalCodes).toContain('100-0001');
      expect(postalCodes).toContain('100-0002');
    });

    it('都道府県名+市区町村名で郵便番号を取得できる', async () => {
      const postalCodes = await reader.fetchPostalCodes('東京都千代田区');

      expect(postalCodes).toHaveLength(2);
      expect(postalCodes).toContain('100-0001');
      expect(postalCodes).toContain('100-0002');
    });

    it('部分一致で郵便番号を取得できる', async () => {
      const postalCodes = await reader.fetchPostalCodes('横浜');

      expect(postalCodes).toHaveLength(1);
      expect(postalCodes).toContain('220-0001');
    });

    it('該当する市区町村がない場合は空配列を返す', async () => {
      const postalCodes = await reader.fetchPostalCodes('存在しない市区町村');

      expect(postalCodes).toEqual([]);
    });

    it('重複する郵便番号を除去する', async () => {
      const csvContent = `
1000001,東京都,千代田区,千代田
1000001,東京都,千代田区,丸の内
1000002,東京都,千代田区,皇居外苑
      `.trim();

      mockedFs.readFileSync.mockReturnValue(csvContent);

      const newReader = new CSVDataReader(testCsvPath);
      const postalCodes = await newReader.fetchPostalCodes('千代田区');

      expect(postalCodes).toHaveLength(2);
      expect(postalCodes.filter(code => code === '100-0001')).toHaveLength(1);
    });

    it('データが未ロードの場合は自動的にロードする', async () => {
      const postalCodes = await reader.fetchPostalCodes('千代田区');

      expect(mockedFs.readFileSync).toHaveBeenCalled();
      expect(postalCodes.length).toBeGreaterThan(0);
    });
  });

  describe('getMunicipalityList', () => {
    beforeEach(() => {
      const csvContent = `
1000001,東京都,千代田区,千代田
1000002,東京都,千代田区,皇居外苑
1040001,東京都,中央区,銀座
2200001,神奈川県,横浜市,中区
      `.trim();

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(csvContent);
    });

    it('市区町村リストを取得できる', async () => {
      const municipalities = await reader.getMunicipalityList();

      expect(municipalities).toHaveLength(3);
      expect(municipalities).toContainEqual({
        prefectureName: '東京都',
        municipalityName: '千代田区',
        fullName: '東京都千代田区'
      });
      expect(municipalities).toContainEqual({
        prefectureName: '東京都',
        municipalityName: '中央区',
        fullName: '東京都中央区'
      });
      expect(municipalities).toContainEqual({
        prefectureName: '神奈川県',
        municipalityName: '横浜市',
        fullName: '神奈川県横浜市'
      });
    });

    it('重複する市区町村を除去する', async () => {
      const municipalities = await reader.getMunicipalityList();

      const chiyodaCount = municipalities.filter(
        m => m.municipalityName === '千代田区'
      ).length;

      expect(chiyodaCount).toBe(1);
    });

    it('データが未ロードの場合は自動的にロードする', async () => {
      const municipalities = await reader.getMunicipalityList();

      expect(mockedFs.readFileSync).toHaveBeenCalled();
      expect(municipalities.length).toBeGreaterThan(0);
    });
  });

  describe('validateCSVFormat', () => {
    it('有効なデータに対してtrueを返す', () => {
      const data = [
        {
          postalCode: '100-0001',
          prefectureName: '東京都',
          municipalityName: '千代田区',
          townName: '千代田'
        },
        {
          postalCode: '100-0002',
          prefectureName: '東京都',
          municipalityName: '千代田区',
          townName: '皇居外苑'
        }
      ];

      const isValid = reader.validateCSVFormat(data);

      expect(isValid).toBe(true);
    });

    it('空のデータに対してfalseを返す', () => {
      const data: any[] = [];

      const isValid = reader.validateCSVFormat(data);

      expect(isValid).toBe(false);
    });

    it('必須フィールドが欠けているデータに対してfalseを返す', () => {
      const data = [
        {
          postalCode: '100-0001',
          prefectureName: '',
          municipalityName: '千代田区',
          townName: '千代田'
        }
      ];

      const isValid = reader.validateCSVFormat(data);

      expect(isValid).toBe(false);
    });

    it('無効な郵便番号を含むデータに対してfalseを返す', () => {
      const data = [
        {
          postalCode: '12345',
          prefectureName: '東京都',
          municipalityName: '千代田区',
          townName: '千代田'
        }
      ];

      const isValid = reader.validateCSVFormat(data);

      expect(isValid).toBe(false);
    });
  });

  describe('Postal Code Formatting', () => {
    it('ハイフンなしの郵便番号をXXX-XXXX形式に変換する', () => {
      const csvContent = '1234567,東京都,テスト区,テスト町';

      const data = reader.parseCSVData(csvContent);

      expect(data[0].postalCode).toBe('123-4567');
    });

    it('既にハイフン付きの郵便番号はそのまま使用する', () => {
      const csvContent = '123-4567,東京都,テスト区,テスト町';

      const data = reader.parseCSVData(csvContent);

      expect(data[0].postalCode).toBe('123-4567');
    });
  });

  describe('isDataLoaded', () => {
    it('データ未ロード時にfalseを返す', () => {
      expect(reader.isDataLoaded()).toBe(false);
    });

    it('データロード後にtrueを返す', async () => {
      const csvContent = '1000001,東京都,千代田区,千代田';

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(csvContent);

      await reader.loadCSVFile();

      expect(reader.isDataLoaded()).toBe(true);
    });
  });

  describe('getDataCount', () => {
    it('ロードされたデータ数を返す', async () => {
      const csvContent = `
1000001,東京都,千代田区,千代田
1000002,東京都,千代田区,皇居外苑
1040001,東京都,中央区,銀座
      `.trim();

      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(csvContent);

      await reader.loadCSVFile();

      expect(reader.getDataCount()).toBe(3);
    });

    it('データ未ロード時に0を返す', () => {
      expect(reader.getDataCount()).toBe(0);
    });
  });
});
