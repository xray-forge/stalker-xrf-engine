import { describe, expect, it, jest } from "@jest/globals";
import { ini_file } from "xray16";

import { roots } from "@/engine/constants/roots";
import { openExtensionIni } from "@/engine/core/extensions/extensions_config";
import { IExtensionsDescriptor } from "@/engine/core/extensions/extensions_types";

jest.mock("xray16", () => ({ ini_file: jest.fn() }));

describe("openExtensionIni util", () => {
  it("should correctly open files relative to the extension directory", () => {
    const extension: IExtensionsDescriptor = {
      directory: "extension_directory",
      name: "Custom extension name",
    } as IExtensionsDescriptor;

    openExtensionIni(extension);

    expect(ini_file).toHaveBeenLastCalledWith(roots.gameData, "extensions\\extension_directory\\main.ltx");

    openExtensionIni(extension, "configs\\custom.ltx");

    expect(ini_file).toHaveBeenLastCalledWith(roots.gameData, "extensions\\extension_directory\\configs\\custom.ltx");
  });
});
