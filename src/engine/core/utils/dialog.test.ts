import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { updateStalkerLogic } from "@/engine/core/binders";
import { IRegistryObjectState, registerObject, registerSimulator, registry } from "@/engine/core/database";
import { ISchemeMeetState } from "@/engine/core/schemes/stalker/meet";
import { MeetManager } from "@/engine/core/schemes/stalker/meet/MeetManager";
import { updateObjectMeetAvailability } from "@/engine/core/schemes/stalker/meet/utils";
import { breakObjectDialog, getNpcSpeaker, isObjectName, updateObjectDialog } from "@/engine/core/utils/dialog";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { mockGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/schemes/stalker/meet/utils", () => ({ updateObjectMeetAvailability: jest.fn() }));
jest.mock("@/engine/core/binders/creature/StalkerBinder", () => ({ updateStalkerLogic: jest.fn() }));

describe("reward utils", () => {
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
