import { game_object, LuabindClass, object_binder, vector } from "xray16";

import { PhantomManager } from "@/engine/core/managers/world/PhantomManager";

/**
 * todo;
 */
@LuabindClass()
export class PhantomBinder extends object_binder {
  public constructor(object: game_object) {
    super(object);
    PhantomManager.getInstance().add_phantom();
  }

  /**
   * todo: Description.
   */
  public override net_destroy(): void {
    PhantomManager.getInstance().remove_phantom();
  }

  /**
   * todo: Description.
   */
  public spawn_phantom(position: vector): void {
    PhantomManager.getInstance().spawn_phantom(position);
  }

  /**
   * todo: Description.
   */
  public phantom_count(): number {
    return PhantomManager.getInstance().phantom_count;
  }
}
