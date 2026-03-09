/**
 * 統合テスト
 * 
 * エンドツーエンドのユーザーワークフローと
 * データソース統合をテストします。
 */

import { DataSourceManager } from '../services/DataSourceManager';
import { PostalCodeSearchService } from '../services/PostalCodeSearchService';
import { AutocompleteService } from '../services/AutocompleteService';
import { SearchForm } from '../ui/SearchForm';
import { DataSourceType, DataSourceConfig } from '../types';
import path from 'path';

describe('統合テスト', () => {
  const csvFilePath = path.join(__dirname, '../../data/postal-codes.csv');

  describe('エンドツーエンドのユーザーワークフロー', () => {
    it('完全な検索フロー: 入力 → オートコンプリート → 検索 → 結果表示', async () => {
      // セットアップ
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 2000
      };

      const dataSourceManager = new DataSourceManager(config);
      const searchService = new PostalCodeSearchService(dataSourceManager);
      const autocompleteService = new AutocompleteService(dataSourceManager);
      const searchForm = new SearchForm(searchService, autocompleteService);

      // ステップ1: ユーザーが「札幌」と入力
      const suggestions = await autocompleteService.getSuggestions('札幌');
      
      // 検証: 候補が表示される
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('札幌'))).toBe(true);

      // ステップ2: ユーザーが「札幌市中央区」を選択
      const selectedMunicipality = suggestions.find(s => s.includes('札幌市中央区'));
      expect(selectedMunicipality).toBeDefined();

      // ステップ3: 検索を実行
      const result = await searchService.searchByMunicipality(selectedMunicipality!);

      // 検証: 結果が返される
      expect(result.postalCodes.length).toBeGreaterThan(0);
      expect(result.postalCodes.every(code => /^\d{3}-\d{4}$/.test(code))).toBe(true);
    });

    it('エラーハンドリングフロー: 無効な入力 → エラーメッセージ表示', async () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 2000
      };

      const dataSourceManager = new DataSourceManager(config);
      const searchService = new PostalCodeSearchService(dataSourceManager);

      // 無効な入力で検索
      await expect(
        searchService.searchByMunicipality('<script>alert("xss")</script>')
      ).rejects.toThrow();
    });

    it('空の結果フロー: 存在しない市区町村 → 適切なメッセージ', async () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 2000
      };

      const dataSourceManager = new DataSourceManager(config);
      const searchService = new PostalCodeSearchService(dataSourceManager);

      // 存在しない市区町村で検索
      const result = await searchService.searchByMunicipality('存在しない市区町村名');

      // 検証: 空の結果が返される
      expect(result.postalCodes).toEqual([]);
    });
  });

  describe('データソース統合テスト', () => {
    it('CSVデータソースとの統合', async () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 2000
      };

      const dataSourceManager = new DataSourceManager(config);
      const searchService = new PostalCodeSearchService(dataSourceManager);

      // 検索を実行
      const result = await searchService.searchByMunicipality('札幌市中央区');

      // 検証: CSVから正しくデータが取得される
      expect(result.postalCodes.length).toBeGreaterThan(0);
      expect(result.municipalityName).toContain('札幌市中央区');
    });

    it('APIデータソースとの統合（モック）', async () => {
      const config: DataSourceConfig = {
        type: DataSourceType.API,
        apiEndpoint: 'https://zipcloud.ibsnet.co.jp/api',
        timeout: 2000
      };

      const dataSourceManager = new DataSourceManager(config);
      
      // データソースが正しく初期化される
      const dataSource = dataSourceManager.getDataSource();
      expect(dataSource).toBeDefined();
    });
  });

  describe('データソース切り替えテスト', () => {
    it('CSVからAPIへの切り替え', () => {
      const csvConfig: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 2000
      };

      const dataSourceManager = new DataSourceManager(csvConfig);
      
      // 初期状態: CSV
      let dataSource = dataSourceManager.getDataSource();
      expect(dataSource).toBeDefined();

      // APIに切り替え
      const apiConfig: DataSourceConfig = {
        type: DataSourceType.API,
        apiEndpoint: 'https://zipcloud.ibsnet.co.jp/api',
        timeout: 2000
      };

      dataSourceManager.setDataSource(apiConfig);
      
      // 切り替え後: API
      dataSource = dataSourceManager.getDataSource();
      expect(dataSource).toBeDefined();
    });

    it('APIからCSVへの切り替え', () => {
      const apiConfig: DataSourceConfig = {
        type: DataSourceType.API,
        apiEndpoint: 'https://zipcloud.ibsnet.co.jp/api',
        timeout: 2000
      };

      const dataSourceManager = new DataSourceManager(apiConfig);
      
      // 初期状態: API
      let dataSource = dataSourceManager.getDataSource();
      expect(dataSource).toBeDefined();

      // CSVに切り替え
      const csvConfig: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 2000
      };

      dataSourceManager.setDataSource(csvConfig);
      
      // 切り替え後: CSV
      dataSource = dataSourceManager.getDataSource();
      expect(dataSource).toBeDefined();
    });

    it('データソース切り替え後も検索が正常に動作する', async () => {
      const csvConfig: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 2000
      };

      const dataSourceManager = new DataSourceManager(csvConfig);
      const searchService = new PostalCodeSearchService(dataSourceManager);

      // CSV で検索
      const result1 = await searchService.searchByMunicipality('札幌市中央区');
      expect(result1.postalCodes.length).toBeGreaterThan(0);

      // データソースを切り替え（同じCSV）
      dataSourceManager.setDataSource(csvConfig);

      // 切り替え後も検索が動作
      const result2 = await searchService.searchByMunicipality('札幌市中央区');
      expect(result2.postalCodes.length).toBeGreaterThan(0);
    });
  });

  describe('複数コンポーネント連携テスト', () => {
    it('SearchService と AutocompleteService の連携', async () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 2000
      };

      const dataSourceManager = new DataSourceManager(config);
      const searchService = new PostalCodeSearchService(dataSourceManager);
      const autocompleteService = new AutocompleteService(dataSourceManager);

      // オートコンプリートで候補を取得
      const suggestions = await autocompleteService.getSuggestions('札幌');
      expect(suggestions.length).toBeGreaterThan(0);

      // 候補の1つで検索
      const firstSuggestion = suggestions[0];
      const result = await searchService.searchByMunicipality(firstSuggestion);

      // 検証: 検索が成功する
      expect(result.postalCodes.length).toBeGreaterThan(0);
    });

    it('SearchForm が SearchService と AutocompleteService を統合', async () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 2000
      };

      const dataSourceManager = new DataSourceManager(config);
      const searchService = new PostalCodeSearchService(dataSourceManager);
      const autocompleteService = new AutocompleteService(dataSourceManager);
      const searchForm = new SearchForm(searchService, autocompleteService);

      // SearchForm が正しく初期化される
      expect(searchForm).toBeDefined();
    });
  });

  describe('パフォーマンス統合テスト', () => {
    it('複数の連続検索が2秒以内に完了する', async () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 2000
      };

      const dataSourceManager = new DataSourceManager(config);
      const searchService = new PostalCodeSearchService(dataSourceManager);

      const municipalities = ['札幌市中央区', '札幌市北区', '札幌市東区'];
      const startTime = Date.now();

      for (const municipality of municipalities) {
        await searchService.searchByMunicipality(municipality);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 検証: 全体で2秒以内
      expect(totalTime).toBeLessThan(2000);
    });

    it('オートコンプリートと検索の組み合わせが2秒以内に完了する', async () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 2000
      };

      const dataSourceManager = new DataSourceManager(config);
      const searchService = new PostalCodeSearchService(dataSourceManager);
      const autocompleteService = new AutocompleteService(dataSourceManager);

      const startTime = Date.now();

      // オートコンプリート
      const suggestions = await autocompleteService.getSuggestions('札幌');
      
      // 検索
      if (suggestions.length > 0) {
        await searchService.searchByMunicipality(suggestions[0]);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // 検証: 全体で2秒以内
      expect(totalTime).toBeLessThan(2000);
    });
  });
});
