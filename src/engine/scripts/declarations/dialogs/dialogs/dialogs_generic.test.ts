import { beforeAll, describe, expect, it, jest } from "@jest/globals";

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
});
