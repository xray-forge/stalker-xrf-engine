import { object_binder, XR_game_object, XR_object_binder, XR_vector } from "xray16";

import { PhantomManager } from "@/mod/scripts/core/PhantomManager";

export interface IPhantomBinder extends XR_object_binder {
  spawn_phantom(position: XR_vector): void;
  phantom_count(): number;
}

export const PhantomBinder: IPhantomBinder = declare_xr_class("PhantomBinder", object_binder, {
  __init(object: XR_game_object): void {
    xr_class_super(object);

    PhantomManager.getInstance<PhantomManager>().add_phantom();
  },
  net_destroy(): void {
    PhantomManager.getInstance<PhantomManager>().remove_phantom();
  },
  spawn_phantom(position: XR_vector): void {
    PhantomManager.getInstance<PhantomManager>().spawn_phantom(position);
  },
  phantom_count(): number {
    return PhantomManager.getInstance<PhantomManager>().phantom_count;
  }
} as IPhantomBinder);
