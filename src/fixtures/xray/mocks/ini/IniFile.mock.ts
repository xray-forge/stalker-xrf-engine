import { jest } from "@jest/globals";
import { ini_file } from "xray16";

import { AnyObject, TName, TNumberId, TPath, TSection } from "@/engine/lib/types";
import { FILES_MOCKS } from "@/fixtures/xray/mocks/ini/files.mock";

/**
 * todo;
 */
export class MockIniFile<T extends AnyObject> {
  public path: TName;
  public data: T;

  public constructor(path: string, data?: T) {
    this.path = path;
    this.data = data || (FILES_MOCKS[path as keyof typeof FILES_MOCKS] as unknown as T) || {};
  }

  public r_float = jest.fn((section: TSection, field: TName) => this.data[section][field]);
  public r_u32 = jest.fn((section: TSection, field: TName) => this.data[section][field]);
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
  public r_line = jest.fn((section: TSection, line_number: TNumberId) => {
    const data = this.data[section];

    if (Array.isArray(data)) {
      return [true, data[line_number], null];
    }

    const entry = Object.entries(data)[line_number];

    return [true, entry[0], entry[1]];
  });
  public line_exist = jest.fn((section: TSection, param: TName) => {
    return this.data[section][param] !== undefined;
  });

  private get = jest.fn((section: TSection, field: TName) => {
    return this.data[section][field] === undefined ? null : this.data[section][field];
  });

  public fname = jest.fn(() => {
    return this.path;
  });

  public asMock(): ini_file {
    return this as unknown as ini_file;
  }
}

/**
 * todo;
 */
export function mockIniFile(path: TPath, data?: AnyObject): ini_file {
  return new MockIniFile(path, data) as unknown as ini_file;
}
