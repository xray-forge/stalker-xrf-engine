import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { clsid } from "xray16";

import { registerActor, registerSimulator, registerStoryLink } from "@/engine/core/database";
import {
  isActorSeenByObject,
  isObjectInjured,
  isObjectSeenByActor,
  isStalkerAlive,
} from "@/engine/core/utils/object/object_check";
import { ClientObject, ServerHumanObject, TClassId } from "@/engine/lib/types";
import { mockClientGameObject, mockServerAlifeHumanStalker, mockServerAlifeMonsterBase } from "@/fixtures/xray";

describe("object_check utils", () => {
  beforeEach(() => registerSimulator());

  it("isStalkerAlive should correctly check stalker alive state", () => {
    const aliveStalkerServerObject: ServerHumanObject = mockServerAlifeHumanStalker({
      alive: () => true,
      clsid: () => clsid.script_stalker as TClassId,
    });
    const aliveStalkerClientObject: ClientObject = mockClientGameObject({
      idOverride: aliveStalkerServerObject.id,
      alive: () => true,
      clsid: () => clsid.script_stalker as TClassId,
    });

    registerStoryLink(aliveStalkerServerObject.id, "alive-stalker-sid");

    expect(isStalkerAlive(aliveStalkerServerObject)).toBe(true);
    expect(isStalkerAlive(aliveStalkerClientObject)).toBe(true);
    expect(isStalkerAlive("alive-stalker-sid")).toBe(true);
    expect(isStalkerAlive("not-existing-stalker-sid")).toBe(false);
    expect(isStalkerAlive(mockClientGameObject())).toBe(false);
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
    expect(isObjectInjured(mockClientGameObject())).toBe(false);
    expect(isObjectInjured(mockClientGameObject({ radiation: -1, health: 100, bleeding: -1 }))).toBe(false);
    expect(isObjectInjured(mockClientGameObject({ radiation: 0.01 }))).toBe(true);
    expect(isObjectInjured(mockClientGameObject({ radiation: 0.5 }))).toBe(true);
    expect(isObjectInjured(mockClientGameObject({ bleeding: 0.01 }))).toBe(true);
    expect(isObjectInjured(mockClientGameObject({ bleeding: 0.5 }))).toBe(true);
    expect(isObjectInjured(mockClientGameObject({ health: 0.999 }))).toBe(true);
    expect(isObjectInjured(mockClientGameObject({ health: 0.5 }))).toBe(true);
  });

  it("isObjectSeenByActor should correctly check objects visibility", () => {
    expect(() => isObjectSeenByActor(mockClientGameObject())).toThrow();

    const actor: ClientObject = mockClientGameObject();

    registerActor(actor);

    jest.spyOn(actor, "alive").mockImplementation(() => true);
    jest.spyOn(actor, "see").mockImplementation(() => true);
    expect(isObjectSeenByActor(mockClientGameObject())).toBe(true);

    jest.spyOn(actor, "alive").mockImplementation(() => false);
    jest.spyOn(actor, "see").mockImplementation(() => true);
    expect(isObjectSeenByActor(mockClientGameObject())).toBe(false);

    jest.spyOn(actor, "alive").mockImplementation(() => true);
    jest.spyOn(actor, "see").mockImplementation(() => false);
    expect(isObjectSeenByActor(mockClientGameObject())).toBe(false);

    jest.spyOn(actor, "alive").mockImplementation(() => false);
    jest.spyOn(actor, "see").mockImplementation(() => false);
    expect(isObjectSeenByActor(mockClientGameObject())).toBe(false);
  });

  it("isActorSeenByObject should correctly check actor visibility", () => {
    const object: ClientObject = mockClientGameObject();

    registerActor(mockClientGameObject());

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
