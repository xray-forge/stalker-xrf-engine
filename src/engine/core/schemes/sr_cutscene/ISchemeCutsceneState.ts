import type { IBaseSchemeState } from "@/engine/core/schemes/base";
import type { CutsceneManager } from "@/engine/core/schemes/sr_cutscene/CutsceneManager";
import type { LuaArray, StringOptional, TRate } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeCutsceneState extends IBaseSchemeState {
  cutscene_action: CutsceneManager; // todo: Rename.
  state: string;
  look: string;
  point: string;
  global_cameffect: boolean;
  pp_effector: StringOptional;
  cam_effector: LuaArray<string>;
  fov: TRate;
  enable_ui_on_end: boolean;
  outdoor: boolean;
}
