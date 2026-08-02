import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TName } from "xray16/lib";

import { infoPortions } from "@/engine/constants/info_portions";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs"]);
}

function resetActor(): GameObject {
  resetRegistry();

  return mockRegisteredActor().actorGameObject;
}

beforeAll(() => require("@/engine/declarations/dialogs/quests/shared/preconditions"));

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
});

describe("quest_dialog_heli_precond", () => {
  it("should hide the dialog after every helicopter was searched or the finale was completed", () => {
    expect(callDialogsBinding("quest_dialog_heli_precond")).toBe(true);

    giveInfoPortion(infoPortions.jup_b9_heli_1_searched);
    giveInfoPortion(infoPortions.zat_b100_heli_2_searched);
    giveInfoPortion(infoPortions.zat_b28_heli_3_searched);
    giveInfoPortion(infoPortions.jup_b8_heli_4_searched);
    giveInfoPortion(infoPortions.zat_b101_heli_5_searched);
    expect(callDialogsBinding("quest_dialog_heli_precond")).toBe(false);

    resetActor();

    giveInfoPortion(infoPortions.pri_b305_actor_wondered_done);
    expect(callDialogsBinding("quest_dialog_heli_precond")).toBe(false);
  });

  it("should stay available while any helicopter is still unsearched", () => {
    giveInfoPortion(infoPortions.jup_b9_heli_1_searched);
    giveInfoPortion(infoPortions.zat_b100_heli_2_searched);
    giveInfoPortion(infoPortions.zat_b28_heli_3_searched);
    giveInfoPortion(infoPortions.jup_b8_heli_4_searched);

    expect(callDialogsBinding("quest_dialog_heli_precond")).toBe(true);
  });
});

describe("quest_dialog_military_precond", () => {
  it("should be available only while exactly one military clue is known", () => {
    expect(callDialogsBinding("quest_dialog_military_precond")).toBe(false);

    giveInfoPortion(infoPortions.zat_b28_heli_3_searched);
    expect(callDialogsBinding("quest_dialog_military_precond")).toBe(true);

    giveInfoPortion(infoPortions.jup_b9_blackbox_decrypted);
    expect(callDialogsBinding("quest_dialog_military_precond")).toBe(false);
  });

  it("should also accept the decrypted blackbox as the only known clue", () => {
    giveInfoPortion(infoPortions.jup_b9_blackbox_decrypted);

    expect(callDialogsBinding("quest_dialog_military_precond")).toBe(true);
  });
});

describe("quest_dialog_squad_precond", () => {
  it("should be available until every squad member has been hired", () => {
    expect(callDialogsBinding("quest_dialog_squad_precond")).toBe(true);

    giveInfoPortion(infoPortions.jup_b218_monolith_hired);
    giveInfoPortion(infoPortions.jup_b218_soldier_hired);
    giveInfoPortion(infoPortions.jup_a10_vano_agree_go_und);
    expect(callDialogsBinding("quest_dialog_squad_precond")).toBe(false);
  });

  it("should stay available while any squad member is still unhired", () => {
    giveInfoPortion(infoPortions.jup_b218_monolith_hired);
    giveInfoPortion(infoPortions.jup_b218_soldier_hired);

    expect(callDialogsBinding("quest_dialog_squad_precond")).toBe(true);
  });
});

describe("quest_dialog_toolkits_precond", () => {
  it("should be available while either mechanic toolkit task is active", () => {
    expect(callDialogsBinding("quest_dialog_toolkits_precond")).toBe(false);

    giveInfoPortion(infoPortions.zat_a2_mechanic_toolkit_search);
    expect(callDialogsBinding("quest_dialog_toolkits_precond")).toBe(true);

    giveInfoPortion(infoPortions.zat_b3_task_end);
    expect(callDialogsBinding("quest_dialog_toolkits_precond")).toBe(false);

    giveInfoPortion(infoPortions.jup_b217_tech_instruments_start);
    expect(callDialogsBinding("quest_dialog_toolkits_precond")).toBe(true);
  });

  it("should close once the Jupiter toolkit task also ends", () => {
    giveInfoPortion(infoPortions.jup_b217_tech_instruments_start);
    expect(callDialogsBinding("quest_dialog_toolkits_precond")).toBe(true);

    giveInfoPortion(infoPortions.jup_b217_task_end);
    expect(callDialogsBinding("quest_dialog_toolkits_precond")).toBe(false);
  });
});
