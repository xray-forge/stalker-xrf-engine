import { beforeEach, describe, expect, it } from "@jest/globals";

import { haveExtensions, registerExtension } from "@/engine/core/database/extensions";
import { registry } from "@/engine/core/database/registry";
import { IExtensionsDescriptor } from "@/engine/core/utils/extensions";

describe("extensions module of the database", () => {
  beforeEach(() => {
    registry.extensions = new LuaTable();
  });

  it("should correctly register extensions", () => {
    expect(() => registerExtension(null as unknown as IExtensionsDescriptor)).toThrow();
    expect(() => registerExtension({} as IExtensionsDescriptor)).toThrow();

    const first: IExtensionsDescriptor = { name: "first", module: {} } as IExtensionsDescriptor;
    const second: IExtensionsDescriptor = { name: "second", module: {} } as IExtensionsDescriptor;

    expect(registry.extensions.length()).toBe(0);

    expect(registerExtension(first)).toBe(first);
    expect(registry.extensions.length()).toBe(1);

    expect(registerExtension(second)).toBe(second);
    expect(registry.extensions.length()).toBe(2);

    expect(registry.extensions.has("first")).toBe(true);
    expect(registry.extensions.has("second")).toBe(true);
  });

  it("should correctly check if have extensions", () => {
    const first: IExtensionsDescriptor = { name: "first", module: {} } as IExtensionsDescriptor;

    expect(haveExtensions()).toBe(false);

    expect(registerExtension(first)).toBe(first);
    expect(haveExtensions()).toBe(true);
  });
});
