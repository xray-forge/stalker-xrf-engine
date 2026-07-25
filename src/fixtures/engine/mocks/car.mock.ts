import { jest } from "@jest/globals";
import { Car, Vector } from "xray16/alias";
import { MockVector } from "xray16/mocks";

/**
 * Configuration of car mock.
 */
export interface IMockCarConfig {
  canHit?: boolean;
  hasWeapon?: boolean;
  health?: number;
  isObjectVisible?: boolean;
}

/**
 * Mock of the engine car object, used by minigun and vehicle related schemes.
 *
 * Todo: Replace with lib update.
 */
export function mockCar({
  canHit = true,
  hasWeapon = true,
  health = 1,
  isObjectVisible = true,
}: IMockCarConfig = {}): Car {
  return {
    Action: jest.fn(),
    CanHit: jest.fn(() => canHit),
    CurrentVel: jest.fn(() => MockVector.create() as unknown as Vector),
    GetfHealth: jest.fn(() => health),
    HasWeapon: jest.fn(() => hasWeapon),
    IsObjectVisible: jest.fn(() => isObjectVisible),
    SetParam: jest.fn(),
  } as unknown as Car;
}
