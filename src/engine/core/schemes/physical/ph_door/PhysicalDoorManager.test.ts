import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { physics_joint } from "xray16";
import { GameObject, PhysicObject, PhysicsElement, PhysicsJoint, PhysicsShell } from "xray16/alias";
import { TIndex, ZERO_VECTOR } from "xray16/lib";
import { $fromObject } from "xray16/macros";
import { MockGameObject, MockPhysicObject, MockPhysicsElement, MockPhysicsJoint, MockPhysicsShell } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { getManager } from "@/engine/core/database";
import { IBoneStateDescriptor, parseConditionsList } from "@/engine/core/ini";
import { SoundManager } from "@/engine/core/managers/sounds";
import { ISchemePhysicalDoorState } from "@/engine/core/schemes/physical/ph_door/ph_door_types";
import { PhysicalDoorManager } from "@/engine/core/schemes/physical/ph_door/PhysicalDoorManager";
import { switchObjectSchemeToSection, trySwitchToAnotherSection } from "@/engine/core/schemes/runtime";
import { EScheme } from "@/engine/core/schemes/types";
import { mockBaseSchemeLogic, mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime/scheme_switch", () => ({
  trySwitchToAnotherSection: jest.fn(),
  switchObjectSchemeToSection: jest.fn(),
}));

/**
 * Attach a physics shell with a `door` joint and element to the object so door manipulation can be verified.
 */
function attachDoorPhysics(
  object: GameObject,
  { isFixed = false }: { isFixed?: boolean } = {}
): { shell: PhysicsShell; element: PhysicsElement; physicObject: PhysicObject } {
  const shell: PhysicsShell = MockPhysicsShell.mock();
  const element: PhysicsElement = MockPhysicsElement.mock();
  const physicObject: PhysicObject = MockPhysicObject.mock();

  jest.spyOn(element, "is_fixed").mockImplementation(() => isFixed);
  jest.spyOn(shell, "get_element_by_bone_name").mockImplementation(() => element);
  jest.spyOn(object, "get_physics_shell").mockImplementation(() => shell);
  jest.spyOn(object, "get_physics_object").mockImplementation(() => physicObject);

  return { element, physicObject, shell };
}

/**
 * Create a `door` joint with a spied force setter so applied force and velocity can be asserted.
 */
function mockDoorJoint(): PhysicsJoint {
  const joint: PhysicsJoint = MockPhysicsJoint.mock("door");

  jest.spyOn(joint, "set_max_force_and_velocity");

  return joint;
}

