import { LuaArray, TMoveType, TName, TRate, TStringId, Vector } from "@/engine/lib/types";

/**
 * todo;
 * Note: Used by engine so types are not camelcase.
 */
export interface ISmartCoverDescriptor {
  need_weapon?: boolean;
  loopholes: LuaArray<ISmartCoverLoopholeDescriptor>;
  transitions: Array<{
    vertex0: TStringId;
    vertex1: TStringId;
    weight: TRate;
    // todo: Lua array.
    actions: Array<{
      precondition_functor?: string;
      precondition_params?: string;
      animation?: string;
      position?: Vector;
      body_state?: TMoveType;
      movement_type?: TMoveType;
      actions: Array<{
        animation: TName;
        position: Vector;
        body_state: TMoveType;
        movement_type: TMoveType;
      }>;
    }>;
  }>;
}

/**
 * todo;
 * Note: Used by engine so types are not camelcase.
 */
export interface ISmartCoverLoopholeDescriptor {
  id: TStringId;
  fov_position: Vector;
  fov_direction: Vector;
  danger_fov_direction?: Vector;
  enter_direction: Vector;
  enterable?: boolean;
  exitable?: boolean;
  usable: boolean;
  fov: number;
  danger_fov?: number;
  range: number;
  actions: Record<string, { animations: { idle?: Array<string>; shoot?: Array<string> } }>;
  transitions: Array<{
    action_from: string;
    action_to: string;
    weight: number;
    animations: Array<string>;
  }>;
}
