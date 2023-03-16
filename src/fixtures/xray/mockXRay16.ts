import { jest } from "@jest/globals";

import { mockGetConsole } from "@/fixtures/xray/console.mock";
import { system_ini } from "@/fixtures/xray/ini.mock";
import { IniFile } from "@/fixtures/xray/IniFile.mock";

/**
 * todo;
 */
export function mockXRay16({ get_console = mockGetConsole } = {}): void {
  jest.mock("xray16", () => ({
    get_console,
    system_ini,
    ini_file: IniFile,
  }));
}
