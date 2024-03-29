import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { clsid } from "xray16";

import {
  IRegistryObjectState,
  registerActor,
  registerObject,
  registerSimulator,
  registerStoryLink,
  registry,
} from "@/engine/core/database";
import {
  canActorSleep,
  isActorSeenByObject,
  isObjectInjured,
  isObjectSeenByActor,
  isObjectWithKnownInfo,
  isStalkerAlive,
} from "@/engine/core/utils/object/object_check";
import { AnyObject, GameObject, ServerHumanObject, ServerMonsterBaseObject } from "@/engine/lib/types";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { MockAlifeHumanStalker, MockAlifeMonsterBase, MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("isStalkerAlive util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly check stalker alive state", () => {
    const aliveStalkerServerObject: ServerHumanObject = MockAlifeHumanStalker.mockWithClassId(clsid.script_stalker);
    const aliveStalkerGameObject: GameObject = MockGameObject.mock({
      id: aliveStalkerServerObject.id,
      alive: true,
      clsid: clsid.script_stalker,
    });

    const deadStalkerServerObject: ServerHumanObject = MockAlifeHumanStalker.mockWithClassId(clsid.script_stalker);
    const deadMonsterServerObject: ServerMonsterBaseObject = MockAlifeMonsterBase.mock();

    jest.spyOn(deadStalkerServerObject, "alive").mockImplementation(() => false);
    jest.spyOn(deadMonsterServerObject, "alive").mockImplementation(() => false);

    registerStoryLink(aliveStalkerServerObject.id, "alive-stalker-sid");

    expect(isStalkerAlive(aliveStalkerServerObject)).toBe(true);
    expect(isStalkerAlive(aliveStalkerGameObject)).toBe(true);
    expect(isStalkerAlive("alive-stalker-sid")).toBe(true);
    expect(isStalkerAlive("not-existing-stalker-sid")).toBe(false);
    expect(isStalkerAlive(MockGameObject.mock())).toBe(false);
    expect(isStalkerAlive(deadStalkerServerObject)).toBe(false);
    expect(isStalkerAlive(deadMonsterServerObject)).toBe(false);
    expect(isStalkerAlive(MockAlifeMonsterBase.mock())).toBe(false);
  });
});

describe("isObjectInjured util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly check objects", () => {
    expect(isObjectInjured(MockGameObject.mock())).toBe(false);
    expect(isObjectInjured(MockGameObject.mock({ radiation: -1, health: 100, bleeding: -1 }))).toBe(false);
    expect(isObjectInjured(MockGameObject.mock({ radiation: 0.01 }))).toBe(true);
    expect(isObjectInjured(MockGameObject.mock({ radiation: 0.5 }))).toBe(true);
    expect(isObjectInjured(MockGameObject.mock({ bleeding: 0.01 }))).toBe(true);
    expect(isObjectInjured(MockGameObject.mock({ bleeding: 0.5 }))).toBe(true);
    expect(isObjectInjured(MockGameObject.mock({ health: 0.999 }))).toBe(true);
    expect(isObjectInjured(MockGameObject.mock({ health: 0.5 }))).toBe(true);
  });
});

describe("isObjectSeenByActor util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly check objects visibility", () => {
    expect(() => isObjectSeenByActor(MockGameObject.mock())).toThrow();

    const actor: GameObject = MockGameObject.mock();

    registerActor(actor);

    jest.spyOn(actor, "alive").mockImplementation(() => true);
    jest.spyOn(actor, "see").mockImplementation(() => true);
    expect(isObjectSeenByActor(MockGameObject.mock())).toBe(true);

    jest.spyOn(actor, "alive").mockImplementation(() => false);
    jest.spyOn(actor, "see").mockImplementation(() => true);
    expect(isObjectSeenByActor(MockGameObject.mock())).toBe(false);

    jest.spyOn(actor, "alive").mockImplementation(() => true);
    jest.spyOn(actor, "see").mockImplementation(() => false);
    expect(isObjectSeenByActor(MockGameObject.mock())).toBe(false);

    jest.spyOn(actor, "alive").mockImplementation(() => false);
    jest.spyOn(actor, "see").mockImplementation(() => false);
    expect(isObjectSeenByActor(MockGameObject.mock())).toBe(false);
  });
});

describe("isActorSeenByObject util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly check actor visibility", () => {
    const object: GameObject = MockGameObject.mock();

    registerActor(MockGameObject.mock());

    jest.spyOn(object, "alive").mockImplementation(() => true);
    jest.spyOn(object, "see").mockImplementation(() => true);
    expect(isActorSeenByObject(object)).toBe(true);

    jest.spyOn(object, "alive").mockImplementation(() => false);
    jest.spyOn(object, "see").mockImplementation(() => true);
    expect(isActorSeenByObject(object)).toBe(false);

    jest.spyOn(object, "alive").mockImplementation(() => true);
    jest.spyOn(object, "see").mockImplementation(() => false);
    expect(isActorSeenByObject(object)).toBe(false);

    jest.spyOn(object, "alive").mockImplementation(() => false);
    jest.spyOn(object, "see").mockImplementation(() => false);
    expect(isActorSeenByObject(object)).toBe(false);
  });
});

describe("canActorSleep util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("canActorSleep should correctly check object", () => {
    mockRegisteredActor();

    expect(canActorSleep()).toBe(true);

    registry.actor.radiation = 1;
    expect(canActorSleep()).toBe(false);

    registry.actor.bleeding = 1;
    expect(canActorSleep()).toBe(false);

    registry.actor.radiation = 0;
    expect(canActorSleep()).toBe(false);

    registry.actor.bleeding = 0;
    expect(canActorSleep()).toBe(true);
  });
});

describe("isObjectWithKnownInfo util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should check with no known info in spawn ini file", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);

    expect(isObjectWithKnownInfo(object)).toBe(false);
  });

  it("should check with known info in spawn ini file", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    state.sectionLogic = "test_section";

    jest.spyOn(object, "spawn_ini").mockImplementation(() => {
      return MockIniFile.mock("test.ltx", {
        known_info: "test",
      });
    });

    expect(isObjectWithKnownInfo(object)).toBe(true);
  });

  it("should check with custom known info in spawn ini file", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const data: AnyObject = {
      test_section: {
        known_info: "test_10",
      },
    };

    state.sectionLogic = "test_section";

    jest.spyOn(object, "spawn_ini").mockImplementation(() => MockIniFile.mock("test.ltx", data));

    expect(isObjectWithKnownInfo(object)).toBe(false);

    data["test_10"] = "test";

    expect(isObjectWithKnownInfo(object)).toBe(true);
  });

  it("should check with custom spawn ini config", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    MockIniFile.register("custom_spawn.ltx", {
      test_section: {
        known_info: "test_10",
      },
      test_10: "test",
    });

    state.sectionLogic = "test_section";

    jest.spyOn(object, "spawn_ini").mockImplementation(() => {
      return MockIniFile.mock("test.ltx", {
        logic: { cfg: "custom_spawn.ltx" },
      });
    });

    expect(isObjectWithKnownInfo(object)).toBe(true);
  });
});
