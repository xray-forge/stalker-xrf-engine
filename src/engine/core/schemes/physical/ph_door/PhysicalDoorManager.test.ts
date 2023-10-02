import { describe, expect, it, jest } from "@jest/globals";
import { physics_joint } from "xray16";

import { ISchemePhysicalDoorState } from "@/engine/core/schemes/physical/ph_door/ph_door_types";
import { PhysicalDoorManager } from "@/engine/core/schemes/physical/ph_door/PhysicalDoorManager";
import { ClientObject, EScheme } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { mockClientGameObject, MockPhysicsShell } from "@/fixtures/xray";

describe("PhysicalDoorManager", () => {
  it("should correctly activate without shell object", () => {
    const object: ClientObject = mockClientGameObject();
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {});
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);

    manager.activate();

    expect(object.get_physics_shell).toHaveBeenCalledTimes(1);
    expect(manager.isInitialized).toBe(false);
  });

  it("should correctly activate with shell object", () => {
    const object: ClientObject = mockClientGameObject({ get_physics_shell: jest.fn(() => MockPhysicsShell.mock()) });
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {
      showTips: true,
      scriptUsedMoreThanOnce: false,
      closed: true,
    });
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);

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

  it("should correctly deactivate", () => {
    const object: ClientObject = mockClientGameObject();
    const state: ISchemePhysicalDoorState = mockSchemeState<ISchemePhysicalDoorState>(EScheme.PH_DOOR, {});
    const manager: PhysicalDoorManager = new PhysicalDoorManager(object, state);

    manager.activate();
    manager.deactivate();

    expect(object.set_tip_text).toHaveBeenCalledWith("");
  });
});
