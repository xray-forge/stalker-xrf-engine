import { jest } from "@jest/globals";

import { Optional } from "@/engine/lib/types";

/**
 * Mock generic io file.
 */
export class MockIoFile {
  public static mock(path: string, mode: string, isOpen: boolean = true): LuaFile {
    return new MockIoFile(path, mode, isOpen) as unknown as LuaFile;
  }

  public path: string;
  public mode: string;
  public isOpen: boolean;
  public content: Optional<string> = "";

  public constructor(path: string, mode: string, isOpen: boolean = true) {
    this.path = path;
    this.mode = mode;
    this.isOpen = isOpen;
  }

  public write = jest.fn((data: string): void => {
    if (!this.isOpen) {
      throw new Error("Cannot write in closed file.");
    }

    this.content = data;
  });

  public close = jest.fn((): void => {
    this.isOpen = false;
  });

  public read = jest.fn((): Optional<string> => {
    return this.content;
  });

  public asMock = jest.fn((): LuaFile => {
    return this as unknown as LuaFile;
  });
}

export const mockIo = {
  open: jest.fn((path: string, mode: string) => [new MockIoFile(path, mode)]),
  type: jest.fn((target) => {
    if (target instanceof MockIoFile) {
      return target.isOpen ? "file" : "closed file";
    } else {
      return null;
    }
  }),
};
