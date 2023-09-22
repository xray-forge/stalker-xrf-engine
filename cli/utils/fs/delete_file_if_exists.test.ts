import * as fs from "fs";

import { describe, expect, it, jest } from "@jest/globals";

import { deleteFileIfExists } from "#/utils/fs/delete_file_if_exists";

jest.mock("fs");

describe("delete_file_if_exists util", () => {
  it("should correctly call fs methods to delete file if existing", () => {
    jest.spyOn(fs, "existsSync").mockImplementation(() => true);

    deleteFileIfExists("test1");

    expect(fs.existsSync).toHaveBeenCalledTimes(1);
    expect(fs.unlinkSync).toHaveBeenCalledTimes(1);
    expect(fs.unlinkSync).toHaveBeenCalledWith("test1");
  });

  it("should correctly call fs methods to delete file if not existing", () => {
    jest.spyOn(fs, "existsSync").mockImplementation(() => false);

    deleteFileIfExists("test1");

    expect(fs.existsSync).toHaveBeenCalledTimes(1);
    expect(fs.unlinkSync).toHaveBeenCalledTimes(0);
  });
});
