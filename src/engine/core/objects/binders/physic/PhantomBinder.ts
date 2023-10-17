import { LuabindClass, object_binder } from "xray16";

import { PhantomManager } from "@/engine/core/managers/psy/PhantomManager";
import { GameObject, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
@LuabindClass()
export class PhantomBinder extends object_binder {
  public constructor(object: GameObject) {
    super(object);
    PhantomManager.getInstance().addPhantom();
  }

  /**
   * todo: Description.
   */
  public override net_destroy(): void {
    PhantomManager.getInstance().removePhantom();
  }

  /**
   * todo: Description.
   */
  public spawn_phantom(position: Vector): void {
    PhantomManager.getInstance().spawnPhantom(position);
  }

  /**
   * todo: Description.
   */
  public phantom_count(): number {
    return PhantomManager.getInstance().phantomsCount;
  }
}
