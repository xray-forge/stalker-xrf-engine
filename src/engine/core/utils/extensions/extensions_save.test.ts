import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registry } from "@/engine/core/database";
import { loadExtension, saveExtension } from "@/engine/core/utils/extensions/extensions_save";
import { IExtensionsDescriptor } from "@/engine/core/utils/extensions/extensions_types";
import { AnyObject } from "@/engine/lib/types";
import { mockExtension, resetRegistry } from "@/fixtures/engine";

describe("saveExtension util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly save", () => {
    const extension: IExtensionsDescriptor = mockExtension();
    const save = jest.fn((data: AnyObject) => {
      data.a = 1;
      data.b = 2;
    });

    saveExtension(extension);

    expect(registry.dynamicData.extensions).toEqual({});

    extension.module.save = save;

    saveExtension(extension);

    expect(extension.module.save).toHaveBeenCalledWith(registry.dynamicData.extensions[extension.name]);
    expect(registry.dynamicData.extensions).toEqual({ [extension.name]: { a: 1, b: 2 } });
  });
});

describe("loadExtension util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly save", () => {
    const extension: IExtensionsDescriptor = mockExtension();
    const load = jest.fn((data: AnyObject) => {
      expect(data.a).toBe("first");
      expect(data.b).toBe("second");
      expect(data.c).toBe(true);
    });

    loadExtension(extension);

    expect(registry.dynamicData.extensions).toEqual({});

    extension.module.load = load;
    registry.dynamicData.extensions[extension.name] = {
      a: "first",
      b: "second",
      c: true,
    };

    loadExtension(extension);

    expect(load).toHaveBeenCalledWith(registry.dynamicData.extensions[extension.name]);
  });
});
