import { level } from "xray16";

import { AbstractManager } from "@/engine/core/managers/abstract";
import { TCount, Vector } from "@/engine/lib/types";

/**
 * Todo.
 */
export class PhantomManager extends AbstractManager {
  public phantomsCount: TCount = 0;

  /**
   * Todo.
   */
  public addPhantom(): void {
    this.phantomsCount = this.phantomsCount + 1;
  }

  /**
   * Todo.
   */
  public removePhantom(): void {
    this.phantomsCount = this.phantomsCount - 1;
  }

  /**
   * Todo.
   */
  public spawnPhantom(position: Vector): void {
    level.spawn_phantom(position);
  }
}
