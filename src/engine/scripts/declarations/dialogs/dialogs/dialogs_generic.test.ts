import { beforeAll, describe, expect, it, jest } from "@jest/globals";

import { ActorInputManager } from "@/engine/core/managers/actor";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { breakObjectDialog, updateObjectDialog } from "@/engine/core/utils/dialog";
import { actorHasMedKit } from "@/engine/core/utils/item";
import { isObjectWounded } from "@/engine/core/utils/planner";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { AnyArgs, AnyObject, GameObject, TName } from "@/engine/lib/types";
import { callBinding, checkNestedBinding, mockRegisteredActor } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";
import { mockGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/planner", () => ({ isObjectWounded: jest.fn(() => false) }));
jest.mock("@/engine/core/utils/item", () => ({ actorHasMedKit: jest.fn(() => false) }));
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
    checkDialogsBinding("update_npc_dialog");
    checkDialogsBinding("is_wounded");
    checkDialogsBinding("is_not_wounded");
    checkDialogsBinding("actor_have_medkit");
    checkDialogsBinding("actor_hasnt_medkit");
    checkDialogsBinding("transfer_medkit");
    checkDialogsBinding("actor_have_bandage");
    checkDialogsBinding("transfer_bandage");
    checkDialogsBinding("kill_yourself");
    checkDialogsBinding("allow_wounded_dialog");
    checkDialogsBinding("level_zaton");
    checkDialogsBinding("level_jupiter");
    checkDialogsBinding("level_pripyat");
    checkDialogsBinding("not_level_zaton");
    checkDialogsBinding("not_level_jupiter");
    checkDialogsBinding("not_level_pripyat");
    checkDialogsBinding("is_friend");
    checkDialogsBinding("is_not_friend");
    checkDialogsBinding("become_friend");
    checkDialogsBinding("npc_stalker");
    checkDialogsBinding("npc_bandit");
    checkDialogsBinding("npc_freedom");
    checkDialogsBinding("npc_dolg");
    checkDialogsBinding("npc_army");
    checkDialogsBinding("actor_in_dolg");
    checkDialogsBinding("actor_not_in_dolg");
    checkDialogsBinding("actor_in_freedom");
    checkDialogsBinding("actor_not_in_freedom");
    checkDialogsBinding("actor_in_bandit");
    checkDialogsBinding("actor_not_in_bandit");
    checkDialogsBinding("actor_in_stalker");
    checkDialogsBinding("actor_not_in_stalker");
    checkDialogsBinding("has_2000_money");
    checkDialogsBinding("transfer_any_pistol_from_actor");
    checkDialogsBinding("have_actor_any_pistol");
    checkDialogsBinding("disable_ui");
    checkDialogsBinding("disable_ui_only");
    checkDialogsBinding("is_surge_running");
    checkDialogsBinding("is_surge_not_running");
  });

  it("break_dialog should correctly break", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = mockGameObject();

    callDialogsBinding("break_dialog", [actorGameObject, object]);
    expect(breakObjectDialog).toHaveBeenCalledWith(object);
  });

  it("update_npc_dialog should correctly update", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = mockGameObject();

    callDialogsBinding("update_npc_dialog", [actorGameObject, object]);
    expect(updateObjectDialog).toHaveBeenCalledWith(object);
  });

  it("is_wounded should correctly check wounded state", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = mockGameObject();

    replaceFunctionMock(isObjectWounded, (it) => it === ACTOR_ID);

    expect(callDialogsBinding("is_wounded", [actorGameObject, object])).toBe(false);
    expect(isObjectWounded).toHaveBeenCalledWith(object.id());

    replaceFunctionMock(isObjectWounded, (it) => it === object.id());

    expect(callDialogsBinding("is_wounded", [actorGameObject, object])).toBe(true);
    expect(isObjectWounded).toHaveBeenCalledWith(object.id());
  });

  it("is_not_wounded should correctly check wounded state", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = mockGameObject();

    replaceFunctionMock(isObjectWounded, (it) => it === ACTOR_ID);

    expect(callDialogsBinding("is_not_wounded", [actorGameObject, object])).toBe(true);
    expect(isObjectWounded).toHaveBeenCalledWith(object.id());

    replaceFunctionMock(isObjectWounded, (it) => it === object.id());

    expect(callDialogsBinding("is_not_wounded", [actorGameObject, object])).toBe(false);
    expect(isObjectWounded).toHaveBeenCalledWith(object.id());
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

  it.todo("allow_wounded_dialog should correctly allow dialog");

  it.todo("level_zaton should correctly check if level is zaton");

  it.todo("level_not_zaton should correctly check if level is not zaton");

  it.todo("level_jupiter should correctly check if level is jupiter");

  it.todo("level_not_jupiter should correctly check if level is not jupiter");

  it.todo("level_pripyat should correctly check if level is pripyat");

  it.todo("level_not_pripyat should correctly check if level is not pripyat");

  it.todo("is_friend should correctly check friend relations");

  it.todo("is_not_friend should correctly check not friend relations");

  it.todo("become_friend should correctly change relations");

  it.todo("npc_stalker should correctly check stalker faction");

  it.todo("npc_bandit should correctly check bandit faction");

  it.todo("npc_freedom should correctly check freedom faction");

  it.todo("npc_dolg should correctly check dolg faction");

  it.todo("npc_army should correctly check army faction");

  it.todo("actor_in_dolg should correctly check actor in dolg faction");

  it.todo("actor_not_in_dolg should correctly check actor not in dolg faction");

  it.todo("actor_in_freedom should correctly check actor in freedom faction");

  it.todo("actor_not_in_freedom should correctly check actor not in freedom faction");

  it.todo("actor_in_bandit should correctly check actor in bandit faction");

  it.todo("actor_not_in_bandit should correctly check actor not in bandit faction");

  it.todo("actor_in_stalker should correctly check actor in stalker faction");

  it.todo("actor_not_in_stalker should correctly check actor not in stalker faction");

  it("has_2000_money should correctly check money amount", () => {
    const first: GameObject = mockGameObject({ money: () => 1000 });
    const second: GameObject = mockGameObject({ money: () => 2000 });

    expect(callDialogsBinding("has_2000_money", [first])).toBe(false);
    expect(callDialogsBinding("has_2000_money", [second])).toBe(true);
  });

  it.todo("transfer_any_pistol_from_actor should correctly transfer pistols");

  it.todo("have_actor_any_pistol should correctly check pistols");

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

  it("is_surge_running should correctly check surge state", () => {
    surgeConfig.IS_STARTED = true;
    expect(callDialogsBinding("is_surge_running")).toBe(true);

    surgeConfig.IS_STARTED = false;
    expect(callDialogsBinding("is_surge_running")).toBe(false);
  });

  it("is_surge_not_running should correctly check surge state", () => {
    surgeConfig.IS_FINISHED = true;
    expect(callDialogsBinding("is_surge_not_running")).toBe(true);

    surgeConfig.IS_FINISHED = false;
    expect(callDialogsBinding("is_surge_not_running")).toBe(false);
  });
});
