import { level, XR_vector } from "xray16";

import { Optional } from "@/mod/lib/types";

export class PhantomManager {
  public static instance: Optional<PhantomManager> = null;

  public static getInstance(): PhantomManager {
    if (!this.instance) {
      this.instance = new this();
    }

    return this.instance;
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
