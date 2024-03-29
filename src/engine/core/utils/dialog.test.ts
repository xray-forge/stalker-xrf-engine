import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { IRegistryObjectState, registerObject, registerSimulator, registry } from "@/engine/core/database";
import { ISchemeMeetState } from "@/engine/core/schemes/stalker/meet";
import { MeetManager } from "@/engine/core/schemes/stalker/meet/MeetManager";
import { updateObjectMeetAvailability } from "@/engine/core/schemes/stalker/meet/utils";
import { breakObjectDialog, getNpcSpeaker, isObjectName, updateObjectDialog } from "@/engine/core/utils/dialog";
import { updateStalkerLogic } from "@/engine/core/utils/logics";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { MockGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/schemes/stalker/meet/utils");
jest.mock("@/engine/core/utils/logics");

describe("getNpcSpeaker util", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
    registerSimulator();
  });

  it("should correctly pick speaker", () => {
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    expect(getNpcSpeaker(registry.actor, first)).toBe(first);
    expect(getNpcSpeaker(registry.actor, second)).toBe(second);

    expect(getNpcSpeaker(first, registry.actor)).toBe(first);
    expect(getNpcSpeaker(second, registry.actor)).toBe(second);
  });
});

describe("isObjectName util", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
    registerSimulator();
  });

  it("should correctly check name", () => {
    const object: GameObject = MockGameObject.mock({ name: "test_complex_name" });

    expect(object.name()).toBe("test_complex_name");
    expect(isObjectName(object, "another")).toBeFalsy();
    expect(isObjectName(object, "test_complex_name")).toBeTruthy();
    expect(isObjectName(object, "complex_name")).toBeTruthy();
    expect(isObjectName(object, "test_complex")).toBeTruthy();
    expect(isObjectName(object, "test")).toBeTruthy();
    expect(isObjectName(object, "complex")).toBeTruthy();
    expect(isObjectName(object, "name")).toBeTruthy();
  });
});

describe("breakObjectDialog util", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
    registerSimulator();
  });

  it("breakObjectDialog should correctly break", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mock();

    breakObjectDialog(object);

    expect(actorGameObject.stop_talk).toHaveBeenCalledTimes(1);
    expect(object.stop_talk).toHaveBeenCalledTimes(1);
  });
});

describe("updateObjectDialog util", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
    registerSimulator();
  });

  it("should correctly update dialog state", () => {
    mockRegisteredActor();

    const object: GameObject = MockGameObject.mock();
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
