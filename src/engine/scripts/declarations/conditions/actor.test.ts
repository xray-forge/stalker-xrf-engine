import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { clsid, level } from "xray16";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { actorConfig } from "@/engine/core/managers/actor/ActorConfig";
import { isActorInSurgeCover } from "@/engine/core/managers/surge/utils/surge_cover";
import { ISchemeDeathState } from "@/engine/core/schemes/stalker/death";
import { ISchemeHitState } from "@/engine/core/schemes/stalker/hit";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { detectors } from "@/engine/lib/constants/items/detectors";
import { medkits } from "@/engine/lib/constants/items/drugs";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { EActorMenuMode, EScheme, GameObject } from "@/engine/lib/types";
import {
  callXrCondition,
  checkXrCondition,
  mockRegisteredActor,
  mockSchemeState,
  resetRegistry,
} from "@/fixtures/engine";
import { replaceFunctionMock, resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/managers/surge/utils/surge_cover");

describe("actor conditions declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/actor");
  });

  it("should correctly inject external methods for game", () => {
    checkXrCondition("wealthy_functor");
    checkXrCondition("information_dealer_functor");
    checkXrCondition("actor_in_surge_cover");
    checkXrCondition("is_enemy_actor");
    checkXrCondition("actor_alive");
    checkXrCondition("actor_see_npc");
    checkXrCondition("npc_in_actor_frustum");
    checkXrCondition("dist_to_actor_le");
    checkXrCondition("dist_to_actor_ge");
    checkXrCondition("actor_health_le");
    checkXrCondition("actor_in_zone");
    checkXrCondition("heli_see_actor");
    checkXrCondition("actor_has_item");
    checkXrCondition("actor_has_item_count");
    checkXrCondition("hit_by_actor");
    checkXrCondition("killed_by_actor");
    checkXrCondition("actor_has_weapon");
    checkXrCondition("actor_active_detector");
    checkXrCondition("actor_on_level");
    checkXrCondition("talking");
    checkXrCondition("actor_nomove_nowpn");
    checkXrCondition("actor_has_nimble_weapon");
    checkXrCondition("actor_has_active_nimble_weapon");
    checkXrCondition("dead_body_searching");
  });
});

