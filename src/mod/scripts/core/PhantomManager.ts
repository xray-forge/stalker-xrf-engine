import { level, XR_vector } from "xray16";

import { AbstractSingletonManager } from "@/mod/scripts/core/utils/AbstractSingletonManager";

export class PhantomManager extends AbstractSingletonManager {
  public phantom_count: number = 0;

  public add_phantom(): void {
    this.phantom_count = this.phantom_count + 1;
  }

  public remove_phantom(): void {
    this.phantom_count = this.phantom_count - 1;
  }

  public spawn_phantom(position: XR_vector): void {
    level.spawn_phantom(position);
  }
}
