import { jest } from "@jest/globals";
import { CHelicopter } from "xray16";

import { TRate } from "@/engine/lib/types";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

export class MockCHelicopter {
  public static mock(health: TRate = 1): CHelicopter {
    const helicopter: MockCHelicopter = new MockCHelicopter();

    helicopter.health = health;

    return helicopter as unknown as CHelicopter;
  }

  public health: TRate = 1;
  public velocity: TRate = 10;

  public velocityVector: MockVector = MockVector.create(0.5, 0.5, 0.5);

  public isVisible = jest.fn(() => false);

  public GetfHealth = jest.fn(() => this.health);

  public SetfHealth = jest.fn((health: TRate) => (this.health = health));

  public TurnEngineSound = jest.fn();

  public SetEnemy = jest.fn();

  public SetLinearAcc = jest.fn();

  public SetMaxVelocity = jest.fn();

  public SetSpeedInDestPoint = jest.fn();

  public UseFireTrail = jest.fn();

  public GoPatrolByRoundPath = jest.fn();

  public ClearEnemy = jest.fn();

  public LookAtPoint = jest.fn();

  public GetMaxVelocity = jest.fn(() => 7);

  public SetDestPosition = jest.fn();

  public GetDistanceToDestPosition = jest.fn(() => 30);

  public GetCurrVelocity = jest.fn(() => this.velocity);

  public GetCurrVelocityVec = jest.fn(() => this.velocityVector);
}
