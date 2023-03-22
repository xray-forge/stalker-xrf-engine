import { jest } from "@jest/globals";
import { XR_ini_file } from "xray16";

import { AnyObject, TName, TNumberId, TSection } from "@/engine/lib/types";

/**
 * todo;
 */
export class IniFile<T extends AnyObject> {
  public path: TName;
  public data: T;

  public constructor(path: string, data: T = {} as T) {
    this.path = path;
    this.data = data;
  }

  public r_float = jest.fn((section: TSection, field: TName) => this.data[section][field]);
  public r_u32 = jest.fn((section: TSection, field: TName) => this.data[section][field]);
  public r_s32 = jest.fn((section: TSection, field: TName) => this.data[section][field]);
  public r_string = jest.fn((section: TSection, field: TName) => this.data[section][field]);
  public r_bool = jest.fn((section: TSection, field: TName) => this.data[section][field]);
  public line_count = jest.fn((section: TSection) => Object.keys(this.data[section]).length);
  public section_count = jest.fn((section: TSection) => Object.keys(this.data).length);
  public section_exist = jest.fn((section: TSection) => this.data[section] !== undefined);
  public r_line = jest.fn((section: TSection, line_number: TNumberId) => {
    return ["?", this.data[section], this.data[section]];
  });
  public line_exist = jest.fn((section: TSection, param: TName) => {
    return this.data[section][param] !== undefined;
  });

  private get = jest.fn((section: TSection, field: TName) => {
    return this.data[section][field] === undefined ? null : this.data[section][field];
  });
}

/**
 * todo;
 */
export function mockIniFile(name: TName, data: AnyObject): XR_ini_file {
  return new IniFile(name, data) as unknown as XR_ini_file;
}
