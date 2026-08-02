import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, Nillable, TName } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { getManager } from "@/engine/core/database";
import { DialogManager } from "@/engine/core/managers/dialogs";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

function callDialogBinding<T = void>(name: TName, ...parameters: AnyArgs): T {
  const effects: Nillable<AnyObject> = (_G as AnyObject)["dialog_manager"];

  if (effects && name in effects) {
    return (_G as AnyObject)["dialog_manager"][name](...parameters);
  } else if (!effects) {
    throw new Error("Unexpected call - 'dialog_manager' global is not registered.");
  } else {
    throw new Error(`Unexpected method provided - '${name}', no matching methods in dialog_manager globals.`);
  }
}

beforeAll(() => {
  require("@/engine/declarations/dialogs/dialog_manager/phrase_state");
});

beforeEach(() => {
  resetRegistry();
});

describe("action_disable_quest_phrase", () => {
  it("should record the phrase under the NPC quest-disabled phrase table", () => {
    const { actorGameObject } = mockRegisteredActor();
    const npc: GameObject = MockGameObject.mockStalker();
    const manager: DialogManager = getManager(DialogManager);

    callDialogBinding("action_disable_quest_phrase", actorGameObject, npc, "jup_b6_dialog", "3");

    expect(manager.questDisabledPhrases.get(npc.id()).get("3")).toBe(true);
  });
});

describe("precondition_is_phrase_disabled", () => {
  it("should reject phrases disabled for the NPC speaker", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();
    const manager: DialogManager = getManager(DialogManager);
    const disabled = new LuaTable<string, boolean>();

    expect(
      callDialogBinding("precondition_is_phrase_disabled", actorGameObject, object, "dialog", "parent", "phrase")
    ).toBe(true);

    disabled.set("phrase", true);
    manager.disabledPhrases.set(object.id(), disabled);

    expect(
      callDialogBinding("precondition_is_phrase_disabled", actorGameObject, object, "dialog", "parent", "phrase")
    ).toBe(false);
  });
});

describe("action_disable_phrase", () => {
  it("should correctly disable phrases", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();
    const manager: DialogManager = getManager(DialogManager);

    jest.spyOn(manager, "disableObjectPhrase").mockImplementation(jest.fn());

    callDialogBinding("action_disable_phrase", actorGameObject, object, "dialog_name", "0");

    expect(manager.disableObjectPhrase).toHaveBeenCalledTimes(1);
    expect(manager.disableObjectPhrase).toHaveBeenCalledWith(object.id(), "dialog_name");
  });
});

describe("create_bye_phrase", () => {
  it("should return one localized actor farewell", () => {
    expect([
      "translated_actor_break_dialog_1",
      "translated_actor_break_dialog_2",
      "translated_actor_break_dialog_3",
    ]).toContain(callDialogBinding<string>("create_bye_phrase"));
  });
});

describe("uni_dialog_precond", () => {
  it("should correctly check dialog preconditions", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();

    jest.spyOn(object, "character_community").mockImplementation(() => "stalker");
    expect(callDialogBinding("uni_dialog_precond", actorGameObject, object)).toBe(true);

    jest.spyOn(object, "character_community").mockImplementation(() => "bandit");
    expect(callDialogBinding("uni_dialog_precond", actorGameObject, object)).toBe(true);

    jest.spyOn(object, "character_community").mockImplementation(() => "dolg");
    expect(callDialogBinding("uni_dialog_precond", actorGameObject, object)).toBe(true);

    jest.spyOn(object, "character_community").mockImplementation(() => "freedom");
    expect(callDialogBinding("uni_dialog_precond", actorGameObject, object)).toBe(true);

    jest.spyOn(object, "character_community").mockImplementation(() => "zombied");
    expect(callDialogBinding("uni_dialog_precond", actorGameObject, object)).toBe(false);

    jest.spyOn(object, "character_community").mockImplementation(() => "monolith");
    expect(callDialogBinding("uni_dialog_precond", actorGameObject, object)).toBe(false);
  });
});
