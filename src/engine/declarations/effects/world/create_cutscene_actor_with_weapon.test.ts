import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { TSection } from "xray16/lib";
import {
  MockAlifeHumanStalker,
  MockAlifeItemWeapon,
  MockAlifeObject,
  MockAlifeSimulator,
  MockGameObject,
  MockPatrol,
} from "xray16/mocks";

import { questItems } from "@/engine/constants/items/quest_items";
import { weapons } from "@/engine/constants/items/weapons";
import { registerSimulator, registry } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/world/create_cutscene_actor_with_weapon");
});

beforeEach(() => {
  resetRegistry();
});

/**
 * Register a simulator, a cutscene patrol path and an actor carrying a weapon of the provided section.
 */
function mockCutsceneSetup(section: TSection = "wpn_ak74"): { actor: GameObject; weapon: GameObject } {
  const actor: GameObject = MockGameObject.mockActor();
  const weapon: GameObject = MockGameObject.mock({ section });

  registerSimulator();
  MockAlifeSimulator.addToRegistry(MockAlifeItemWeapon.mock({ id: weapon.id(), section }));
  MockPatrol.setup({
    "cutscene-path": {
      points: [{ flag: 0, gvid: 42, lvid: 24, name: "cutscene-point", position: actor.position() as never }],
    },
  });

  return { actor, weapon };
}

