import { describe, expect, it } from "@jest/globals";
import { clsid } from "xray16";

import { getObjectCommunity } from "@/engine/core/utils/community";
import { ClientObject, ServerHumanObject, TClassId } from "@/engine/lib/types";
import { replaceFunctionMock } from "@/fixtures/jest";
import { mockClientGameObject, mockServerAlifeHumanStalker } from "@/fixtures/xray";

describe("community utils", () => {
  it("getObjectCommunity should correctly get community", () => {
    expect(getObjectCommunity(mockClientGameObject())).toBe("monster");
    expect(getObjectCommunity(mockServerAlifeHumanStalker())).toBe("stalker");

    const clientObject: ClientObject = mockClientGameObject({ clsid: () => clsid.script_stalker as TClassId });
    const serverObject: ServerHumanObject = mockServerAlifeHumanStalker({
      clsid: () => clsid.script_stalker as TClassId,
    });

    expect(getObjectCommunity(clientObject)).toBe("stalker");
    expect(getObjectCommunity(serverObject)).toBe("stalker");

    replaceFunctionMock(clientObject.character_community, () => "monolith");
    replaceFunctionMock(serverObject.community, () => "army");

    expect(getObjectCommunity(clientObject)).toBe("monolith");
    expect(getObjectCommunity(serverObject)).toBe("army");
  });
});
