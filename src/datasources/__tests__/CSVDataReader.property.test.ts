import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';
import { CSVDataReader } from '../CSVDataReader';
import { CSVFileError } from '../../errors';

// fsモジュールをモック
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('CSVDataReader - Property Tests', () => {
  let reader: CSVDataReader;
  const testCsvPath = '/test/postal_codes.csv';

  beforeEach(() => {
    reader = new CSVDataReader(testCsvPath);
    jest.clearAllMocks();
  });

  /**
   * Feature: postal-code-lookup, Property 16: CSVファイルの解析
   * 検証要件: 8.3
   * 
   * 任意の日本郵便標準フォーマットのCSVファイルに対して、
   * システムは正しく解析し、郵便番号データを取得できる
   */
  describe('Property 16: CSVファイルの解析', () => {
    it('任意の有効なCSVデータに対して、正しく解析できる', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              postalCode: fc.oneof(
                fc.constant('1000001'),
                fc.constant('100-0001'),
                fc.constant('1234567')
              ),
              prefecture: fc.constantFrom('東京都', '神奈川県', '大阪府', '北海道'),
              municipality: fc.constantFrom('千代田区', '横浜市', '大阪市', '札幌市'),
              town: fc.constantFrom('千代田', '中区', '北区', '中央区')
            }),
            { minLength: 1, maxLength: 100 }
          ),
          (records) => {
            // CSVコンテンツを生成
            const csvContent = records
              .map(r => `${r.postalCode},${r.prefecture},${r.municipality},${r.town}`)
              .join('\n');

            // CSV解析
            const data = reader.parseCSVData(csvContent);

            // 検証: データが解析されること
            expect(data.length).toBeGreaterThan(0);

            // 検証: すべてのデータが必要なフィールドを持つこと
            data.forEach(item => {
              expect(item).toHaveProperty('postalCode');
              expect(item).toHaveProperty('prefectureName');
              expect(item).toHaveProperty('municipalityName');
              expect(item).toHaveProperty('townName');
              expect(typeof item.postalCode).toBe('string');
              expect(typeof item.prefectureName).toBe('string');
              expect(typeof item.municipalityName).toBe('string');
              expect(typeof item.townName).toBe('string');
            });

            // 検証: すべての郵便番号がハイフン付き7桁形式であること
            data.forEach(item => {
              expect(item.postalCode).toMatch(/^\d{3}-\d{4}$/);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('任意のヘッダー行を含むCSVに対して、ヘッダーをスキップして解析できる', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            '郵便番号,都道府県,市区町村,町域',
            'postal_code,prefecture,municipality,town',
            'zipcode,pref,city,area'
          ),
          fc.array(
            fc.record({
              postalCode: fc.constant('1000001'),
              prefecture: fc.constant('東京都'),
              municipality: fc.constant('千代田区'),
              town: fc.constant('千代田')
            }),
            { minLength: 1, maxLength: 50 }
          ),
          (header, records) => {
            // ヘッダー付きCSVコンテンツを生成
            const csvContent =
              header +
              '\n' +
              records
                .map(r => `${r.postalCode},${r.prefecture},${r.municipality},${r.town}`)
                .join('\n');

            // CSV解析
            const data = reader.parseCSVData(csvContent);

            // 検証: ヘッダーがスキップされ、データが解析されること
            expect(data.length).toBe(records.length);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('任意のダブルクォートで囲まれた値を含むCSVに対して、正しく解析できる', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              postalCode: fc.constant('1000001'),
              prefecture: fc.constant('東京都'),
              municipality: fc.constant('千代田区'),
              town: fc.constantFrom('千代田', '丸の内,一丁目', '大手町')
            }),
            { minLength: 1, maxLength: 50 }
          ),
          (records) => {
            // ダブルクォート付きCSVコンテンツを生成
            const csvContent = records
              .map(
                r =>
                  `"${r.postalCode}","${r.prefecture}","${r.municipality}","${r.town}"`
              )
              .join('\n');

            // CSV解析
            const data = reader.parseCSVData(csvContent);

            // 検証: データが正しく解析されること
            expect(data.length).toBe(records.length);

            // 検証: ダブルクォートが除去されていること
            data.forEach(item => {
              expect(item.postalCode).not.toContain('"');
              expect(item.prefectureName).not.toContain('"');
              expect(item.municipalityName).not.toContain('"');
              expect(item.townName).not.toContain('"');
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('任意の市区町村名に対して、該当する郵便番号を取得できる', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('千代田区', '横浜市', '大阪市', '札幌市'),
          async (municipalityName) => {
            // テストデータを生成
            const csvContent = `
1000001,東京都,千代田区,千代田
1000002,東京都,千代田区,皇居外苑
2200001,神奈川県,横浜市,中区
5300001,大阪府,大阪市,北区
0600001,北海道,札幌市,中央区
            `.trim();

            // fsモックを設定
            mockedFs.existsSync.mockReturnValue(true);
            mockedFs.readFileSync.mockReturnValue(csvContent);

            // 郵便番号を取得
            const postalCodes = await reader.fetchPostalCodes(municipalityName);

            // 検証: 郵便番号が取得できること
            expect(Array.isArray(postalCodes)).toBe(true);
            expect(postalCodes.length).toBeGreaterThan(0);

            // 検証: すべての郵便番号がハイフン付き7桁形式であること
            postalCodes.forEach(code => {
              expect(code).toMatch(/^\d{3}-\d{4}$/);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('任意の都道府県名+市区町村名の組み合わせに対して、郵便番号を取得できる', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('東京都千代田区', '神奈川県横浜市', '大阪府大阪市'),
          async (fullName) => {
            // テストデータを生成
            const csvContent = `
1000001,東京都,千代田区,千代田
2200001,神奈川県,横浜市,中区
5300001,大阪府,大阪市,北区
            `.trim();

            // fsモックを設定
            mockedFs.existsSync.mockReturnValue(true);
            mockedFs.readFileSync.mockReturnValue(csvContent);

            // 郵便番号を取得
            const postalCodes = await reader.fetchPostalCodes(fullName);

            // 検証: 郵便番号が取得できること
            expect(Array.isArray(postalCodes)).toBe(true);
            expect(postalCodes.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('任意のCSVファイルから市区町村リストを取得できる', async () => {
      await fc.assert(
        fc.asyncProperty(fc.constant(null), async () => {
          // テストデータを生成
          const csvContent = `
1000001,東京都,千代田区,千代田
1000002,東京都,千代田区,皇居外苑
1040001,東京都,中央区,銀座
2200001,神奈川県,横浜市,中区
          `.trim();

          // fsモックを設定
          mockedFs.existsSync.mockReturnValue(true);
          mockedFs.readFileSync.mockReturnValue(csvContent);

          // 市区町村リストを取得
          const municipalities = await reader.getMunicipalityList();

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

          // 検証: 重複が除去されていること（千代田区は2件あるが1件になる）
          const chiyodaCount = municipalities.filter(
            m => m.municipalityName === '千代田区'
          ).length;
          expect(chiyodaCount).toBe(1);
        }),
        { numRuns: 50 }
      );
    });

    it('任意の無効な郵便番号を含むCSVに対して、有効なデータのみを解析する', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              postalCode: fc.oneof(
                fc.constant('1000001'), // 有効
                fc.constant('100-0001'), // 有効
                fc.constant('12345'), // 無効（5桁）
                fc.constant('12345678'), // 無効（8桁）
                fc.constant('abc-defg') // 無効（数字でない）
              ),
              prefecture: fc.constant('東京都'),
              municipality: fc.constant('千代田区'),
              town: fc.constant('千代田')
            }),
            { minLength: 5, maxLength: 20 }
          ),
          (records) => {
            // CSVコンテンツを生成
            const csvContent = records
              .map(r => `${r.postalCode},${r.prefecture},${r.municipality},${r.town}`)
              .join('\n');

            // 有効な郵便番号が少なくとも1つあるかチェック
            const hasValidPostalCode = records.some(
              r => r.postalCode === '1000001' || r.postalCode === '100-0001'
            );

            if (hasValidPostalCode) {
              // CSV解析
              const data = reader.parseCSVData(csvContent);

              // 検証: 有効なデータのみが解析されること
              data.forEach(item => {
                expect(item.postalCode).toMatch(/^\d{3}-\d{4}$/);
              });
            } else {
              // すべて無効な場合はエラーがスローされることを確認
              expect(() => reader.parseCSVData(csvContent)).toThrow(CSVFileError);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('任意の空行や空白を含むCSVに対して、正しく解析できる', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              postalCode: fc.constant('1000001'),
              prefecture: fc.constant('東京都'),
              municipality: fc.constant('千代田区'),
              town: fc.constant('千代田')
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (records) => {
            // 空行を含むCSVコンテンツを生成
            const csvContent = records
              .map(r => `${r.postalCode},${r.prefecture},${r.municipality},${r.town}`)
              .join('\n\n'); // 空行を挿入

            // CSV解析
            const data = reader.parseCSVData(csvContent);

            // 検証: 空行がスキップされ、データが解析されること
            expect(data.length).toBe(records.length);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('任意のCSVフォーマットに対して、フォーマット検証ができる', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              postalCode: fc.constant('1000001'),
              prefecture: fc.constant('東京都'),
              municipality: fc.constant('千代田区'),
              town: fc.constant('千代田')
            }),
            { minLength: 1, maxLength: 50 }
          ),
          (records) => {
            // CSVコンテンツを生成
            const csvContent = records
              .map(r => `${r.postalCode},${r.prefecture},${r.municipality},${r.town}`)
              .join('\n');

            // CSV解析
            const data = reader.parseCSVData(csvContent);

            // フォーマット検証
            const isValid = reader.validateCSVFormat(data);

            // 検証: フォーマットが有効であること
            expect(isValid).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Error Handling', () => {
    it('存在しないファイルに対して、CSVFileErrorをスローする', async () => {
      mockedFs.existsSync.mockReturnValue(false);

      await expect(reader.loadCSVFile()).rejects.toThrow(CSVFileError);
      await expect(reader.loadCSVFile()).rejects.toThrow('CSVファイルが見つかりません');
    });

    it('空のCSVファイルに対して、CSVFileErrorをスローする', () => {
      const csvContent = '';

      expect(() => reader.parseCSVData(csvContent)).toThrow(CSVFileError);
      expect(() => reader.parseCSVData(csvContent)).toThrow(
        '有効なデータが見つかりませんでした'
      );
    });

    it('無効なデータのみを含むCSVに対して、CSVFileErrorをスローする', () => {
      const csvContent = `
invalid,data,here
12345,東京都,千代田区,千代田
abc,def,ghi,jkl
      `.trim();

      expect(() => reader.parseCSVData(csvContent)).toThrow(CSVFileError);
    });
  });
});
