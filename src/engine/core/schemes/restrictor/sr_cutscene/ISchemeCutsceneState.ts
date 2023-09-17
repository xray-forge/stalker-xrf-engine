import type { IBaseSchemeState } from "@/engine/core/database/types";
import type { LuaArray, StringOptional, TRate } from "@/engine/lib/types";

/**
 * todo;
 */
export enum EEffectorState {
  START = "start",
  RELEASE = "release",
  FINISH = "finish",
  IDLE = "idle",
}

/**
 * todo;
 */
export enum ESceneState {
  NONE = "",
  RUN = "run",
}

/**
 * State of cutscene scheme.
 */
export interface ISchemeCutsceneState extends IBaseSchemeState {
  ppEffector: StringOptional;
  cameraEffector: LuaArray<string>;
  fov: TRate;
  state: string;
  look: string;
  point: string;
  shouldEnableUiOnEnd: boolean;
  isGlobalCameraEffect: boolean;
  isOutdoor: boolean;
}
