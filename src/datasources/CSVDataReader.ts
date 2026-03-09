import * as fs from 'fs';
import * as path from 'path';
import { IDataSource, Municipality, PostalCodeData } from '../types';
import { CSVFileError, DataSourceError } from '../errors';

/**
 * CSVデータリーダー
 * 日本郵便標準フォーマットのCSVファイルから郵便番号データを読み込む
 */
export class CSVDataReader implements IDataSource {
  private csvFilePath: string;
  private postalCodeData: PostalCodeData[] = [];
  private isLoaded: boolean = false;

  constructor(csvFilePath: string) {
    this.csvFilePath = csvFilePath;
  }

  /**
   * CSVファイルを読み込む
   * @param filePath CSVファイルパス
   */
  async loadCSVFile(filePath?: string): Promise<void> {
    const targetPath = filePath || this.csvFilePath;

    try {
      // ファイルの存在確認
      if (!fs.existsSync(targetPath)) {
        throw new CSVFileError(`CSVファイルが見つかりません: ${targetPath}`);
      }

      // ファイル読み込み
      const csvContent = fs.readFileSync(targetPath, 'utf-8');

      // CSV解析
      this.postalCodeData = this.parseCSVData(csvContent);
      this.isLoaded = true;
    } catch (error) {
      if (error instanceof CSVFileError) {
        throw error;
      }
      throw new CSVFileError(`CSVファイルの読み込みに失敗しました: ${(error as Error).message}`);
    }
  }

  /**
   * CSVデータを解析
   * 日本郵便標準フォーマット: 郵便番号,都道府県名,市区町村名,町域名
   * @param csvContent CSV文字列
   * @returns 郵便番号データ配列
   */
  parseCSVData(csvContent: string): PostalCodeData[] {
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    const data: PostalCodeData[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // ヘッダー行をスキップ（郵便番号で始まらない行）
      if (i === 0 && !this.isValidPostalCodeLine(line)) {
        continue;
      }

      try {
        const parsed = this.parseCSVLine(line);
        if (parsed) {
          data.push(parsed);
        }
      } catch (error) {
        // 個別の行の解析エラーは警告として記録し、処理を続行
        console.warn(`CSV行の解析に失敗しました (行 ${i + 1}): ${(error as Error).message}`);
      }
    }

    if (data.length === 0) {
      throw new CSVFileError('有効なデータが見つかりませんでした');
    }

    return data;
  }

  /**
   * CSV行を解析
   * @param line CSV行
   * @returns 郵便番号データ
   */
  private parseCSVLine(line: string): PostalCodeData | null {
    // CSVの値を分割（カンマ区切り、ダブルクォートで囲まれた値に対応）
    const values = this.splitCSVLine(line);

    let postalCode: string;
    let prefectureName: string;
    let municipalityName: string;
    let townName: string;

    // フォーマット判定: 4列（簡易形式）または15列（日本郵便標準フォーマット）
    if (values.length >= 9) {
      // 日本郵便標準フォーマット（15列）
      // 列1: 全国地方公共団体コード
      // 列2: 旧郵便番号
      // 列3: 郵便番号（7桁）
      // 列4: 都道府県名（カナ）
      // 列5: 市区町村名（カナ）
      // 列6: 町域名（カナ）
      // 列7: 都道府県名（漢字）
      // 列8: 市区町村名（漢字）
      // 列9: 町域名（漢字）
      // 列10-15: その他のフラグ
      postalCode = values[2]; // 郵便番号（7桁）
      prefectureName = values[6]; // 都道府県名（漢字）
      municipalityName = values[7]; // 市区町村名（漢字）
      townName = values[8]; // 町域名（漢字）
    } else if (values.length >= 4) {
      // 簡易形式（4列）: 郵便番号,都道府県名,市区町村名,町域名
      postalCode = values[0];
      prefectureName = values[1];
      municipalityName = values[2];
      townName = values[3];
    } else {
      // フィールド数が不足
      return null;
    }

    // 郵便番号の検証
    if (!this.validatePostalCode(postalCode)) {
      return null;
    }

    return {
      postalCode: this.formatPostalCode(postalCode),
      prefectureName: prefectureName.trim(),
      municipalityName: municipalityName.trim(),
      townName: townName.trim()
    };
  }

