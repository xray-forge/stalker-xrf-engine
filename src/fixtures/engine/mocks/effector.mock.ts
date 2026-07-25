import { jest } from "@jest/globals";
import { color, noise } from "xray16";
import { Color, EffectorParams, Noise } from "xray16/alias";

/**
 * Mock of the engine `effector_params` class, which is not provided by `xray16` mocks.
 *
 * Defaults match the neutral post-process state described in `xray16` typings.
 * Todo: Replace with lib update.
 */
export class MockEffectorParams {
  public static mock(): EffectorParams {
    return new MockEffectorParams() as unknown as EffectorParams;
  }

  public readonly __name: string = "effector_params";

  public color_add: Color = new color(0, 0, 0);
  public color_base: Color = new color(0.5, 0.5, 0.5);
  public color_gray: Color = new color(0.5, 0.5, 0.5);
  public dual: EffectorParams["dual"] = { h: 0, v: 0 } as EffectorParams["dual"];
  public blur: number = 0;
  public gray: number = 0;
  public noise: Noise = new noise(0, 0, 0);

  public assign: EffectorParams["assign"] = jest.fn();
}
