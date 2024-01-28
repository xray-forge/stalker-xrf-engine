import { describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import { IRegistryObjectState, registerActor, registerObject, registry } from "@/engine/core/database";
import {
  ETeleportState,
  ISchemeTeleportState,
  SchemeTeleport,
  TeleportManager,
} from "@/engine/core/schemes/restrictor/sr_teleport";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { activateSchemeBySection, loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { EScheme, GameObject, IniFile } from "@/engine/lib/types";
import { getSchemeAction } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";
import { MockGameObject, MockIniFile, patrols } from "@/fixtures/xray";

describe("TeleportManager class", () => {
  it("should correctly call updates, teleport and react to generic logic", () => {
    registerActor(MockGameObject.mock());

    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_teleport@test": {
        timeout: 500,
        point1: "test-teleport",
        look1: "test-teleport-look",
        on_info: "{+finish} nil, sr_teleport@test",
      },
    });

    jest.spyOn(Date, "now").mockImplementation(() => 10_000);

    registerObject(object);
    loadSchemeImplementation(SchemeTeleport);
    activateSchemeBySection(object, ini, "sr_teleport@test", null, false);

    const schemeState: ISchemeTeleportState = state[EScheme.SR_TELEPORT] as ISchemeTeleportState;
    const teleportManager: TeleportManager = getSchemeAction(schemeState);

    expect(state.activeSection).toBe("sr_teleport@test");

    jest.spyOn(Date, "now").mockImplementation(() => 20_000);
    teleportManager.update();
    expect(teleportManager.teleportState).toBe(ETeleportState.IDLE);

    replaceFunctionMock(object.inside, () => true);
    teleportManager.update();
    expect(teleportManager.teleportState).toBe(ETeleportState.ACTIVATED);

    teleportManager.update();
    expect(teleportManager.teleportState).toBe(ETeleportState.ACTIVATED);
    expect(registry.actor.set_actor_direction).not.toHaveBeenCalled();
    expect(registry.actor.set_actor_position).not.toHaveBeenCalled();

    jest.spyOn(Date, "now").mockImplementation(() => 20_000 + schemeState.timeout);

    teleportManager.update();

    expect(teleportManager.teleportState).toBe(ETeleportState.IDLE);
    expect(level.add_pp_effector).toHaveBeenCalledWith("teleport.ppe", 2006, false);
    expect(registry.actor.set_actor_direction).toHaveBeenCalledWith(-2.723368324010564);
    expect(registry.actor.set_actor_position).toHaveBeenCalledWith(patrols["test-teleport"].points[0].position);

    replaceFunctionMock(object.inside, () => false);
    jest.spyOn(Date, "now").mockImplementation(() => 40_000 + schemeState.timeout);

    teleportManager.update();
    expect(teleportManager.teleportState).toBe(ETeleportState.IDLE);
    expect(registry.actor.set_actor_direction).toHaveBeenCalledTimes(1);
    expect(registry.actor.set_actor_position).toHaveBeenCalledTimes(1);
    expect(state.activeSection).toBe("sr_teleport@test");

    jest.spyOn(Date, "now").mockImplementation(() => 100_000);
    giveInfoPortion("finish");

    teleportManager.update();
    expect(state.activeSection).toBeNull();
    expect(state.activeScheme).toBeNull();
    expect(state.activationTime).toBe(100_000);
  });
});
