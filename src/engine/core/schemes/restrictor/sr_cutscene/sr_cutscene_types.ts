import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import type { LuaArray, StringNillable, TPath, TRate } from "@/engine/lib/types";

/**
 * State of effector set run with `level.add_effect` interface.
 */
export const enum EEffectorState {
  START = "start",
  RELEASE = "release",
  FINISH = "finish",
  IDLE = "idle",
}

/**
 * Enumeration of cutscene scene playback states.
 */
export const enum ESceneState {
  NONE = "",
  RUN = "run",
}

/**
 * State of cutscene scheme.
 */
export interface ISchemeCutsceneState extends IBaseSchemeState {
  ppEffector: StringNillable;
  cameraEffector: LuaArray<string>;
  fov: TRate;
  state: string;
  look: string;
  point: string;
  shouldEnableUiOnEnd: boolean;
  isGlobalCameraEffect: boolean;
  isOutdoor: boolean;
}

/**
 * Descriptor of camera effector properties.
 */
export interface ICameraEffectorSetDescriptorItem {
  anim: TPath;
  looped?: string | boolean;
  isGlobalCameraEffect: boolean;
  // Condition list.
  enabled?: string;
}

/**
 * Descriptor mapping each effector state to its ordered list of camera effector items.
 */
export type TCamEffectorSetDescriptor = Record<EEffectorState, LuaArray<ICameraEffectorSetDescriptorItem>>;
