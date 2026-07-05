import { GameObject } from "xray16/alias";
import { Nillable } from "xray16/lib";

import { ISchemeCutsceneState } from "@/engine/core/schemes/restrictor/sr_cutscene/sr_cutscene_types";

export const cutsceneConfig = {
  objectCutscene: null as Nillable<GameObject>,
  cutsceneState: null as Nillable<ISchemeCutsceneState>,
};