  /**
   * CSV行を分割（ダブルクォート対応）
   * @param line CSV行
   * @returns 分割された値の配列
   */
  private splitCSVLine(line: string): string[] {
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }

    // 最後の値を追加
    values.push(currentValue);

    return values.map(v => v.trim().replace(/^"|"$/g, ''));
  }

  /**
   * 郵便番号を検証
   * @param postalCode 郵便番号
   * @returns 有効かどうか
   */
  private validatePostalCode(postalCode: string): boolean {
    // ハイフンを除去
    const cleaned = postalCode.replace(/-/g, '');

    // 7桁の数字であることを確認
    return /^\d{7}$/.test(cleaned);
  }

  /**
   * 郵便番号をハイフン付き7桁形式に変換
   * @param code 郵便番号
   * @returns ハイフン付き郵便番号 (XXX-XXXX)
   */
  private formatPostalCode(code: string): string {
    // ハイフンを除去
    const cleaned = code.replace(/-/g, '');

    // 7桁でない場合はそのまま返す
    if (cleaned.length !== 7) {
      return code;
    }

    // XXX-XXXX形式に変換
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3)}`;
  }

  /**
   * 有効な郵便番号行かどうかを判定
   * @param line CSV行
   * @returns 有効かどうか
   */
  private isValidPostalCodeLine(line: string): boolean {
    const firstValue = line.split(',')[0].trim().replace(/^"|"$/g, '');
    return this.validatePostalCode(firstValue);
  }

  /**
   * CSVフォーマットを検証
   * @param data 郵便番号データ配列
   * @returns 有効かどうか
   */
  validateCSVFormat(data: PostalCodeData[]): boolean {
    if (data.length === 0) {
      return false;
    }

    // すべてのデータが必要なフィールドを持つことを確認
    return data.every(
      item =>
        item.postalCode &&
        item.prefectureName &&
        item.municipalityName &&
        this.validatePostalCode(item.postalCode)
    );
  }

  /**
   * 市区町村名で郵便番号を取得
   * @param municipalityName 市区町村名
   * @returns 郵便番号リスト
   */
  async fetchPostalCodes(municipalityName: string): Promise<string[]> {
    // データが読み込まれていない場合は読み込む
    if (!this.isLoaded) {
      await this.loadCSVFile();
    }

    // 市区町村名で検索（部分一致）
    const filtered = this.postalCodeData.filter(
      item =>
        item.municipalityName.includes(municipalityName) ||
        `${item.prefectureName}${item.municipalityName}`.includes(municipalityName)
    );

    // 郵便番号を抽出し、重複を除去
    const postalCodes = filtered.map(item => item.postalCode);
    return Array.from(new Set(postalCodes));
  }

  /**
   * 市区町村リストを取得
   * @returns 市区町村リスト
   */
  async getMunicipalityList(): Promise<Municipality[]> {
    // データが読み込まれていない場合は読み込む
    if (!this.isLoaded) {
      await this.loadCSVFile();
    }

    // 市区町村の重複を除去
    const municipalityMap = new Map<string, Municipality>();

    this.postalCodeData.forEach(item => {
      const key = `${item.prefectureName}-${item.municipalityName}`;
      if (!municipalityMap.has(key)) {
        municipalityMap.set(key, {
          prefectureName: item.prefectureName,
          municipalityName: item.municipalityName,
          fullName: `${item.prefectureName}${item.municipalityName}`
        });
      }
    });

    return Array.from(municipalityMap.values());
  }

  /**
   * データがロードされているかを確認
   * @returns ロード済みかどうか
   */
  isDataLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * ロードされたデータ数を取得
   * @returns データ数
   */
  getDataCount(): number {
    return this.postalCodeData.length;
  }
}
