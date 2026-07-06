import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { Nillable } from "xray16/lib";
import { MockPropertyStorage, MockVector } from "xray16/mocks";

import { getManager } from "@/engine/core/database";
import { setStalkerState } from "@/engine/core/database/stalker";
import { SoundManager } from "@/engine/core/managers/sounds";
import { ISchemeCoverState } from "@/engine/core/schemes/stalker/cover";
import { ActionCover } from "@/engine/core/schemes/stalker/cover/actions/ActionCover";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { EScheme } from "@/engine/lib/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/database/stalker");

function setupAction(soundIdle: Nillable<string>): { action: ActionCover; object: GameObject } {
  const object: GameObject = MockGameObject.mock();
  const state: ISchemeCoverState = mockSchemeState<ISchemeCoverState>(EScheme.COVER, {
    soundIdle: soundIdle as string,
    animationConditionList: parseConditionsList("cover_hide"),
  });
  const action: ActionCover = new ActionCover(state);

  action.setup(object, MockPropertyStorage.mock());
  action.coverVertexId = 5;
  action.coverPosition = MockVector.mock(0, 0, 0);

  return { action, object };
}

describe("ActionCover", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
    resetFunctionMock(setStalkerState);
  });

  it("should play the idle sound while moving to cover", () => {
    const soundManager: SoundManager = getManager(SoundManager);
    const { action, object } = setupAction("cover_idle_snd");

    jest.spyOn(soundManager, "play").mockImplementation(jest.fn(() => null));

    // Far from cover => moving branch; idle sound must still be attempted.
    jest.spyOn(action.coverPosition, "distance_to_sqr").mockImplementation(() => 100);
    action.execute();

    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "cover_idle_snd");
  });

  it("should play the idle sound when sitting in cover", () => {
    const soundManager: SoundManager = getManager(SoundManager);
    const { action, object } = setupAction("cover_idle_snd");

    jest.spyOn(soundManager, "play").mockImplementation(jest.fn(() => null));

    // Reached cover => reached branch; idle sound is played here too.
    jest.spyOn(action.coverPosition, "distance_to_sqr").mockImplementation(() => 0.1);
    action.execute();

    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "cover_idle_snd");
  });

  it("should not play any sound when sound_idle is not configured", () => {
    const soundManager: SoundManager = getManager(SoundManager);
    const { action } = setupAction(null);

    jest.spyOn(soundManager, "play").mockImplementation(jest.fn(() => null));

    jest.spyOn(action.coverPosition, "distance_to_sqr").mockImplementation(() => 100);
    action.execute();

    expect(soundManager.play).not.toHaveBeenCalled();
  });
});
