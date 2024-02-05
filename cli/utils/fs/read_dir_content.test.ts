import { Dirent } from "fs";
import * as fsp from "fs/promises";

import { describe, expect, it, jest } from "@jest/globals";

import { readDirContent } from "#/utils/fs/read_dir_content";

function mockDirent(base: Partial<Dirent> = {}): Dirent {
  return { isDirectory: () => false, ...base } as Dirent;
}

jest.mock("fs/promises");

describe("readDirContent util", () => {
  it("should handle empty directories", async () => {
    jest.spyOn(fsp, "readdir").mockImplementation(async () => {
      return [];
    });

    expect(await readDirContent("test/example/")).toEqual([]);
  });

  it("should handle directories with files", async () => {
    jest.spyOn(fsp, "readdir").mockImplementation(async () => {
      return [
        mockDirent({ name: "example_a.txt" }),
        mockDirent({ name: "example_b.txt" }),
        mockDirent({ name: "example_c.txt" }),
      ];
    });

    expect(await readDirContent("test/example/", true)).toEqual([
      "test\\example\\example_a.txt",
      "test\\example\\example_b.txt",
      "test\\example\\example_c.txt",
    ]);

    expect(await readDirContent("test/example/", false)).toEqual([
      "test\\example\\example_a.txt",
      "test\\example\\example_b.txt",
      "test\\example\\example_c.txt",
    ]);
  });

  it("should handle directories with mixed content, recursive", async () => {
    jest.spyOn(fsp, "readdir").mockImplementation(async (it) => {
      if (it === "test/example/") {
        return [
          mockDirent({ name: "example_folder", isDirectory: () => true }),
          mockDirent({ name: "example_file.txt" }),
        ];
      } else {
        return [
          mockDirent({ name: "nested_a.txt" }),
          mockDirent({ name: "nested_b.txt" }),
          mockDirent({ name: "nested_c.txt" }),
        ];
      }
    });

    expect(await readDirContent("test/example/", true)).toEqual([
      [
        "test\\example\\example_folder\\nested_a.txt",
        "test\\example\\example_folder\\nested_b.txt",
        "test\\example\\example_folder\\nested_c.txt",
      ],
      "test\\example\\example_file.txt",
    ]);

    expect(await readDirContent("test/example/", false)).toEqual([
      "test\\example\\example_folder",
      "test\\example\\example_file.txt",
    ]);
  });
});
