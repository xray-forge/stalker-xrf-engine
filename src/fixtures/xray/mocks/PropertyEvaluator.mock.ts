import { XR_game_object } from "xray16";

/**
 * todo;
 */
export class MockPropertyEvaluator {
  public object!: XR_game_object;

  public setup(object: XR_game_object): void {
    this.object = object;
  }
}
