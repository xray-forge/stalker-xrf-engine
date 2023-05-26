import { game_object } from "xray16";

/**
 * todo;
 */
export class MockPropertyEvaluator {
  public object!: game_object;

  public setup(object: game_object): void {
    this.object = object;
  }
}
