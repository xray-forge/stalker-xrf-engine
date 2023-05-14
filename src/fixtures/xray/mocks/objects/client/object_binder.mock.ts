import { jest } from "@jest/globals";
import { XR_game_object } from "xray16";

/**
 * todo;
 */
export class MockObjectBinder {
  public constructor(public object: XR_game_object) {}

  public load = jest.fn();

  public net_Relcase = jest.fn();

  public net_destroy = jest.fn();

  public net_export = jest.fn();

  public net_import = jest.fn();

  public net_save_relevant = jest.fn(() => true);

  public net_spawn = jest.fn(() => true);

  public reinit = jest.fn();

  public reload = jest.fn();

  public save = jest.fn();

  public update = jest.fn();
}
