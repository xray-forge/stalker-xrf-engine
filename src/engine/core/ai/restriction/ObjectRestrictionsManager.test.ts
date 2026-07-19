import { describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockIniFile } from "xray16/mocks";

import { ObjectRestrictionsManager } from "@/engine/core/ai/restriction";
import { IRegistryObjectState, registerObject, registry } from "@/engine/core/database";

describe("ObjectRestrictionsController", () => {
  it("caches one controller and captures the initial restrictors", () => {
    const object: GameObject = MockGameObject.mock({
      inRestrictions: "base-in-a, base-in-b",
      outRestrictions: "base-out-a, base-out-b",
    });

    registerObject(object);

    const first: ObjectRestrictionsManager = ObjectRestrictionsManager.getOrCreateForObject(object);
    const second: ObjectRestrictionsManager = ObjectRestrictionsManager.getOrCreateForObject(object);

    expect(second).toBe(first);
    expect(registry.objects.get(object.id()).restrictionsController).toBe(first);
    expect(first.baseInRestrictions.length()).toBe(2);
    expect(first.baseInRestrictions.has("base-in-a")).toBeTruthy();
    expect(first.baseInRestrictions.has("base-in-b")).toBeTruthy();
    expect(first.baseOutRestrictions.length()).toBe(2);
    expect(first.baseOutRestrictions.has("base-out-a")).toBeTruthy();
    expect(first.baseOutRestrictions.has("base-out-b")).toBeTruthy();
  });

  it("replaces dynamic in and out restrictors while preserving the initial ones", () => {
    const object: GameObject = MockGameObject.mock({
      inRestrictions: "base-in",
      outRestrictions: "base-out",
    });
    const state: IRegistryObjectState = registerObject(object);

    state.ini = MockIniFile.mock("test.ltx", {
      "restrictor@first": {
        in_restr: "first-in",
        out_restr: "first-out",
      },
      "restrictor@second": {
        in_restr: "second-in",
        out_restr: "second-out",
      },
    });

    const controller: ObjectRestrictionsManager = ObjectRestrictionsManager.syncForObject(object, "restrictor@first");

    controller.sync("restrictor@second");

    expect(object.in_restrictions()).toBe("base-in,second-in");
    expect(object.out_restrictions()).toBe("base-out,second-out");
  });

  it("removes dynamic restrictors when the next section omits both fields", () => {
    const object: GameObject = MockGameObject.mock({
      inRestrictions: "base-in",
      outRestrictions: "base-out",
    });
    const state: IRegistryObjectState = registerObject(object);

    state.ini = MockIniFile.mock("test.ltx", {
      "restrictor@active": {
        in_restr: "dynamic-in",
        out_restr: "dynamic-out",
      },
      "restrictor@empty": {},
    });

    const controller: ObjectRestrictionsManager = ObjectRestrictionsManager.syncForObject(object, "restrictor@active");

    controller.sync("restrictor@empty");

    expect(object.in_restrictions()).toBe("base-in");
    expect(object.out_restrictions()).toBe("base-out");
  });

  it("does not call the engine when synchronization is already satisfied", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    state.ini = MockIniFile.mock("test.ltx", {
      "restrictor@active": {
        in_restr: "dynamic-in",
        out_restr: "dynamic-out",
      },
    });

    const controller: ObjectRestrictionsManager = ObjectRestrictionsManager.syncForObject(object, "restrictor@active");
    const addRestrictions = jest.spyOn(object, "add_restrictions");
    const removeRestrictions = jest.spyOn(object, "remove_restrictions");

    addRestrictions.mockClear();
    removeRestrictions.mockClear();
    controller.sync("restrictor@active");

    expect(addRestrictions).not.toHaveBeenCalled();
    expect(removeRestrictions).not.toHaveBeenCalled();
  });

  it("ignores literal nil restrictors", () => {
    const object: GameObject = MockGameObject.mock({
      inRestrictions: "base-in",
      outRestrictions: "base-out",
    });
    const state: IRegistryObjectState = registerObject(object);

    state.ini = MockIniFile.mock("test.ltx", {
      "restrictor@nil": {
        in_restr: "nil",
        out_restr: "nil",
      },
    });

    ObjectRestrictionsManager.syncForObject(object, "restrictor@nil");

    expect(object.in_restrictions()).toBe("base-in");
    expect(object.out_restrictions()).toBe("base-out");
  });
});
