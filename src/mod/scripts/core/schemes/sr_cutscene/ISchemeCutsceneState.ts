import { LuaArray, StringOptional, TRate } from "@/mod/lib/types";
import { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";
import { CutsceneManager } from "@/mod/scripts/core/schemes/sr_cutscene/CutsceneManager";

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
