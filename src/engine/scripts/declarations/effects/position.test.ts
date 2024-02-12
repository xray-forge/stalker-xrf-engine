import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { patrol } from "xray16";

import {
  registerObject,
  registerSimulator,
  registerStoryLink,
  registry,
  resetStalkerState,
} from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { setSquadPosition } from "@/engine/core/objects/squad/utils";
import { GameObject, Patrol, ServerObject } from "@/engine/lib/types";
import { callXrEffect, checkXrEffect, mockRegisteredActor, MockSquad, resetRegistry } from "@/fixtures/engine";
import { MockAlifeObject, MockGameObject, MockParticleObject, MockPatrol } from "@/fixtures/xray";

jest.mock("@/engine/core/database/stalker");
jest.mock("@/engine/core/objects/squad/utils");

describe("position effects declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/position");
  });

  it("should correctly inject external methods for game", () => {
    checkXrEffect("teleport_npc");
    checkXrEffect("teleport_npc_by_story_id");
    checkXrEffect("teleport_squad");
    checkXrEffect("teleport_actor");
    checkXrEffect("play_particle_on_path");
  });
});

describe("position effects implementation", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/position");
  });

  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("teleport_npc should teleport objects", () => {
    expect(() => callXrEffect("teleport_npc", MockGameObject.mockActor(), MockGameObject.mock())).toThrow(
      "Wrong parameters in 'teleport_npc' function."
    );

    const object: GameObject = MockGameObject.mock();

    callXrEffect("teleport_npc", MockGameObject.mockActor(), object, "test-wp");

    expect(resetStalkerState).toHaveBeenCalledWith(object);
    expect(object.set_npc_position).toHaveBeenCalledWith(new patrol("test-wp").point(0));

    callXrEffect("teleport_npc", MockGameObject.mockActor(), object, "test-wp", 1);

    expect(resetStalkerState).toHaveBeenCalledWith(object);
    expect(object.set_npc_position).toHaveBeenCalledWith(new patrol("test-wp").point(1));
  });

  it("teleport_npc_by_story_id should teleport objects by story ids", () => {
    expect(() => callXrEffect("teleport_npc_by_story_id", MockGameObject.mockActor(), MockGameObject.mock())).toThrow(
      "Wrong parameters in 'teleport_npc_by_story_id' function."
    );

    expect(() => {
      callXrEffect(
        "teleport_npc_by_story_id",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "test-sid",
        "test-wp"
      );
    }).toThrow("There is no story object with id 'test-sid'.");

    const first: GameObject = MockGameObject.mock();
    const second: ServerObject = MockAlifeObject.mock();

    registerStoryLink(first.id(), "test-sid-1");
    registerStoryLink(second.id, "test-sid-2");

    callXrEffect(
      "teleport_npc_by_story_id",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      "test-sid-1",
      "test-wp"
    );

    expect(resetStalkerState).toHaveBeenCalledWith(first);
    expect(first.set_npc_position).toHaveBeenCalledWith(new patrol("test-wp").point(0));

    callXrEffect(
      "teleport_npc_by_story_id",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      "test-sid-2",
      "test-wp",
      2
    );

    expect(second.position).toBe(new patrol("test-wp").point(2));
  });

  it("teleport_squad should teleport squads", () => {
    expect(() => callXrEffect("teleport_npc_by_story_id", MockGameObject.mockActor(), MockGameObject.mock())).toThrow(
      "Wrong parameters in 'teleport_npc_by_story_id' function."
    );

    expect(() => {
      callXrEffect("teleport_squad", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid", "test-wp");
    }).toThrow("There is no squad with story id 'test-sid'.");

    const squad: Squad = MockSquad.mock();

    registerStoryLink(squad.id, "test-sid-squad");

    callXrEffect("teleport_squad", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid-squad", "test-wp", 1);

    expect(setSquadPosition).toHaveBeenCalledWith(squad, new patrol("test-wp").point(1));
  });

  it("teleport_actor should teleport actors", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(() => callXrEffect("teleport_actor", MockGameObject.mockActor(), MockGameObject.mock())).toThrow(
      "Wrong parameters in 'teleport_actor' effect."
    );

    callXrEffect("teleport_actor", actorGameObject, MockGameObject.mock(), "test-wp");

    expect(actorGameObject.set_actor_direction).toHaveBeenCalledTimes(0);
    expect(actorGameObject.set_actor_position).toHaveBeenCalledWith(new patrol("test-wp").point(0));

    callXrEffect("teleport_actor", actorGameObject, MockGameObject.mock(), "test-wp-2", "test-wp-3");

    expect(actorGameObject.set_actor_direction).toHaveBeenCalledWith(expect.closeTo(-1.5707));
    expect(actorGameObject.set_actor_position).toHaveBeenCalledWith(new patrol("test-wp-2").point(0));

    expect(registry.noWeaponZones.length()).toBe(0);

    const noWeaponZone: GameObject = MockGameObject.mock();

    registerObject(noWeaponZone);

    jest.spyOn(noWeaponZone, "inside").mockImplementation(() => true);

    registry.noWeaponZones.set(noWeaponZone.id(), false);

    callXrEffect("teleport_actor", actorGameObject, MockGameObject.mock(), "test-wp");

    expect(registry.noWeaponZones.get(noWeaponZone.id())).toBe(true);
  });

  it("play_particle_on_path should play particles", () => {
    jest.spyOn(math, "random").mockImplementation(() => 20);

    expect(() => {
      callXrEffect("play_particle_on_path", MockGameObject.mockActor(), MockGameObject.mock());
    }).not.toThrow();

    callXrEffect(
      "play_particle_on_path",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      "test-particle",
      "test-wp",
      10
    );

    expect(MockParticleObject.REGISTRY.length()).toBe(1);
    expect(MockParticleObject.REGISTRY.get("test-particle")).not.toBeNull();

    const first: MockParticleObject = MockParticleObject.REGISTRY.get("test-particle");
    const path: Patrol = MockPatrol.mock("test-wp");

    expect(first.play_at_pos).toHaveBeenCalledTimes(0);

    callXrEffect(
      "play_particle_on_path",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      "test-particle",
      "test-wp",
      20
    );

    expect(MockParticleObject.REGISTRY.length()).toBe(1);
    expect(MockParticleObject.REGISTRY.get("test-particle")).not.toBeNull();

    const second: MockParticleObject = MockParticleObject.REGISTRY.get("test-particle");

    expect(second.play_at_pos).toHaveBeenCalledTimes(3);
    expect(second.play_at_pos).toHaveBeenCalledWith(path.point(0));
    expect(second.play_at_pos).toHaveBeenCalledWith(path.point(1));
    expect(second.play_at_pos).toHaveBeenCalledWith(path.point(2));
  });
});
