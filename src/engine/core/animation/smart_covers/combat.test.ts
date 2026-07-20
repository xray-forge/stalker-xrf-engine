import { describe, expect, it } from "@jest/globals";

import { getSmartCoverCombat } from "@/engine/core/animation/smart_covers/combat";

describe("getSmartCoverCombat", () => {
  it("uses the right-side loophole descriptor for crouch-front-right", () => {
    const crouchFrontRight = getSmartCoverCombat().loopholes.get(3)!;

    expect(crouchFrontRight.id).toBe("crouch_front_right");
    expect(crouchFrontRight.danger_fov_direction).toEqual(expect.objectContaining({ z: 1 }));
    expect(crouchFrontRight.actions.idle.animations.idle).toEqual(["loophole_crouch_front_right_idle_0"]);
  });
});
