import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import { getManager, registerActor } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { objectPunchActor } from "@/engine/core/utils/action";
import { animations } from "@/engine/lib/constants/animation";
import { GameObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject } from "@/fixtures/xray";

describe("objectPunchActor util", () => {
  beforeEach(() => {
    resetFunctionMock(level.add_cam_effector);
    resetRegistry();
  });

  it("objectPunchActor should correctly punch actor", () => {
    const ak74: GameObject = MockGameObject.mock({ section: "wpn_ak74" });
    const actor: GameObject = MockGameObject.mockActor({
      inventory: [[ak74.section(), ak74]],
    });
    const object: GameObject = MockGameObject.mock();

    registerActor(actor);

    jest.spyOn(actor.position(), "distance_to_sqr").mockImplementation(() => 4.1);
    jest.spyOn(getManager(ActorInputManager), "setInactiveInputTime").mockImplementation(() => {});

    // Too far.
    objectPunchActor(object);

    expect(level.add_cam_effector).not.toHaveBeenCalled();
    expect(getManager(ActorInputManager).setInactiveInputTime).not.toHaveBeenCalled();

    jest
      .spyOn(actor.position(), "distance_to_sqr")
      .mockReset()
      .mockImplementation(() => 4);

    // Punch first time.
    objectPunchActor(object);

    expect(level.add_cam_effector).toHaveBeenCalledWith(animations.camera_effects_fusker, 999, false, "");
    expect(getManager(ActorInputManager).setInactiveInputTime).toHaveBeenCalled();

    // Punch second time.
    objectPunchActor(object);

    expect(level.add_cam_effector).toHaveBeenCalledTimes(2);
    expect(getManager(ActorInputManager).setInactiveInputTime).toHaveBeenCalledTimes(2);
  });
});
