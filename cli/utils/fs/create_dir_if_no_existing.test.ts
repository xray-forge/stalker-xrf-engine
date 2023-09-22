import * as fs from "fs";

import { describe, expect, it, jest } from "@jest/globals";

import { createDirIfNoExisting } from "#/utils/fs/create_dir_if_no_existing";

jest.mock("fs");

describe("create_dir_if_no_existing util", () => {
  it("should correctly call fs methods to create dir if existing", () => {
    jest.spyOn(fs, "existsSync").mockImplementation(() => true);

    createDirIfNoExisting("test1");

    expect(fs.existsSync).toHaveBeenCalledTimes(1);
    expect(fs.mkdirSync).toHaveBeenCalledTimes(0);
  });
  it("should correctly call fs methods to create dir if no existing", () => {
    jest.spyOn(fs, "existsSync").mockImplementation(() => false);

    createDirIfNoExisting("test1");

    expect(fs.existsSync).toHaveBeenCalledTimes(1);
    expect(fs.mkdirSync).toHaveBeenCalledTimes(1);
    expect(fs.mkdirSync).toHaveBeenCalledWith("test1", expect.objectContaining({ recursive: true }));
  });
});
