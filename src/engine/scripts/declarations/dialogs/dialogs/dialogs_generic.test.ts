import { beforeAll, describe, expect, it, jest } from "@jest/globals";

import { ActorInputManager } from "@/engine/core/managers/actor";
import { breakObjectDialog, updateObjectDialog } from "@/engine/core/utils/dialog";
import { actorHasMedKit, getAnyObjectPistol } from "@/engine/core/utils/item";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { AnyArgs, AnyObject, GameObject, TName } from "@/engine/lib/types";
import { callBinding, checkNestedBinding, mockRegisteredActor } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";
import { mockGameObject } from "@/fixtures/xray";

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
  const checkDialogsBinding = (name: TName) => checkNestedBinding("dialogs", name);
  const callDialogsBinding = (name: TName, args: AnyArgs = []) => callBinding(name, args, (_G as AnyObject)["dialogs"]);

  beforeAll(() => {
    require("@/engine/scripts/declarations/dialogs/dialogs/dialogs_generic");
  });

  it("should correctly inject dialog functors", () => {
    checkDialogsBinding("break_dialog");
    checkDialogsBinding("actor_have_medkit");
    checkDialogsBinding("actor_hasnt_medkit");
    checkDialogsBinding("transfer_medkit");
    checkDialogsBinding("actor_have_bandage");
    checkDialogsBinding("transfer_bandage");
    checkDialogsBinding("kill_yourself");
    checkDialogsBinding("has_2000_money");
    checkDialogsBinding("transfer_any_pistol_from_actor");
    checkDialogsBinding("have_actor_any_pistol");
    checkDialogsBinding("disable_ui");
    checkDialogsBinding("disable_ui_only");
  });

  it("break_dialog should correctly break", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = mockGameObject();

    callDialogsBinding("break_dialog", [actorGameObject, object]);
    expect(breakObjectDialog).toHaveBeenCalledWith(object);
  });

  it("actor_have_medkit should correctly check medkit", () => {
    replaceFunctionMock(actorHasMedKit, () => true);

    expect(callDialogsBinding("actor_have_medkit")).toBe(true);
    expect(actorHasMedKit).toHaveBeenCalled();

    replaceFunctionMock(actorHasMedKit, () => false);

    expect(callDialogsBinding("actor_have_medkit")).toBe(false);
    expect(actorHasMedKit).toHaveBeenCalled();
  });

  it("actor_hasnt_medkit should correctly check medkit", () => {
    replaceFunctionMock(actorHasMedKit, () => true);

    expect(callDialogsBinding("actor_hasnt_medkit")).toBe(false);
    expect(actorHasMedKit).toHaveBeenCalled();

    replaceFunctionMock(actorHasMedKit, () => false);

    expect(callDialogsBinding("actor_hasnt_medkit")).toBe(true);
    expect(actorHasMedKit).toHaveBeenCalled();
  });

  it.todo("transfer_medkit should correctly transfer medkits");

  it.todo("actor_have_bandage should correctly check if actor has bandage");

  it.todo("transfer_bandage should correctly transfer actor has bandage");

  it.todo("kill_yourself should correctly force actor kill");

  it("has_2000_money should correctly check money amount", () => {
    const first: GameObject = mockGameObject({ money: () => 1000 });
    const second: GameObject = mockGameObject({ money: () => 2000 });

    expect(callDialogsBinding("has_2000_money", [first])).toBe(false);
    expect(callDialogsBinding("has_2000_money", [second])).toBe(true);
  });

  it("transfer_any_pistol_from_actor should correctly transfer pistols", () => {
    const { actorGameObject } = mockRegisteredActor();

    callDialogsBinding("transfer_any_pistol_from_actor", []);
    expect(actorGameObject.transfer_item).not.toHaveBeenCalled();

    const speaker: GameObject = mockGameObject();
    const fort: GameObject = mockGameObject();

    replaceFunctionMock(getAnyObjectPistol, () => fort);

    callDialogsBinding("transfer_any_pistol_from_actor", [actorGameObject, speaker]);
    expect(actorGameObject.transfer_item).toHaveBeenCalledWith(fort, speaker);
  });

  it("have_actor_any_pistol should correctly check pistols", () => {
    const { actorGameObject } = mockRegisteredActor();

    replaceFunctionMock(getAnyObjectPistol, () => null);
    expect(callDialogsBinding("have_actor_any_pistol", [])).toBe(false);
    expect(getAnyObjectPistol).toHaveBeenCalledWith(actorGameObject);

    replaceFunctionMock(getAnyObjectPistol, () => mockGameObject());
    expect(callDialogsBinding("have_actor_any_pistol", [])).toBe(true);
  });

  it("disable_ui should correctly disable UI", () => {
    const actorInputManager: ActorInputManager = ActorInputManager.getInstance();

    jest.spyOn(actorInputManager, "disableGameUi").mockImplementation(jest.fn());

    callDialogsBinding("disable_ui");
    expect(actorInputManager.disableGameUi).toHaveBeenCalledTimes(1);
    expect(actorInputManager.disableGameUi).toHaveBeenCalledWith(false);
  });

  it("disable_ui_only should correctly disable UI only", () => {
    const actorInputManager: ActorInputManager = ActorInputManager.getInstance();

    jest.spyOn(actorInputManager, "disableGameUiOnly").mockImplementation(jest.fn());

    callDialogsBinding("disable_ui_only");
    expect(actorInputManager.disableGameUiOnly).toHaveBeenCalledTimes(1);
  });
});
