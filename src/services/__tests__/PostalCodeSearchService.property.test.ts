import * as fc from 'fast-check';
import { PostalCodeSearchService } from '../PostalCodeSearchService';
import { DataSourceManager } from '../DataSourceManager';
import { DataSourceType, DataSourceConfig } from '../../types';
import { ValidationError } from '../../errors';
import * as path from 'path';

describe('PostalCodeSearchService - Property Tests', () => {
  const csvFilePath = path.join(__dirname, '../../..', 'data', 'postal-codes.csv');
  let service: PostalCodeSearchService;
  let dataSourceManager: DataSourceManager;

  beforeEach(async () => {
    const config: DataSourceConfig = {
      type: DataSourceType.CSV,
      csvFilePath,
      timeout: 5000
    };
    dataSourceManager = new DataSourceManager(config);
    service = new PostalCodeSearchService(dataSourceManager);
    
    // Pre-load CSV data to avoid repeated loading
    const dataSource = dataSourceManager.getDataSource();
    await dataSource.getMunicipalityList();
  });

  /**
   * **Feature: postal-code-lookup, Property 2: 有効な市区町村名での検索成功**
   * 
   * 任意の有効な市区町村名に対して、検索を実行すると、
   * その市区町村に属するすべての郵便番号が取得される
   * 
   * **検証要件: 1.2**
   */
  describe('Property 2: 有効な市区町村名での検索成功', () => {
    it('任意の有効な市区町村名に対して、郵便番号が取得される', async () => {
      // CSVファイルから実際の市区町村名を取得
      const dataSource = dataSourceManager.getDataSource();
      const municipalities = await dataSource.getMunicipalityList();
      const validMunicipalityNames = municipalities.map(m => m.municipalityName);

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...validMunicipalityNames.slice(0, 10)), // 最初の10件でテスト
          async (municipalityName) => {
            const result = await service.searchByMunicipality(municipalityName);

            // 郵便番号が取得されることを確認
            expect(result.postalCodes).toBeDefined();
            expect(Array.isArray(result.postalCodes)).toBe(true);
            expect(result.postalCodes.length).toBeGreaterThan(0);

            // 市区町村名が設定されることを確認
            expect(result.municipalityName).toBeDefined();
            expect(result.municipalityName.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  /**
   * **Feature: postal-code-lookup, Property 3: 郵便番号の出力形式**
   * 
   * 任意の検索結果に対して、すべての郵便番号がカンマ区切り形式で単一行に表示され、
   * 各郵便番号はハイフン付き7桁形式（XXX-XXXX）である
   * 
   * **検証要件: 1.3, 1.4, 9.1, 9.2, 9.3**
   */
  describe('Property 3: 郵便番号の出力形式', () => {
    it('任意の郵便番号リストに対して、カンマ区切り形式で出力される', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.tuple(
              fc.integer({ min: 0, max: 999 }),
              fc.integer({ min: 0, max: 9999 })
            ).map(([first, second]) => {
              const firstPart = first.toString().padStart(3, '0');
              const secondPart = second.toString().padStart(4, '0');
              return `${firstPart}-${secondPart}`;
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (postalCodes) => {
            const formatted = service.formatOutput(postalCodes);

            // カンマ区切りであることを確認
            expect(formatted).toMatch(/^[\d\-,]+$/);

            // 各郵便番号がハイフン付き7桁形式であることを確認
            const codes = formatted.split(',');
            codes.forEach(code => {
              expect(code).toMatch(/^\d{3}-\d{4}$/);
            });

            // 単一行であることを確認（改行なし）
            expect(formatted).not.toContain('\n');
            expect(formatted).not.toContain('\r');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('formatOutput()は重複を除去し、ソートされた結果を返す', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.tuple(
              fc.integer({ min: 0, max: 999 }),
              fc.integer({ min: 0, max: 9999 })
            ).map(([first, second]) => {
              const firstPart = first.toString().padStart(3, '0');
              const secondPart = second.toString().padStart(4, '0');
              return `${firstPart}-${secondPart}`;
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (postalCodes) => {
            const formatted = service.formatOutput(postalCodes);
            const codes = formatted.split(',');

            // 重複がないことを確認
            const uniqueCodes = Array.from(new Set(codes));
            expect(codes.length).toBe(uniqueCodes.length);

            // ソートされていることを確認
            const sortedCodes = [...codes].sort();
            expect(codes).toEqual(sortedCodes);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: postal-code-lookup, Property 4: 存在しない市区町村名のエラーハンドリング**
   * 
   * 任意の存在しない市区町村名に対して、検索を実行すると、
   * 適切な日本語エラーメッセージが表示される
   * 
   * **検証要件: 1.5, 4.1**
   */
  describe('Property 4: 存在しない市区町村名のエラーハンドリング', () => {
    it('任意の存在しない市区町村名に対して、エラーがスローされる', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => {
            // 実際の市区町村名ではないランダムな文字列を生成
            return /^[a-zA-Z0-9]+$/.test(s); // 英数字のみ（日本の市区町村名ではない）
          }),
          async (invalidName) => {
            // ValidationError または CSVFileError がスローされることを確認
            await expect(service.searchByMunicipality(invalidName)).rejects.toThrow();
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * **Feature: postal-code-lookup, Property 9: 無効な文字の入力検証**
   * 
   * 任意の無効な文字を含む入力に対して、システムは入力を検証し、
   * 適切な日本語エラーメッセージを表示する
   * 
   * **検証要件: 4.2**
   */
  describe('Property 9: 無効な文字の入力検証', () => {
    it('任意の特殊文字を含む入力に対して、検証エラーが返される', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }).map(s => s + '<script>'),
          (invalidInput) => {
            const validation = service.validateMunicipalityName(invalidInput);

            // 検証が失敗することを確認
            expect(validation.isValid).toBe(false);
            expect(validation.errorMessage).toBeDefined();
            expect(validation.errorMessage).toContain('無効な文字');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('空の入力に対して、適切なエラーメッセージが返される', () => {
      fc.assert(
        fc.property(fc.constantFrom('', '   ', '\t', '\n'), (emptyInput) => {
          const validation = service.validateMunicipalityName(emptyInput);

          expect(validation.isValid).toBe(false);
          expect(validation.errorMessage).toBe('市区町村名を入力してください');
        }),
        { numRuns: 10 }
      );
    });

    it('長すぎる入力に対して、適切なエラーメッセージが返される', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 51, maxLength: 100 }).filter(s => s.trim().length > 50),
          (longInput) => {
            const validation = service.validateMunicipalityName(longInput);

            expect(validation.isValid).toBe(false);
            expect(validation.errorMessage).toContain('長すぎます');
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * **Feature: postal-code-lookup, Property 10: 市区町村名の存在確認**
   * 
   * 任意の入力された市区町村名に対して、システムはデータソース（API/CSV）に
   * 存在するか確認する
   * 
   * **検証要件: 4.3**
   */
  describe('Property 10: 市区町村名の存在確認', () => {
    it('任意の市区町村名に対して、存在確認が実行される', async () => {
      const dataSource = dataSourceManager.getDataSource();
      const municipalities = await dataSource.getMunicipalityList();
      const validNames = municipalities.slice(0, 5).map(m => m.municipalityName);
      const invalidNames = ['存在しない市', 'テスト区', '架空町'];

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...validNames, ...invalidNames),
          async (municipalityName) => {
            const exists = await service.checkMunicipalityExists(municipalityName);

            // 結果がbooleanであることを確認
            expect(typeof exists).toBe('boolean');

            // 有効な名前の場合はtrueを返すことを確認
            if (validNames.includes(municipalityName)) {
              expect(exists).toBe(true);
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * **Feature: postal-code-lookup, Property 20: XSS攻撃対策**
   * 
   * 任意のユーザー入力に対して、システムはXSS攻撃を防ぐために
   * 入力をサニタイズする
   * 
   * **検証要件: 10.1**
   */
  describe('Property 20: XSS攻撃対策', () => {
    it('任意のXSS攻撃パターンに対して、入力がサニタイズされる', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            '<script>alert("XSS")</script>',
            '<img src=x onerror=alert(1)>',
            '<svg onload=alert(1)>',
            'javascript:alert(1)',
            '<iframe src="javascript:alert(1)">',
            '"><script>alert(String.fromCharCode(88,83,83))</script>'
          ),
          (xssInput) => {
            const sanitized = service.sanitizeInput(xssInput);

            // 危険なタグが除去されることを確認
            expect(sanitized).not.toContain('<script');
            expect(sanitized).not.toContain('<img');
            expect(sanitized).not.toContain('<svg');
            expect(sanitized).not.toContain('<iframe');
            expect(sanitized).not.toContain('onerror');
            expect(sanitized).not.toContain('onload');

            // 危険な文字が除去されることを確認
            expect(sanitized).not.toContain('<');
            expect(sanitized).not.toContain('>');
            expect(sanitized).not.toContain('"');
            expect(sanitized).not.toContain("'");
            
            // javascript: プロトコルが除去されることを確認
            expect(sanitized.toLowerCase()).not.toContain('javascript:');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('任意の通常の日本語入力に対して、サニタイズ後も内容が保持される', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('千代田区', '東京都千代田区', '横浜市', '大阪市中央区'),
          (normalInput) => {
            const sanitized = service.sanitizeInput(normalInput);

            // 通常の入力は変更されないことを確認
            expect(sanitized).toBe(normalInput);
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});
