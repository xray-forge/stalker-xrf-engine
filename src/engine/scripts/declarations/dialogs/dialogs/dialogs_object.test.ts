import { beforeAll, describe, expect, it, jest } from "@jest/globals";

import { updateObjectDialog } from "@/engine/core/utils/dialog";
import { isObjectWounded } from "@/engine/core/utils/planner";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { AnyArgs, AnyObject, EGameObjectRelation, GameObject, TName, TRelationType } from "@/engine/lib/types";
import { callBinding, checkNestedBinding, mockRegisteredActor } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";
import { MockGameObject } from "@/fixtures/xray";

function checkDialogsBinding(name: TName): void {
  return checkNestedBinding("dialogs", name);
}

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

describe("dialogs_generic external callbacks", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/dialogs/dialogs/dialogs_object");
  });

  it("should correctly inject dialog functors", () => {
    checkDialogsBinding("update_npc_dialog");
    checkDialogsBinding("is_wounded");
    checkDialogsBinding("is_not_wounded");
    checkDialogsBinding("is_friend");
    checkDialogsBinding("is_not_friend");
    checkDialogsBinding("become_friend");
    checkDialogsBinding("npc_stalker");
    checkDialogsBinding("npc_bandit");
    checkDialogsBinding("npc_freedom");
    checkDialogsBinding("npc_dolg");
    checkDialogsBinding("npc_army");
  });

  it("update_npc_dialog should correctly update", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mock();

    callDialogsBinding("update_npc_dialog", [actorGameObject, object]);
    expect(updateObjectDialog).toHaveBeenCalledWith(object);
  });

  it("is_wounded should correctly check wounded state", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mock();

    replaceFunctionMock(isObjectWounded, (it) => it === ACTOR_ID);

    expect(callDialogsBinding("is_wounded", [actorGameObject, object])).toBe(false);
    expect(isObjectWounded).toHaveBeenCalledWith(object.id());

    replaceFunctionMock(isObjectWounded, (it) => it === object.id());

    expect(callDialogsBinding("is_wounded", [actorGameObject, object])).toBe(true);
    expect(isObjectWounded).toHaveBeenCalledWith(object.id());
  });

  it("is_not_wounded should correctly check wounded state", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mock();

    replaceFunctionMock(isObjectWounded, (it) => it === ACTOR_ID);

    expect(callDialogsBinding("is_not_wounded", [actorGameObject, object])).toBe(true);
    expect(isObjectWounded).toHaveBeenCalledWith(object.id());

    replaceFunctionMock(isObjectWounded, (it) => it === object.id());

    expect(callDialogsBinding("is_not_wounded", [actorGameObject, object])).toBe(false);
    expect(isObjectWounded).toHaveBeenCalledWith(object.id());
  });

  it("is_friend should correctly check friend relations", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(actor, "relation").mockImplementation(() => EGameObjectRelation.FRIEND as TRelationType);
    expect(callDialogsBinding("is_friend", [actor, object])).toBe(true);

    jest.spyOn(actor, "relation").mockImplementation(() => EGameObjectRelation.ENEMY as TRelationType);
    expect(callDialogsBinding("is_friend", [actor, object])).toBe(false);
  });

  it("is_not_friend should correctly check not friend relations", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(actor, "relation").mockImplementation(() => EGameObjectRelation.FRIEND as TRelationType);
    expect(callDialogsBinding("is_not_friend", [actor, object])).toBe(false);

    jest.spyOn(actor, "relation").mockImplementation(() => EGameObjectRelation.ENEMY as TRelationType);
    expect(callDialogsBinding("is_not_friend", [actor, object])).toBe(true);
  });

  it("become_friend should correctly change relations", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const object: GameObject = MockGameObject.mock();

    callDialogsBinding("become_friend", [actor, object]);

    expect(actor.set_relation).toHaveBeenCalledWith(EGameObjectRelation.FRIEND, object);
  });

  it("npc_stalker should correctly check army faction", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(
      callDialogsBinding("npc_stalker", [actorGameObject, MockGameObject.mockStalker({ community: "monolith" })])
    ).toBe(false);

    expect(
      callDialogsBinding("npc_stalker", [actorGameObject, MockGameObject.mockStalker({ community: "stalker" })])
    ).toBe(true);
  });

  it("npc_bandit should correctly check army faction", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(
      callDialogsBinding("npc_bandit", [actorGameObject, MockGameObject.mockStalker({ community: "stalker" })])
    ).toBe(false);

    expect(
      callDialogsBinding("npc_bandit", [actorGameObject, MockGameObject.mockStalker({ community: "bandit" })])
    ).toBe(true);
  });

  it("npc_freedom should correctly check army faction", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(
      callDialogsBinding("npc_freedom", [actorGameObject, MockGameObject.mockStalker({ community: "stalker" })])
    ).toBe(false);

    expect(
      callDialogsBinding("npc_freedom", [actorGameObject, MockGameObject.mockStalker({ community: "freedom" })])
    ).toBe(true);
  });

  it("npc_dolg should correctly check army faction", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(
      callDialogsBinding("npc_dolg", [actorGameObject, MockGameObject.mockStalker({ community: "stalker" })])
    ).toBe(false);

    expect(callDialogsBinding("npc_dolg", [actorGameObject, MockGameObject.mockStalker({ community: "dolg" })])).toBe(
      true
    );
  });

  it("npc_army should correctly check army faction", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(
      callDialogsBinding("npc_army", [actorGameObject, MockGameObject.mockStalker({ community: "stalker" })])
    ).toBe(false);

    expect(callDialogsBinding("npc_army", [actorGameObject, MockGameObject.mockStalker({ community: "army" })])).toBe(
      true
    );
  });
});
