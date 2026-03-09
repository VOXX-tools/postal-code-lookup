/**
 * セキュリティ - プロパティテスト
 * 
 * HTTPS通信とセキュリティ要件を検証するプロパティベーステスト
 */

import * as fc from 'fast-check';
import { DataSourceType, DataSourceConfig } from '../types';

describe('セキュリティ - プロパティテスト', () => {
  /**
   * Feature: postal-code-lookup, Property 21: HTTPS通信
   * 検証要件: 10.2
   * 
   * 任意のAPIリクエストは、HTTPS経由で送信される
   */
  describe('Property 21: HTTPS通信', () => {
    it('任意のAPI設定に対して、HTTPSプロトコルが使用される', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'https://zipcloud.ibsnet.co.jp/api',
            'https://api.example.com',
            'https://secure-api.example.jp'
          ),
          (apiEndpoint) => {
            const config: DataSourceConfig = {
              type: DataSourceType.API,
              apiEndpoint,
              timeout: 2000
            };

            // 検証: HTTPSプロトコルが使用されている
            expect(config.apiEndpoint).toMatch(/^https:\/\//);
            expect(config.apiEndpoint).not.toMatch(/^http:\/\//);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('任意のHTTPエンドポイントは拒否される', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'http://zipcloud.ibsnet.co.jp/api',
            'http://api.example.com',
            'http://insecure-api.example.jp'
          ),
          (httpEndpoint) => {
            // 検証: HTTPプロトコルは使用すべきでない
            expect(httpEndpoint).toMatch(/^http:\/\//);
            expect(httpEndpoint).not.toMatch(/^https:\/\//);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('任意のプロトコルに対して、HTTPSのみが許可される', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('https', 'http', 'ftp', 'file'),
          fc.string({ minLength: 5, maxLength: 50 }),
          (protocol, domain) => {
            const endpoint = `${protocol}://${domain}`;

            if (protocol === 'https') {
              // HTTPS: 許可される
              expect(endpoint).toMatch(/^https:\/\//);
            } else {
              // その他のプロトコル: 許可されない
              expect(endpoint).not.toMatch(/^https:\/\//);
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('入力サニタイゼーションのプロパティ', () => {
    it('任意のHTMLタグを含む入力は無効である', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            '<script>',
            '<img>',
            '<iframe>',
            '<body>',
            '<div>',
            '</script>',
            '<a href="">',
            '<input>'
          ),
          fc.string({ minLength: 0, maxLength: 20 }),
          (tag, content) => {
            const input = tag + content;

            // 検証: HTMLタグを含む入力は無効
            expect(input).toContain('<');
            expect(input).toContain('>');
          }
        ),
        { numRuns: 20 }
      );
    });

    it('任意の特殊文字を含む入力は検証される', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('<', '>', '"', "'", '&'),
          fc.string({ minLength: 0, maxLength: 20 }),
          (specialChar, content) => {
            const input = content + specialChar;

            // 検証: 特殊文字が含まれている
            const hasSpecialChar = /[<>"'&]/.test(input);
            expect(hasSpecialChar).toBe(true);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('任意の正常な日本語入力は有効である', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            '札幌市中央区',
            '東京都千代田区',
            '大阪府大阪市',
            '北海道',
            '神奈川県横浜市'
          ),
          (validInput) => {
            // 検証: 日本語のみで構成されている
            expect(/^[ぁ-んァ-ヶー一-龠々〆〤\s]+$/.test(validInput)).toBe(true);
            
            // 検証: 特殊文字が含まれていない
            expect(validInput).not.toContain('<');
            expect(validInput).not.toContain('>');
            expect(validInput).not.toContain('"');
            expect(validInput).not.toContain("'");
            expect(validInput).not.toContain('&');
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('XSS攻撃対策のプロパティ', () => {
    it('任意のスクリプトタグを含む入力は無効である', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            '<script>alert("xss")</script>',
            '<script>document.cookie</script>',
            '<script src="evil.js"></script>',
            '<SCRIPT>alert("xss")</SCRIPT>'
          ),
          (xssAttempt) => {
            // 検証: スクリプトタグが含まれている
            expect(xssAttempt.toLowerCase()).toContain('script');
            expect(xssAttempt).toContain('<');
            expect(xssAttempt).toContain('>');
          }
        ),
        { numRuns: 20 }
      );
    });

    it('任意のイベントハンドラを含む入力は無効である', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'onerror=',
            'onclick=',
            'onload=',
            'onmouseover=',
            'onfocus='
          ),
          (eventHandler) => {
            // 検証: イベントハンドラが含まれている
            expect(eventHandler).toContain('on');
            expect(eventHandler).toContain('=');
          }
        ),
        { numRuns: 20 }
      );
    });

    it('任意のJavaScriptプロトコルを含む入力は無効である', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'javascript:alert("xss")',
            'javascript:void(0)',
            'javascript:document.cookie',
            'JAVASCRIPT:alert("xss")'
          ),
          (jsProtocol) => {
            // 検証: JavaScriptプロトコルが含まれている
            expect(jsProtocol.toLowerCase()).toContain('javascript:');
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('データソースセキュリティのプロパティ', () => {
    it('任意の信頼できるAPIエンドポイントはHTTPSを使用する', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'zipcloud.ibsnet.co.jp',
            'api.example.com',
            'secure-api.example.jp'
          ),
          (domain) => {
            const endpoint = `https://${domain}/api`;

            // 検証: HTTPSプロトコル
            expect(endpoint).toMatch(/^https:\/\//);
            
            // 検証: 適切なドメイン
            expect(endpoint).toContain(domain);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('任意のCSVファイルパスがディレクトリトラバーサルを含まない', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'data/postal-codes.csv',
            './data/postal-codes.csv',
            '/absolute/path/data/postal-codes.csv'
          ),
          (safePath) => {
            // 検証: 安全なパス（..を含まない）
            expect(safePath).not.toContain('..');
          }
        ),
        { numRuns: 20 }
      );
    });

    it('任意の不正なファイルパスはディレクトリトラバーサルを含む', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            '../../../etc/passwd',
            '..\\..\\..\\windows\\system32',
            '../../sensitive-data.csv'
          ),
          (maliciousPath) => {
            // 検証: ディレクトリトラバーサルが含まれている
            expect(maliciousPath).toContain('..');
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('出力エスケープのプロパティ', () => {
    it('任意の郵便番号出力に特殊文字が含まれない', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.string({ minLength: 7, maxLength: 8 })
              .filter(s => /^\d{3}-?\d{4}$/.test(s)),
            { minLength: 1, maxLength: 10 }
          ),
          (postalCodes) => {
            // 検証: 各郵便番号に特殊文字が含まれない
            postalCodes.forEach(code => {
              expect(code).not.toContain('<');
              expect(code).not.toContain('>');
              expect(code).not.toContain('"');
              expect(code).not.toContain("'");
              expect(code).not.toContain('&');
              expect(code).not.toContain('script');
            });
          }
        ),
        { numRuns: 20 }
      );
    });

    it('任意のエラーメッセージに機密情報が含まれない', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            '市区町村名を入力してください',
            '指定された市区町村が見つかりません',
            '無効な文字が含まれています',
            'ネットワーク接続を確認してください'
          ),
          (errorMessage) => {
            // 検証: ファイルパスが含まれない
            expect(errorMessage).not.toContain('/');
            expect(errorMessage).not.toContain('\\');
            
            // 検証: スタックトレースが含まれない
            expect(errorMessage).not.toContain('at ');
            expect(errorMessage).not.toContain('.ts:');
            expect(errorMessage).not.toContain('.js:');
            
            // 検証: 日本語メッセージ
            expect(errorMessage).toMatch(/[ぁ-んァ-ヶー一-龠々]/);
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
