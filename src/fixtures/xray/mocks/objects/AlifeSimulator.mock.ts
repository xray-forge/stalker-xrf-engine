import { jest } from "@jest/globals";
import { alife_simulator, cse_alife_object } from "xray16";

/**
 * todo;
 */
export class MockAlifeSimulator {
  public static registry: Record<number, cse_alife_object> = {};

  public static addToRegistry(object: cse_alife_object): void {
    MockAlifeSimulator.registry[object.id] = object;
  }

  public static removeFromRegistry(id: number): void {
    delete MockAlifeSimulator.registry[id];
  }

  public actor = jest.fn(() => MockAlifeSimulator.registry[0] || null);

  public object = jest.fn((id: number) => MockAlifeSimulator.registry[id] || null);

  public create_ammo = jest.fn(() => {});

  public release = jest.fn((object: cse_alife_object) => {
    MockAlifeSimulator.removeFromRegistry(object.id);
  });
}

/**
 * todo;
 */
export function mockAlifeSimulator(): alife_simulator {
  return new MockAlifeSimulator() as unknown as alife_simulator;
}
