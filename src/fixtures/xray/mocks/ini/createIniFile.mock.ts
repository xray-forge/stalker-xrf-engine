import { IniFile } from "@/engine/lib/types";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";

/**
 * Mocked creation of ini file.
 */
export function mockCreateIniFile(content: string): IniFile {
  return mockIniFile("*****", JSON.parse(content));
}
