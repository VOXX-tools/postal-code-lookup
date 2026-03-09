import * as fc from 'fast-check';
import { DataSourceManager } from '../DataSourceManager';
import { DataSourceType, DataSourceConfig } from '../../types';
import * as path from 'path';

/**
 * **Feature: postal-code-lookup, Property 14: データソース選択**
 * 
 * 任意のデータソース設定に対して、システムは指定されたデータソース（API/CSV）から
 * 郵便番号データを取得する
 * 
 * **検証要件: 8.1, 8.4**
 */
describe('Property 14: データソース選択', () => {
  const csvFilePath = path.join(__dirname, '../../..', 'data', 'postal-codes.csv');
  const apiEndpoint = 'https://zipcloud.ibsnet.co.jp/api';

  it('任意のデータソースタイプに対して、正しいデータソースが設定される', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(DataSourceType.API, DataSourceType.CSV),
        (dataSourceType) => {
          // 設定を作成
          const config: DataSourceConfig = {
            type: dataSourceType,
            apiEndpoint: dataSourceType === DataSourceType.API ? apiEndpoint : undefined,
            csvFilePath: dataSourceType === DataSourceType.CSV ? csvFilePath : undefined,
            timeout: 5000
          };

          // データソースマネージャーを作成
          const manager = new DataSourceManager(config);

          // データソースが取得できることを確認
          const dataSource = manager.getDataSource();
          expect(dataSource).toBeDefined();
          expect(dataSource).not.toBeNull();

          // 現在のデータソースタイプが正しいことを確認
          expect(manager.getCurrentDataSourceType()).toBe(dataSourceType);

          // データソースが有効であることを確認
          expect(manager.validateDataSource()).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('任意のデータソースタイプに対して、データソースの切り替えが正しく動作する', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(DataSourceType.API, DataSourceType.CSV),
        fc.constantFrom(DataSourceType.API, DataSourceType.CSV),
        (initialType, switchToType) => {
          // 初期設定
          const config: DataSourceConfig = {
            type: initialType,
            apiEndpoint,
            csvFilePath,
            timeout: 5000
          };

          const manager = new DataSourceManager(config);

          // 初期データソースを確認
          expect(manager.getCurrentDataSourceType()).toBe(initialType);

          // データソースを切り替え
          manager.setDataSource(switchToType);

          // 切り替え後のデータソースを確認
          expect(manager.getCurrentDataSourceType()).toBe(switchToType);

          // データソースが有効であることを確認
          expect(manager.validateDataSource()).toBe(true);

          // データソースが取得できることを確認
          const dataSource = manager.getDataSource();
          expect(dataSource).toBeDefined();
          expect(dataSource).not.toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('任意のタイムアウト値に対して、設定が正しく保持される', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 30000 }),
        fc.constantFrom(DataSourceType.API, DataSourceType.CSV),
        (timeout, dataSourceType) => {
          const config: DataSourceConfig = {
            type: dataSourceType,
            apiEndpoint,
            csvFilePath,
            timeout
          };

          const manager = new DataSourceManager(config);

          // 設定が正しく保持されていることを確認
          const retrievedConfig = manager.getConfig();
          expect(retrievedConfig.timeout).toBe(timeout);
          expect(retrievedConfig.type).toBe(dataSourceType);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('データソースが設定されている場合、getDataSource()は常に有効なデータソースを返す', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(DataSourceType.API, DataSourceType.CSV),
        (dataSourceType) => {
          const config: DataSourceConfig = {
            type: dataSourceType,
            apiEndpoint,
            csvFilePath,
            timeout: 5000
          };

          const manager = new DataSourceManager(config);

          // データソースを取得
          const dataSource = manager.getDataSource();

          // IDataSourceインターフェースのメソッドが存在することを確認
          expect(typeof dataSource.fetchPostalCodes).toBe('function');
          expect(typeof dataSource.getMunicipalityList).toBe('function');
        }
      ),
      { numRuns: 100 }
    );
  });
});
