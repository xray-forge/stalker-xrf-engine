import { LuabindClass, object_binder, XR_game_object, XR_vector } from "xray16";

import { PhantomManager } from "@/mod/scripts/core/manager/PhantomManager";

/**
 * todo;
 */
@LuabindClass()
export class PhantomBinder extends object_binder {
  /**
   * todo;
   */
  public constructor(object: XR_game_object) {
    super(object);
    PhantomManager.getInstance().add_phantom();
  }

  /**
   * todo;
   */
  public override net_destroy(): void {
    PhantomManager.getInstance().remove_phantom();
  }

  /**
   * todo;
   */
  public spawn_phantom(position: XR_vector): void {
    PhantomManager.getInstance().spawn_phantom(position);
  }

  /**
   * todo;
   */
  public phantom_count(): number {
    return PhantomManager.getInstance().phantom_count;
  }
}
