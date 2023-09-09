import { jest } from "@jest/globals";
import { CALifeMonsterBrain } from "xray16";

/**
 * Mocking monster alife brain.
 */
export class MockCAlifeMonsterBrain {
  public static mock(): CALifeMonsterBrain {
    return new MockCAlifeMonsterBrain() as unknown as CALifeMonsterBrain;
  }

  public can_choose_alife_tasks = jest.fn();
}
