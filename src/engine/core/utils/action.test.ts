import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import { registerActor } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { objectPunchActor } from "@/engine/core/utils/action";
import { animations } from "@/engine/lib/constants/animation";
import { EActiveItemSlot, GameObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { mockActorGameObject, MockGameObject } from "@/fixtures/xray";

describe("action utils", () => {
  beforeEach(() => {
    resetFunctionMock(level.add_cam_effector);
    resetRegistry();
  });

  it("objectPunchActor should correctly punch actor", () => {
    const ak74: GameObject = MockGameObject.mock({ sectionOverride: "wpn_ak74" });
    const actor: GameObject = mockActorGameObject({
      active_item: () => actor.object(ak74.section()),
      active_slot: <T extends number>() => EActiveItemSlot.PRIMARY as T,
      inventory: [[ak74.section(), ak74]],
    });
    const object: GameObject = MockGameObject.mock();

    registerActor(actor);

    jest.spyOn(actor.position(), "distance_to_sqr").mockImplementation(() => 4.1);
    jest.spyOn(ActorInputManager.getInstance(), "setInactiveInputTime").mockImplementation(() => {});

    // Too far.
    objectPunchActor(object);

    expect(level.add_cam_effector).not.toHaveBeenCalled();
    expect(ActorInputManager.getInstance().setInactiveInputTime).not.toHaveBeenCalled();

    jest
      .spyOn(actor.position(), "distance_to_sqr")
      .mockReset()
      .mockImplementation(() => 4);

    // Punch first time.
    objectPunchActor(object);

    expect(level.add_cam_effector).toHaveBeenCalledWith(animations.camera_effects_fusker, 999, false, "");
    expect(ActorInputManager.getInstance().setInactiveInputTime).toHaveBeenCalled();

    // Punch second time.
    objectPunchActor(object);

    expect(level.add_cam_effector).toHaveBeenCalledTimes(2);
    expect(ActorInputManager.getInstance().setInactiveInputTime).toHaveBeenCalledTimes(2);
  });
});
