import { jest } from "@jest/globals";
import { XR_alife_simulator, XR_cse_alife_object } from "xray16";

/**
 * todo;
 */
export class MockAlifeSimulator {
  public static registry: Record<number, XR_cse_alife_object> = {};

  public static addToRegistry(object: XR_cse_alife_object): void {
    MockAlifeSimulator.registry[object.id] = object;
  }

  public static removeFromRegistry(id: number): void {
    delete MockAlifeSimulator.registry[id];
  }

  public actor = jest.fn(() => MockAlifeSimulator.registry[0] || null);

  public object = jest.fn((id: number) => MockAlifeSimulator.registry[id] || null);

  public create_ammo = jest.fn(() => {});

  public release = jest.fn((object: XR_cse_alife_object) => {
    MockAlifeSimulator.removeFromRegistry(object.id);
  });
}

/**
 * todo;
 */
export function mockAlifeSimulator(): XR_alife_simulator {
  return new MockAlifeSimulator() as unknown as XR_alife_simulator;
}
