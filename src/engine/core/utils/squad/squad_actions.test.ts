import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registerSimulator, registry } from "@/engine/core/database";
import type { Squad } from "@/engine/core/objects/squad";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import {
  canSquadHelpActor,
  isObjectSquadCommander,
  isObjectSquadCommanderById,
} from "@/engine/core/utils/squad/squad_actions";
import { GameObject, ServerGroupObject, ServerHumanObject } from "@/engine/lib/types";
import { mockRegisteredActor } from "@/fixtures/engine";
import {
  MockAlifeOnlineOfflineGroup,
  MockGameObject,
  mockServerAlifeHumanStalker,
  mockServerAlifeOnlineOfflineGroup,
} from "@/fixtures/xray";

describe("squad_actions utils", () => {
  beforeEach(() => {
    mockRegisteredActor();
    registerSimulator();
  });

  it("canSquadHelpActor should correctly check if squad can help actor", () => {
    const squad: Squad = mockServerAlifeOnlineOfflineGroup({}) as Squad;

    expect(canSquadHelpActor(squad)).toBe(false);

    registry.actorCombat.set(1, true);
    registry.actorCombat.set(2, true);

    expect(canSquadHelpActor(squad)).toBe(false);

    jest.spyOn(squad, "getCommunity").mockImplementation(() => "stalker");
    expect(canSquadHelpActor(squad)).toBe(false);

    giveInfoPortion("sim_stalker_help_harder");
    expect(canSquadHelpActor(squad)).toBe(true);

    jest.spyOn(squad, "getCommunity").mockImplementation(() => "freedom");
    expect(canSquadHelpActor(squad)).toBe(false);

    giveInfoPortion("sim_freedom_help_harder");
    expect(canSquadHelpActor(squad)).toBe(true);

    jest.spyOn(squad, "getCommunity").mockImplementation(() => "dolg");
    expect(canSquadHelpActor(squad)).toBe(false);

    giveInfoPortion("sim_duty_help_harder");
    expect(canSquadHelpActor(squad)).toBe(true);

    (squad as unknown as MockAlifeOnlineOfflineGroup).m_game_vertex_id = -1;
    expect(canSquadHelpActor(squad)).toBe(false);

    (squad as unknown as MockAlifeOnlineOfflineGroup).m_game_vertex_id = registry.actor.game_vertex_id();
    expect(canSquadHelpActor(squad)).toBe(true);

    registry.actorCombat = new LuaTable();
    expect(canSquadHelpActor(squad)).toBe(false);
  });

  it("isObjectSquadCommander should correctly check if object commanding squad", () => {
    expect(isObjectSquadCommander(MockGameObject.mock())).toBe(false);
    expect(isObjectSquadCommander(mockServerAlifeHumanStalker())).toBe(false);

    const gameObject: GameObject = MockGameObject.mock();
    const groupObject: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();
    const serverObject: ServerHumanObject = mockServerAlifeHumanStalker({
      id: gameObject.id(),
      group_id: groupObject.id,
    });

    expect(isObjectSquadCommander(gameObject)).toBe(false);
    expect(isObjectSquadCommander(serverObject)).toBe(false);

    jest.spyOn(groupObject, "commander_id").mockImplementation(() => gameObject.id());

    expect(isObjectSquadCommander(gameObject)).toBe(true);
    expect(isObjectSquadCommander(serverObject)).toBe(true);
  });

  it("isObjectSquadCommanderById should correctly check if object commanding squad", () => {
    expect(isObjectSquadCommanderById(MockGameObject.mock().id())).toBe(false);
    expect(isObjectSquadCommanderById(mockServerAlifeHumanStalker().id)).toBe(false);

    const gameObject: GameObject = MockGameObject.mock();
    const groupObject: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();
    const serverObject: ServerHumanObject = mockServerAlifeHumanStalker({
      id: gameObject.id(),
      group_id: groupObject.id,
    });

    expect(isObjectSquadCommanderById(gameObject.id())).toBe(false);
    expect(isObjectSquadCommanderById(serverObject.id)).toBe(false);

    jest.spyOn(groupObject, "commander_id").mockImplementation(() => gameObject.id());

    expect(isObjectSquadCommanderById(gameObject.id())).toBe(true);
    expect(isObjectSquadCommanderById(serverObject.id)).toBe(true);
  });
});
