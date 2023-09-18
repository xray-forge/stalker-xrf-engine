import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import { registerActor, registry } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { objectPunchActor } from "@/engine/core/utils/object/object_action";
import { animations } from "@/engine/lib/constants/animation";
import { ClientObject, EActiveItemSlot } from "@/engine/lib/types";
import { resetFunctionMock } from "@/fixtures/jest";
import { mockActorClientGameObject, mockClientGameObject } from "@/fixtures/xray";

describe("object_action utils", () => {
  beforeEach(() => {
    resetFunctionMock(level.add_cam_effector);
    registry.managers = new LuaTable();
  });

  it("'objectPunchActor' should correctly punch actor and force weapon drop based", () => {
    const ak74: ClientObject = mockClientGameObject({ sectionOverride: "wpn_ak74" });
    const actor: ClientObject = mockActorClientGameObject({
      active_item: () => actor.object(ak74.section()),
      active_slot: <T extends number>() => EActiveItemSlot.PRIMARY as T,
      inventory: [[ak74.section(), ak74]],
    });
    const object: ClientObject = mockClientGameObject();

    registerActor(actor);

    jest.spyOn(actor.position(), "distance_to_sqr").mockImplementation(() => 4.1);
    jest.spyOn(ActorInputManager.getInstance(), "setInactiveInputTime").mockImplementation(() => {});

    objectPunchActor(object);

    expect(level.add_cam_effector).not.toHaveBeenCalled();
    expect(ActorInputManager.getInstance().setInactiveInputTime).not.toHaveBeenCalled();
    expect(actor.drop_item).not.toHaveBeenCalled();
    expect(actor.object(ak74.section())).toBe(ak74);

    jest
      .spyOn(actor.position(), "distance_to_sqr")
      .mockReset()
      .mockImplementation(() => 4);

    objectPunchActor(object);

    expect(level.add_cam_effector).toHaveBeenCalledWith(animations.camera_effects_fusker, 999, false, "");
    expect(ActorInputManager.getInstance().setInactiveInputTime).toHaveBeenCalled();
    expect(actor.drop_item).toHaveBeenCalled();
    expect(actor.object(ak74.section())).toBeNull();

    objectPunchActor(object);

    expect(level.add_cam_effector).toHaveBeenCalledTimes(2);
    expect(ActorInputManager.getInstance().setInactiveInputTime).toHaveBeenCalledTimes(2);
    expect(actor.drop_item).toHaveBeenCalledTimes(1);
    expect(actor.object(ak74.section())).toBeNull();
  });

  it("'objectPunchActor' should not drop items when active slot is not primary or secondary", () => {
    const actor: ClientObject = mockActorClientGameObject({
      active_item: () => mockClientGameObject(),
      inventory: [["wpn_ak74", mockClientGameObject({ sectionOverride: "wpn_ak74" })]],
    });
    const object: ClientObject = mockClientGameObject();

    registerActor(actor);

    jest.spyOn(actor.position(), "distance_to_sqr").mockImplementation(() => 4);
    jest.spyOn(actor, "active_slot").mockImplementation(() => EActiveItemSlot.NONE);

    objectPunchActor(object);

    expect(actor.drop_item).not.toHaveBeenCalled();

    jest.spyOn(actor, "active_slot").mockImplementation(() => EActiveItemSlot.KNIFE);

    objectPunchActor(object);

    expect(actor.drop_item).not.toHaveBeenCalled();

    jest.spyOn(actor, "active_slot").mockImplementation(() => EActiveItemSlot.SECONDARY);

    objectPunchActor(object);

    expect(actor.drop_item).toHaveBeenCalled();

    jest.spyOn(actor, "active_slot").mockImplementation(() => EActiveItemSlot.PRIMARY);

    objectPunchActor(object);

    expect(actor.drop_item).toHaveBeenCalledTimes(2);
  });
});
