import { describe, expect, it } from "@jest/globals";

import { EGenericPhraseCategory } from "@/engine/core/managers/dialogs";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import { initializeStartDialogs } from "@/engine/core/managers/dialogs/utils/dialog_init";
import { MockPhraseDialog } from "@/fixtures/xray";

describe("initializeStartDialogs util", () => {
  it("should correctly generate phrases and scripts for generic categories", () => {
    const dialog: MockPhraseDialog = MockPhraseDialog.create();

    initializeStartDialogs(dialog.asMock(), EGenericPhraseCategory.INFORMATION);

    expect(dialog.AddPhrase).toHaveBeenCalledTimes(6);

    expect(dialog.AddPhrase).toHaveBeenCalledWith("", "0", "", -10_000);
    expect(dialog.AddPhrase).toHaveBeenCalledWith("", "1", "0", -10_000);
    expect(dialog.AddPhrase).toHaveBeenCalledWith("dm_information_1", "14", "1", -10_000);
    expect(dialog.AddPhrase).toHaveBeenCalledWith("dm_information_2", "15", "1", -10_000);
    expect(dialog.AddPhrase).toHaveBeenCalledWith("dm_information_3", "16", "1", -10_000);
    expect(dialog.AddPhrase).toHaveBeenCalledWith("dm_information_4", "17", "1", -10_000);

    expect(dialog.GetPhrase("0").GetPhraseScript()).toEqual({
      text: null,
      preconditions: [],
      actions: [],
    });
    expect(dialog.GetPhrase("1").GetPhraseScript()).toEqual({
      text: null,
      preconditions: [],
      actions: ["dialog_manager.fill_priority_information_table"],
    });
    expect(dialog.GetPhrase("14").GetPhraseScript()).toEqual({
      text: null,
      preconditions: ["dialog_manager.precondition_information_dialogs", "dialogs.is_not_wounded"],
      actions: ["dialog_manager.action_information_dialogs"],
    });
    expect(dialog.GetPhrase("15").GetPhraseScript()).toEqual({
      text: null,
      preconditions: ["dialog_manager.precondition_information_dialogs", "dialogs.is_not_wounded"],
      actions: ["dialog_manager.action_information_dialogs"],
    });
    expect(dialog.GetPhrase("16").GetPhraseScript()).toEqual({
      text: null,
      preconditions: ["dialog_manager.precondition_information_dialogs", "dialogs.is_not_wounded"],
      actions: ["dialog_manager.action_information_dialogs"],
    });
    expect(dialog.GetPhrase("17").GetPhraseScript()).toEqual({
      text: null,
      preconditions: ["dialog_manager.precondition_information_dialogs", "dialogs.is_not_wounded"],
      actions: ["dialog_manager.action_information_dialogs"],
    });
  });

  it("should correctly generate phrases and scripts for generic categories", () => {
    const dialog: MockPhraseDialog = MockPhraseDialog.create();

    initializeStartDialogs(dialog.asMock(), EGenericPhraseCategory.HELLO);

    expect(dialog.AddPhrase).toHaveBeenCalledTimes(11);

    expect(dialog.AddPhrase).toHaveBeenCalledWith("", "0", "", -10_000);
    expect(dialog.AddPhrase).toHaveBeenCalledWith("", "1", "0", -10_000);
    expect(dialog.AddPhrase).toHaveBeenCalledWith("dm_help_0", "18", "1", -10_000);
    expect(dialog.AddPhrase).toHaveBeenCalledWith("dm_help_1", "19", "1", -10_000);
    expect(dialog.AddPhrase).toHaveBeenCalledWith("dm_hello_0", "20", "1", -10_000);
    expect(dialog.AddPhrase).toHaveBeenCalledWith("dm_hello_1", "21", "1", -10_000);
    expect(dialog.AddPhrase).toHaveBeenCalledWith("dm_hello_2", "22", "1", -10_000);

    expect(dialog.GetPhrase("0").GetPhraseScript()).toEqual({
      text: null,
      preconditions: [],
      actions: [],
    });
    expect(dialog.GetPhrase("1").GetPhraseScript()).toEqual({
      text: null,
      preconditions: [],
      actions: ["dialog_manager.fill_priority_hello_table"],
    });
    expect(dialog.GetPhrase("18").GetPhraseScript()).toEqual({
      text: null,
      preconditions: ["dialog_manager.precondition_hello_dialogs", "dialogs.is_wounded"],
      actions: ["dialog_manager.action_hello_dialogs"],
    });
    expect(dialog.GetPhrase("19").GetPhraseScript()).toEqual({
      text: null,
      preconditions: ["dialog_manager.precondition_hello_dialogs", "dialogs.is_wounded"],
      actions: ["dialog_manager.action_hello_dialogs"],
    });
    expect(dialog.GetPhrase("20").GetPhraseScript()).toEqual({
      text: null,
      preconditions: ["dialog_manager.precondition_hello_dialogs", "dialogs.is_not_wounded"],
      actions: ["dialog_manager.action_hello_dialogs"],
    });
    expect(dialog.GetPhrase("21").GetPhraseScript()).toEqual({
      text: null,
      preconditions: ["dialog_manager.precondition_hello_dialogs", "dialogs.is_not_wounded"],
      actions: ["dialog_manager.action_hello_dialogs"],
    });
    expect(dialog.GetPhrase("22").GetPhraseScript()).toEqual({
      text: null,
      preconditions: ["dialog_manager.precondition_hello_dialogs", "dialogs.is_not_wounded"],
      actions: ["dialog_manager.action_hello_dialogs"],
    });
  });

  it("should correctly assert phrases and scripts for unknown categories", () => {
    expect(() => initializeStartDialogs(MockPhraseDialog.mock(), "unknown" as EGenericPhraseCategory)).toThrow(
      "Expected to have pre-defined phrases for category 'unknown'."
    );

    dialogConfig.PHRASES.set("unknown" as EGenericPhraseCategory, new LuaTable());

    expect(() => initializeStartDialogs(MockPhraseDialog.mock(), "unknown" as EGenericPhraseCategory)).toThrow(
      "Expected to have at least one pre-defined phrase for category 'unknown'."
    );

    dialogConfig.PHRASES.delete("unknown" as EGenericPhraseCategory);
  });
});
