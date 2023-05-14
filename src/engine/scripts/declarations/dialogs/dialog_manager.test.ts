import { describe, it } from "@jest/globals";

import { AnyObject, TName } from "@/engine/lib/types";

describe("'dialogs' external callbacks", () => {
  const checkBinding = (name: TName, container: AnyObject = global) => {
    if (!container["dialog_manager"][name]) {
      throw new Error(`Expected '${name}' callback to be declared.`);
    }
  };

  it("should correctly inject dialog functors", () => {
    require("@/engine/scripts/declarations/dialogs/dialog_manager");

    checkBinding("init_new_dialog");
    checkBinding("initializeStartDialogs");
    checkBinding("init_hello_dialogs");
    checkBinding("action_disable_quest_phrase");
    checkBinding("action_anomalies_dialogs");
    checkBinding("action_job_dialogs");
    checkBinding("action_hello_dialogs");
    checkBinding("fill_priority_hello_table");
    checkBinding("fill_priority_job_table");
    checkBinding("fill_priority_anomalies_table");
    checkBinding("fill_priority_information_table");
    checkBinding("precondition_hello_dialogs");
    checkBinding("precondition_job_dialogs_no_more");
    checkBinding("precondition_job_dialogs_do_not_know");
    checkBinding("precondition_job_dialogs");
    checkBinding("precondition_anomalies_dialogs_no_more");
    checkBinding("precondition_information_dialogs_no_more");
    checkBinding("precondition_information_dialogs_do_not_know");
    checkBinding("action_information_dialogs");
    checkBinding("precondition_information_dialogs");
    checkBinding("precondition_is_phrase_disabled");
    checkBinding("action_disable_phrase");
    checkBinding("create_bye_phrase");
    checkBinding("uni_dialog_precond");
  });
});
