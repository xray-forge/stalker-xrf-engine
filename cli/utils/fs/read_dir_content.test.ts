import * as fs from "node:fs";
import * as fsp from "node:fs/promises";

import { describe, expect, it, jest } from "@jest/globals";

import { readDirContent } from "#/utils/fs/read_dir_content";

import { normalizeOSPath } from "@/fixtures/cli";

function mockDirent(base: Partial<fs.Dirent> = {}): fs.Dirent<Buffer<ArrayBuffer>> {
  return { isDirectory: () => false, ...base } as unknown as fs.Dirent<Buffer<ArrayBuffer>>;
}

jest.mock("node:fs/promises");

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
      normalizeOSPath("test\\example\\example_a.txt"),
      normalizeOSPath("test\\example\\example_b.txt"),
      normalizeOSPath("test\\example\\example_c.txt"),
    ]);

    expect(await readDirContent("test/example/", false)).toEqual([
      normalizeOSPath("test\\example\\example_a.txt"),
      normalizeOSPath("test\\example\\example_b.txt"),
      normalizeOSPath("test\\example\\example_c.txt"),
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
        normalizeOSPath("test\\example\\example_folder\\nested_a.txt"),
        normalizeOSPath("test\\example\\example_folder\\nested_b.txt"),
        normalizeOSPath("test\\example\\example_folder\\nested_c.txt"),
      ],
      normalizeOSPath("test\\example\\example_file.txt"),
    ]);

    expect(await readDirContent("test/example/", false)).toEqual([
      normalizeOSPath("test\\example\\example_folder"),
      normalizeOSPath("test\\example\\example_file.txt"),
    ]);
  });
});
