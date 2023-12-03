import { beforeEach, describe, expect, it } from "@jest/globals";

import { registerSimulator } from "@/engine/core/database";
import { getObjectSquad, getObjectSquadByObjectId } from "@/engine/core/utils/squad/squad_get";
import { GameObject, ServerGroupObject, ServerHumanObject } from "@/engine/lib/types";
import { MockGameObject, mockServerAlifeHumanStalker, mockServerAlifeOnlineOfflineGroup } from "@/fixtures/xray";

describe("squad utils", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("getObjectSquad should correctly get squad of an object", () => {
    expect(getObjectSquad(MockGameObject.mock())).toBeNull();
    expect(getObjectSquad(mockServerAlifeHumanStalker())).toBeNull();

    const gameObject: GameObject = MockGameObject.mock();
    const groupObject: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();
    const serverObject: ServerHumanObject = mockServerAlifeHumanStalker({
      id: gameObject.id(),
      group_id: groupObject.id,
    });

    expect(getObjectSquad(gameObject)).toBe(groupObject);
    expect(getObjectSquad(serverObject)).toBe(groupObject);

    serverObject.group_id = 99_999;

    expect(getObjectSquad(gameObject)).toBeNull();
    expect(getObjectSquad(serverObject)).toBeNull();
  });

  it("getObjectSquadByObjectId should correctly get squad of an object", () => {
    expect(getObjectSquadByObjectId(MockGameObject.mock().id())).toBeNull();
    expect(getObjectSquadByObjectId(mockServerAlifeHumanStalker().id)).toBeNull();

    const gameObject: GameObject = MockGameObject.mock();
    const groupObject: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();
    const serverObject: ServerHumanObject = mockServerAlifeHumanStalker({
      id: gameObject.id(),
      group_id: groupObject.id,
    });

    expect(getObjectSquadByObjectId(gameObject.id())).toBe(groupObject);
    expect(getObjectSquadByObjectId(serverObject.id)).toBe(groupObject);

    serverObject.group_id = 99_999;

    expect(getObjectSquadByObjectId(gameObject.id())).toBeNull();
    expect(getObjectSquadByObjectId(serverObject.id)).toBeNull();
  });

  it.todo("getSquadCommunity should correctly get community for squads");
});
