import { LuabindClass, object_binder } from "xray16";

import { PhantomManager } from "@/engine/core/managers/psy/PhantomManager";
import { GameObject, TCount, Vector } from "@/engine/lib/types";

/**
 * Binder for phantom game objects created by psy antenna.
 */
@LuabindClass()
export class PhantomBinder extends object_binder {
  public constructor(object: GameObject) {
    super(object);
    PhantomManager.getInstance().addPhantom();
  }

  public override net_destroy(): void {
    PhantomManager.getInstance().removePhantom();
  }

  /**
   * Spawn new phantom instance somewhere nearby.
   *
   * @param position - where to spawn next phantom
   */
  public spawnPhantom(position: Vector): void {
    PhantomManager.getInstance().spawnPhantom(position);
  }

  /**
   * @returns count of currently spawned phantoms
   */
  public getPhantomsCount(): TCount {
    return PhantomManager.getInstance().phantomsCount;
  }
}
