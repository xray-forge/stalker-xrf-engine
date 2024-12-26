import { describe, expect, it, jest } from "@jest/globals";

import { getAvailableExtensions, IExtensionsDescriptor } from "@/engine/core/utils/extensions";
import {
  loadExtensionsState,
  saveExtensionsState,
  syncExtensionsState,
} from "@/engine/core/utils/extensions/extensions_state";
import { LuaArray } from "@/engine/lib/types";
import { registerExtensions } from "@/engine/scripts/register/extensions_registrator";
import { replaceFunctionMockOnce } from "@/fixtures/jest";

jest.mock("@/engine/core/utils/extensions");
jest.mock("@/engine/core/utils/extensions/extensions_state");

describe("extensions registrator", () => {
  it("should correctly register extensions from empty list", () => {
    replaceFunctionMockOnce(getAvailableExtensions, () => new LuaTable());

    registerExtensions(true);
  });

  it("should correctly register extensions from available list", () => {
    const first: IExtensionsDescriptor = {
      canToggle: false,
      entry: "first/",
      isEnabled: true,
      module: {
        register: jest.fn(),
      },
      name: "first",
      path: "first/path",
    };

    const second: IExtensionsDescriptor = {
      canToggle: false,
      entry: "first/",
      isEnabled: false,
      module: {
        unregister: jest.fn(),
      },
      name: "first",
      path: "first/path",
    };

    replaceFunctionMockOnce(getAvailableExtensions, () => $fromArray([second, first]));
    replaceFunctionMockOnce(loadExtensionsState, () => $fromArray([first, second]));
    replaceFunctionMockOnce(syncExtensionsState, (available, sync) => {
      expect(available).toEqualLuaArrays([second, first]);
      expect(sync).toEqualLuaArrays([first, second]);

      return $fromArray([first, second]);
    });
    replaceFunctionMockOnce(saveExtensionsState, (sorted: LuaArray<IExtensionsDescriptor>) => {
      expect(sorted.length()).toBe(2);
      expect(sorted).toEqualLuaArrays([first, second]);
    });

    registerExtensions(true);

    expect(getAvailableExtensions).toHaveBeenCalledTimes(1);
    expect(loadExtensionsState).toHaveBeenCalledTimes(1);
    expect(syncExtensionsState).toHaveBeenCalledTimes(1);
    expect(saveExtensionsState).toHaveBeenCalledTimes(1);

    expect(first.module.register).toHaveBeenCalledTimes(1);
    expect(first.module.register).toHaveBeenCalledWith(true, first);

    expect(second.module.unregister).toHaveBeenCalledTimes(1);
    expect(second.module.unregister).toHaveBeenCalledWith(true, second);
  });

  it("should correctly skip loading if LFS is not enabled", () => {
    const previous: typeof lfs = global.lfs;

    global.lfs = null as unknown as typeof lfs;

    registerExtensions(false);

    global.lfs = previous;
  });
});
