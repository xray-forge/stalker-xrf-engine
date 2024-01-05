import { describe, expect, it } from "@jest/globals";
import { clsid } from "xray16";

import { registerObject } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { getObjectCommunity, getSquadCommunity, setObjectTeamSquadGroup } from "@/engine/core/utils/community";
import { GameObject, ServerHumanObject, TClassId } from "@/engine/lib/types";
import { MockSquad } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";
import { MockAlifeHumanStalker, MockGameObject } from "@/fixtures/xray";

describe("getSquadCommunity util", () => {
  it("should correctly get community for squads", () => {
    const squad: Squad = MockSquad.mock();

    squad.faction = "none";
    expect(getSquadCommunity(squad)).toBeNull();

    squad.faction = "monster_special";
    expect(getSquadCommunity(squad)).toBe("monster");

    squad.faction = "stalker";
    expect(getSquadCommunity(squad)).toBe("stalker");

    squad.faction = "killer";
    expect(getSquadCommunity(squad)).toBe("killer");

    squad.faction = "monolith";
    expect(getSquadCommunity(squad)).toBe("monolith");

    squad.faction = "monster_special";
    expect(getSquadCommunity(squad)).toBe("monster");

    squad.faction = "monster_vegetarian";
    expect(getSquadCommunity(squad)).toBe("monster");

    squad.faction = "monster_zombied_night";
    expect(getSquadCommunity(squad)).toBe("monster");
  });
});

describe("getObjectCommunity util", () => {
  it("should correctly get community", () => {
    expect(getObjectCommunity(MockGameObject.mock())).toBe("monster");
    expect(getObjectCommunity(MockAlifeHumanStalker.mock())).toBe("stalker");

    const gameObject: GameObject = MockGameObject.mock({ clsid: () => clsid.script_stalker as TClassId });
    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mockWithClassId(clsid.script_stalker);

    expect(getObjectCommunity(gameObject)).toBe("stalker");
    expect(getObjectCommunity(serverObject)).toBe("stalker");

    replaceFunctionMock(gameObject.character_community, () => "monolith");
    replaceFunctionMock(serverObject.community, () => "army");

    expect(getObjectCommunity(gameObject)).toBe("monolith");
    expect(getObjectCommunity(serverObject)).toBe("army");
  });
});

describe("setObjectTeamSquadGroup util", () => {
  it("should correctly set object group details", () => {
    const firstServerObject: ServerHumanObject = MockAlifeHumanStalker.mock();
    const firstObject: GameObject = MockGameObject.mock({ idOverride: firstServerObject.id });

    setObjectTeamSquadGroup(firstServerObject, 432, 543, 654);

    expect(firstServerObject.team).toBe(432);
    expect(firstServerObject.squad).toBe(543);
    expect(firstServerObject.group).toBe(654);

    expect(firstObject.change_team).not.toHaveBeenCalled();

    const secondServerObject: ServerHumanObject = MockAlifeHumanStalker.mock();
    const secondObject: GameObject = MockGameObject.mock({ idOverride: secondServerObject.id });

    registerObject(secondObject);
    setObjectTeamSquadGroup(secondServerObject, 443, 444, 445);

    expect(secondServerObject.team).not.toBe(443);
    expect(secondServerObject.squad).not.toBe(444);
    expect(secondServerObject.group).not.toBe(445);

    expect(secondObject.change_team).toHaveBeenCalledWith(443, 444, 445);
  });
});
