import * as fs from "fs";
import * as path from "path";

import { jest } from "@jest/globals";
import { parse } from "ini";

import { GAME_DATA_LTX_CONFIGS_DIR } from "#/globals";
import { normalizeParameterPath } from "#/utils/fs/normalize_parameter_path";

import { AnyObject, IniFile, TName, TNumberId, TPath, TSection } from "@/engine/lib/types";
import { FILES_MOCKS } from "@/fixtures/xray/mocks/ini/files.mock";

/**
 * Mock class implementing engine ini files reading with JSON based data stores.
 */
export class MockIniFile<T extends AnyObject = AnyObject> {
  public static mock(path: TPath, data?: AnyObject, content?: string): IniFile {
    return new MockIniFile(path, data, content) as unknown as IniFile;
  }

  public static create<T extends AnyObject = AnyObject>(path: TPath, data?: T, content?: string): MockIniFile<T> {
    return new MockIniFile<T>(path, data, content);
  }

  public static register(path: TPath, data: AnyObject): void {
    FILES_MOCKS[path] = data;
  }

  public static registerIni(ini: IniFile): void {
    FILES_MOCKS[ini.fname()] = (ini as unknown as MockIniFile).data;
  }

  public path: TName;
  public content: string;
  public data: T;

  public constructor(iniPath: TPath, data?: T, content: string = "") {
    this.path = iniPath;
    this.content = content;
    this.data = data || (FILES_MOCKS[iniPath as keyof typeof FILES_MOCKS] as unknown as T);

    if (!this.data) {
      const absolutePath: TPath = path.resolve(GAME_DATA_LTX_CONFIGS_DIR, normalizeParameterPath(iniPath));

      if (fs.existsSync(absolutePath)) {
        this.data = parse(fs.readFileSync(path.resolve(absolutePath)).toString()) as T;
      } else {
        this.data = {} as T;
      }
    }
  }

  public w_string = jest.fn((section: TSection, field: TName, value: string) => {
    if (!this.data[section]) {
      (this.data as AnyObject)[section] = {};
    }

    this.data[section][field] = value;
  });

  public r_float = jest.fn((section: TSection, field: TName) => +this.data[section][field]);

  public r_u32 = jest.fn((section: TSection, field: TName) => {
    if (!(section in this.data)) {
      throw new Error(`Section '${section}' does not exist in '${this.path}'.`);
    }

    return this.data[section][field];
  });

  public r_s32 = jest.fn((section: TSection, field: TName) => this.data[section][field]);

  public r_string = jest.fn((section: TSection, field: TName) => this.data[section][field]);

  public r_string_wb = jest.fn((section: TSection, field: TName) => {
    return (this.data[section][field] as string).trim().replace(/^"(.*)"$/, "$1");
  });

  public r_bool = jest.fn((section: TSection, field: TName) => {
    if (typeof this.data[section][field] === "string") {
      return this.data[section][field] === "true";
    } else {
      return Boolean(this.data[section][field]);
    }
  });

  public line_count = jest.fn((section: TSection) => {
    const data = this.data[section];

    if (Array.isArray(data)) {
      return data.length;
    }

    return Object.keys(data || {}).length;
  });

  public section_count = jest.fn(() => Object.keys(this.data).length);

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

  public set_readonly = jest.fn();

  public set_override_names = jest.fn();

  public save_as = jest.fn();

  public save_at_end = jest.fn();

  public section_for_each = jest.fn((cb: (section: TSection) => void) => {
    Object.keys(this.data).forEach((it) => cb(it));
  });

  public asMock(): IniFile {
    return this as unknown as IniFile;
  }
}