describe("create_cutscene_actor_with_weapon", () => {
  it("should spawn an actor and clone the active weapon at the patrol point", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const weapon: GameObject = MockGameObject.mock({ section: "wpn_ak74" });
    const actorWeapon = MockAlifeItemWeapon.mock({ id: weapon.id(), section: "wpn_ak74" });
    const cutsceneActor = MockAlifeObject.mock({ id: 501 });
    const cutsceneWeapon = MockAlifeItemWeapon.mock({ id: 502, section: "wpn_ak74" });

    registerSimulator();
    MockAlifeSimulator.addToRegistry(actorWeapon);
    MockPatrol.setup({
      "cutscene-path": {
        points: [{ flag: 0, gvid: 42, lvid: 24, name: "cutscene-point", position: actor.position() as any }],
      },
    });
    jest.spyOn(actor, "active_slot").mockReturnValue(2);
    jest.spyOn(actor, "active_item").mockReturnValue(weapon);
    jest.spyOn(cutsceneWeapon, "clone_addons");
    jest
      .spyOn(registry.simulator, "create")
      .mockImplementationOnce(() => cutsceneActor)
      .mockImplementationOnce(() => cutsceneWeapon);

    callXrEffect(
      "create_cutscene_actor_with_weapon",
      actor,
      MockGameObject.mock(),
      "cutscene_stalker",
      "cutscene-path",
      0,
      90
    );

    expect(registry.simulator.create).toHaveBeenNthCalledWith(1, "cutscene_stalker", actor.position(), 24, 42);
    expect(registry.simulator.create).toHaveBeenNthCalledWith(
      2,
      "wpn_ak74",
      actor.position(),
      24,
      42,
      cutsceneActor.id
    );
    expect(cutsceneWeapon.clone_addons).toHaveBeenCalledWith(actorWeapon);
  });

  it("should reject missing spawn section, missing path, and unknown path", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const object: GameObject = MockGameObject.mock();

    registerSimulator();

    expect(() => callXrEffect("create_cutscene_actor_with_weapon", actor, object)).toThrow();
    expect(() => callXrEffect("create_cutscene_actor_with_weapon", actor, object, "cutscene_stalker")).toThrow();
    expect(() =>
      callXrEffect("create_cutscene_actor_with_weapon", actor, object, "cutscene_stalker", "missing-path")
    ).toThrow();
  });

  it("should set the torso yaw for a spawned stalker and the angle for anything else", () => {
    const { actor, weapon } = mockCutsceneSetup();
    const cutsceneStalker = MockAlifeHumanStalker.mock({ id: 511 });
    const cutsceneWeapon = MockAlifeItemWeapon.mock({ id: 512, section: "wpn_ak74" });

    jest.spyOn(actor, "active_slot").mockReturnValue(2);
    jest.spyOn(actor, "active_item").mockReturnValue(weapon);
    jest
      .spyOn(registry.simulator, "create")
      .mockImplementationOnce(() => cutsceneStalker)
      .mockImplementationOnce(() => cutsceneWeapon);

    callXrEffect(
      "create_cutscene_actor_with_weapon",
      actor,
      MockGameObject.mock(),
      "cutscene_stalker",
      "cutscene-path",
      0,
      180
    );

    expect(cutsceneStalker.o_torso()!.yaw).toBeCloseTo(Math.PI);
  });

  it("should do nothing when the active slot holds no weapon", () => {
    const { actor } = mockCutsceneSetup();

    jest.spyOn(actor, "active_slot").mockReturnValue(1);
    jest.spyOn(registry.simulator, "create").mockImplementationOnce(() => MockAlifeObject.mock({ id: 521 }));

    callXrEffect(
      "create_cutscene_actor_with_weapon",
      actor,
      MockGameObject.mock(),
      "cutscene_stalker",
      "cutscene-path"
    );

    expect(registry.simulator.create).toHaveBeenCalledTimes(1);
  });

  it("should take the weapon from an explicitly requested slot", () => {
    const { actor, weapon } = mockCutsceneSetup();
    const cutsceneWeapon = MockAlifeItemWeapon.mock({ id: 532, section: "wpn_ak74" });

    MockGameObject.asMock(actor).item_in_slot.mockImplementation(((slot: number) =>
      slot === 3 ? weapon : null) as never);
    jest
      .spyOn(registry.simulator, "create")
      .mockImplementationOnce(() => MockAlifeObject.mock({ id: 531 }))
      .mockImplementationOnce(() => cutsceneWeapon);

    callXrEffect(
      "create_cutscene_actor_with_weapon",
      actor,
      MockGameObject.mock(),
      "cutscene_stalker",
      "cutscene-path",
      0,
      0,
      3
    );

    expect(registry.simulator.create).toHaveBeenNthCalledWith(2, "wpn_ak74", actor.position(), 24, 42, 531);
  });

  it("should fall back to slot three and then slot two when the requested slot is empty", () => {
    for (const fallbackSlot of [3, 2]) {
      const { actor, weapon } = mockCutsceneSetup();
      const cutsceneWeapon = MockAlifeItemWeapon.mock({ id: 542, section: "wpn_ak74" });

      MockGameObject.asMock(actor).item_in_slot.mockImplementation(((slot: number) =>
        slot === fallbackSlot ? weapon : null) as never);

      const create = jest
        .spyOn(registry.simulator, "create")
        .mockReset()
        .mockImplementationOnce(() => MockAlifeObject.mock({ id: 541 }))
        .mockImplementationOnce(() => cutsceneWeapon);

      callXrEffect(
        "create_cutscene_actor_with_weapon",
        actor,
        MockGameObject.mock(),
        "cutscene_stalker",
        "cutscene-path",
        0,
        0,
        7
      );

      expect(create).toHaveBeenCalledTimes(2);
    }
  });

  it("should do nothing when the requested slot and both fallbacks are empty", () => {
    const { actor } = mockCutsceneSetup();

    MockGameObject.asMock(actor).item_in_slot.mockImplementation((() => null) as never);
    jest.spyOn(registry.simulator, "create").mockImplementationOnce(() => MockAlifeObject.mock({ id: 551 }));

    callXrEffect(
      "create_cutscene_actor_with_weapon",
      actor,
      MockGameObject.mock(),
      "cutscene_stalker",
      "cutscene-path",
      0,
      0,
      7
    );

    expect(registry.simulator.create).toHaveBeenCalledTimes(1);
  });

  it("should substitute the repaired gauss rifle and skip cloning its addons", () => {
    const { actor } = mockCutsceneSetup(questItems.pri_a17_gauss_rifle);
    const gaussRifle: GameObject = MockGameObject.mock({ section: questItems.pri_a17_gauss_rifle });
    const cutsceneWeapon = MockAlifeItemWeapon.mock({ id: 562, section: weapons.wpn_gauss });

    MockAlifeSimulator.addToRegistry(
      MockAlifeItemWeapon.mock({ id: gaussRifle.id(), section: questItems.pri_a17_gauss_rifle })
    );

    jest.spyOn(actor, "active_slot").mockReturnValue(2);
    jest.spyOn(actor, "active_item").mockReturnValue(gaussRifle);
    jest.spyOn(cutsceneWeapon, "clone_addons");
    jest
      .spyOn(registry.simulator, "create")
      .mockImplementationOnce(() => MockAlifeObject.mock({ id: 561 }))
      .mockImplementationOnce(() => cutsceneWeapon);

    callXrEffect(
      "create_cutscene_actor_with_weapon",
      actor,
      MockGameObject.mock(),
      "cutscene_stalker",
      "cutscene-path"
    );

    expect(registry.simulator.create).toHaveBeenNthCalledWith(2, weapons.wpn_gauss, actor.position(), 24, 42, 561);
    expect(cutsceneWeapon.clone_addons).not.toHaveBeenCalled();
  });
});
