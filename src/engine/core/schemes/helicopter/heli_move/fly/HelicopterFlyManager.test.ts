import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { CHelicopter } from "xray16";
import { GameObject, Vector } from "xray16/alias";
import { LuaArray, ZERO_VECTOR } from "xray16/lib";
import { MockGameObject, MockVector } from "xray16/mocks";

import { HelicopterFlyManager } from "@/engine/core/schemes/helicopter/heli_move/fly/HelicopterFlyManager";
import { resetRegistry } from "@/fixtures/engine";

function createManager(): { helicopter: CHelicopter; manager: HelicopterFlyManager; object: GameObject } {
  const object: GameObject = MockGameObject.mockHelicopter({ position: MockVector.create(0, 0, 0) });
  const helicopter: CHelicopter = object.get_helicopter();

  jest.spyOn(helicopter, "GetCurrVelocity").mockImplementation(() => 0);
  jest.spyOn(helicopter, "GetMaxVelocity").mockImplementation(() => 50);
  jest.spyOn(helicopter, "GetDistanceToDestPosition").mockImplementation(() => 100);

  return { helicopter, manager: new HelicopterFlyManager(object), object };
}

describe("HelicopterFlyManager", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly initialize", () => {
    const { manager, object } = createManager();

    expect(manager.object).toBe(object);
    expect(manager.pointByLook).toBe(ZERO_VECTOR);
    expect(manager.blockFlook).toBe(false);
    expect(manager.heliLAccFW).toBe(6);
    expect(manager.heliLAccBW).toBe(4);
    expect(manager.maxVelocity).toBe(0);
    expect(manager.destPoint).toBeNull();
  });

  it("should fly straight to the destination when already in the callback phase", () => {
    const { helicopter, manager } = createManager();
    const destination: Vector = MockVector.create(10, 0, 10);

    const result: boolean = manager.flyOnPointWithVector(destination, MockVector.create(0, 0, 1), 30, true, false);

    expect(result).toBe(false);
    expect(manager.destPoint).toBe(destination);
    expect(helicopter.SetDestPosition).toHaveBeenCalledWith(destination);
    expect(helicopter.SetSpeedInDestPoint).toHaveBeenCalledWith(helicopter.GetMaxVelocity());
  });

  it("should arrive with zero velocity when requested", () => {
    const { helicopter, manager } = createManager();

    manager.flyOnPointWithVector(MockVector.create(10, 0, 10), MockVector.create(0, 0, 1), 30, true, true);

    expect(helicopter.SetSpeedInDestPoint).toHaveBeenCalledWith(0);
  });

  it("should target the destination directly while braking distance is not reached", () => {
    const { manager } = createManager();
    const destination: Vector = MockVector.create(10, 0, 10);

    jest.spyOn(manager.object.get_helicopter(), "GetCurrVelocity").mockImplementation(() => 100);

    // 360 km/h equals the current 100 m/s velocity, so almost no braking distance is required.
    const result: boolean = manager.flyOnPointWithVector(destination, MockVector.create(0, 0, 1), 360, false, false);

    expect(result).toBe(false);
    expect(manager.destPoint).toBe(destination);
  });

  it("should compute an intermediate braking point once the path is long enough", () => {
    const { manager } = createManager();

    jest.spyOn(manager, "calculatePoint").mockImplementation(() => MockVector.create(5, 0, 5));

    const result: boolean = manager.flyOnPointWithVector(
      MockVector.create(10, 0, 10),
      MockVector.create(0, 0, 1),
      30,
      false,
      false
    );

    expect(result).toBe(true);
    expect(manager.calculatePoint).toHaveBeenCalledTimes(1);
    expect(manager.destPoint).not.toBeNull();
  });

  it("should keep the intermediate point unchanged when look is blocked", () => {
    const { manager } = createManager();

    manager.setBlockFlook(true);
    jest.spyOn(manager, "calculatePoint").mockImplementation(() => MockVector.create(5, 0, 5));

    manager.flyOnPointWithVector(MockVector.create(10, 0, 10), MockVector.create(0, 0, 1), 30, false, false);

    expect(manager.destPoint).toEqual(MockVector.create(5, 0, 5));
  });

  it("should interpolate an intermediate point on differing heights", () => {
    const { manager } = createManager();

    manager.pointArr.set(0, MockVector.create(0, 0, 0));
    manager.pointArr.set(1, MockVector.create(10, 10, 10));
    manager.pointArr.set(2, MockVector.create(1, 1, 1));

    const point: Vector = manager.calculatePoint();

    expect(point.y).toBe(5);
    expect(point.x).not.toBeNaN();
    expect(point.z).not.toBeNaN();
  });

  it("should interpolate an intermediate point on equal heights", () => {
    const { manager } = createManager();

    manager.pointArr.set(0, MockVector.create(0, 5, 0));
    manager.pointArr.set(1, MockVector.create(10, 5, 10));
    manager.pointArr.set(2, MockVector.create(1, 5, 1));

    const point: Vector = manager.calculatePoint();

    expect(point.y).toBe(5);
    expect(point.z).toBe(5);
  });

  it("should interpolate an intermediate point on equal heights and depths", () => {
    const { manager } = createManager();

    manager.pointArr.set(0, MockVector.create(0, 5, 7));
    manager.pointArr.set(1, MockVector.create(10, 5, 7));
    manager.pointArr.set(2, MockVector.create(1, 5, 7));

    const point: Vector = manager.calculatePoint();

    expect(point.y).toBe(5);
    expect(point.x).toBe(5);
  });

  it("should compute lagrange interpolation", () => {
    const { manager } = createManager();
    // Source iterates indexes 0..2, so sample tables have to be zero based.
    const samples: LuaArray<number> = new LuaTable();

    samples.set(0, 0);
    samples.set(1, 1);
    samples.set(2, 2);

    expect(manager.lagrange(1, samples, samples)).toBeCloseTo(1);
  });

  it("should clamp corrected velocity to the configured maximum", () => {
    const { helicopter, manager } = createManager();

    manager.maxVelocity = 36;
    manager.correctVelocity();

    expect(helicopter.SetMaxVelocity).toHaveBeenCalledWith(10);
  });

  it("should keep computed velocity below the configured maximum", () => {
    const { helicopter, manager } = createManager();

    manager.maxVelocity = 10_000;
    manager.correctVelocity();

    expect(helicopter.SetMaxVelocity).toHaveBeenCalledWith(Math.sqrt((2 * 6 * 100) / 3));
  });

  it("should look at the configured point only when look is blocked", () => {
    const { helicopter, manager } = createManager();
    const point: Vector = MockVector.create(3, 4, 5);

    manager.setLookPoint(point);
    manager.lookAtPosition();

    expect(helicopter.LookAtPoint).not.toHaveBeenCalled();

    manager.setBlockFlook(true);
    manager.lookAtPosition();

    expect(manager.pointByLook).toBe(point);
    expect(helicopter.LookAtPoint).toHaveBeenCalledWith(point, true);
  });
});
