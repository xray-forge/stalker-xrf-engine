import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registry } from "@/engine/core/database";
import type { Squad } from "@/engine/core/objects/server/squad";
import { giveInfo } from "@/engine/core/utils/info_portion";
import { canSquadHelpActor } from "@/engine/core/utils/squad/squad_actions";
import { mockRegisteredActor } from "@/fixtures/engine";
import { MockAlifeOnlineOfflineGroup, mockServerAlifeOnlineOfflineGroup } from "@/fixtures/xray";

describe("squad_actions utils", () => {
  beforeEach(() => {
    mockRegisteredActor();
  });

  it("canSquadHelpActor should correctly check if squad can help actor", () => {
    const squad: Squad = mockServerAlifeOnlineOfflineGroup({}) as Squad;

    expect(canSquadHelpActor(squad)).toBe(false);

    registry.actorCombat.set(1, true);
    registry.actorCombat.set(2, true);

    expect(canSquadHelpActor(squad)).toBe(false);

    jest.spyOn(squad, "getCommunity").mockImplementation(() => "stalker");
    expect(canSquadHelpActor(squad)).toBe(false);

    giveInfo("sim_stalker_help_harder");
    expect(canSquadHelpActor(squad)).toBe(true);

    jest.spyOn(squad, "getCommunity").mockImplementation(() => "freedom");
    expect(canSquadHelpActor(squad)).toBe(false);

    giveInfo("sim_freedom_help_harder");
    expect(canSquadHelpActor(squad)).toBe(true);

    jest.spyOn(squad, "getCommunity").mockImplementation(() => "dolg");
    expect(canSquadHelpActor(squad)).toBe(false);

    giveInfo("sim_duty_help_harder");
    expect(canSquadHelpActor(squad)).toBe(true);

    (squad as unknown as MockAlifeOnlineOfflineGroup).m_game_vertex_id = -1;
    expect(canSquadHelpActor(squad)).toBe(false);

    (squad as unknown as MockAlifeOnlineOfflineGroup).m_game_vertex_id = registry.actor.game_vertex_id();
    expect(canSquadHelpActor(squad)).toBe(true);

    registry.actorCombat = new LuaTable();
    expect(canSquadHelpActor(squad)).toBe(false);
  });

  it.todo("isObjectSquadCommander should correctly check if object commanding squad");
});
