import { ini_file } from "xray16";

import { mockIniFile } from "@/fixtures/xray/mocks/ini";

/**
 * Mocked creation of ini file.
 */
export function mockCreateIniFile(content: string): ini_file {
  return mockIniFile("*****", JSON.parse(content));
}
