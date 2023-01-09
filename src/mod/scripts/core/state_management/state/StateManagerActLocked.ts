import { action_base, XR_action_base } from "xray16";

import { StateManager } from "@/mod/scripts/core/state_management/StateManager";

export interface IStateManagerActLocked extends XR_action_base {
  st: StateManager;
}

export const StateManagerActLocked: IStateManagerActLocked = declare_xr_class("StateManagerActLocked", action_base, {
  __init(name: string, st: StateManager): void {
    xr_class_super(null, name);
    this.st = st;
  },
  initialize(): void {
    action_base.initialize(this);
  },
  execute(): void {
    action_base.execute(this);
  },
  finalize(): void {
    action_base.finalize(this);
  }
} as IStateManagerActLocked);
