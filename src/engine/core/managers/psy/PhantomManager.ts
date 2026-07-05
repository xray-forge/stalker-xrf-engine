import { level } from "xray16";
import { Vector } from "xray16/alias";

import { AbstractManager } from "@/engine/core/managers/abstract";
import { TCount } from "@/engine/lib/types";

/**
 * Manager handling phantom spawn count tracking in the game world.
 */
export class PhantomManager extends AbstractManager {
  public phantomsCount: TCount = 0;

  /**
   * Increment the count of currently active phantoms.
   */
  public addPhantom(): void {
    this.phantomsCount = this.phantomsCount + 1;
  }

  /**
   * Decrement the count of currently active phantoms.
   */
  public removePhantom(): void {
    this.phantomsCount = this.phantomsCount - 1;
  }

  /**
   * Spawn a phantom at the provided position in the game world.
   *
   * @param position - Vector position to spawn the phantom at.
   */
  public spawnPhantom(position: Vector): void {
    level.spawn_phantom(position);
  }
}
