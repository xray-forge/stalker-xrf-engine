import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { ISchemeCutsceneState } from "@/engine/core/schemes/restrictor/sr_cutscene";
import { cutsceneConfig } from "@/engine/core/schemes/restrictor/sr_cutscene/CutsceneConfig";
import { emitCutsceneEndedEvent } from "@/engine/core/schemes/restrictor/sr_cutscene/utils/cutscene_utils";
import { emitSchemeEvent } from "@/engine/core/schemes/runtime";
import { EScheme, ESchemeEvent } from "@/engine/core/schemes/types";
import { mockSchemeState } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime/scheme_event", () => ({
  emitSchemeEvent: jest.fn(),
}));

describe("cutscene_utils module", () => {
  beforeEach(() => {
    cutsceneConfig.objectCutscene = null;
    cutsceneConfig.cutsceneState = null;
  });

  it("emitCutsceneEndedEvent should correctly emit scheme event", () => {
    const state: ISchemeCutsceneState = mockSchemeState(EScheme.SR_CUTSCENE);

    cutsceneConfig.objectCutscene = MockGameObject.mock();
    cutsceneConfig.cutsceneState = state;

    emitCutsceneEndedEvent();

    expect(emitSchemeEvent).toHaveBeenCalledWith(state, ESchemeEvent.CUTSCENE);
  });
});
