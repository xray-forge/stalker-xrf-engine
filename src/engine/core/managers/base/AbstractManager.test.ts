import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registry } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/base/AbstractManager";
import { resetRegistry } from "@/fixtures/engine";
import { MockLuaTable } from "@/fixtures/lua";
import { mockNetPacket, mockNetProcessor } from "@/fixtures/xray";

describe("AbstractCoreManager class", () => {
  class ExampleManager extends AbstractManager {
    public override initialize = jest.fn();
    public override destroy = jest.fn();
  }

  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly have lifecycle and method placeholders that throw", () => {
    expect(ExampleManager.getWeakInstance()).toBeNull();
    expect(MockLuaTable.getMockSize(registry.managers)).toBe(0);

    const manager: ExampleManager = ExampleManager.getInstance();

    expect(MockLuaTable.getMockSize(registry.managers)).toBe(1);

    expect(manager.isDestroyed).toBeFalsy();
    expect(manager.initialize).toHaveBeenCalledTimes(1);
    expect(manager.destroy).toHaveBeenCalledTimes(0);

    expect(() => manager.load(mockNetProcessor())).toThrow();
    expect(() => manager.save(mockNetPacket())).toThrow();
    expect(() => manager.update(0)).toThrow();

    ExampleManager.dispose();

    expect(manager.isDestroyed).toBeTruthy();
    expect(manager.initialize).toHaveBeenCalledTimes(1);
    expect(manager.destroy).toHaveBeenCalledTimes(1);
  });
});
