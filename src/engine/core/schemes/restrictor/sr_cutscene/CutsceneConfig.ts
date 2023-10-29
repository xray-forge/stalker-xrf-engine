import { ISchemeCutsceneState } from "@/engine/core/schemes/restrictor/sr_cutscene/sr_cutscene_types";
import { GameObject, Optional } from "@/engine/lib/types";

export const cutsceneConfig = {
  objectCutscene: null as Optional<GameObject>,
  cutsceneState: null as Optional<ISchemeCutsceneState>,
};
