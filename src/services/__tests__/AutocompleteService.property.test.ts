import * as fc from 'fast-check';
import { AutocompleteService } from '../AutocompleteService';
import { DataSourceManager } from '../DataSourceManager';
import { DataSourceType, DataSourceConfig, Municipality } from '../../types';
import * as path from 'path';

/**
 * **Feature: postal-code-lookup, Property 1: オートコンプリート候補表示**
 * 
 * 任意の入力文字列に対して、オートコンプリート機能を呼び出すと、
 * 部分一致する市区町村名の候補リストが2秒以内に返される
 * 
 * **検証要件: 1.1, 2.1, 2.4, 5.2**
 */
describe('Property 1: オートコンプリート候補表示', () => {
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

  it('任意の入力文字列に対して、2秒以内に候補リストが返される', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 0, maxLength: 50 }),
        async (input) => {
          const startTime = Date.now();
          const suggestions = await autocompleteService.getSuggestions(input);
          const endTime = Date.now();

          // 2秒以内に応答
          expect(endTime - startTime).toBeLessThan(2000);

          // 配列が返される
          expect(Array.isArray(suggestions)).toBe(true);

          // すべての候補が文字列
          suggestions.forEach(suggestion => {
            expect(typeof suggestion).toBe('string');
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('任意の有効な日本語入力に対して、部分一致する候補が返される', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('東京', '大阪', '千代田', '横浜', '札幌', '福岡', '名古屋', '京都'),
        async (input) => {
          const suggestions = await autocompleteService.getSuggestions(input);

          // 候補が返される
          expect(suggestions.length).toBeGreaterThan(0);

          // すべての候補に入力文字列が含まれる
          suggestions.forEach(suggestion => {
            expect(suggestion.toLowerCase()).toContain(input.toLowerCase());
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  it('空の入力に対して、空の配列が返される', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('', '   ', '\t', '\n'),
        async (input) => {
          const suggestions = await autocompleteService.getSuggestions(input);

          // 空の配列が返される
          expect(suggestions).toEqual([]);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('任意の入力に対して、候補数は最大50件に制限される', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 10 }),
        async (input) => {
          const suggestions = await autocompleteService.getSuggestions(input);

          // 候補数は50件以下
          expect(suggestions.length).toBeLessThanOrEqual(50);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: postal-code-lookup, Property 5: オートコンプリート候補の内容**
 * 
 * 任意のオートコンプリート候補リストには、都道府県名と市区町村名の両方が含まれる
 * 
 * **検証要件: 2.2**
 */
describe('Property 5: オートコンプリート候補の内容', () => {
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

  it('任意の有効な入力に対して、候補には都道府県名と市区町村名の両方が含まれる', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('東京', '大阪', '千代田', '横浜', '札幌'),
        async (input) => {
          const suggestions = await autocompleteService.getSuggestions(input);

          // 候補が存在する場合
          if (suggestions.length > 0) {
            suggestions.forEach(suggestion => {
              // 都道府県パターン（北海道、東京都、大阪府、京都府、その他県）
              const prefecturePattern = /(北海道|.+?[都道府県])/;
              const hasPrefecture = prefecturePattern.test(suggestion);

              // 都道府県名が含まれることを確認
              expect(hasPrefecture).toBe(true);

              // 市区町村名が含まれることを確認（都道府県名の後に文字列が続く）
              const match = suggestion.match(prefecturePattern);
              if (match) {
                const afterPrefecture = suggestion.substring(match[0].length);
                expect(afterPrefecture.length).toBeGreaterThan(0);
              }
            });
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('filterSuggestions()は都道府県名と市区町村名の両方を含む候補を返す', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('東京', '千代田', '横浜', '札幌'),
        fc.array(
          fc.record({
            prefectureName: fc.constantFrom('東京都', '北海道', '大阪府', '神奈川県'),
            municipalityName: fc.constantFrom('千代田区', '中央区', '港区', '新宿区'),
            fullName: fc.string()
          }),
          { minLength: 1, maxLength: 100 }
        ),
        (input, municipalities) => {
          // fullNameを生成
          const municipalitiesWithFullName = municipalities.map(m => ({
            ...m,
            fullName: `${m.prefectureName}${m.municipalityName}`
          }));

          const filtered = autocompleteService.filterSuggestions(
            input,
            municipalitiesWithFullName
          );

          // フィルタリングされた候補にはfullNameが設定されている
          filtered.forEach(municipality => {
            expect(municipality.fullName).toBeDefined();
            expect(municipality.fullName.length).toBeGreaterThan(0);

            // 都道府県名が含まれる
            expect(municipality.fullName).toContain(municipality.prefectureName);

            // 市区町村名が含まれる
            expect(municipality.fullName).toContain(municipality.municipalityName);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('formatSuggestion()は都道府県名と市区町村名を含む完全名称を返す', () => {
    fc.assert(
      fc.property(
        fc.record({
          prefectureName: fc.constantFrom('東京都', '北海道', '大阪府', '神奈川県'),
          municipalityName: fc.constantFrom('千代田区', '中央区', '港区', '新宿区'),
          fullName: fc.string()
        }),
        (municipality) => {
          // fullNameを生成
          const municipalityWithFullName: Municipality = {
            ...municipality,
            fullName: `${municipality.prefectureName}${municipality.municipalityName}`
          };

          const formatted = autocompleteService.formatSuggestion(municipalityWithFullName);

          // 完全名称が返される
          expect(formatted).toBe(municipalityWithFullName.fullName);

          // 都道府県名が含まれる
          expect(formatted).toContain(municipality.prefectureName);

          // 市区町村名が含まれる
          expect(formatted).toContain(municipality.municipalityName);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: postal-code-lookup, Property 6: 候補選択時の入力フィールド設定**
 * 
 * 任意のオートコンプリート候補を選択すると、選択された市区町村名が
 * 入力フィールドに正しく設定される
 * 
 * **検証要件: 2.3**
 * 
 * 注: このプロパティはUI層で検証されるため、ここではformatSuggestion()が
 * 正しい形式を返すことを検証します
 */
describe('Property 6: 候補選択時の入力フィールド設定', () => {
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

  it('任意の市区町村データに対して、formatSuggestion()は選択可能な形式を返す', () => {
    fc.assert(
      fc.property(
        fc.record({
          prefectureName: fc.constantFrom('東京都', '北海道', '大阪府', '神奈川県'),
          municipalityName: fc.constantFrom('千代田区', '中央区', '港区', '新宿区'),
          fullName: fc.string()
        }),
        (municipality) => {
          // fullNameを生成
          const municipalityWithFullName: Municipality = {
            ...municipality,
            fullName: `${municipality.prefectureName}${municipality.municipalityName}`
          };

          const formatted = autocompleteService.formatSuggestion(municipalityWithFullName);

          // 文字列が返される
          expect(typeof formatted).toBe('string');

          // 空でない
          expect(formatted.length).toBeGreaterThan(0);

          // 完全名称と一致
          expect(formatted).toBe(municipalityWithFullName.fullName);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('任意の候補リストに対して、すべての候補が選択可能な形式である', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('東京', '大阪', '千代田', '横浜'),
        async (input) => {
          const suggestions = await autocompleteService.getSuggestions(input);

          // すべての候補が文字列
          suggestions.forEach(suggestion => {
            expect(typeof suggestion).toBe('string');
            expect(suggestion.length).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  it('filterSuggestions()の結果をformatSuggestion()で整形すると、一貫した形式になる', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('東京', '千代田', '横浜'),
        fc.array(
          fc.record({
            prefectureName: fc.constantFrom('東京都', '北海道', '大阪府', '神奈川県'),
            municipalityName: fc.constantFrom('千代田区', '中央区', '港区', '新宿区'),
            fullName: fc.string()
          }),
          { minLength: 1, maxLength: 50 }
        ),
        (input, municipalities) => {
          // fullNameを生成
          const municipalitiesWithFullName = municipalities.map(m => ({
            ...m,
            fullName: `${m.prefectureName}${m.municipalityName}`
          }));

          const filtered = autocompleteService.filterSuggestions(
            input,
            municipalitiesWithFullName
          );

          // すべての候補を整形
          const formatted = filtered.map(m => autocompleteService.formatSuggestion(m));

          // すべてが文字列
          formatted.forEach(f => {
            expect(typeof f).toBe('string');
            expect(f.length).toBeGreaterThan(0);
          });

          // 重複がない
          const uniqueFormatted = new Set(formatted);
          expect(uniqueFormatted.size).toBe(formatted.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
