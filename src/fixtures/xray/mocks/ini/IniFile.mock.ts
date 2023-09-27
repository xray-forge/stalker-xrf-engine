import { jest } from "@jest/globals";

import { AnyObject, IniFile, TName, TNumberId, TPath, TSection } from "@/engine/lib/types";
import { FILES_MOCKS } from "@/fixtures/xray/mocks/ini/files.mock";

/**
 * todo;
 */
export class MockIniFile<T extends AnyObject> {
  public path: TName;
  public content: string;
  public data: T;

  public constructor(path: string, data?: T, content: string = "") {
    this.path = path;
    this.content = content;
    this.data = data || (FILES_MOCKS[path as keyof typeof FILES_MOCKS] as unknown as T) || {};
  }

  public r_float = jest.fn((section: TSection, field: TName) => this.data[section][field]);
  public r_u32 = jest.fn((section: TSection, field: TName) => {
    if (!(section in this.data)) {
      throw new Error(`Section '${section}' does not exist in '${this.path}'.`);
    }

    return this.data[section][field];
  });

  public r_s32 = jest.fn((section: TSection, field: TName) => this.data[section][field]);
  public r_string = jest.fn((section: TSection, field: TName) => this.data[section][field]);
  public r_bool = jest.fn((section: TSection, field: TName) => this.data[section][field]);
  public line_count = jest.fn((section: TSection) => {
    const data = this.data[section];

    if (Array.isArray(data)) {
      return data.length;
    }

    return Object.keys(data || {}).length;
  });
  public section_count = jest.fn((section: TSection) => Object.keys(this.data).length);
  public section_exist = jest.fn((section: TSection) => this.data[section] !== undefined);
  public r_line = jest.fn((section: TSection, lineNumber: TNumberId) => {
    const data = this.data[section];

    if (Array.isArray(data)) {
      return [true, data[lineNumber], null];
    }

    const entry = Object.entries(data)[lineNumber];

    return [true, entry[0], entry[1]];
  });
  public line_exist = jest.fn((section: TSection, param: TName) => {
    return this.data[section]?.[param] !== undefined;
  });

  private get = jest.fn((section: TSection, field: TName) => {
    return this.data[section][field] === undefined ? null : this.data[section][field];
  });

  public fname = jest.fn(() => {
    return this.path;
  });

  public section_for_each = jest.fn((cb: (section: TSection) => void) => {
    Object.keys(this.data).forEach((it) => cb(it));
  });

  public asMock(): IniFile {
    return this as unknown as IniFile;
  }
}

/**
 * Mock generic ini file for testing.
 */
export function mockIniFile(path: TPath, data?: AnyObject, content?: string): IniFile {
  return new MockIniFile(path, data, content) as unknown as IniFile;
}

/**
 * Mock file existence in registry for testing.
 */
export function registerIniFileMock(ini: IniFile): void {
  FILES_MOCKS[ini.fname()] = (ini as unknown as MockIniFile<AnyObject>).data;
}
