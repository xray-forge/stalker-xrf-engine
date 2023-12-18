import { LuabindClass, object_binder } from "xray16";

import { getManager } from "@/engine/core/database";
import { PhantomManager } from "@/engine/core/managers/psy/PhantomManager";
import { GameObject } from "@/engine/lib/types";

/**
 * Binder for phantom game objects created by psy antenna.
 */
@LuabindClass()
export class PhantomBinder extends object_binder {
  public constructor(object: GameObject) {
    super(object);
    getManager(PhantomManager).addPhantom();
  }

  public override net_destroy(): void {
    getManager(PhantomManager).removePhantom();
  }
}
