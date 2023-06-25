import { jest } from "@jest/globals";

import { AlifeSimulator, Optional, ServerObject } from "@/engine/lib/types";

/**
 * todo;
 */
export class MockAlifeSimulator {
  public static simulator: Optional<MockAlifeSimulator> = null;
  public static registry: Record<number, ServerObject> = {};

  public static addToRegistry(object: ServerObject): void {
    MockAlifeSimulator.registry[object.id] = object;
  }

  public static removeFromRegistry(id: number): void {
    delete MockAlifeSimulator.registry[id];
  }

  public static getFromRegistry<T extends ServerObject = ServerObject>(id: number): Optional<T> {
    return (MockAlifeSimulator.registry[id] as T) || null;
  }

  public static getInstance(): MockAlifeSimulator {
    if (!MockAlifeSimulator.simulator) {
      MockAlifeSimulator.simulator = new MockAlifeSimulator();
    }

    return MockAlifeSimulator.simulator;
  }

  public actor = jest.fn(() => MockAlifeSimulator.registry[0] || null);

  public object = jest.fn((id: number) => MockAlifeSimulator.registry[id] || null);

  public create = jest.fn(() => {});

  public create_ammo = jest.fn(() => {});

  public level_name = jest.fn(() => "pripyat");

  public release = jest.fn((object: ServerObject) => {
    MockAlifeSimulator.removeFromRegistry(object.id);
  });
}

/**
 * todo;
 */
export function mockAlifeSimulator(): AlifeSimulator {
  return MockAlifeSimulator.getInstance() as unknown as AlifeSimulator;
}
