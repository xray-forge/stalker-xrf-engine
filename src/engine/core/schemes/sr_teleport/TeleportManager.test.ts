import { describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import { IRegistryObjectState, registerActor, registerObject, registry } from "@/engine/core/database";
import { activateSchemeBySection } from "@/engine/core/schemes/base/utils";
import { ETeleportState, ISchemeTeleportState } from "@/engine/core/schemes/sr_teleport/ISchemeTeleportState";
import { SchemeTeleport } from "@/engine/core/schemes/sr_teleport/SchemeTeleport";
import { TeleportManager } from "@/engine/core/schemes/sr_teleport/TeleportManager";
import { giveInfo } from "@/engine/core/utils/info_portion";
import { ClientObject, EScheme, IniFile } from "@/engine/lib/types";
import { loadSchemeImplementation } from "@/engine/scripts/register/schemes_registrator";
import { getSchemeAction } from "@/fixtures/engine/mocks";
import { replaceFunctionMock } from "@/fixtures/utils/function_mock";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";
import { patrols } from "@/fixtures/xray/mocks/objects/path/patrols";

describe("TeleportManager class", () => {
  it("should correctly call updates, teleport and react to generic logic", () => {
    registerActor(mockClientGameObject());

    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);

    const ini: IniFile = mockIniFile("test.ltx", {
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

    expect(state.active_section).toBe("sr_teleport@test");

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
    expect(state.active_section).toBe("sr_teleport@test");

    jest.spyOn(Date, "now").mockImplementation(() => 100_000);
    giveInfo("finish");

    teleportManager.update();
    expect(state.active_section).toBeNull();
    expect(state.active_scheme).toBeNull();
    expect(state.activation_time).toBe(100_000);
  });
});
