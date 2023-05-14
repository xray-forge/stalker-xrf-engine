import { jest } from "@jest/globals";
import { XR_game_object } from "xray16";

/**
 * todo;
 */
export class MockObjectBinder {
  public constructor(public object: XR_game_object) {}

  public load(): void {}

  public net_Relcase(): void {}

  public net_destroy(): void {}

  public net_export(): void {}

  public net_import(): void {}

  public net_save_relevant(): boolean {
    return true;
  }

  public net_spawn(): boolean {
    return true;
  }

  public reinit(): void {}

  public reload(): void {}

  public save(): void {}

  public update(): void {}
}
