import { level } from "xray16";

import { AbstractManager } from "@/engine/core/managers/base/AbstractManager";
import { TCount, Vector } from "@/engine/lib/types";

/**
 * todo;
 */
export class PhantomManager extends AbstractManager {
  public phantomsCount: TCount = 0;

  /**
   * todo;
   */
  public addPhantom(): void {
    this.phantomsCount = this.phantomsCount + 1;
  }

  /**
   * todo;
   */
  public removePhantom(): void {
    this.phantomsCount = this.phantomsCount - 1;
  }

  /**
   * todo;
   */
  public spawnPhantom(position: Vector): void {
    level.spawn_phantom(position);
  }
}
