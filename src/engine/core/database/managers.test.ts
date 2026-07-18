import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  disposeManager,
  disposeManagers,
  getManager,
  getManagerByName,
  getWeakManager,
  initializeManager,
  isManagerInitialized,
} from "@/engine/core/database/managers";
import { registry } from "@/engine/core/database/registry";
import { AbstractManager } from "@/engine/core/managers/abstract";
import { resetRegistry } from "@/fixtures/engine";

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

function assertRegistryIsClean(): void {
  expect(registry.managers.get(ExampleManagerOne)).toBeNull();
  expect(registry.managersByName.get(ExampleManagerOne.name)).toBeNull();
  expect(registry.managers.get(ExampleManagerTwo)).toBeNull();
  expect(registry.managersByName.get(ExampleManagerTwo.name)).toBeNull();
  expect(registry.managers.get(ExampleManagerThree)).toBeNull();
  expect(registry.managersByName.get(ExampleManagerThree.name)).toBeNull();
  expect(table.size(registry.managers)).toBe(0);
}

describe("getManager", () => {
  beforeEach(() => {
    resetRegistry();
    assertRegistryIsClean();
  });

  it("should correctly initialize managers", () => {
    // Does not initialize by name.
    expect(getManagerByName(ExampleManagerOne.name)).toBeNull();
    expect(getManagerByName(ExampleManagerTwo.name)).toBeNull();

    getManager(ExampleManagerOne);

    expect(registry.managers.get(ExampleManagerOne)).not.toBeNull();
    expect(registry.managersByName.get(ExampleManagerOne.name)).not.toBeNull();
    expect(registry.managers.get(ExampleManagerTwo)).toBeNull();
    expect(registry.managersByName.get(ExampleManagerTwo.name)).toBeNull();
    expect(table.size(registry.managers)).toBe(1);
    expect(table.size(registry.managersByName)).toBe(1);

    getManager(ExampleManagerTwo);

    expect(registry.managers.get(ExampleManagerOne)).not.toBeNull();
    expect(registry.managersByName.get(ExampleManagerOne.name)).not.toBeNull();
    expect(registry.managers.get(ExampleManagerTwo)).not.toBeNull();
    expect(registry.managersByName.get(ExampleManagerTwo.name)).not.toBeNull();
    expect(table.size(registry.managers)).toBe(2);
    expect(table.size(registry.managersByName)).toBe(2);

    expect(getManager(ExampleManagerOne)).toBe(registry.managers.get(ExampleManagerOne));
    expect(getManagerByName(ExampleManagerOne.name)).toBe(registry.managers.get(ExampleManagerOne));
    expect(getManager(ExampleManagerTwo)).toBe(registry.managers.get(ExampleManagerTwo));
    expect(getManagerByName(ExampleManagerTwo.name)).toBe(registry.managers.get(ExampleManagerTwo));

    expect(registry.managers.get(ExampleManagerOne)?.initialize).toHaveBeenCalledTimes(1);
    expect(registry.managers.get(ExampleManagerTwo)?.initialize).toHaveBeenCalledTimes(1);
    expect(table.size(registry.managers)).toBe(2);
  });
});

describe("getManager", () => {
  beforeEach(() => {
    resetRegistry();
    assertRegistryIsClean();
  });

  it("should correctly initialize managers in a lazy way", () => {
    getManager(ExampleManagerThree);

    expect(table.size(registry.managers)).toBe(1);
    expect(table.size(registry.managersByName)).toBe(1);
    expect(registry.managers.get(ExampleManagerThree)).not.toBeNull();
    expect(registry.managersByName.get(ExampleManagerThree.name)).not.toBeNull();
    expect(registry.managers.get(ExampleManagerThree)?.initialize).toHaveBeenCalledTimes(1);
  });
});

describe("initializeManager", () => {
  beforeEach(() => {
    resetRegistry();
    assertRegistryIsClean();
  });

  it("should correctly initialize managers directly", () => {
    initializeManager(ExampleManagerThree);

    expect(table.size(registry.managers)).toBe(1);
    expect(table.size(registry.managersByName)).toBe(1);
    expect(registry.managers.get(ExampleManagerThree)).not.toBeNull();
    expect(registry.managersByName.get(ExampleManagerThree.name)).not.toBeNull();
    expect(registry.managers.get(ExampleManagerThree)?.initialize).toHaveBeenCalledTimes(1);
  });
});

