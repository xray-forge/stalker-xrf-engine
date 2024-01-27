import { parse } from "ini";

import { IniFile } from "@/engine/lib/types";
import { MockIniFile } from "@/fixtures/xray";

/**
 * Mocked creation of ini file.
 */
export function mockCreateIniFile(content: string): IniFile {
  try {
    return MockIniFile.mock("*****", JSON.parse(content), content);
  } catch (error) {
    // Cannot parse ltx as json, try parsing actual ini.
    return MockIniFile.mock("#####", parse(content), content);
  }
}
