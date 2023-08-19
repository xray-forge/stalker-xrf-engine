import { parse } from "ini";

import { IniFile } from "@/engine/lib/types";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

/**
 * Mocked creation of ini file.
 */
export function mockCreateIniFile(content: string): IniFile {
  try {
    return mockIniFile("*****", JSON.parse(content), content);
  } catch (error) {
    // Cannot parse ltx as json, try parsing actual ini.
    return mockIniFile("#####", parse(content), content);
  }
}
