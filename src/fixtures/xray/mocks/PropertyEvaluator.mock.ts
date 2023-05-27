import { ClientObject } from "@/engine/lib/types";

/**
 * todo;
 */
export class MockPropertyEvaluator {
  public object!: ClientObject;

  public setup(object: ClientObject): void {
    this.object = object;
  }
}