describe("getWeakManager", () => {
  beforeEach(() => {
    resetRegistry();
    assertRegistryIsClean();
  });

  it("should correctly get weak references", () => {
    getWeakManager(ExampleManagerOne);

    expect(table.size(registry.managers)).toBe(0);
    expect(table.size(registry.managersByName)).toBe(0);

    getWeakManager(ExampleManagerTwo);

    expect(table.size(registry.managers)).toBe(0);
    expect(table.size(registry.managersByName)).toBe(0);

    getWeakManager(ExampleManagerThree);

    expect(table.size(registry.managers)).toBe(0);
    expect(table.size(registry.managersByName)).toBe(0);
  });
});

describe("isManagerInitialized", () => {
  beforeEach(() => {
    resetRegistry();
    assertRegistryIsClean();
  });

  it("should correctly check managers initialize status", () => {
    // Does not initialize.
    getManagerByName(ExampleManagerOne.name);
    getManagerByName(ExampleManagerTwo.name);
    getManagerByName(ExampleManagerThree.name);

    expect(isManagerInitialized(ExampleManagerOne)).toBe(false);
    expect(isManagerInitialized(ExampleManagerTwo)).toBe(false);
    expect(isManagerInitialized(ExampleManagerThree)).toBe(false);

    getManager(ExampleManagerOne);

    expect(isManagerInitialized(ExampleManagerOne)).toBe(true);
    expect(isManagerInitialized(ExampleManagerTwo)).toBe(false);
    expect(isManagerInitialized(ExampleManagerThree)).toBe(false);

    getManager(ExampleManagerTwo);

    expect(isManagerInitialized(ExampleManagerOne)).toBe(true);
    expect(isManagerInitialized(ExampleManagerTwo)).toBe(true);
    expect(isManagerInitialized(ExampleManagerThree)).toBe(false);

    getManager(ExampleManagerThree);

    expect(isManagerInitialized(ExampleManagerOne)).toBe(true);
    expect(isManagerInitialized(ExampleManagerTwo)).toBe(true);
    expect(isManagerInitialized(ExampleManagerThree)).toBe(true);
  });
});

describe("disposeManager", () => {
  beforeEach(() => {
    resetRegistry();
    assertRegistryIsClean();
  });

  it("should correctly dispose manager", () => {
    getManager(ExampleManagerOne);
    disposeManager(ExampleManagerOne);

    expect(isManagerInitialized(ExampleManagerOne)).toBe(false);
    expect(registry.managers.get(ExampleManagerOne)).toBeNull();

    getManager(ExampleManagerTwo);
    disposeManager(ExampleManagerTwo);

    expect(isManagerInitialized(ExampleManagerTwo)).toBe(false);
    expect(registry.managers.get(ExampleManagerTwo)).toBeNull();
  });
});

describe("disposeManagers", () => {
  beforeEach(() => {
    resetRegistry();
    assertRegistryIsClean();
  });

  it("should correctly dispose managers", () => {
    getManager(ExampleManagerOne);
    getManager(ExampleManagerTwo);
    getManager(ExampleManagerThree);

    disposeManagers();

    expect(table.size(registry.managers)).toBe(0);
  });
});

describe("getManagerByName", () => {
  beforeEach(() => {
    resetRegistry();
    assertRegistryIsClean();
  });

  it("should correctly get managers by name", () => {
    expect(getManagerByName("ExampleManagerOne")).toBeNull();

    getManager(ExampleManagerOne);

    expect(getManagerByName("ExampleManagerOne")).toBe(getManager(ExampleManagerOne));
    expect(getManagerByName("ExampleManagerTwo")).toBeNull();

    getManager(ExampleManagerTwo);

    expect(getManagerByName("ExampleManagerTwo")).toBe(getManager(ExampleManagerTwo));
  });
});
