import { ISchemeCutsceneState } from "@/engine/core/schemes/restrictor/sr_cutscene";
import { cutsceneConfig } from "@/engine/core/schemes/restrictor/sr_cutscene/CutsceneConfig";
import { emitSchemeEvent } from "@/engine/core/schemes/runtime";
import { ESchemeEvent } from "@/engine/core/schemes/types";

/**
 * Handle ending of cutscene.
 */
export function emitCutsceneEndedEvent(): void {
  emitSchemeEvent(cutsceneConfig.cutsceneState as ISchemeCutsceneState, ESchemeEvent.CUTSCENE);
}
