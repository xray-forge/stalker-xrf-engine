import { describe, expect, it, jest } from "@jest/globals";

import { CutsceneManager } from "@/engine/core/schemes/restrictor/sr_cutscene/CutsceneManager";
import { ESceneState, ISchemeCutsceneState } from "@/engine/core/schemes/restrictor/sr_cutscene/sr_cutscene_types";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { mockGameObject } from "@/fixtures/xray";

describe("CutsceneManager", () => {
  it("should correctly initialize", () => {
    const object: GameObject = mockGameObject();
    const state: ISchemeCutsceneState = mockSchemeState(EScheme.SR_CUTSCENE);
    const manager: CutsceneManager = new CutsceneManager(object, state);

    expect(manager.object).toBe(object);
    expect(manager.state).toBe(state);
    expect(manager.isUiDisabled).toBe(false);
    expect(manager.isPostprocess).toBe(false);
    expect(manager.motionId).toBe(1);
    expect(manager.motion).toBeNull();
    expect(manager.sceneState).toBe(ESceneState.NONE);
  });

  it("should correctly handle activation", () => {
    const object: GameObject = mockGameObject();
    const state: ISchemeCutsceneState = mockSchemeState(EScheme.SR_CUTSCENE);
    const manager: CutsceneManager = new CutsceneManager(object, state);

    jest.spyOn(manager, "onZoneEnter").mockImplementation(jest.fn());

    manager.activate();

    expect(manager.sceneState).toBe(ESceneState.NONE);
    expect(manager.state.signals).toEqualLuaTables({});
    expect(manager.motion).toBeNull();
    expect(manager.onZoneEnter).toHaveBeenCalled();
  });

  it.todo("should correctly handle updates");

  it.todo("should correctly handle selection of next motion");

  it.todo("should correctly handle zone entering");

  it.todo("should correctly handle cutscene end event");
});
