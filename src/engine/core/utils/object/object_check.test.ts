import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { clsid } from "xray16";

import { registerActor, registerSimulator, registerStoryLink, registry } from "@/engine/core/database";
import {
  canActorSleep,
  isActorSeenByObject,
  isObjectInjured,
  isObjectSeenByActor,
  isStalkerAlive,
} from "@/engine/core/utils/object/object_check";
import { GameObject, ServerHumanObject, TClassId } from "@/engine/lib/types";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { MockGameObject, mockServerAlifeHumanStalker, mockServerAlifeMonsterBase } from "@/fixtures/xray";

describe("object_check utils", () => {
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

  it("isStalkerAlive should correctly check stalker alive state", () => {
    const aliveStalkerServerObject: ServerHumanObject = mockServerAlifeHumanStalker({
      alive: () => true,
      clsid: () => clsid.script_stalker as TClassId,
    });
    const aliveStalkerGameObject: GameObject = MockGameObject.mock({
      idOverride: aliveStalkerServerObject.id,
      alive: () => true,
      clsid: () => clsid.script_stalker as TClassId,
    });

    registerStoryLink(aliveStalkerServerObject.id, "alive-stalker-sid");

    expect(isStalkerAlive(aliveStalkerServerObject)).toBe(true);
    expect(isStalkerAlive(aliveStalkerGameObject)).toBe(true);
    expect(isStalkerAlive("alive-stalker-sid")).toBe(true);
    expect(isStalkerAlive("not-existing-stalker-sid")).toBe(false);
    expect(isStalkerAlive(MockGameObject.mock())).toBe(false);
    expect(
      isStalkerAlive(
        mockServerAlifeHumanStalker({
          alive: () => false,
          clsid: () => clsid.script_stalker as TClassId,
        })
      )
    ).toBe(false);
    expect(
      isStalkerAlive(
        mockServerAlifeHumanStalker({
          alive: () => false,
          clsid: () => clsid.boar_s as TClassId,
        })
      )
    ).toBe(false);
    expect(
      isStalkerAlive(
        mockServerAlifeMonsterBase({
          alive: () => true,
          clsid: () => clsid.boar_s as TClassId,
        })
      )
    ).toBe(false);
  });

  it("isObjectInjured should correctly check objects", () => {
    expect(isObjectInjured(MockGameObject.mock())).toBe(false);
    expect(isObjectInjured(MockGameObject.mock({ radiation: -1, health: 100, bleeding: -1 }))).toBe(false);
    expect(isObjectInjured(MockGameObject.mock({ radiation: 0.01 }))).toBe(true);
    expect(isObjectInjured(MockGameObject.mock({ radiation: 0.5 }))).toBe(true);
    expect(isObjectInjured(MockGameObject.mock({ bleeding: 0.01 }))).toBe(true);
    expect(isObjectInjured(MockGameObject.mock({ bleeding: 0.5 }))).toBe(true);
    expect(isObjectInjured(MockGameObject.mock({ health: 0.999 }))).toBe(true);
    expect(isObjectInjured(MockGameObject.mock({ health: 0.5 }))).toBe(true);
  });

  it("isObjectSeenByActor should correctly check objects visibility", () => {
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

  it("isActorSeenByObject should correctly check actor visibility", () => {
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
