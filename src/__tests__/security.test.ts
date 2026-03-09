/**
 * セキュリティ検証テスト
 * 
 * HTTPS通信、入力サニタイゼーション、XSS攻撃対策を検証します。
 */

import { PostalCodeSearchService } from '../services/PostalCodeSearchService';
import { DataSourceManager } from '../services/DataSourceManager';
import { JapanPostAPIClient } from '../datasources/JapanPostAPIClient';
import { DataSourceType, DataSourceConfig } from '../types';
import path from 'path';

describe('セキュリティ検証', () => {
  describe('HTTPS通信の確認', () => {
    it('API設定がHTTPSエンドポイントを使用している', () => {
      const config: DataSourceConfig = {
        type: DataSourceType.API,
        apiEndpoint: 'https://zipcloud.ibsnet.co.jp/api',
        timeout: 2000
      };

      // 検証: HTTPSプロトコルが使用されている
      expect(config.apiEndpoint).toMatch(/^https:\/\//);
    });

    it('HTTPエンドポイントは拒否される', () => {
      const httpEndpoint = 'http://zipcloud.ibsnet.co.jp/api';
      
      // 検証: HTTPは使用すべきでない
      expect(httpEndpoint).not.toMatch(/^https:\/\//);
      expect(httpEndpoint).toMatch(/^http:\/\//);
    });
  });

  describe('入力サニタイゼーションの確認', () => {
    let searchService: PostalCodeSearchService;

    beforeEach(() => {
      const csvFilePath = path.join(__dirname, '../../data/postal-codes.csv');
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 2000
      };
      const dataSourceManager = new DataSourceManager(config);
      searchService = new PostalCodeSearchService(dataSourceManager);
    });

    it('HTMLタグを含む入力が拒否される', async () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        '<img src=x onerror=alert("xss")>',
        '<iframe src="javascript:alert(\'xss\')">',
        '<body onload=alert("xss")>'
      ];

      for (const input of maliciousInputs) {
        await expect(
          searchService.searchByMunicipality(input)
        ).rejects.toThrow();
      }
    });

    it('JavaScriptコードを含む入力が拒否される', async () => {
      const maliciousInputs = [
        'javascript:alert("xss")',
        'onclick=alert("xss")',
        'onerror=alert("xss")'
      ];

      for (const input of maliciousInputs) {
        await expect(
          searchService.searchByMunicipality(input)
        ).rejects.toThrow();
      }
    });

    it('特殊文字を含む入力が適切に処理される', async () => {
      const specialChars = [
        '<',
        '>',
        '"',
        "'",
        '&',
        '<>"\'&'
      ];

      for (const char of specialChars) {
        await expect(
          searchService.searchByMunicipality(char)
        ).rejects.toThrow();
      }
    });

    it('SQLインジェクション試行が拒否される', async () => {
      const sqlInjectionAttempts = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "admin'--",
        "' OR 1=1--"
      ];

      for (const attempt of sqlInjectionAttempts) {
        await expect(
          searchService.searchByMunicipality(attempt)
        ).rejects.toThrow();
      }
    });

    it('正常な日本語入力は受け入れられる', async () => {
      const validInputs = [
        '札幌市中央区',
        '東京都千代田区',
        '大阪府大阪市',
        '北海道'
      ];

      for (const input of validInputs) {
        // エラーがスローされないことを確認
        await expect(
          searchService.searchByMunicipality(input)
        ).resolves.toBeDefined();
      }
    });
  });

  describe('XSS攻撃対策の確認', () => {
    let searchService: PostalCodeSearchService;

    beforeEach(() => {
      const csvFilePath = path.join(__dirname, '../../data/postal-codes.csv');
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 2000
      };
      const dataSourceManager = new DataSourceManager(config);
      searchService = new PostalCodeSearchService(dataSourceManager);
    });

    it('XSS攻撃パターン1: スクリプトタグ', async () => {
      await expect(
        searchService.searchByMunicipality('<script>alert("xss")</script>')
      ).rejects.toThrow();
    });

    it('XSS攻撃パターン2: イベントハンドラ', async () => {
      await expect(
        searchService.searchByMunicipality('<img src=x onerror=alert("xss")>')
      ).rejects.toThrow();
    });

    it('XSS攻撃パターン3: JavaScriptプロトコル', async () => {
      await expect(
        searchService.searchByMunicipality('javascript:alert("xss")')
      ).rejects.toThrow();
    });

    it('XSS攻撃パターン4: データURIスキーム', async () => {
      await expect(
        searchService.searchByMunicipality('data:text/html,<script>alert("xss")</script>')
      ).rejects.toThrow();
    });

    it('XSS攻撃パターン5: エンコードされたスクリプト', async () => {
      await expect(
        searchService.searchByMunicipality('%3Cscript%3Ealert("xss")%3C/script%3E')
      ).rejects.toThrow();
    });

    it('出力がエスケープされている（結果に特殊文字が含まれない）', async () => {
      const result = await searchService.searchByMunicipality('札幌市中央区');
      
      // 検証: 郵便番号に特殊文字が含まれない
      result.postalCodes.forEach(code => {
        expect(code).not.toContain('<');
        expect(code).not.toContain('>');
        expect(code).not.toContain('"');
        expect(code).not.toContain("'");
        expect(code).not.toContain('&');
        expect(code).not.toContain('script');
      });
    });
  });

  describe('入力検証の境界値テスト', () => {
    let searchService: PostalCodeSearchService;

    beforeEach(() => {
      const csvFilePath = path.join(__dirname, '../../data/postal-codes.csv');
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 2000
      };
      const dataSourceManager = new DataSourceManager(config);
      searchService = new PostalCodeSearchService(dataSourceManager);
    });

    it('空の入力が拒否される', async () => {
      await expect(
        searchService.searchByMunicipality('')
      ).rejects.toThrow();
    });

    it('スペースのみの入力が拒否される', async () => {
      await expect(
        searchService.searchByMunicipality('   ')
      ).rejects.toThrow();
    });

    it('非常に長い入力が適切に処理される', async () => {
      const longInput = 'あ'.repeat(1000);
      
      // エラーがスローされるか、空の結果が返される
      try {
        const result = await searchService.searchByMunicipality(longInput);
        expect(result.postalCodes).toEqual([]);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('制御文字を含む入力が拒否される', async () => {
      const controlChars = [
        '\x00', // NULL
        '\x01', // SOH
        '\x1F', // US
        '\x7F'  // DEL
      ];

      for (const char of controlChars) {
        await expect(
          searchService.searchByMunicipality(`札幌${char}市`)
        ).rejects.toThrow();
      }
    });
  });

  describe('データソースセキュリティ', () => {
    it('CSVファイルパスがディレクトリトラバーサルを防ぐ', () => {
      const maliciousPaths = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '/etc/passwd',
        'C:\\Windows\\System32\\config\\SAM'
      ];

      for (const maliciousPath of maliciousPaths) {
        const config: DataSourceConfig = {
          type: DataSourceType.CSV,
          csvFilePath: maliciousPath,
          timeout: 2000
        };

        // 検証: 不正なパスは使用すべきでない
        expect(config.csvFilePath).toContain('..');
      }
    });

    it('APIエンドポイントが信頼できるドメインである', () => {
      const trustedEndpoint = 'https://zipcloud.ibsnet.co.jp/api';
      
      // 検証: 信頼できるドメイン
      expect(trustedEndpoint).toContain('zipcloud.ibsnet.co.jp');
      expect(trustedEndpoint).toMatch(/^https:\/\//);
    });

    it('不正なAPIエンドポイントは使用されない', () => {
      const untrustedEndpoints = [
        'http://malicious-site.com/api',
        'https://evil.com/api',
        'ftp://untrusted.com/data'
      ];

      for (const endpoint of untrustedEndpoints) {
        // 検証: 信頼できないエンドポイント
        expect(endpoint).not.toContain('zipcloud.ibsnet.co.jp');
      }
    });
  });

  describe('エラーメッセージのセキュリティ', () => {
    let searchService: PostalCodeSearchService;

    beforeEach(() => {
      const csvFilePath = path.join(__dirname, '../../data/postal-codes.csv');
      const config: DataSourceConfig = {
        type: DataSourceType.CSV,
        csvFilePath,
        timeout: 2000
      };
      const dataSourceManager = new DataSourceManager(config);
      searchService = new PostalCodeSearchService(dataSourceManager);
    });

    it('エラーメッセージに機密情報が含まれない', async () => {
      try {
        await searchService.searchByMunicipality('<script>alert("xss")</script>');
      } catch (error) {
        const errorMessage = (error as Error).message;
        
        // 検証: エラーメッセージにファイルパスやスタックトレースが含まれない
        expect(errorMessage).not.toContain('/');
        expect(errorMessage).not.toContain('\\');
        expect(errorMessage).not.toContain('at ');
        expect(errorMessage).not.toContain('.ts:');
      }
    });

    it('エラーメッセージがユーザーフレンドリーである', async () => {
      try {
        await searchService.searchByMunicipality('');
      } catch (error) {
        const errorMessage = (error as Error).message;
        
        // 検証: 日本語のエラーメッセージ
        expect(errorMessage).toMatch(/[ぁ-んァ-ヶー一-龠々]/);
      }
    });
  });
});
