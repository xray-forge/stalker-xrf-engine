import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  disposeManager,
  disposeManagers,
  getManagerInstance,
  getManagerInstanceByName,
  getWeakManagerInstance,
  initializeManager,
  isManagerInitialized,
} from "@/engine/core/database/managers";
import { registry } from "@/engine/core/database/registry";
import { AbstractManager } from "@/engine/core/managers/base/AbstractManager";

describe("managers module of the database", () => {
  class ExampleManagerOne extends AbstractManager {
    public override initialize = jest.fn();
    public override destroy = jest.fn();
  }

  class ExampleManagerTwo extends AbstractManager {
    public override initialize = jest.fn();
    public override destroy = jest.fn();
  }

  class ExampleManagerThree extends AbstractManager {
    public override initialize = jest.fn();
    public override destroy = jest.fn();
  }

  const assertRegistryIsClean = () => {
    expect(registry.managers.get(ExampleManagerOne)).toBeNull();
    expect(registry.managers.get(ExampleManagerTwo)).toBeNull();
    expect(registry.managers.get(ExampleManagerThree)).toBeNull();
    expect(registry.managers.length()).toBe(0);
  };

  beforeEach(() => {
    registry.managers = new LuaTable();
  });

  it("should correctly initialize managers", () => {
    assertRegistryIsClean();

    getManagerInstance(ExampleManagerOne);
    expect(registry.managers.get(ExampleManagerOne)).not.toBeNull();
    expect(registry.managers.get(ExampleManagerTwo)).toBeNull();
    expect(registry.managers.length()).toBe(1);

    getManagerInstance(ExampleManagerTwo);
    expect(registry.managers.get(ExampleManagerOne)).not.toBeNull();
    expect(registry.managers.get(ExampleManagerTwo)).not.toBeNull();
    expect(registry.managers.length()).toBe(2);

    expect(getManagerInstance(ExampleManagerOne)).toBe(registry.managers.get(ExampleManagerOne));
    expect(getManagerInstance(ExampleManagerTwo)).toBe(registry.managers.get(ExampleManagerTwo));

    expect(registry.managers.get(ExampleManagerOne).initialize).toHaveBeenCalledTimes(1);
    expect(registry.managers.get(ExampleManagerTwo).initialize).toHaveBeenCalledTimes(1);
    expect(registry.managers.length()).toBe(2);
  });

  it("should correctly initialize managers in a lazy way", () => {
    assertRegistryIsClean();

    getManagerInstance(ExampleManagerThree, false);
    expect(registry.managers.length()).toBe(1);
    expect(registry.managers.get(ExampleManagerThree)).not.toBeNull();
    expect(registry.managers.get(ExampleManagerThree).initialize).toHaveBeenCalledTimes(0);
  });

  it("should correctly initialize managers directly", () => {
    assertRegistryIsClean();

    initializeManager(ExampleManagerThree);
    expect(registry.managers.length()).toBe(1);
    expect(registry.managers.get(ExampleManagerThree)).not.toBeNull();
    expect(registry.managers.get(ExampleManagerThree).initialize).toHaveBeenCalledTimes(1);
  });

  it("should correctly get weak references", () => {
    assertRegistryIsClean();

    getWeakManagerInstance(ExampleManagerOne);
    expect(registry.managers.length()).toBe(0);
    expect(registry.managers.get(ExampleManagerOne)).toBeNull();

    getWeakManagerInstance(ExampleManagerTwo);
    expect(registry.managers.length()).toBe(0);
    expect(registry.managers.get(ExampleManagerTwo)).toBeNull();

    getWeakManagerInstance(ExampleManagerThree);
    expect(registry.managers.length()).toBe(0);
    expect(registry.managers.get(ExampleManagerThree)).toBeNull();
  });

  it("should correctly check managers initialize status", () => {
    assertRegistryIsClean();

    getManagerInstance(ExampleManagerOne, false);
    expect(isManagerInitialized(ExampleManagerOne)).toBe(true);
    expect(isManagerInitialized(ExampleManagerTwo)).toBe(false);
    expect(isManagerInitialized(ExampleManagerThree)).toBe(false);

    getManagerInstance(ExampleManagerTwo, false);
    expect(isManagerInitialized(ExampleManagerOne)).toBe(true);
    expect(isManagerInitialized(ExampleManagerTwo)).toBe(true);
    expect(isManagerInitialized(ExampleManagerThree)).toBe(false);

    getManagerInstance(ExampleManagerThree, false);
    expect(isManagerInitialized(ExampleManagerOne)).toBe(true);
    expect(isManagerInitialized(ExampleManagerTwo)).toBe(true);
    expect(isManagerInitialized(ExampleManagerThree)).toBe(true);
  });

  it("should correctly dispose manager", () => {
    assertRegistryIsClean();

    getManagerInstance(ExampleManagerOne);
    disposeManager(ExampleManagerOne);
    expect(isManagerInitialized(ExampleManagerOne)).toBe(false);
    expect(registry.managers.get(ExampleManagerOne)).toBeNull();

    getManagerInstance(ExampleManagerTwo);
    disposeManager(ExampleManagerTwo);
    expect(isManagerInitialized(ExampleManagerTwo)).toBe(false);
    expect(registry.managers.get(ExampleManagerTwo)).toBeNull();
  });

  it("should correctly dispose managers", () => {
    assertRegistryIsClean();

    getManagerInstance(ExampleManagerOne);
    getManagerInstance(ExampleManagerTwo);
    getManagerInstance(ExampleManagerThree);

    disposeManagers();
    expect(registry.managers.length()).toBe(0);
  });

  it("getManagerInstance should correctly get managers by name", () => {
    assertRegistryIsClean();

    expect(getManagerInstanceByName("ExampleManagerOne")).toBeNull();
    getManagerInstance(ExampleManagerOne);
    expect(getManagerInstanceByName("ExampleManagerOne")).toBe(getManagerInstance(ExampleManagerOne));
    expect(getManagerInstanceByName("ExampleManagerTwo")).toBeNull();
    getManagerInstance(ExampleManagerTwo);
    expect(getManagerInstanceByName("ExampleManagerTwo")).toBe(getManagerInstance(ExampleManagerTwo));
  });
});
