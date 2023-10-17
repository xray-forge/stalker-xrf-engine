import { PhysicsShell, TName } from "@/engine/lib/types";
import { MockPhysicsJoint } from "@/fixtures/xray/mocks/objects/client/physics_joint.mock";

export class MockPhysicsShell {
  public static mock(): PhysicsShell {
    return new MockPhysicsShell() as unknown as PhysicsShell;
  }

  public get_joint_by_bone_name(name: TName): MockPhysicsJoint {
    return new MockPhysicsJoint(name);
  }
}
