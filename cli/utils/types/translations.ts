export interface IXmlTranslationSchema {
  string_table: { string: Array<{ text: string; "@_id": string }> };
}

export interface IJsonTranslationSchema {
  [key: string]: Record<string, string>;
}
