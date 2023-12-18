import { jest } from "@jest/globals";

import { PhysicsShell, TName } from "@/engine/lib/types";
import { MockPhysicsJoint } from "@/fixtures/xray/mocks/objects/game/physics_joint.mock";

export class MockPhysicsShell {
  public static mock(): PhysicsShell {
    return new MockPhysicsShell() as unknown as PhysicsShell;
  }

  public get_joint_by_bone_name = jest.fn((name: TName) => new MockPhysicsJoint(name));

  public get_element_by_bone_name = jest.fn(() => null);
}
