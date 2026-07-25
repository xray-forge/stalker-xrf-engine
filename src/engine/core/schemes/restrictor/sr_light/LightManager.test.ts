import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { registry } from "@/engine/core/database";
import { LightManager } from "@/engine/core/schemes/restrictor/sr_light/LightManager";
import { ISchemeLightState } from "@/engine/core/schemes/restrictor/sr_light/sr_light_types";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime/scheme_switch", () => ({
  trySwitchToAnotherSection: jest.fn(() => false),
}));

describe("LightManager", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(trySwitchToAnotherSection);
    replaceFunctionMock(trySwitchToAnotherSection, () => false);
  });

  it("should register light zone on activation", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeLightState = mockSchemeState<ISchemeLightState>(EScheme.SR_LIGHT, { light: true });
    const manager: LightManager = new LightManager(object, state);

    expect(manager.active).toBe(false);

    manager.activate();

    expect(registry.lightZones.get(object.id())).toBe(manager);
  });

  it("should activate zone on update", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeLightState = mockSchemeState<ISchemeLightState>(EScheme.SR_LIGHT, { light: true });
    const manager: LightManager = new LightManager(object, state);

    manager.activate();
    manager.update();

    expect(manager.active).toBe(true);
    expect(registry.lightZones.has(object.id())).toBe(true);
  });

  it("should unregister zone when switching to another section", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeLightState = mockSchemeState<ISchemeLightState>(EScheme.SR_LIGHT, { light: true });
    const manager: LightManager = new LightManager(object, state);

    manager.activate();
    manager.update();

    replaceFunctionMock(trySwitchToAnotherSection, () => true);
    manager.update();

    expect(manager.active).toBe(false);
    expect(registry.lightZones.has(object.id())).toBe(false);
  });

  it("should not report light state for inactive zone", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeLightState = mockSchemeState<ISchemeLightState>(EScheme.SR_LIGHT, { light: true });
    const manager: LightManager = new LightManager(object, state);

    jest.spyOn(object, "inside").mockImplementation(() => true);

    expect(manager.checkStalker(MockGameObject.mock())).toEqual([false, false]);
  });

  it("should report configured light state for object inside active zone", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeLightState = mockSchemeState<ISchemeLightState>(EScheme.SR_LIGHT, { light: true });
    const manager: LightManager = new LightManager(object, state);

    manager.activate();
    manager.update();

    jest.spyOn(object, "inside").mockImplementation(() => true);
    expect(manager.checkStalker(MockGameObject.mock())).toEqual([true, true]);

    state.light = false;
    expect(manager.checkStalker(MockGameObject.mock())).toEqual([false, true]);

    jest.spyOn(object, "inside").mockImplementation(() => false);
    expect(manager.checkStalker(MockGameObject.mock())).toEqual([false, false]);
  });
});
