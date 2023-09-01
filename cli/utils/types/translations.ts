export interface IXmlTranslationSchema {
  string_table: { string: Array<{ text: string; "@_id": string }> };
}

export interface IJsonTranslationSchema {
  [key: string]: Record<string, string>;
}

/**
 * Enumeration of possible extensions for usage.
 */
export enum EEncoding {
  ASCII = "ascii",
  WINDOWS_1251 = "windows-1251",
  WINDOWS_1250 = "windows-1250",
  UTF_8 = "utf-8",
}
