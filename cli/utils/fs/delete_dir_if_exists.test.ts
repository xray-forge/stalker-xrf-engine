import * as fs from "fs";

import { describe, expect, it, jest } from "@jest/globals";

import { deleteDirIfExists } from "#/utils/fs/delete_dir_if_exists";

jest.mock("fs");

describe("delete_dir_if_exists util", () => {
  it("should correctly call fs methods to delete dir if not existing", () => {
    jest.spyOn(fs, "existsSync").mockImplementation(() => false);

    deleteDirIfExists("test1");

    expect(fs.existsSync).toHaveBeenCalledTimes(1);
    expect(fs.rmSync).toHaveBeenCalledTimes(0);
  });

  it("should correctly call fs methods to delete dir if existing", () => {
    jest.spyOn(fs, "existsSync").mockImplementation(() => true);

    deleteDirIfExists("test1");

    expect(fs.existsSync).toHaveBeenCalledTimes(1);
    expect(fs.rmSync).toHaveBeenCalledTimes(1);
    expect(fs.rmSync).toHaveBeenCalledWith("test1", expect.objectContaining({ recursive: true }));
  });
});
