import { Optional } from "@/mod/lib/types";

export class AbstractSingletonManager {
  public static instance: Optional<AbstractSingletonManager> = null;

  public static getInstance<T extends AbstractSingletonManager = AbstractSingletonManager>() {
    if (!this.instance) {
      this.instance = new this();
    }

    return this.instance;
  }
}
