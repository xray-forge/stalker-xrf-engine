import { beforeEach, describe, expect, it } from "@jest/globals";

import { registerSimulator } from "@/engine/core/database";
import { Squad } from "@/engine/core/objects/squad";
import { getObjectSquad, getObjectSquadByObjectId } from "@/engine/core/utils/squad/squad_get";
import { GameObject, ServerHumanObject } from "@/engine/lib/types";
import { MockSquad } from "@/fixtures/engine";
import { MockAlifeHumanStalker, MockGameObject } from "@/fixtures/xray";

describe("getObjectSquad util", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should correctly get squad of an object", () => {
    expect(getObjectSquad(MockGameObject.mock())).toBeNull();
    expect(getObjectSquad(MockAlifeHumanStalker.mock())).toBeNull();

    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock();
    const gameObject: GameObject = MockGameObject.mock({ idOverride: serverObject.id });
    const squad: Squad = MockSquad.mock();

    serverObject.group_id = squad.id;

    expect(getObjectSquad(gameObject)).toBe(squad);
    expect(getObjectSquad(serverObject)).toBe(squad);

    serverObject.group_id = 99_999;

    expect(getObjectSquad(gameObject)).toBeNull();
    expect(getObjectSquad(serverObject)).toBeNull();
  });
});

describe("getObjectSquadByObjectId util", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should correctly get squad of an object", () => {
    expect(getObjectSquadByObjectId(MockGameObject.mock().id())).toBeNull();
    expect(getObjectSquadByObjectId(MockAlifeHumanStalker.mock().id)).toBeNull();

    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock();
    const gameObject: GameObject = MockGameObject.mock({ idOverride: serverObject.id });
    const squad: Squad = MockSquad.mock();

    serverObject.group_id = squad.id;

    expect(getObjectSquadByObjectId(gameObject.id())).toBe(squad);
    expect(getObjectSquadByObjectId(serverObject.id)).toBe(squad);

    serverObject.group_id = 99_999;

    expect(getObjectSquadByObjectId(gameObject.id())).toBeNull();
    expect(getObjectSquadByObjectId(serverObject.id)).toBeNull();
  });
});
