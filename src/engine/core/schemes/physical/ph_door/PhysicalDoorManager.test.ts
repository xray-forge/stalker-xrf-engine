import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { physics_joint } from "xray16";

import { ISchemePhysicalDoorState } from "@/engine/core/schemes/physical/ph_door/ph_door_types";
import { PhysicalDoorManager } from "@/engine/core/schemes/physical/ph_door/PhysicalDoorManager";
import { IBoneStateDescriptor, parseConditionsList } from "@/engine/core/utils/ini";
import { switchObjectSchemeToSection, trySwitchToAnotherSection } from "@/engine/core/utils/scheme";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import { EScheme, GameObject, TIndex } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject, MockPhysicsJoint, MockPhysicsShell } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/scheme/scheme_switch", () => ({
  trySwitchToAnotherSection: jest.fn(),
  switchObjectSchemeToSection: jest.fn(),
}));

describe("PhysicalDoorManager", () => {
  beforeEach(() => {
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
      hitOnBone: $fromObject<TIndex, IBoneStateDescriptor>({ 2: { index: 2, state: parseConditionsList("sample") } }),
    });
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);

    manager.onHit(object, 30, ZERO_VECTOR, null, 1);
    expect(switchObjectSchemeToSection).toHaveBeenCalledTimes(0);

    manager.onHit(object, 30, ZERO_VECTOR, null, 2);
    expect(switchObjectSchemeToSection).toHaveBeenCalledWith(object, state.ini, "sample");
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
});
