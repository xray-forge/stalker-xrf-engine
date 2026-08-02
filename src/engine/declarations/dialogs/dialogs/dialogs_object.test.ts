import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { EGameObjectRelation, GameObject, TRelationType } from "xray16/alias";
import { ACTOR_ID, AnyArgs, AnyObject, TName } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import { updateObjectDialog } from "@/engine/core/utils/dialog";
import { isObjectWounded } from "@/engine/core/utils/planner";
import { callBinding, mockRegisteredActor } from "@/fixtures/engine";

function callDialogsBinding(name: TName, args: AnyArgs = []): unknown {
  return callBinding(name, args, (_G as AnyObject)["dialogs"]);
}

jest.mock("@/engine/core/utils/planner", () => ({ isObjectWounded: jest.fn(() => false) }));

jest.mock("@/engine/core/utils/item", () => ({
  actorHasMedKit: jest.fn(() => false),
  getAnyObjectPistol: jest.fn(() => null),
}));

jest.mock("@/engine/core/utils/dialog", () => ({
  breakObjectDialog: jest.fn(),
  updateObjectDialog: jest.fn(),
  getNpcSpeaker: (first: GameObject, second: GameObject) => (first.id() === ACTOR_ID ? second : first),
}));

beforeAll(() => {
  require("@/engine/declarations/dialogs/dialogs/dialogs_object");
});

describe("update_npc_dialog", () => {
  it("should correctly update", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mock();

    callDialogsBinding("update_npc_dialog", [actorGameObject, object]);
    expect(updateObjectDialog).toHaveBeenCalledWith(object);
  });
});

describe("is_wounded", () => {
  it("should correctly check wounded state", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mock();

    replaceFunctionMock(isObjectWounded, (it) => it === ACTOR_ID);

    expect(callDialogsBinding("is_wounded", [actorGameObject, object])).toBe(false);
    expect(isObjectWounded).toHaveBeenCalledWith(object.id());

    replaceFunctionMock(isObjectWounded, (it) => it === object.id());

    expect(callDialogsBinding("is_wounded", [actorGameObject, object])).toBe(true);
    expect(isObjectWounded).toHaveBeenCalledWith(object.id());
  });
});

describe("is_not_wounded", () => {
  it("should correctly check wounded state", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mock();

    replaceFunctionMock(isObjectWounded, (it) => it === ACTOR_ID);

    expect(callDialogsBinding("is_not_wounded", [actorGameObject, object])).toBe(true);
    expect(isObjectWounded).toHaveBeenCalledWith(object.id());

    replaceFunctionMock(isObjectWounded, (it) => it === object.id());

    expect(callDialogsBinding("is_not_wounded", [actorGameObject, object])).toBe(false);
    expect(isObjectWounded).toHaveBeenCalledWith(object.id());
  });
});

describe("is_friend", () => {
  it("should correctly check friend relations", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(actor, "relation").mockImplementation(() => EGameObjectRelation.FRIEND as TRelationType);
    expect(callDialogsBinding("is_friend", [actor, object])).toBe(true);

    jest.spyOn(actor, "relation").mockImplementation(() => EGameObjectRelation.ENEMY as TRelationType);
    expect(callDialogsBinding("is_friend", [actor, object])).toBe(false);
  });
});

describe("is_not_friend", () => {
  it("should correctly check not friend relations", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(actor, "relation").mockImplementation(() => EGameObjectRelation.FRIEND as TRelationType);
    expect(callDialogsBinding("is_not_friend", [actor, object])).toBe(false);

    jest.spyOn(actor, "relation").mockImplementation(() => EGameObjectRelation.ENEMY as TRelationType);
    expect(callDialogsBinding("is_not_friend", [actor, object])).toBe(true);
  });
});

describe("become_friend", () => {
  it("should correctly change relations", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const object: GameObject = MockGameObject.mock();

    callDialogsBinding("become_friend", [actor, object]);

    expect(actor.set_relation).toHaveBeenCalledWith(EGameObjectRelation.FRIEND, object);
  });
});

describe("npc_stalker", () => {
  it("should correctly check army faction", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(
      callDialogsBinding("npc_stalker", [actorGameObject, MockGameObject.mockStalker({ community: "monolith" })])
    ).toBe(false);

    expect(
      callDialogsBinding("npc_stalker", [actorGameObject, MockGameObject.mockStalker({ community: "stalker" })])
    ).toBe(true);
  });
});

describe("npc_bandit", () => {
  it("should correctly check army faction", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(
      callDialogsBinding("npc_bandit", [actorGameObject, MockGameObject.mockStalker({ community: "stalker" })])
    ).toBe(false);

    expect(
      callDialogsBinding("npc_bandit", [actorGameObject, MockGameObject.mockStalker({ community: "bandit" })])
    ).toBe(true);
  });
});

describe("npc_freedom", () => {
  it("should correctly check army faction", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(
      callDialogsBinding("npc_freedom", [actorGameObject, MockGameObject.mockStalker({ community: "stalker" })])
    ).toBe(false);

    expect(
      callDialogsBinding("npc_freedom", [actorGameObject, MockGameObject.mockStalker({ community: "freedom" })])
    ).toBe(true);
  });
});

describe("npc_dolg", () => {
  it("should correctly check army faction", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(
      callDialogsBinding("npc_dolg", [actorGameObject, MockGameObject.mockStalker({ community: "stalker" })])
    ).toBe(false);

    expect(callDialogsBinding("npc_dolg", [actorGameObject, MockGameObject.mockStalker({ community: "dolg" })])).toBe(
      true
    );
  });
});

describe("npc_army", () => {
  it("should correctly check army faction", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(
      callDialogsBinding("npc_army", [actorGameObject, MockGameObject.mockStalker({ community: "stalker" })])
    ).toBe(false);

    expect(callDialogsBinding("npc_army", [actorGameObject, MockGameObject.mockStalker({ community: "army" })])).toBe(
      true
    );
  });
});
