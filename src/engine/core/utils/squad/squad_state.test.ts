import { describe, expect, it, jest } from "@jest/globals";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { updateSquadInvulnerabilityState } from "@/engine/core/utils/squad/squad_state";
import { FALSE, TRUE } from "@/engine/lib/constants/words";
import { GameObject, IniFile, ServerCreatureObject } from "@/engine/lib/types";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockAlifeOnlineOfflineGroup, MockGameObject, mockIniFile, mockServerAlifeHumanStalker } from "@/fixtures/xray";

describe("squad_state utils", () => {
  it("updateSquadInvulnerabilityState should correctly update state for squad", () => {
    const squadMock: MockAlifeOnlineOfflineGroup = new MockAlifeOnlineOfflineGroup("test_section");
    const squad: Squad = squadMock as unknown as Squad;

    const ini: IniFile = mockIniFile("test.ltx", {
      active: {
        invulnerable: true,
      },
    });

    const first: GameObject = MockGameObject.mock();
    const firstServer: ServerCreatureObject = mockServerAlifeHumanStalker({ id: first.id() });
    const firstState: IRegistryObjectState = registerObject(first);

    const second: GameObject = MockGameObject.mock();
    const secondServer: ServerCreatureObject = mockServerAlifeHumanStalker({ id: second.id() });
    const secondState: IRegistryObjectState = registerObject(second);

    firstState.ini = ini;
    firstState.activeSection = "active";
    secondState.ini = ini;
    secondState.activeSection = "active";

    squadMock.addSquadMember(firstServer);
    squadMock.addSquadMember(secondServer);

    squad.invulnerabilityConditionList = parseConditionsList(FALSE);

    jest.spyOn(first, "invulnerable").mockImplementation(() => false);
    jest.spyOn(second, "invulnerable").mockImplementation(() => false);

    squadMock.online = false;
    updateSquadInvulnerabilityState(squad);

    expect(first.invulnerable).toHaveBeenCalledTimes(0);
    expect(second.invulnerable).toHaveBeenCalledTimes(0);

    squadMock.online = true;
    updateSquadInvulnerabilityState(squad);

    expect(first.invulnerable).toHaveBeenCalledTimes(1);
    expect(second.invulnerable).toHaveBeenCalledTimes(1);

    resetFunctionMock(first.invulnerable);
    resetFunctionMock(second.invulnerable);

    updateSquadInvulnerabilityState(squad);

    expect(first.invulnerable).toHaveBeenCalledTimes(1);
    expect(second.invulnerable).toHaveBeenCalledTimes(1);

    resetFunctionMock(first.invulnerable);
    resetFunctionMock(second.invulnerable);

    firstState.activeSection = "another";

    updateSquadInvulnerabilityState(squad);

    expect(first.invulnerable).toHaveBeenCalledTimes(2);
    expect(second.invulnerable).toHaveBeenCalledTimes(1);

    jest
      .spyOn(first, "invulnerable")
      .mockReset()
      .mockImplementation(() => true);
    jest
      .spyOn(second, "invulnerable")
      .mockReset()
      .mockImplementation(() => true);

    squad.invulnerabilityConditionList = parseConditionsList(TRUE);
    secondState.activeSection = "another";

    updateSquadInvulnerabilityState(squad);

    expect(first.invulnerable).toHaveBeenCalledTimes(1);
    expect(second.invulnerable).toHaveBeenCalledTimes(1);

    resetFunctionMock(first.invulnerable);
    resetFunctionMock(second.invulnerable);
  });
});
