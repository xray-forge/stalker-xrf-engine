import { describe, expect, it } from "@jest/globals";

import { getObjectSquad } from "@/engine/core/utils/squad/squad_get";
import { ClientObject, ServerGroupObject, ServerHumanObject } from "@/engine/lib/types";
import { mockClientGameObject, mockServerAlifeHumanStalker, mockServerAlifeOnlineOfflineGroup } from "@/fixtures/xray";

describe("squad utils", () => {
  it("getObjectSquad should correctly get squad of an object", () => {
    expect(getObjectSquad(mockClientGameObject())).toBeNull();
    expect(getObjectSquad(mockServerAlifeHumanStalker())).toBeNull();

    const clientObject: ClientObject = mockClientGameObject();
    const groupObject: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();
    const serverObject: ServerHumanObject = mockServerAlifeHumanStalker({
      id: clientObject.id(),
      group_id: groupObject.id,
    });

    expect(getObjectSquad(clientObject)).toBe(groupObject);
    expect(getObjectSquad(serverObject)).toBe(groupObject);

    serverObject.group_id = 99_999;

    expect(getObjectSquad(clientObject)).toBeNull();
    expect(getObjectSquad(serverObject)).toBeNull();
  });
});
