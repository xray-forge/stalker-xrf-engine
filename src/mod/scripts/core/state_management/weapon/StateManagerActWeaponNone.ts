import { action_base, object, XR_action_base } from "xray16";

import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerActWeaponNone extends XR_action_base {
  st: StateManager;
}

export const StateManagerActWeaponNone = declare_xr_class("StateManagerActWeaponNone", action_base, {
  __init(name: string, st: StateManager): void {
    xr_class_super(null, name);
    this.st = st;
  },
  initialize(): void {
    action_base.initialize(this);
    this.object.set_item(object.idle, null);
  },
  execute(): void {
    action_base.execute(this);
  },
  finalize(): void {
    action_base.finalize(this);
  }
} as IStateManagerActWeaponNone);
