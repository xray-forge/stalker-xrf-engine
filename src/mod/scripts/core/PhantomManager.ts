import { level, XR_vector } from "xray16";

import { managersRegistry } from "@/mod/scripts/core/db/ManagersRegistry";

export class PhantomManager {
  public static getInstance(): PhantomManager {
    if (!managersRegistry.has(this)) {
      managersRegistry.set(this, new this());
    }

    return managersRegistry.get(this) as PhantomManager;
  }

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
