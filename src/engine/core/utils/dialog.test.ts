import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  IRegistryObjectState,
  registerActor,
  registerObject,
  registerSimulator,
  registry,
} from "@/engine/core/database";
import { updateStalkerLogic } from "@/engine/core/objects/binders";
import { ISchemeMeetState } from "@/engine/core/schemes/stalker/meet";
import { MeetManager } from "@/engine/core/schemes/stalker/meet/MeetManager";
import { updateObjectMeetAvailability } from "@/engine/core/schemes/stalker/meet/utils";
import {
  breakObjectDialog,
  getActorAvailableMedKit,
  getNpcSpeaker,
  isObjectName,
  updateObjectDialog,
} from "@/engine/core/utils/dialog";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { medkits } from "@/engine/lib/constants/items/drugs";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { MockLuaTable } from "@/fixtures/lua";
import { mockGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/schemes/stalker/meet/utils", () => ({ updateObjectMeetAvailability: jest.fn() }));
jest.mock("@/engine/core/objects/binders/creature/StalkerBinder", () => ({ updateStalkerLogic: jest.fn() }));

describe("reward utils", () => {
  const createObjectWithItems = () =>
    mockGameObject({
      inventory: [
        [1, mockGameObject({ sectionOverride: medkits.medkit } as Partial<GameObject>)],
        [2, mockGameObject({ sectionOverride: medkits.medkit } as Partial<GameObject>)],
        [3, mockGameObject({ sectionOverride: medkits.medkit_army } as Partial<GameObject>)],
        [4, mockGameObject({ sectionOverride: medkits.medkit_army } as Partial<GameObject>)],
        [5, mockGameObject({ sectionOverride: medkits.medkit_army } as Partial<GameObject>)],
        [40, mockGameObject({ sectionOverride: weapons.wpn_svd } as Partial<GameObject>)],
        [41, mockGameObject({ sectionOverride: weapons.wpn_svd } as Partial<GameObject>)],
        [50, mockGameObject({ sectionOverride: ammo.ammo_9x18_pmm } as Partial<GameObject>)],
        [51, mockGameObject({ sectionOverride: ammo.ammo_9x18_pmm } as Partial<GameObject>)],
        [52, mockGameObject({ sectionOverride: ammo.ammo_9x18_pmm } as Partial<GameObject>)],
        [53, mockGameObject({ sectionOverride: ammo.ammo_9x18_pmm } as Partial<GameObject>)],
        [54, mockGameObject({ sectionOverride: ammo.ammo_9x18_pmm } as Partial<GameObject>)],
        [55, mockGameObject({ sectionOverride: ammo.ammo_9x18_pmm } as Partial<GameObject>)],
      ],
    });

  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
    registerSimulator();
  });

  it("getNpcSpeaker should correctly pick speaker", () => {
    const first: GameObject = mockGameObject();
    const second: GameObject = mockGameObject();

    expect(getNpcSpeaker(registry.actor, first)).toBe(first);
    expect(getNpcSpeaker(registry.actor, second)).toBe(second);

    expect(getNpcSpeaker(first, registry.actor)).toBe(first);
    expect(getNpcSpeaker(second, registry.actor)).toBe(second);
  });

  it("isObjectName should correctly check name", () => {
    const object: GameObject = mockGameObject({ name: () => "test_complex_name" } as Partial<GameObject>);

    expect(object.name()).toBe("test_complex_name");
    expect(isObjectName(object, "another")).toBeFalsy();
    expect(isObjectName(object, "test_complex_name")).toBeTruthy();
    expect(isObjectName(object, "complex_name")).toBeTruthy();
    expect(isObjectName(object, "test_complex")).toBeTruthy();
    expect(isObjectName(object, "test")).toBeTruthy();
    expect(isObjectName(object, "complex")).toBeTruthy();
    expect(isObjectName(object, "name")).toBeTruthy();
  });

  it("getActorAvailableMedKit should correctly check medkit", () => {
    registerActor(createObjectWithItems());

    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray(Object.values(medkits)))).toBe(medkits.medkit);
    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray(Object.values(medkits)), mockGameObject())).toBeNull();

    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray([medkits.medkit]))).toBe(medkits.medkit);
    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray([medkits.medkit_army]))).toBe(medkits.medkit_army);
    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray([medkits.medkit_scientic]))).toBeNull();

    expect(getActorAvailableMedKit(MockLuaTable.mockFromArray([medkits.medkit]), mockGameObject())).toBeNull();
  });

  it("breakObjectDialog should correctly break", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = mockGameObject();

    breakObjectDialog(object);

    expect(actorGameObject.stop_talk).toHaveBeenCalledTimes(1);
    expect(object.stop_talk).toHaveBeenCalledTimes(1);
  });

  it("updateObjectDialog should correctly update dialog state", () => {
    mockRegisteredActor();

    const object: GameObject = mockGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const meetState: ISchemeMeetState = mockSchemeState(EScheme.MEET);

    state[EScheme.MEET] = meetState;
    meetState.meetManager = { update: jest.fn() } as unknown as MeetManager;

    updateObjectDialog(object);

    expect(meetState.meetManager.update).toHaveBeenCalledTimes(1);
    expect(updateObjectMeetAvailability).toHaveBeenCalledWith(object);
    expect(updateStalkerLogic).toHaveBeenCalledWith(object);
  });
});
