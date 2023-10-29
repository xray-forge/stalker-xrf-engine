import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { ISchemeCutsceneState } from "@/engine/core/schemes/restrictor/sr_cutscene";
import { cutsceneConfig } from "@/engine/core/schemes/restrictor/sr_cutscene/CutsceneConfig";
import { emitCutsceneEndedEvent } from "@/engine/core/schemes/restrictor/sr_cutscene/utils/cutscene_utils";
import { emitSchemeEvent } from "@/engine/core/utils/scheme";
import { EScheme, ESchemeEvent, GameObject } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { mockGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/scheme/scheme_event", () => ({
  emitSchemeEvent: jest.fn(),
}));

describe("cutscene_utils module", () => {
  beforeEach(() => {
    cutsceneConfig.objectCutscene = null;
    cutsceneConfig.cutsceneState = null;
  });

  it("emitCutsceneEndedEvent should correctly emit scheme event", () => {
    const state: ISchemeCutsceneState = mockSchemeState(EScheme.SR_CUTSCENE);
    const object: GameObject = mockGameObject();

    cutsceneConfig.objectCutscene = object;
    cutsceneConfig.cutsceneState = state;

    emitCutsceneEndedEvent();

    expect(emitSchemeEvent).toHaveBeenCalledWith(object, state, ESchemeEvent.CUTSCENE);
  });
});
