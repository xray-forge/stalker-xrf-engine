import { GameObject } from "xray16/alias";

import { ISchemeCutsceneState } from "@/engine/core/schemes/restrictor/sr_cutscene/sr_cutscene_types";
import { Nillable } from "@/engine/lib/types";

export const cutsceneConfig = {
  objectCutscene: null as Nillable<GameObject>,
  cutsceneState: null as Nillable<ISchemeCutsceneState>,
};
