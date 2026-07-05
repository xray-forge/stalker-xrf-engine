import { PhysicsJoint } from "xray16/alias";
import { TName, TRate } from "xray16/lib";

export class MockPhysicsJoint {
  public static mock(name: TName): PhysicsJoint {
    return new MockPhysicsJoint(name) as unknown as PhysicsJoint;
  }

  public name: TName;

  public constructor(name: TName) {
    this.name = name;
  }

  public get_limits(min: TRate, max: TRate): LuaMultiReturn<[TRate, TRate]> {
    return $multi(min, max);
  }

  public get_axis_angle(angle: TRate): TRate {
    return angle;
  }

  public set_max_force_and_velocity(): void {}
}
