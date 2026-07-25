import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { get_hud, level } from "xray16";
import { GameObject } from "xray16/alias";
import { NIL } from "xray16/lib";
import { MockGameObject, MockVector } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { getManager, getPortableStoreValue, registerObject, setPortableStoreValue } from "@/engine/core/database";
import { PsyAntennaManager } from "@/engine/core/managers/psy/PsyAntennaManager";
import { PsyAntennaSchemaManager } from "@/engine/core/schemes/restrictor/sr_psy_antenna/PsyAntennaSchemaManager";
import {
  EAntennaState,
  ISchemePsyAntennaState,
} from "@/engine/core/schemes/restrictor/sr_psy_antenna/sr_psy_antenna_types";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime";
import { EScheme } from "@/engine/core/schemes/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime/scheme_switch", () => ({
  trySwitchToAnotherSection: jest.fn(() => false),
}));

function createPsyAntennaState(base: Partial<ISchemePsyAntennaState> = {}): ISchemePsyAntennaState {
  return mockSchemeState<ISchemePsyAntennaState>(EScheme.SR_PSY_ANTENNA, {
    hitFreq: 5,
    hitIntensity: 2,
    hitType: "telepatic",
    intensity: 1,
    muteSoundThreshold: 3,
    noMumble: false,
    noStatic: false,
    phantomProb: 0.5,
    postprocess: NIL,
    ...base,
  });
}

/**
 * Create psy antenna scheme manager over restrictor object with the actor placed inside or outside of it.
 */
function createManager(
  state: ISchemePsyAntennaState,
  isActorInside: boolean = true
): { antennaManager: PsyAntennaManager; manager: PsyAntennaSchemaManager; object: GameObject } {
  mockRegisteredActor({ position: MockVector.create(0, 0, 0) });

  const object: GameObject = MockGameObject.mock();

  jest.spyOn(object, "inside").mockImplementation(() => isActorInside);
  registerObject(object);

  return {
    antennaManager: getManager(PsyAntennaManager),
    manager: new PsyAntennaSchemaManager(object, state),
    object,
  };
}

