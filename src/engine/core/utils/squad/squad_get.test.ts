import { beforeEach, describe, expect, it } from "@jest/globals";

import { registerSimulator } from "@/engine/core/database";
import { getObjectSquad } from "@/engine/core/utils/squad/squad_get";
import { GameObject, ServerGroupObject, ServerHumanObject } from "@/engine/lib/types";
import { mockGameObject, mockServerAlifeHumanStalker, mockServerAlifeOnlineOfflineGroup } from "@/fixtures/xray";

describe("squad utils", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("getObjectSquad should correctly get squad of an object", () => {
    expect(getObjectSquad(mockGameObject())).toBeNull();
    expect(getObjectSquad(mockServerAlifeHumanStalker())).toBeNull();

    const gameObject: GameObject = mockGameObject();
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
});