describe("actor conditions implementation", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/actor");
  });

  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(isActorInSurgeCover);
  });

  it("wealthy_functor should check wealth of the actor", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(callXrCondition("wealthy_functor", actorGameObject, MockGameObject.mock())).toBe(false);

    giveInfoPortion("actor_wealthy");

    expect(callXrCondition("wealthy_functor", actorGameObject, MockGameObject.mock())).toBe(true);
  });

  it("information_dealer_functor should check info dealer achievement", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(callXrCondition("information_dealer_functor", actorGameObject, MockGameObject.mock())).toBe(false);

    giveInfoPortion("actor_information_dealer");

    expect(callXrCondition("information_dealer_functor", actorGameObject, MockGameObject.mock())).toBe(true);
  });

  it("actor_in_surge_cover should check if actor is in surge cover", () => {
    replaceFunctionMock(isActorInSurgeCover, () => false);
    expect(callXrCondition("actor_in_surge_cover", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);

    replaceFunctionMock(isActorInSurgeCover, () => true);
    expect(callXrCondition("actor_in_surge_cover", MockGameObject.mockActor(), MockGameObject.mock())).toBe(true);
  });

  it.todo("is_enemy_actor should check if actor and object are enemies");

  it("actor_alive should check if actor is alive", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(callXrCondition("actor_alive", actorGameObject, MockGameObject.mock())).toBe(true);

    jest.spyOn(actorGameObject, "alive").mockImplementation(() => false);

    expect(callXrCondition("actor_alive", actorGameObject, MockGameObject.mock())).toBe(false);
  });

  it("actor_see_npc should check if actor sees NPC", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(actorGameObject, "see").mockImplementation(() => true);

    expect(callXrCondition("actor_see_npc", actorGameObject, object)).toBe(true);
    expect(actorGameObject.see).toHaveBeenCalledTimes(1);
    expect(actorGameObject.see).toHaveBeenCalledWith(object);

    jest.spyOn(actorGameObject, "see").mockImplementation(() => false);

    expect(callXrCondition("actor_see_npc", actorGameObject, object)).toBe(false);
    expect(actorGameObject.see).toHaveBeenCalledTimes(2);
    expect(actorGameObject.see).toHaveBeenCalledWith(object);
  });

  it.todo("actor_see_npc npc_in_actor_frustum check if npc is in actor frustum");

  it.todo("dist_to_actor_le should check distance between actor and object");

  it.todo("dist_to_actor_ge should check distance between actor and object");

  it.todo("actor_health_le should check actor health");

  it.todo("actor_in_zone should check actor in zone");

  it("heli_see_actor should check if heli see actor", () => {
    const { actorGameObject } = mockRegisteredActor();
    const helicopter: GameObject = MockGameObject.mockHelicopter();

    jest.spyOn(helicopter.get_helicopter(), "isVisible").mockImplementation(() => true);

    expect(callXrCondition("heli_see_actor", actorGameObject, helicopter)).toBe(true);
    expect(helicopter.get_helicopter().isVisible).toHaveBeenCalledTimes(1);
    expect(helicopter.get_helicopter().isVisible).toHaveBeenCalledWith(actorGameObject);

    jest.spyOn(helicopter.get_helicopter(), "isVisible").mockImplementation(() => false);

    expect(callXrCondition("heli_see_actor", actorGameObject, helicopter)).toBe(false);
    expect(helicopter.get_helicopter().isVisible).toHaveBeenCalledTimes(2);
    expect(helicopter.get_helicopter().isVisible).toHaveBeenCalledWith(actorGameObject);
  });

  it("actor_has_item should check if actor has item", () => {
    const actor: GameObject = MockGameObject.mockActor({
      inventory: [
        [0, MockGameObject.mockWithSection(medkits.medkit)],
        [1, MockGameObject.mockWithSection(weapons.wpn_svd)],
      ],
    });

    expect(callXrCondition("actor_has_item", actor, MockGameObject.mock(), medkits.medkit)).toBe(true);
    expect(callXrCondition("actor_has_item", actor, MockGameObject.mock(), medkits.medkit_army)).toBe(false);
    expect(callXrCondition("actor_has_item", actor, MockGameObject.mock(), weapons.wpn_svd)).toBe(true);
    expect(callXrCondition("actor_has_item", actor, MockGameObject.mock(), weapons.wpn_val)).toBe(false);
  });

  it("actor_has_item_count should check if actor has items", () => {
    const actor: GameObject = MockGameObject.mockActor({
      inventory: [
        [0, MockGameObject.mockWithSection(medkits.medkit)],
        [1, MockGameObject.mockWithSection(medkits.medkit)],
        [2, MockGameObject.mockWithSection(medkits.medkit)],
        [3, MockGameObject.mockWithSection(weapons.wpn_svd)],
      ],
    });

    expect(callXrCondition("actor_has_item_count", actor, MockGameObject.mock(), medkits.medkit, 1)).toBe(true);
    expect(callXrCondition("actor_has_item_count", actor, MockGameObject.mock(), medkits.medkit, 3)).toBe(true);
    expect(callXrCondition("actor_has_item_count", actor, MockGameObject.mock(), medkits.medkit, 4)).toBe(false);
    expect(callXrCondition("actor_has_item_count", actor, MockGameObject.mock(), weapons.wpn_val, 1)).toBe(false);
    expect(callXrCondition("actor_has_item_count", actor, MockGameObject.mock(), weapons.wpn_svd, 1)).toBe(true);
  });

  it("hit_by_actor should check if object is hit by actor", () => {
    const object: GameObject = MockGameObject.mock();

    expect(callXrCondition("hit_by_actor", MockGameObject.mockActor(), object)).toBe(false);

    const state: IRegistryObjectState = registerObject(object);

    expect(callXrCondition("hit_by_actor", MockGameObject.mockActor(), object)).toBe(false);

    state[EScheme.HIT] = mockSchemeState(EScheme.HIT);

    expect(callXrCondition("hit_by_actor", MockGameObject.mockActor(), object)).toBe(false);

    (state[EScheme.HIT] as ISchemeHitState).who = 1;

    expect(callXrCondition("hit_by_actor", MockGameObject.mockActor(), object)).toBe(false);

    (state[EScheme.HIT] as ISchemeHitState).who = 0;

    expect(callXrCondition("hit_by_actor", MockGameObject.mockActor(), object)).toBe(true);
  });

  it("killed_by_actor should check if object is killed by actor", () => {
    const object: GameObject = MockGameObject.mock();

    expect(callXrCondition("killed_by_actor", MockGameObject.mockActor(), object)).toBe(false);

    const state: IRegistryObjectState = registerObject(object);

    expect(callXrCondition("killed_by_actor", MockGameObject.mockActor(), object)).toBe(false);

    state[EScheme.DEATH] = mockSchemeState(EScheme.DEATH);

    expect(callXrCondition("killed_by_actor", MockGameObject.mockActor(), object)).toBe(false);

    (state[EScheme.DEATH] as ISchemeDeathState).killerId = 1;

    expect(callXrCondition("killed_by_actor", MockGameObject.mockActor(), object)).toBe(false);

    (state[EScheme.DEATH] as ISchemeDeathState).killerId = 0;

    expect(callXrCondition("killed_by_actor", MockGameObject.mockActor(), object)).toBe(true);
  });

  it("actor_has_weapon should check if actor active item is weapon", () => {
    const actor: GameObject = MockGameObject.mockActor();

    expect(callXrCondition("actor_has_weapon", actor, MockGameObject.mock())).toBe(false);

    jest.spyOn(actor, "active_item").mockImplementation(() => MockGameObject.mockWithClassId(clsid.wpn_ak74));

    expect(callXrCondition("actor_has_weapon", actor, MockGameObject.mock())).toBe(true);

    jest
      .spyOn(actor, "active_item")
      .mockImplementation(() => MockGameObject.mockWithClassId(clsid.device_detector_elite));

    expect(callXrCondition("actor_has_weapon", actor, MockGameObject.mock())).toBe(false);

    jest.spyOn(actor, "active_item").mockImplementation(() => MockGameObject.mockWithClassId(clsid.wpn_pm));

    expect(callXrCondition("actor_has_weapon", actor, MockGameObject.mock())).toBe(true);
  });

  it("actor_active_detector should check currently active actor detector", () => {
    const actor: GameObject = MockGameObject.mockActor();

    expect(() => callXrCondition("actor_active_detector", actor, MockGameObject.mock())).toThrow(
      "Wrong parameters in xr condition 'actor_active_detector'."
    );

    expect(callXrCondition("actor_active_detector", actor, MockGameObject.mock(), detectors.detector_scientific)).toBe(
      false
    );

    jest
      .spyOn(actor, "active_detector")
      .mockImplementation(() => MockGameObject.mockWithSection(detectors.detector_simple));

    expect(callXrCondition("actor_active_detector", actor, MockGameObject.mock(), detectors.detector_scientific)).toBe(
      false
    );
    expect(callXrCondition("actor_active_detector", actor, MockGameObject.mock(), detectors.detector_simple)).toBe(
      true
    );

    jest
      .spyOn(actor, "active_detector")
      .mockImplementation(() => MockGameObject.mockWithSection(detectors.detector_scientific));

    expect(callXrCondition("actor_active_detector", actor, MockGameObject.mock(), detectors.detector_scientific)).toBe(
      true
    );
    expect(callXrCondition("actor_active_detector", actor, MockGameObject.mock(), detectors.detector_simple)).toBe(
      false
    );
  });

  it("actor_on_level should check if actor is on level", () => {
    expect(
      callXrCondition(
        "actor_on_level",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "not-existing",
        "not-existing-2"
      )
    ).toBe(false);

    jest.spyOn(level, "name").mockImplementationOnce(() => "zaton");

    expect(
      callXrCondition(
        "actor_on_level",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "jupiter",
        "pripyat",
        "zaton"
      )
    ).toBe(true);

    jest.spyOn(level, "name").mockImplementationOnce(() => "another");

    expect(
      callXrCondition(
        "actor_on_level",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "jupiter",
        "pripyat",
        "zaton"
      )
    ).toBe(false);
  });

  it("talking should check if actor is talking", () => {
    const actor: GameObject = MockGameObject.mockActor();

    jest.spyOn(actor, "is_talking").mockImplementation(() => false);
    expect(callXrCondition("talking", actor, MockGameObject.mock())).toBe(false);

    jest.spyOn(actor, "is_talking").mockImplementation(() => true);
    expect(callXrCondition("talking", actor, MockGameObject.mock())).toBe(true);
  });

  it("actor_nomove_nowpn should check if actor is talking without weapon", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(callXrCondition("actor_nomove_nowpn", actorGameObject, MockGameObject.mock())).toBe(true);

    jest.spyOn(actorGameObject, "active_item").mockImplementation(() => MockGameObject.mockWithClassId(clsid.wpn_ak74));
    expect(callXrCondition("actor_nomove_nowpn", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(actorGameObject, "is_talking").mockImplementation(() => true);
    expect(callXrCondition("actor_nomove_nowpn", actorGameObject, MockGameObject.mock())).toBe(true);

    jest.spyOn(actorGameObject, "is_talking").mockImplementation(() => false);
    expect(callXrCondition("actor_nomove_nowpn", actorGameObject, MockGameObject.mock())).toBe(false);

    jest
      .spyOn(actorGameObject, "active_item")
      .mockImplementation(() => MockGameObject.mockWithClassId(clsid.device_detector_advanced));
    expect(callXrCondition("actor_nomove_nowpn", actorGameObject, MockGameObject.mock())).toBe(true);
  });

  it("actor_has_nimble_weapon should check if actor has nimble weapon", () => {
    const first: GameObject = MockGameObject.mockActor({
      inventory: [
        [weapons.wpn_ak74u, MockGameObject.mockWithSection(weapons.wpn_ak74u)],
        [weapons.wpn_pm, MockGameObject.mockWithSection(weapons.wpn_pm)],
      ],
    });
    const second: GameObject = MockGameObject.mockActor({
      inventory: [[weapons.wpn_fn2000_nimble, MockGameObject.mockWithSection(weapons.wpn_fn2000_nimble)]],
    });
    const third: GameObject = MockGameObject.mockActor({
      inventory: [
        [weapons.wpn_ak74u, MockGameObject.mockWithSection(weapons.wpn_ak74u)],
        [weapons.wpn_pm, MockGameObject.mockWithSection(weapons.wpn_pm)],
        [weapons.wpn_g36_nimble, MockGameObject.mockWithSection(weapons.wpn_g36_nimble)],
      ],
    });

    expect(callXrCondition("actor_has_nimble_weapon", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);
    expect(callXrCondition("actor_has_nimble_weapon", first, MockGameObject.mock())).toBe(false);
    expect(callXrCondition("actor_has_nimble_weapon", second, MockGameObject.mock())).toBe(true);
    expect(callXrCondition("actor_has_nimble_weapon", third, MockGameObject.mock())).toBe(true);
  });

  it("actor_has_active_nimble_weapon should check if actor has active nimble weapon", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(callXrCondition("actor_has_active_nimble_weapon", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(actorGameObject, "item_in_slot").mockImplementation(() => MockGameObject.mock());

    expect(callXrCondition("actor_has_active_nimble_weapon", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(actorGameObject, "item_in_slot").mockImplementation((slot) => {
      return slot === 2 ? MockGameObject.mockWithSection(weapons.wpn_fn2000_nimble) : MockGameObject.mock();
    });

    expect(callXrCondition("actor_has_active_nimble_weapon", actorGameObject, MockGameObject.mock())).toBe(true);

    jest.spyOn(actorGameObject, "item_in_slot").mockImplementation((slot) => {
      return slot === 3 ? MockGameObject.mockWithSection(weapons.wpn_fn2000_nimble) : MockGameObject.mock();
    });

    expect(callXrCondition("actor_has_active_nimble_weapon", actorGameObject, MockGameObject.mock())).toBe(true);
  });

  it("dead_body_searching should check if actor is searching dead body", () => {
    actorConfig.ACTOR_MENU_MODE = EActorMenuMode.TALK_DIALOG;
    expect(callXrCondition("dead_body_searching", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);

    actorConfig.ACTOR_MENU_MODE = EActorMenuMode.DEAD_BODY_SEARCH;
    expect(callXrCondition("dead_body_searching", MockGameObject.mockActor(), MockGameObject.mock())).toBe(true);

    actorConfig.ACTOR_MENU_MODE = EActorMenuMode.UNDEFINED;
    expect(callXrCondition("dead_body_searching", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);
  });
});
