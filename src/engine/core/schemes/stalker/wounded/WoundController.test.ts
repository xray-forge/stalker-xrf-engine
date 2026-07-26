import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { time_global } from "xray16";
import { GameObject } from "xray16/alias";
import { FALSE, NIL } from "xray16/lib";
import { MockAlifeObject, MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import { drugs } from "@/engine/constants/items/drugs";
import { misc } from "@/engine/constants/items/misc";
import {
  getManager,
  getPortableStoreValue,
  registerObject,
  registerSimulator,
  setPortableStoreValue,
} from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { parseWoundedData } from "@/engine/core/schemes/stalker/wounded/utils";
import { WoundController } from "@/engine/core/schemes/stalker/wounded/WoundController";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded/wounded_types";
import { EScheme } from "@/engine/core/schemes/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";

function createWoundedState(overrides: Partial<ISchemeWoundedState> = {}): ISchemeWoundedState {
  return mockSchemeState<ISchemeWoundedState>(EScheme.WOUNDED, {
    hpFight: parseWoundedData("50|false"),
    hpState: parseWoundedData("50|wounded_hp@wounded_hp_sound"),
    hpStateSee: parseWoundedData("50|wounded_hp_seen@wounded_hp_seen_sound"),
    hpVictim: parseWoundedData("50|victim"),
    psyState: parseWoundedData("20|wounded_psy@wounded_psy_sound"),
    ...overrides,
  });
}

describe("WoundController", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    mockRegisteredActor();
  });

  it("should persist recalculated wounded state on update", () => {
    const object: GameObject = MockGameObject.mock({ health: 0.4, psyHealth: 1 });
    const state: ISchemeWoundedState = createWoundedState();
    const controller: WoundController = new WoundController(object, state);

    registerObject(object);
    jest.spyOn(object, "see").mockReturnValue(false);

    controller.update();

    expect(controller.woundState).toBe("wounded_hp");
    expect(controller.sound).toBe("wounded_hp_sound");
    expect(controller.fight).toBe("false");
    expect(controller.victim).toBe("victim");
    expect(getPortableStoreValue(object.id(), "wounded_state")).toBe("wounded_hp");
    expect(getPortableStoreValue(object.id(), "wounded_sound")).toBe("wounded_hp_sound");
    expect(getPortableStoreValue(object.id(), "wounded_fight")).toBe("false");
    expect(getPortableStoreValue(object.id(), "wounded_victim")).toBe("victim");
  });

  it("should correctly unlock medkit eating", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeWoundedState = mockSchemeState(EScheme.WOUNDED);
    const controller: WoundController = new WoundController(object, state);

    expect(controller.canUseMedkit).toBe(false);

    controller.unlockMedkit();

    expect(controller.canUseMedkit).toBe(true);
  });

  it("should consume the available medkit and thank the healer within the wounded period", () => {
    const object: GameObject = MockGameObject.mock();
    const scriptedMedkit: GameObject = MockGameObject.mock({ id: 101 });
    const inventoryMedkit: GameObject = MockGameObject.mock({ id: 102 });
    const serverMedkit = MockAlifeObject.mock({ id: inventoryMedkit.id() });
    const state: ISchemeWoundedState = createWoundedState();
    const controller: WoundController = new WoundController(object, state);
    const soundManager: SoundManager = getManager(SoundManager);

    registerObject(object);
    MockAlifeSimulator.addToRegistry(serverMedkit);
    setPortableStoreValue(object.id(), "begin_wounded", 40_000);
    replaceFunctionMock(time_global, () => 100_000);
    jest.spyOn(object, "object").mockImplementation((section: string | number) => {
      if (section === misc.medkit_script) {
        return scriptedMedkit;
      }

      return section === drugs.medkit ? inventoryMedkit : null;
    });
    jest.spyOn(controller, "update").mockImplementation(() => {});
    jest.spyOn(soundManager, "play").mockImplementation(() => null);

    controller.unlockMedkit();
    controller.useMedkit();

    expect(object.eat).toHaveBeenCalledWith(scriptedMedkit);
    expect(MockAlifeSimulator.getInstance().release).toHaveBeenCalledWith(serverMedkit, true);
    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "help_thanks");
    expect(getPortableStoreValue(object.id(), "begin_wounded")).toBeNull();
    expect(controller.canUseMedkit).toBe(false);
    expect(controller.update).toHaveBeenCalledTimes(1);
  });

  it("should preserve fighting and victim decisions when only HP wound processing applies", () => {
    const object: GameObject = MockGameObject.mock({ health: 0.4, psyHealth: 1 });
    const controller: WoundController = new WoundController(object, createWoundedState());

    registerObject(object);
    jest.spyOn(object, "see").mockReturnValue(false);

    controller.update();

    expect(controller.fight).toBe("false");
    expect(controller.victim).toBe("victim");
  });

  it("should clear HP-only decisions when a psy wound applies", () => {
    const object: GameObject = MockGameObject.mock({ health: 0.4, psyHealth: 0.1 });
    const controller: WoundController = new WoundController(object, createWoundedState());

    registerObject(object);

    controller.update();

    expect(controller.woundState).toBe("wounded_psy");
    expect(controller.sound).toBe("wounded_psy_sound");
    expect(controller.fight).toBe(FALSE);
    expect(controller.victim).toBe(NIL);
    expect(getPortableStoreValue(object.id(), "wounded_fight")).toBe(FALSE);
    expect(getPortableStoreValue(object.id(), "wounded_victim")).toBe(NIL);
  });

  it("should use HP state configured for an actor that sees the wounded object", () => {
    const object: GameObject = MockGameObject.mock({ health: 0.4, psyHealth: 1 });
    const controller: WoundController = new WoundController(object, createWoundedState());

    registerObject(object);
    jest.spyOn(object, "see").mockReturnValue(true);

    controller.update();

    expect(controller.woundState).toBe("wounded_hp_seen");
    expect(controller.sound).toBe("wounded_hp_seen_sound");
  });

  it("should correctly handle hit events", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeWoundedState = mockSchemeState(EScheme.WOUNDED);
    const controller: WoundController = new WoundController(object, state);

    jest.spyOn(controller, "update").mockImplementation(() => {});
    jest.spyOn(object, "alive").mockImplementation(() => false);
    jest.spyOn(object, "critically_wounded").mockImplementation(() => true);

    controller.onHit();
    expect(controller.update).not.toHaveBeenCalled();

    jest.spyOn(object, "alive").mockImplementation(() => true);
    controller.onHit();
    expect(controller.update).not.toHaveBeenCalled();

    jest.spyOn(object, "critically_wounded").mockImplementation(() => false);

    controller.onHit();
    expect(controller.update).toHaveBeenCalledTimes(1);
  });
});
