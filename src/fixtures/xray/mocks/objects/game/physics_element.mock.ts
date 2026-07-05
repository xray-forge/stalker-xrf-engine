import { jest } from "@jest/globals";
import { PhysicsElement } from "xray16/alias";

/**
 * Physic element implementation mock.
 */
export class MockPhysicsElement {
  public static mock(): PhysicsElement {
    return new MockPhysicsElement() as unknown as PhysicsElement;
  }

  public is_fixed = jest.fn(() => false);

  public fix = jest.fn(() => {});
}