describe("PhysicalDoorManager", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(trySwitchToAnotherSection);
    resetFunctionMock(switchObjectSchemeToSection);
  });

  it("should correctly activate without shell object", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {});
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);

    manager.activate();

    expect(object.get_physics_shell).toHaveBeenCalledTimes(1);
    expect(manager.isInitialized).toBe(false);
  });

  it("should correctly activate with shell object", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {
      showTips: true,
      scriptUsedMoreThanOnce: false,
      closed: true,
    });
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);

    jest.spyOn(object, "get_physics_shell").mockImplementation(() => MockPhysicsShell.mock());
    jest.spyOn(manager, "closeDoor").mockImplementation(jest.fn());

    manager.activate();

    expect(object.get_physics_shell).toHaveBeenCalledTimes(1);
    expect(manager.isInitialized).toBe(true);
    expect(manager.joint).toBeInstanceOf(physics_joint);
    expect(manager.lowLimits).toBe(0);
    expect(manager.hiLimits).toBe(0);
    expect(manager.block).toBe(false);
    expect(manager.soundlessBlock).toBe(false);
    expect(manager.showTips).toBe(true);
    expect(object.set_nonscript_usable).toHaveBeenCalledWith(false);
    expect(manager.closeDoor).toHaveBeenCalledWith(true);
  });

  it("should correctly activate and force open", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {
      showTips: true,
      scriptUsedMoreThanOnce: false,
      closed: false,
    });
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);

    jest.spyOn(object, "get_physics_shell").mockImplementation(() => MockPhysicsShell.mock());
    jest.spyOn(manager, "openDoor").mockImplementation(jest.fn());

    manager.activate();

    expect(manager.openDoor).toHaveBeenCalledWith(true);
  });

  it("should correctly deactivate", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {});
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);

    manager.activate();
    manager.deactivate();

    expect(object.set_tip_text).toHaveBeenCalledWith("");
  });

  it("should throw on updates without initialization", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {});
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);

    manager.isInitialized = false;

    expect(() => manager.update()).toThrow();
  });

  it("should correctly update", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {});
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);

    manager.isInitialized = true;

    manager.update();

    expect(trySwitchToAnotherSection).toHaveBeenCalledWith(object, state);
  });

  it("should correctly check if state is open without slider", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {
      slider: false,
    });
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);

    manager.joint = MockPhysicsJoint.mock("test");
    manager.hiLimits = 0.01;

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => 10);
    expect(manager.isOpen()).toBe(true);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => 1);
    expect(manager.isOpen()).toBe(true);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => 0.04);
    expect(manager.isOpen()).toBe(true);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => 0.03);
    expect(manager.isOpen()).toBe(true);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => 0.02);
    expect(manager.isOpen()).toBe(true);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => 0.0);
    expect(manager.isOpen()).toBe(true);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => -0.02);
    expect(manager.isOpen()).toBe(false);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => -0.03);
    expect(manager.isOpen()).toBe(false);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => -0.04);
    expect(manager.isOpen()).toBe(false);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => -10);
    expect(manager.isOpen()).toBe(false);
  });

  it("should correctly check if state is open with slider", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {
      slider: true,
    });
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);

    manager.joint = MockPhysicsJoint.mock("test");
    manager.hiLimits = 0.01;

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => 10);
    expect(manager.isOpen()).toBe(false);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => 1);
    expect(manager.isOpen()).toBe(false);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => 0.04);
    expect(manager.isOpen()).toBe(false);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => 0.03);
    expect(manager.isOpen()).toBe(false);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => 0.0);
    expect(manager.isOpen()).toBe(true);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => -0.03);
    expect(manager.isOpen()).toBe(true);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => -0.04);
    expect(manager.isOpen()).toBe(true);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => -1);
    expect(manager.isOpen()).toBe(true);
  });

  it("should correctly check if state is closed without slider", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {
      slider: false,
    });
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);

    manager.joint = MockPhysicsJoint.mock("test");
    manager.lowLimits = 0.01;

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => 10);
    expect(manager.isClosed()).toBe(false);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => 1);
    expect(manager.isClosed()).toBe(false);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => 0.04);
    expect(manager.isClosed()).toBe(false);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => 0.03);
    expect(manager.isClosed()).toBe(true);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => 0.0);
    expect(manager.isClosed()).toBe(true);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => -10);
    expect(manager.isClosed()).toBe(true);
  });

  it("should correctly check if state is closed with slider", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {
      slider: true,
    });
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);

    manager.joint = MockPhysicsJoint.mock("test");
    manager.lowLimits = 0.01;

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => 10);
    expect(manager.isClosed()).toBe(true);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => 1);
    expect(manager.isClosed()).toBe(true);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => 0.04);
    expect(manager.isClosed()).toBe(true);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => 0.03);
    expect(manager.isClosed()).toBe(true);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => 0.0);
    expect(manager.isClosed()).toBe(true);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => -0.03);
    expect(manager.isClosed()).toBe(true);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => -0.04);
    expect(manager.isClosed()).toBe(false);

    jest.spyOn(manager.joint, "get_axis_angle").mockImplementation(() => -1);
    expect(manager.isClosed()).toBe(false);
  });

  it("should correctly handle usage", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {
      locked: false,
      sndOpenStart: "snd_open",
    });
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);
    const soundManager: SoundManager = getManager(SoundManager);

    jest.spyOn(soundManager, "play").mockImplementation(() => null);

    manager.onUse(object, null);

    expect(soundManager.play).not.toHaveBeenCalled();
    expect(switchObjectSchemeToSection).not.toHaveBeenCalled();

    state.locked = true;
    state.onUse = mockBaseSchemeLogic({ condlist: parseConditionsList("next@section") });

    manager.onUse(object, null);

    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "snd_open");
    expect(switchObjectSchemeToSection).toHaveBeenCalledWith(object, state.ini, "next@section");
  });

  it("should correctly handle hit", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {
      hitOnBone: $fromObject<TIndex, IBoneStateDescriptor>({ 2: { index: 2, state: parseConditionsList("sample") } }),
    });
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);

    manager.onHit(object, 30, ZERO_VECTOR, null, 1);
    expect(switchObjectSchemeToSection).toHaveBeenCalledTimes(0);

    manager.onHit(object, 30, ZERO_VECTOR, null, 2);
    expect(switchObjectSchemeToSection).toHaveBeenCalledWith(object, state.ini, "sample");
  });

  it("should correctly open door with force and sound", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {
      noForce: false,
      sndOpenStart: "snd_open",
      tipClose: "tip_close",
    });
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);
    const soundManager: SoundManager = getManager(SoundManager);
    const { element, physicObject } = attachDoorPhysics(object, { isFixed: true });

    jest.spyOn(soundManager, "play").mockImplementation(() => null);

    manager.joint = mockDoorJoint();
    manager.showTips = true;

    manager.openDoor();

    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "snd_open");
    expect(object.set_fastcall).toHaveBeenCalledWith(manager.openFastcall, manager);
    expect(element.release_fixed).toHaveBeenCalledTimes(1);
    expect(physicObject.set_door_ignore_dynamics).toHaveBeenCalledTimes(1);
    expect(manager.joint.set_max_force_and_velocity).toHaveBeenCalledWith(2100, -3, 0);
    expect(manager.block).toBe(false);
    expect(object.set_tip_text).toHaveBeenCalledWith("tip_close");
  });

  it("should correctly open door without force, sound and tips", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {
      noForce: true,
      sndOpenStart: "snd_open",
      tipClose: "tip_close",
    });
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);
    const soundManager: SoundManager = getManager(SoundManager);
    const { element, physicObject } = attachDoorPhysics(object, { isFixed: false });

    jest.spyOn(soundManager, "play").mockImplementation(() => null);

    manager.joint = mockDoorJoint();
    manager.showTips = false;

    manager.openDoor(true);

    expect(soundManager.play).not.toHaveBeenCalled();
    expect(element.release_fixed).not.toHaveBeenCalled();
    expect(physicObject.set_door_ignore_dynamics).not.toHaveBeenCalled();
    expect(manager.joint.set_max_force_and_velocity).toHaveBeenCalledWith(0, 0, 0);
    expect(object.set_tip_text).not.toHaveBeenCalled();
  });

  it("should correctly close door with force and sound", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {
      locked: false,
      noForce: false,
      sndCloseStart: "snd_close",
      tipOpen: "tip_open",
      tipUnlock: "tip_unlock",
    });
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);
    const soundManager: SoundManager = getManager(SoundManager);
    const { physicObject } = attachDoorPhysics(object);

    jest.spyOn(soundManager, "play").mockImplementation(() => null);

    manager.joint = mockDoorJoint();
    manager.showTips = true;

    manager.closeDoor(false);

    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "snd_close");
    expect(object.set_fastcall).toHaveBeenCalledWith(manager.fastcall, manager);
    expect(manager.joint.set_max_force_and_velocity).toHaveBeenCalledWith(200, 3, 0);
    expect(manager.block).toBe(true);
    expect(manager.soundlessBlock).toBe(false);
    expect(physicObject.set_door_ignore_dynamics).toHaveBeenCalledTimes(1);
    expect(object.set_tip_text).toHaveBeenCalledWith("tip_open");
  });

  it("should correctly close locked door without force and sound", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {
      locked: true,
      noForce: true,
      sndCloseStart: "snd_close",
      tipOpen: "tip_open",
      tipUnlock: "tip_unlock",
    });
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);
    const soundManager: SoundManager = getManager(SoundManager);

    attachDoorPhysics(object);
    jest.spyOn(soundManager, "play").mockImplementation(() => null);

    manager.joint = mockDoorJoint();
    manager.showTips = true;

    manager.closeDoor(true);

    expect(soundManager.play).not.toHaveBeenCalled();
    expect(manager.joint.set_max_force_and_velocity).toHaveBeenCalledWith(0, 0, 0);
    expect(manager.soundlessBlock).toBe(true);
    expect(object.set_tip_text).toHaveBeenCalledWith("tip_unlock");
  });

  it("should correctly apply close action with force", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {
      noForce: false,
      sndCloseStop: "snd_close_stop",
    });
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);
    const soundManager: SoundManager = getManager(SoundManager);
    const { element, physicObject } = attachDoorPhysics(object, { isFixed: false });

    jest.spyOn(soundManager, "play").mockImplementation(() => null);

    manager.joint = mockDoorJoint();
    manager.block = true;
    manager.soundlessBlock = false;

    manager.closeAction();

    expect(manager.joint.set_max_force_and_velocity).toHaveBeenCalledWith(10000, 1, 0);
    expect(element.fix).toHaveBeenCalledTimes(1);
    expect(physicObject.unset_door_ignore_dynamics).toHaveBeenCalledTimes(1);
    expect(manager.block).toBe(false);
    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "snd_close_stop");
  });

  it("should correctly apply close action without force and with soundless block", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {
      noForce: true,
      sndCloseStop: "snd_close_stop",
    });
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);
    const soundManager: SoundManager = getManager(SoundManager);
    const { element } = attachDoorPhysics(object, { isFixed: true });

    jest.spyOn(soundManager, "play").mockImplementation(() => null);

    manager.joint = mockDoorJoint();
    manager.soundlessBlock = true;

    manager.closeAction();

    expect(manager.joint.set_max_force_and_velocity).toHaveBeenCalledWith(0, 0, 0);
    expect(element.fix).not.toHaveBeenCalled();
    expect(soundManager.play).not.toHaveBeenCalled();
  });

  it("should correctly handle close fastcall", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {
      slider: false,
    });
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);

    attachDoorPhysics(object);

    manager.joint = mockDoorJoint();
    jest.spyOn(manager, "closeAction").mockImplementation(jest.fn());
    jest.spyOn(manager, "isClosed").mockImplementation(() => true);

    expect(manager.fastcall()).toBe(false);

    manager.isInitialized = true;
    manager.block = false;

    expect(manager.fastcall()).toBe(false);

    manager.block = true;
    jest.spyOn(manager, "isClosed").mockImplementation(() => false);

    expect(manager.fastcall()).toBe(false);

    jest.spyOn(manager, "isClosed").mockImplementation(() => true);

    expect(manager.fastcall()).toBe(true);
    expect(manager.closeAction).toHaveBeenCalledTimes(1);
    expect(object.on_door_is_closed).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle open fastcall", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {});
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);
    const { physicObject } = attachDoorPhysics(object);

    jest.spyOn(manager, "isOpen").mockImplementation(() => true);

    expect(manager.openFastcall()).toBe(false);

    manager.isInitialized = true;
    jest.spyOn(manager, "isOpen").mockImplementation(() => false);

    expect(manager.openFastcall()).toBe(false);

    jest.spyOn(manager, "isOpen").mockImplementation(() => true);

    expect(manager.openFastcall()).toBe(true);
    expect(physicObject.unset_door_ignore_dynamics).toHaveBeenCalledTimes(1);
    expect(object.on_door_is_open).toHaveBeenCalledTimes(1);
  });

  it("should skip close sound on activation when door is already closed", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {
      closed: true,
      scriptUsedMoreThanOnce: true,
      showTips: false,
    });
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);

    attachDoorPhysics(object);

    jest.spyOn(manager, "isClosed").mockImplementation(() => false);
    jest.spyOn(manager, "closeDoor").mockImplementation(jest.fn());

    manager.activate();

    expect(state.scriptUsedMoreThanOnce).toBe(true);
    expect(manager.closeDoor).toHaveBeenCalledWith(false);
  });
});
