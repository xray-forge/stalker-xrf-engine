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
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded/wounded_types";
import { WoundManager } from "@/engine/core/schemes/stalker/wounded/WoundManager";
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

describe("WoundManager", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    mockRegisteredActor();
  });

  it("should persist recalculated wounded state on update", () => {
    const object: GameObject = MockGameObject.mock({ health: 0.4, psyHealth: 1 });
    const state: ISchemeWoundedState = createWoundedState();
    const manager: WoundManager = new WoundManager(object, state);

    registerObject(object);
    jest.spyOn(object, "see").mockReturnValue(false);

    manager.update();

    expect(manager.woundState).toBe("wounded_hp");
    expect(manager.sound).toBe("wounded_hp_sound");
    expect(manager.fight).toBe("false");
    expect(manager.victim).toBe("victim");
    expect(getPortableStoreValue(object.id(), "wounded_state")).toBe("wounded_hp");
    expect(getPortableStoreValue(object.id(), "wounded_sound")).toBe("wounded_hp_sound");
    expect(getPortableStoreValue(object.id(), "wounded_fight")).toBe("false");
    expect(getPortableStoreValue(object.id(), "wounded_victim")).toBe("victim");
  });

  it("should correctly unlock medkit eating", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeWoundedState = mockSchemeState(EScheme.WOUNDED);
    const manager: WoundManager = new WoundManager(object, state);

    expect(manager.canUseMedkit).toBe(false);

    manager.unlockMedkit();

    expect(manager.canUseMedkit).toBe(true);
  });

  it("should consume the available medkit and thank the healer within the wounded period", () => {
    const object: GameObject = MockGameObject.mock();
    const scriptedMedkit: GameObject = MockGameObject.mock({ id: 101 });
    const inventoryMedkit: GameObject = MockGameObject.mock({ id: 102 });
    const serverMedkit = MockAlifeObject.mock({ id: inventoryMedkit.id() });
    const state: ISchemeWoundedState = createWoundedState();
    const manager: WoundManager = new WoundManager(object, state);
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
    jest.spyOn(manager, "update").mockImplementation(() => {});
    jest.spyOn(soundManager, "play").mockImplementation(() => null);

    manager.unlockMedkit();
    manager.useMedkit();

    expect(object.eat).toHaveBeenCalledWith(scriptedMedkit);
    expect(MockAlifeSimulator.getInstance().release).toHaveBeenCalledWith(serverMedkit, true);
    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "help_thanks");
    expect(getPortableStoreValue(object.id(), "begin_wounded")).toBeNull();
    expect(manager.canUseMedkit).toBe(false);
    expect(manager.update).toHaveBeenCalledTimes(1);
  });

  it("should preserve fighting and victim decisions when only HP wound processing applies", () => {
    const object: GameObject = MockGameObject.mock({ health: 0.4, psyHealth: 1 });
    const manager: WoundManager = new WoundManager(object, createWoundedState());

    registerObject(object);
    jest.spyOn(object, "see").mockReturnValue(false);

    manager.update();

    expect(manager.fight).toBe("false");
    expect(manager.victim).toBe("victim");
  });

  it("should clear HP-only decisions when a psy wound applies", () => {
    const object: GameObject = MockGameObject.mock({ health: 0.4, psyHealth: 0.1 });
    const manager: WoundManager = new WoundManager(object, createWoundedState());

    registerObject(object);

    manager.update();

    expect(manager.woundState).toBe("wounded_psy");
    expect(manager.sound).toBe("wounded_psy_sound");
    expect(manager.fight).toBe(FALSE);
    expect(manager.victim).toBe(NIL);
    expect(getPortableStoreValue(object.id(), "wounded_fight")).toBe(FALSE);
    expect(getPortableStoreValue(object.id(), "wounded_victim")).toBe(NIL);
  });

  it("should use HP state configured for an actor that sees the wounded object", () => {
    const object: GameObject = MockGameObject.mock({ health: 0.4, psyHealth: 1 });
    const manager: WoundManager = new WoundManager(object, createWoundedState());

    registerObject(object);
    jest.spyOn(object, "see").mockReturnValue(true);

    manager.update();

    expect(manager.woundState).toBe("wounded_hp_seen");
    expect(manager.sound).toBe("wounded_hp_seen_sound");
  });

  it("should correctly handle hit events", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeWoundedState = mockSchemeState(EScheme.WOUNDED);
    const manager: WoundManager = new WoundManager(object, state);

    jest.spyOn(manager, "update").mockImplementation(() => {});
    jest.spyOn(object, "alive").mockImplementation(() => false);
    jest.spyOn(object, "critically_wounded").mockImplementation(() => true);

    manager.onHit();
    expect(manager.update).not.toHaveBeenCalled();

    jest.spyOn(object, "alive").mockImplementation(() => true);
    manager.onHit();
    expect(manager.update).not.toHaveBeenCalled();

    jest.spyOn(object, "critically_wounded").mockImplementation(() => false);

    manager.onHit();
    expect(manager.update).toHaveBeenCalledTimes(1);
  });
});
