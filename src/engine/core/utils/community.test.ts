import { describe, expect, it } from "@jest/globals";
import { clsid } from "xray16";

import { registerObject } from "@/engine/core/database";
import { getObjectCommunity, setObjectTeamSquadGroup } from "@/engine/core/utils/community";
import { GameObject, ServerHumanObject, TClassId } from "@/engine/lib/types";
import { replaceFunctionMock } from "@/fixtures/jest";
import { mockGameObject, mockServerAlifeHumanStalker } from "@/fixtures/xray";

describe("community utils", () => {
  it("getObjectCommunity should correctly get community", () => {
    expect(getObjectCommunity(mockGameObject())).toBe("monster");
    expect(getObjectCommunity(mockServerAlifeHumanStalker())).toBe("stalker");

    const gameObject: GameObject = mockGameObject({ clsid: () => clsid.script_stalker as TClassId });
    const serverObject: ServerHumanObject = mockServerAlifeHumanStalker({
      clsid: () => clsid.script_stalker as TClassId,
    });

    expect(getObjectCommunity(gameObject)).toBe("stalker");
    expect(getObjectCommunity(serverObject)).toBe("stalker");

    replaceFunctionMock(gameObject.character_community, () => "monolith");
    replaceFunctionMock(serverObject.community, () => "army");

    expect(getObjectCommunity(gameObject)).toBe("monolith");
    expect(getObjectCommunity(serverObject)).toBe("army");
  });

  it("setObjectTeamSquadGroup should correctly set object group details", () => {
    const firstObject: GameObject = mockGameObject();
    const firstServerObject: ServerHumanObject = mockServerAlifeHumanStalker({ id: firstObject.id() });

    setObjectTeamSquadGroup(firstServerObject, 432, 543, 654);

    expect(firstServerObject.team).toBe(432);
    expect(firstServerObject.squad).toBe(543);
    expect(firstServerObject.group).toBe(654);

    expect(firstObject.change_team).not.toHaveBeenCalled();

    const secondObject: GameObject = mockGameObject();
    const secondServerObject: ServerHumanObject = mockServerAlifeHumanStalker({ id: secondObject.id() });

    registerObject(secondObject);
    setObjectTeamSquadGroup(secondServerObject, 443, 444, 445);

    expect(secondServerObject.team).not.toBe(443);
    expect(secondServerObject.squad).not.toBe(444);
    expect(secondServerObject.group).not.toBe(445);

    expect(secondObject.change_team).toHaveBeenCalledWith(443, 444, 445);
  });
});
