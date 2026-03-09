import { DataSourceManager } from '../DataSourceManager';
import { DataSourceType, DataSourceConfig } from '../../types';
import { DataSourceError } from '../../errors';
import * as path from 'path';

describe('DataSourceManager', () => {
  const csvFilePath = path.join(__dirname, '../../..', 'data', 'postal-codes.csv');
  const apiEndpoint = 'https://zipcloud.ibsnet.co.jp/api';

  describe('constructor()', () => {
    it('CSV設定で初期化できる', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 5000
      };

      const manager = new DataSourceManager(config);
      
      expect(manager.getCurrentDataSourceType()).toBe(DataSourceType.CSV);
      expect(manager.validateDataSource()).toBe(true);
    });

    it('API設定で初期化できる', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.API,
        apiEndpoint,
        timeout: 5000
      };

      const manager = new DataSourceManager(config);
      
      expect(manager.getCurrentDataSourceType()).toBe(DataSourceType.API);
      expect(manager.validateDataSource()).toBe(true);
    });

    it('CSVファイルパスが未設定の場合、DataSourceErrorがスローされる', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        timeout: 5000
      };

      expect(() => new DataSourceManager(config)).toThrow(DataSourceError);
      expect(() => new DataSourceManager(config)).toThrow('CSVファイルパスが設定されていません');
    });

    it('APIエンドポイントが未設定の場合、DataSourceErrorがスローされる', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.API,
        timeout: 5000
      };

      expect(() => new DataSourceManager(config)).toThrow(DataSourceError);
      expect(() => new DataSourceManager(config)).toThrow('APIエンドポイントが設定されていません');
    });
  });

  describe('getDataSource()', () => {
    it('CSV設定の場合、CSVDataReaderが返される', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 5000
      };

      const manager = new DataSourceManager(config);
      const dataSource = manager.getDataSource();
      
      expect(dataSource).toBeDefined();
      expect(dataSource).not.toBeNull();
      expect(typeof dataSource.fetchPostalCodes).toBe('function');
      expect(typeof dataSource.getMunicipalityList).toBe('function');
    });

    it('API設定の場合、JapanPostAPIClientが返される', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.API,
        apiEndpoint,
        timeout: 5000
      };

      const manager = new DataSourceManager(config);
      const dataSource = manager.getDataSource();
      
      expect(dataSource).toBeDefined();
      expect(dataSource).not.toBeNull();
      expect(typeof dataSource.fetchPostalCodes).toBe('function');
      expect(typeof dataSource.getMunicipalityList).toBe('function');
    });
  });

  describe('setDataSource()', () => {
    it('CSVからAPIに切り替えできる', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        apiEndpoint,
        timeout: 5000
      };

      const manager = new DataSourceManager(config);
      
      expect(manager.getCurrentDataSourceType()).toBe(DataSourceType.CSV);
      
      manager.setDataSource(DataSourceType.API);
      
      expect(manager.getCurrentDataSourceType()).toBe(DataSourceType.API);
      expect(manager.validateDataSource()).toBe(true);
    });

    it('APIからCSVに切り替えできる', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.API,
        apiEndpoint,
        csvFilePath,
        timeout: 5000
      };

      const manager = new DataSourceManager(config);
      
      expect(manager.getCurrentDataSourceType()).toBe(DataSourceType.API);
      
      manager.setDataSource(DataSourceType.CSV);
      
      expect(manager.getCurrentDataSourceType()).toBe(DataSourceType.CSV);
      expect(manager.validateDataSource()).toBe(true);
    });

    it('同じデータソースタイプに切り替えても問題ない', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 5000
      };

      const manager = new DataSourceManager(config);
      
      manager.setDataSource(DataSourceType.CSV);
      
      expect(manager.getCurrentDataSourceType()).toBe(DataSourceType.CSV);
      expect(manager.validateDataSource()).toBe(true);
    });

    it('APIエンドポイントが未設定の状態でAPIに切り替えるとDataSourceErrorがスローされる', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 5000
      };

      const manager = new DataSourceManager(config);
      
      expect(() => manager.setDataSource(DataSourceType.API)).toThrow(DataSourceError);
      expect(() => manager.setDataSource(DataSourceType.API)).toThrow('APIエンドポイントが設定されていません');
    });

    it('CSVファイルパスが未設定の状態でCSVに切り替えるとDataSourceErrorがスローされる', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.API,
        apiEndpoint,
        timeout: 5000
      };

      const manager = new DataSourceManager(config);
      
      expect(() => manager.setDataSource(DataSourceType.CSV)).toThrow(DataSourceError);
      expect(() => manager.setDataSource(DataSourceType.CSV)).toThrow('CSVファイルパスが設定されていません');
    });

    it('サポートされていないデータソースタイプでDataSourceErrorがスローされる', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 5000
      };

      const manager = new DataSourceManager(config);
      
      expect(() => manager.setDataSource('INVALID' as DataSourceType)).toThrow(DataSourceError);
      expect(() => manager.setDataSource('INVALID' as DataSourceType)).toThrow('サポートされていないデータソースタイプ');
    });
  });

  describe('validateDataSource()', () => {
    it('有効なデータソースの場合、trueを返す', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 5000
      };

      const manager = new DataSourceManager(config);
      
      expect(manager.validateDataSource()).toBe(true);
    });

    it('データソースが設定されている場合、常にtrueを返す', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.API,
        apiEndpoint,
        timeout: 5000
      };

      const manager = new DataSourceManager(config);
      
      expect(manager.validateDataSource()).toBe(true);
    });
  });

  describe('getCurrentDataSourceType()', () => {
    it('現在のデータソースタイプを返す', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 5000
      };

      const manager = new DataSourceManager(config);
      
      expect(manager.getCurrentDataSourceType()).toBe(DataSourceType.CSV);
    });

    it('データソース切り替え後、新しいタイプを返す', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        apiEndpoint,
        timeout: 5000
      };

      const manager = new DataSourceManager(config);
      
      expect(manager.getCurrentDataSourceType()).toBe(DataSourceType.CSV);
      
      manager.setDataSource(DataSourceType.API);
      
      expect(manager.getCurrentDataSourceType()).toBe(DataSourceType.API);
    });
  });

  describe('getConfig()', () => {
    it('設定を返す', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 5000
      };

      const manager = new DataSourceManager(config);
      const retrievedConfig = manager.getConfig();
      
      expect(retrievedConfig.type).toBe(DataSourceType.CSV);
      expect(retrievedConfig.csvFilePath).toBe(csvFilePath);
      expect(retrievedConfig.timeout).toBe(5000);
    });

    it('設定のコピーを返す（元の設定は変更されない）', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 5000
      };

      const manager = new DataSourceManager(config);
      const retrievedConfig = manager.getConfig();
      
      // 取得した設定を変更
      retrievedConfig.timeout = 10000;
      
      // 元の設定は変更されていない
      const retrievedConfig2 = manager.getConfig();
      expect(retrievedConfig2.timeout).toBe(5000);
    });

    it('データソース切り替え後、新しい設定を返す', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        apiEndpoint,
        timeout: 5000
      };

      const manager = new DataSourceManager(config);
      
      manager.setDataSource(DataSourceType.API);
      
      const retrievedConfig = manager.getConfig();
      expect(retrievedConfig.type).toBe(DataSourceType.API);
    });
  });

  describe('データソース切り替えシナリオ', () => {
    it('CSV → API → CSV の順に切り替えできる', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        apiEndpoint,
        timeout: 5000
      };

      const manager = new DataSourceManager(config);
      
      // 初期状態: CSV
      expect(manager.getCurrentDataSourceType()).toBe(DataSourceType.CSV);
      
      // API に切り替え
      manager.setDataSource(DataSourceType.API);
      expect(manager.getCurrentDataSourceType()).toBe(DataSourceType.API);
      
      // CSV に戻す
      manager.setDataSource(DataSourceType.CSV);
      expect(manager.getCurrentDataSourceType()).toBe(DataSourceType.CSV);
      
      // すべての状態で有効
      expect(manager.validateDataSource()).toBe(true);
    });

    it('複数回切り替えても問題ない', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        apiEndpoint,
        timeout: 5000
      };

      const manager = new DataSourceManager(config);
      
      for (let i = 0; i < 10; i++) {
        manager.setDataSource(DataSourceType.API);
        expect(manager.getCurrentDataSourceType()).toBe(DataSourceType.API);
        
        manager.setDataSource(DataSourceType.CSV);
        expect(manager.getCurrentDataSourceType()).toBe(DataSourceType.CSV);
      }
      
      expect(manager.validateDataSource()).toBe(true);
    });
  });

  describe('エラーハンドリング', () => {
    it('無効な設定でDataSourceErrorがスローされる', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        timeout: 5000
        // csvFilePath が未設定
      };

      expect(() => new DataSourceManager(config)).toThrow(DataSourceError);
    });

    it('エラーメッセージが日本語である', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        timeout: 5000
      };

      try {
        new DataSourceManager(config);
        fail('DataSourceErrorがスローされるべき');
      } catch (error) {
        expect(error).toBeInstanceOf(DataSourceError);
        expect((error as DataSourceError).message).toContain('CSV');
        expect((error as DataSourceError).message).toContain('設定');
      }
    });
  });
});
