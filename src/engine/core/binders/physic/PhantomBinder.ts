import { LuabindClass, object_binder } from "xray16";

import { getManager } from "@/engine/core/database";
import { PhantomManager } from "@/engine/core/managers/psy/PhantomManager";
import { GameObject, TCount, Vector } from "@/engine/lib/types";

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

  /**
   * Spawn new phantom instance somewhere nearby.
   *
   * @param position - where to spawn next phantom
   */
  public spawnPhantom(position: Vector): void {
    getManager(PhantomManager).spawnPhantom(position);
  }

  /**
   * @returns count of currently spawned phantoms
   */
  public getPhantomsCount(): TCount {
    return getManager(PhantomManager).phantomsCount;
  }
}
