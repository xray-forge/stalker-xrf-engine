import { jest } from "@jest/globals";
import { CHelicopter } from "xray16";

import { TRate } from "@/engine/lib/types";

export class MockCHelicopter {
  public static mock(health: TRate = 1): CHelicopter {
    const helicopter: MockCHelicopter = new MockCHelicopter();

    helicopter.health = health;

    return helicopter as unknown as CHelicopter;
  }

  public health: TRate = 1;

  public GetfHealth = jest.fn(() => this.health);
  public SetfHealth = jest.fn((health: TRate) => (this.health = health));
}