describe("PsyAntennaSchemaManager", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(trySwitchToAnotherSection);
    resetFunctionMock(level.add_pp_effector);
    resetFunctionMock(level.set_pp_effector_factor);
    replaceFunctionMock(trySwitchToAnotherSection, () => false);
  });

  it("should enter zone on activation when actor is inside", () => {
    const { manager } = createManager(createPsyAntennaState(), true);

    manager.activate(manager.object);

    expect(manager.antennaState).toBe(EAntennaState.INSIDE);
    expect(get_hud().enable_fake_indicators).toHaveBeenCalledWith(true);
  });

  it("should stay outside zone on activation when actor is outside", () => {
    const { manager } = createManager(createPsyAntennaState(), false);

    manager.activate(manager.object);

    expect(manager.antennaState).toBe(EAntennaState.VOID);
    expect(get_hud().enable_fake_indicators).not.toHaveBeenCalled();
  });

  it("should leave zone on activation when loaded state was inside", () => {
    const { antennaManager, manager, object } = createManager(createPsyAntennaState(), false);

    antennaManager.soundIntensityBase = 10;
    setPortableStoreValue(object.id(), "inside", EAntennaState.INSIDE);

    manager.activate(object, true);

    expect(get_hud().enable_fake_indicators).toHaveBeenCalledWith(false);
    expect(antennaManager.soundIntensityBase).toBe(9);
    expect(manager.antennaState).toBe(EAntennaState.VOID);
  });

  it("should leave zone on deactivation only when inside", () => {
    const { manager } = createManager(createPsyAntennaState(), true);

    manager.deactivate();

    expect(get_hud().enable_fake_indicators).not.toHaveBeenCalled();

    manager.antennaState = EAntennaState.INSIDE;
    manager.deactivate();

    expect(manager.antennaState).toBe(EAntennaState.OUTSIDE);
    expect(get_hud().enable_fake_indicators).toHaveBeenCalledWith(false);
  });

  it("should skip update when switching to another section", () => {
    const { manager } = createManager(createPsyAntennaState(), true);

    replaceFunctionMock(trySwitchToAnotherSection, () => true);

    manager.update();

    expect(manager.antennaState).toBe(EAntennaState.VOID);
  });

  it("should switch state on update", () => {
    const { manager, object } = createManager(createPsyAntennaState(), true);

    manager.update();

    expect(manager.antennaState).toBe(EAntennaState.INSIDE);

    jest.spyOn(object, "inside").mockImplementation(() => false);
    manager.update();

    expect(manager.antennaState).toBe(EAntennaState.OUTSIDE);
  });

  it("should not re-enter zone while already inside", () => {
    const { antennaManager, manager } = createManager(createPsyAntennaState(), true);

    manager.update();
    manager.update();

    expect(antennaManager.soundIntensityBase).toBe(1);
  });

  it("should apply antenna effects on zone enter", () => {
    const state: ISchemePsyAntennaState = createPsyAntennaState({
      hitFreq: 7,
      hitType: "chemical_burn",
      noMumble: true,
      noStatic: true,
    });
    const { antennaManager, manager } = createManager(state, true);

    antennaManager.soundIntensityBase = 1;
    antennaManager.muteSoundThreshold = 2;
    antennaManager.hitIntensity = 3;
    antennaManager.phantomSpawnProbability = 0.1;

    manager.onZoneEnter();

    expect(antennaManager.soundIntensityBase).toBe(2);
    expect(antennaManager.muteSoundThreshold).toBe(5);
    expect(antennaManager.hitIntensity).toBe(5);
    expect(antennaManager.phantomSpawnProbability).toBeCloseTo(0.6);
    expect(antennaManager.noStatic).toBe(true);
    expect(antennaManager.noMumble).toBe(true);
    expect(antennaManager.hitType).toBe("chemical_burn");
    expect(antennaManager.hitFreq).toBe(7);
    expect(level.add_pp_effector).not.toHaveBeenCalled();
  });

  it("should register post process effector on first zone enter", () => {
    const { antennaManager, manager } = createManager(createPsyAntennaState({ postprocess: "psy_antenna.ppe" }), true);
    const nextId: number = antennaManager.postprocessNextId + 1;

    manager.onZoneEnter();

    expect(antennaManager.postprocessCount).toBe(1);
    expect(antennaManager.postprocessNextId).toBe(nextId);
    expect(antennaManager.postprocess.get("psy_antenna.ppe")).toEqual({
      idx: nextId,
      intensity: 0,
      intensityBase: 1,
    });
    expect(level.add_pp_effector).toHaveBeenCalledWith("psy_antenna.ppe", nextId, true);
    expect(level.set_pp_effector_factor).toHaveBeenCalledWith(nextId, 0.01);
  });

  it("should reuse registered post process effector", () => {
    const { antennaManager, manager } = createManager(createPsyAntennaState({ postprocess: "psy_antenna.ppe" }), true);

    antennaManager.postprocess.set("psy_antenna.ppe", { idx: 1500, intensity: 0, intensityBase: 5 });

    manager.onZoneEnter();

    expect(antennaManager.postprocessCount).toBe(0);
    expect(antennaManager.postprocess.get("psy_antenna.ppe").intensityBase).toBe(6);
    expect(level.add_pp_effector).not.toHaveBeenCalled();
  });

  it("should roll back antenna effects on zone leave", () => {
    const { antennaManager, manager } = createManager(createPsyAntennaState({ postprocess: "psy_antenna.ppe" }), true);

    antennaManager.soundIntensityBase = 4;
    antennaManager.muteSoundThreshold = 5;
    antennaManager.hitIntensity = 6;
    antennaManager.phantomSpawnProbability = 0.7;
    antennaManager.postprocess.set("psy_antenna.ppe", { idx: 1500, intensity: 0, intensityBase: 5 });

    manager.onZoneLeave();

    expect(manager.antennaState).toBe(EAntennaState.OUTSIDE);
    expect(antennaManager.soundIntensityBase).toBe(3);
    expect(antennaManager.muteSoundThreshold).toBe(2);
    expect(antennaManager.hitIntensity).toBe(4);
    expect(antennaManager.phantomSpawnProbability).toBeCloseTo(0.2);
    expect(antennaManager.postprocess.get("psy_antenna.ppe").intensityBase).toBe(4);
  });

  it("should ignore unknown post process effector on zone leave", () => {
    const { antennaManager, manager } = createManager(createPsyAntennaState({ postprocess: "psy_antenna.ppe" }), true);

    manager.onZoneLeave();

    expect(antennaManager.postprocess.has("psy_antenna.ppe")).toBe(false);
  });

  it("should save antenna state", () => {
    const { manager, object } = createManager(createPsyAntennaState(), true);

    manager.antennaState = EAntennaState.INSIDE;
    manager.save();

    expect(getPortableStoreValue(object.id(), "inside")).toBe(EAntennaState.INSIDE);
  });
});
