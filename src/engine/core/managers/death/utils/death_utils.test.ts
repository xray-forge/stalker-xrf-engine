import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, ServerHumanObject } from "xray16/alias";
import { MAX_U32 } from "xray16/lib";
import { $fromArray } from "xray16/macros";
import { MockAlifeHumanStalker, MockGameObject, MockIniFile } from "xray16/mocks";

import {
  IRegistryObjectState,
  registerObject,
  registerSimulator,
  registerStoryLink,
  registry,
} from "@/engine/core/database";
import { IReleaseDescriptor } from "@/engine/core/managers/death";
import { deathConfig } from "@/engine/core/managers/death/DeathConfig";
import { canReleaseObjectCorpse, getFarthestCorpseToRelease } from "@/engine/core/managers/death/utils/death_utils";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

describe("canReleaseObjectCorpse", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should check generic objects", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);

    expect(canReleaseObjectCorpse(object)).toBe(true);
  });

  it("should check objects with story ID", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);
    registerStoryLink(object.id(), "test_sid");

    expect(canReleaseObjectCorpse(object)).toBe(false);
  });

  it("should check objects with known info", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    state.sectionLogic = "test_section";

    jest.spyOn(object, "spawn_ini").mockImplementation(() => {
      return MockIniFile.mock("test.ltx", {
        known_info: "test",
      });
    });

    expect(canReleaseObjectCorpse(object)).toBe(false);
  });

  it("should check objects with keep items", () => {
    const item: GameObject = MockGameObject.mock({ section: "keep_item_section" });
    const object: GameObject = MockGameObject.mock({ inventory: [[item.section(), item]] });

    registerObject(object);

    expect(canReleaseObjectCorpse(object)).toBe(false);
  });
});

describe("getFarthestCorpseToRelease", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    mockRegisteredActor();

    jest.spyOn(Date, "now").mockImplementation(() => 80_000);
  });

  it("should check empty lists", () => {
    expect(getFarthestCorpseToRelease(new LuaTable())).toEqual([null, null]);
  });

  it("should check objects without register in simulator", () => {
    expect(
      getFarthestCorpseToRelease(
        $fromArray<IReleaseDescriptor>([
          { diedAt: 50_000, id: 1 },
          { diedAt: null, id: 5 },
        ])
      )
    ).toEqual([null, null]);
  });

  it("selects a corpse without a saved death time when it is far enough", () => {
    const first: ServerHumanObject = MockAlifeHumanStalker.mock({ alive: false });
    const second: ServerHumanObject = MockAlifeHumanStalker.mock({ alive: false });

    jest.spyOn(registry.actor.position(), "distance_to_sqr").mockImplementation(() => MAX_U32);

    expect(
      getFarthestCorpseToRelease(
        $fromArray<IReleaseDescriptor>([
          { diedAt: 50_000, id: first.id },
          { diedAt: null, id: second.id },
        ])
      )
    ).toEqual([2, { diedAt: null, id: second.id }]);

    jest.spyOn(registry.actor.position(), "distance_to_sqr").mockImplementation(() => deathConfig.MIN_DISTANCE_SQR);

    // Too close.
    expect(
      getFarthestCorpseToRelease(
        $fromArray<IReleaseDescriptor>([
          { diedAt: 50_000, id: first.id },
          { diedAt: null, id: second.id },
        ])
      )
    ).toEqual([null, null]);
  });

  it("selects an idle corpse when it is far enough", () => {
    const first: ServerHumanObject = MockAlifeHumanStalker.mock({ alive: false });
    const second: ServerHumanObject = MockAlifeHumanStalker.mock({ alive: false });

    jest.spyOn(registry.actor.position(), "distance_to_sqr").mockImplementation(() => MAX_U32);

    expect(
      getFarthestCorpseToRelease(
        $fromArray<IReleaseDescriptor>([
          { diedAt: 50_000, id: first.id },
          { diedAt: 15_000, id: second.id },
        ])
      )
    ).toEqual([2, { diedAt: 15_000, id: second.id }]);

    jest.spyOn(Date, "now").mockImplementation(() => 0);

    // Too soon.
    expect(
      getFarthestCorpseToRelease(
        $fromArray<IReleaseDescriptor>([
          { diedAt: 50_000, id: first.id },
          { diedAt: 15_000, id: second.id },
        ])
      )
    ).toEqual([null, null]);

    jest.spyOn(Date, "now").mockImplementation(() => 80_000);
    jest.spyOn(registry.actor.position(), "distance_to_sqr").mockImplementation(() => deathConfig.MIN_DISTANCE_SQR);

    // Too close.
    expect(
      getFarthestCorpseToRelease(
        $fromArray<IReleaseDescriptor>([
          { diedAt: 50_000, id: first.id },
          { diedAt: 15_000, id: second.id },
        ])
      )
    ).toEqual([null, null]);
  });

  it("selects the farthest eligible corpse", () => {
    const first: ServerHumanObject = MockAlifeHumanStalker.mock({ alive: false });
    const second: ServerHumanObject = MockAlifeHumanStalker.mock({ alive: false });

    jest.spyOn(registry.actor.position(), "distance_to_sqr").mockImplementation((position) => {
      return position === first.position ? deathConfig.MIN_DISTANCE_SQR + 1 : deathConfig.MIN_DISTANCE_SQR + 2;
    });

    expect(
      getFarthestCorpseToRelease(
        $fromArray<IReleaseDescriptor>([
          { diedAt: null, id: first.id },
          { diedAt: null, id: second.id },
        ])
      )
    ).toEqual([2, { diedAt: null, id: second.id }]);
  });
});
