import { describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockIniFile } from "xray16/mocks";

import { ObjectRestrictionsManager } from "@/engine/core/ai/restriction/index";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";

describe("ObjectRestrictionsManager", () => {
  it("should correctly initialize and get object restrictions", () => {
    const object: GameObject = MockGameObject.mock({
      inRestrictions: "a, b",
      outRestrictions: "c, d",
    });

    registerObject(object);

    const manager: ObjectRestrictionsManager = ObjectRestrictionsManager.initializeForObject(object);

    expect(manager.object).toBe(object);
    expect(manager.baseInRestrictions.length()).toBe(2);
    expect(manager.baseOutRestrictions.length()).toBe(2);

    expect(manager.baseInRestrictions.has("a")).toBeTruthy();
    expect(manager.baseInRestrictions.has("b")).toBeTruthy();
    expect(manager.baseOutRestrictions.has("c")).toBeTruthy();
    expect(manager.baseOutRestrictions.has("d")).toBeTruthy();
  });

  it("should correctly activate and get object restrictions", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    state.ini = MockIniFile.mock("test.ltx", {
      "restrictor@test": {
        out_restr: "dd, ee",
        in_restr: "aa, bb",
      },
    });

    const manager: ObjectRestrictionsManager = ObjectRestrictionsManager.activateForObject(object, "restrictor@test");

    expect(manager.object).toBe(object);
    expect(manager.baseInRestrictions.length()).toBe(3);
    expect(manager.baseOutRestrictions.length()).toBe(3);

    expect(manager.baseInRestrictions.has("a")).toBeTruthy();
    expect(manager.baseInRestrictions.has("b")).toBeTruthy();
    expect(manager.baseInRestrictions.has("c")).toBeTruthy();
    expect(manager.baseOutRestrictions.has("d")).toBeTruthy();
    expect(manager.baseOutRestrictions.has("e")).toBeTruthy();
    expect(manager.baseOutRestrictions.has("f")).toBeTruthy();

    expect(object.in_restrictions()).toBe("a,b,c,aa,bb");
    expect(object.out_restrictions()).toBe("d,e,f,dd,ee");
  });
});
