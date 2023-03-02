import { game, level, XR_CPhraseDialog, XR_CPhraseScript, XR_game_object, XR_net_packet, XR_reader } from "xray16";

import { captions } from "@/mod/globals/captions";
import { communities, TCommunity } from "@/mod/globals/communities";
import { LuaArray, Optional } from "@/mod/lib/types";
import { DIALOG_MANAGER_LTX, registry } from "@/mod/scripts/core/database";
import { hasAlifeInfo } from "@/mod/scripts/utils/actor";
import { getCharacterCommunity } from "@/mod/scripts/utils/alife";
import { isObjectWounded } from "@/mod/scripts/utils/checkers/checkers";
import { parse_infop1, parseNames } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { getObjectBoundSmart } from "@/mod/scripts/utils/gulag";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { getNpcSpeaker } from "@/mod/scripts/utils/quests";

// todo: Separate manager class.
// todo: Separate manager class.
// todo: Separate manager class.
// todo: Simplify.
// todo: Simplify.
// todo: Move to core.
// todo: Move to core.
// todo: Move to core.
// todo: Move to core.
// todo: Move to core.
// todo: Move to core.
// todo: Move to core.
// todo: Move to core.
// todo: Move to core.
// todo: Move to core.
// todo: Move to core.

const logger: LuaLogger = new LuaLogger("dialog_manager");

// -- temporary table of phrases which have been disabled during a conversation
export const disabled_phrases: LuaTable<number, LuaTable<string, boolean>> = new LuaTable();
// -- temporary table of phrases which have been disabled during a conversation | npc id -> phrase id -> boolean
export const quest_disabled_phrases: LuaTable<number, LuaTable<string, boolean>> = new LuaTable();
let id_counter: number = 5; // -- start from 5 because of adding root phrases
let rnd: number = 0;

interface IPhrasesDescriptor {
  id: string;
  name: string;
  npc_community: LuaArray<any> | "not_set";
  level: LuaArray<any> | "not_set";
  actor_community: LuaArray<any> | "not_set" | "all";
  wounded: string;
  once: string;
  info: LuaTable;
  smart: Optional<string>;
  told?: boolean;
}

type TPHRTable = LuaTable<string, IPhrasesDescriptor>;

const phrase_table = {
  hello: {},
  job: {},
  anomalies: {},
  place: {},
  information: {},
} as unknown as LuaTable<string, TPHRTable>;

type TPRTTable = LuaTable<
  number,
  LuaTable<string, number> & { told?: boolean; ignore_once?: Optional<boolean>; id?: -1 }
>;

const priority_table = {
  hello: new LuaTable(),
  job: new LuaTable(),
  anomalies: new LuaTable(),
  place: new LuaTable(),
  information: new LuaTable(),
} as unknown as LuaTable<string, TPRTTable>;

// -- Generate id for phrase
export function get_id(): number {
  return ++id_counter;
}

// -- Parse ini file && store all phrases && their parameters into phrase table
export function fillPhrasesTable(): void {
  logger.info("Fill phrases table");

  const dm_ini_file = DIALOG_MANAGER_LTX;
  let category = "";

  for (const i of $range(0, dm_ini_file.line_count("list") - 1)) {
    const [temp1, id, temp2] = dm_ini_file.r_line("list", i, "", "");

    if (dm_ini_file.line_exist(id, "category")) {
      category = dm_ini_file.r_string(id, "category");

      if (category === "hello") {
        category = "hello";
      } else if (category === "anomalies") {
        category = "anomalies";
      } else if (category === "place") {
        category = "place";
      } else if (category === "job") {
        category = "job";
      } else if (category === "information") {
        category = "information";
      } else {
        category = "default";
      }
    } else {
      abort("Dialog manager error. ! categoried section [%s].", id);
    }

    if (category !== "default") {
      const phrases: IPhrasesDescriptor = {
        id: tostring(get_id()),
        name: id,
        // -- npc community. all || {dolg,freedom,bandit,military,zombied,ecolog,killer,monolith,csky...}
        npc_community: DIALOG_MANAGER_LTX.line_exist(id, "npc_community")
          ? parseNames(dm_ini_file.r_string(id, "npc_community"))
          : "not_set",
        // -- level. all || level name
        level: dm_ini_file.line_exist(id, "level") ? parseNames(dm_ini_file.r_string(id, "level")) : "not_set",
        // -- actor community. all || {actor_dolg, actor, ...}
        actor_community: dm_ini_file.line_exist(id, "actor_community")
          ? parseNames(dm_ini_file.r_string(id, "actor_community"))
          : "not_set",
        // -- is npc wounded? true, false
        wounded: dm_ini_file.line_exist(id, "wounded") ? dm_ini_file.r_string(id, "wounded") : "false",
        // -- phrase is said once. true, always, false(!!!don't set || will no say this phrase)
        once: dm_ini_file.line_exist(id, "once") ? dm_ini_file.r_string(id, "once") : "always",
        info: new LuaTable(),
        smart: null as Optional<string>,
      };

      if (dm_ini_file.line_exist(id, "info") && dm_ini_file.r_string(id, "info") !== "") {
        parse_infop1(phrases.info, dm_ini_file.r_string(id, "info"));
      }

      if (category === "anomalies" || category === "place") {
        if (dm_ini_file.line_exist(id, "smart")) {
          phrases.smart = dm_ini_file.r_string(id, "smart");
        } else {
          phrases.smart = "";
        }
      }

      phrase_table.get(category).set(phrases.id, phrases);
    }
  }
}

// todo: Probably remove?
// -- Save
export function saveNpcDialogs(packet: XR_net_packet, npcId: number): void {
  setSaveMarker(packet, false, "dialog_manager");

  packet.w_bool(priority_table.get("hello").get(npcId) !== null);
  packet.w_bool(priority_table.get("job").get(npcId) !== null);
  packet.w_bool(priority_table.get("anomalies").get(npcId) !== null);
  packet.w_bool(priority_table.get("place").get(npcId) !== null);
  packet.w_bool(priority_table.get("information").get(npcId) !== null);

  setSaveMarker(packet, true, "dialog_manager");
}

// todo: Probably remove?
// -- Load
export function loadNpcDialogs(reader: XR_reader, npc_id: number): void {
  setLoadMarker(reader, false, "dialog_manager");

  reader.r_bool();
  reader.r_bool();
  reader.r_bool();
  reader.r_bool();
  reader.r_bool();

  setLoadMarker(reader, true, "dialog_manager");
}

// -- Initialize new actor dialog
/**
 * todo;
 */
export function init_new_dialog(dialog: XR_CPhraseDialog): void {
  logger.info("Init new dialog");

  const actor_table = ["job", "anomalies", "information"] as unknown as LuaArray<string>;
  const start_phrase_table = [
    "dm_universal_npc_start_0",
    "dm_universal_npc_start_1",
    "dm_universal_npc_start_2",
    "dm_universal_npc_start_3",
  ] as unknown as LuaArray<string>;
  const precond_table = [
    "dialogs.npc_stalker",
    "dialogs.npc_bandit",
    "dialogs.npc_freedom",
    "dialogs.npc_dolg",
  ] as unknown as LuaArray<string>;

  const actor_phrase = dialog.AddPhrase("dm_universal_actor_start", tostring(0), "", -10000);
  const actor_script = actor_phrase.GetPhraseScript();

  for (const j of $range(1, 4)) {
    const npc_phrase = dialog.AddPhrase(start_phrase_table.get(j), tostring(j), tostring(0), -10000);
    const npc_phrase_script = npc_phrase.GetPhraseScript();

    npc_phrase_script.AddPrecondition(precond_table.get(j));

    for (const i of $range(1, actor_table.length())) {
      const index = get_id();
      const str = actor_table.get(i);
      let phrase = dialog.AddPhrase("dm_" + str + "_general", tostring(index), tostring(j), -10000);
      let script: XR_CPhraseScript = phrase.GetPhraseScript();

      if (str === "anomalies") {
        script.AddPrecondition("dialogs.npc_stalker");
      }

      // --script.AddPrecondition("dialog_manager.precondition_is_phrase_disabled")
      script.AddAction("dialog_manager.fill_priority_" + str + "_table");
      // --script.AddAction("dialog_manager.action_disable_phrase")

      for (const k of $range(1, 3)) {
        const answer_no_more = dialog.AddPhrase(
          "dm_" + str + "_no_more_" + tostring(k),
          tostring(get_id()),
          tostring(index),
          -10000
        );
        const script_no_more = answer_no_more.GetPhraseScript();

        script_no_more.AddPrecondition("dialog_manager.precondition_" + str + "_dialogs_no_more");

        const answer_do_not_know = dialog.AddPhrase(
          "dm_" + str + "_do_not_know_" + tostring(k),
          tostring(get_id()),
          tostring(index),
          -10000
        );
        const script_do_not_know = answer_do_not_know.GetPhraseScript();

        script_do_not_know.AddPrecondition("dialog_manager.precondition_" + str + "_dialogs_do_not_know");
      }

      for (const [k, v] of phrase_table.get(str)) {
        phrase = dialog.AddPhrase(v.name, tostring(v.id), tostring(index), -10000);

        // todo: Unreal condition?
        if (phrase !== null) {
          script = phrase.GetPhraseScript();
          script.AddPrecondition("dialog_manager.precondition_" + str + "_dialogs");
          script.AddAction("dialog_manager.action_" + str + "_dialogs");
        }
      }
    }

    dialog.AddPhrase("dm_universal_actor_exit", tostring(get_id()), tostring(j), -10000);
  }
}

/**
 * todo;
 */
function init_start_dialogs(dialog: XR_CPhraseDialog, str: string): void {
  logger.info("Init start dialogs");

  dialog.AddPhrase("", tostring(0), "", -10000);

  let phrase = dialog.AddPhrase("", tostring(1), tostring(0), -10000);
  let script: XR_CPhraseScript = phrase.GetPhraseScript();

  script.AddAction(string.format("dialog_manager.fill_priority_%s_table", str));

  let ph = false;

  for (const [k, v] of phrase_table.get(str)) {
    ph = true;

    phrase = dialog.AddPhrase(v.name, tostring(v.id), tostring(1), -10000);

    script = phrase.GetPhraseScript();
    script.AddPrecondition(string.format("dialog_manager.precondition_%s_dialogs", str));
    script.AddAction(string.format("dialog_manager.action_%s_dialogs", str));

    if (v.wounded === "true") {
      script.AddPrecondition("dialogs.is_wounded");

      const medkit_id = get_id();
      const sorry_id = get_id();
      const thanks_id = get_id();

      phrase = dialog.AddPhrase("dm_wounded_medkit", tostring(medkit_id), tostring(v.id), -10000);
      script = phrase.GetPhraseScript();
      script.AddPrecondition("dialogs.actor_have_medkit");
      script.AddAction("dialogs.transfer_medkit");
      script.AddAction("dialogs.break_dialog");
      phrase = dialog.AddPhrase("dm_wounded_sorry", tostring(sorry_id), tostring(v.id), -10000);
      script = phrase.GetPhraseScript();
      script.AddAction("dialogs.break_dialog");
    } else {
      script.AddPrecondition("dialogs.is_not_wounded");
    }
  }

  if (!ph) {
    logger.warn("Unexpected code reached.");
    phrase = dialog.AddPhrase(string.format("dm_%s_general", str), tostring(null), tostring(1), -10000);
  }
}

// -- Fill selected priority table
/**
 * todo;
 */
export function fill_priority_table(npc: XR_game_object, PT_subtable: TPHRTable, PRT_subtable: TPRTTable): void {
  const npc_id = npc.id();

  if (PRT_subtable.get(npc_id) === null) {
    // -- if (subtable for npc is ! set - create it
    PRT_subtable.set(npc_id, new LuaTable());
  }

  for (const [num, phrase] of PT_subtable) {
    // -- calculate priority for each phrase
    calculate_priority(PRT_subtable, phrase, npc, phrase.id);
  }
}

/**
 * todo;
 */
export function is_told(npc: XR_game_object, phrase: string): boolean {
  return priority_table.get(phrase).get(npc.id())?.told === true;
}

// -- Calculate precondition for default phrase in information dialog
/**
 * todo;
 */
export function precondition_no_more(npc: XR_game_object, str: string): boolean {
  const [pr, id] = get_highest_priority_phrase(phrase_table.get(str), priority_table.get(str), npc);

  return pr < 0 || id === 0;
}

// -- Calculate phrase's preconditions
/**
 * todo;
 */
export function precondition(
  npc: XR_game_object,
  PT_subtable: TPHRTable,
  PRT_subtable: TPRTTable,
  phrase_id: string
): boolean {
  const npcId: number = npc.id();

  if (PRT_subtable.get(npcId) && PRT_subtable.get(npcId).told && PRT_subtable.get(npcId).told === true) {
    return false;
  }

  // -- recalculate current phrase priority
  calculate_priority(PRT_subtable, PT_subtable.get(phrase_id), npc, phrase_id);

  // -- if (current phrase is with highest priority - show it
  return is_highest_priority_phrase(PT_subtable, PRT_subtable, npc, phrase_id);
}

// -- Calculate phrase priority
/**
 * todo;
 */
export function calculate_priority(
  PRT_subtable: TPRTTable,
  PTID_subtable: IPhrasesDescriptor,
  npc: XR_game_object,
  phrase_id: string
): number {
  let f_level = false;
  let f_comm = false;
  let priority: number = -1;
  const npc_id = npc.id();

  if (PTID_subtable.npc_community === "not_set") {
    f_comm = true;
  } else if (PTID_subtable.npc_community.get(1) === "all") {
    priority = priority + 1;
    f_comm = true;
  } else {
    for (const i of $range(1, PTID_subtable.npc_community.length())) {
      if (PTID_subtable.npc_community.get(i) === getCharacterCommunity(npc)) {
        priority = priority + 2;
        f_comm = true;
        break;
      }
    }

    priority = priority - 1;
  }

  if (PTID_subtable.level === "not_set") {
    f_level = true;
  } else if (PTID_subtable.level.get(1) === "all") {
    priority = priority + 1;
    f_level = true;
  } else {
    for (const i of $range(1, PTID_subtable.level.length())) {
      if (PTID_subtable.level.get(i) === level.name()) {
        priority = priority + 2;
        f_level = true;
        break;
      }
    }
  }

  if (PTID_subtable.actor_community === "not_set") {
    priority = priority + 0;
  } else if (PTID_subtable.actor_community === "all") {
    priority = priority + 1;
  } else {
    for (const i of $range(1, PTID_subtable.actor_community.length())) {
      if (PTID_subtable.actor_community.get(i) === getCharacterCommunity(registry.actor)) {
        priority = priority + 2;
        break;
      }
    }
  }

  if (PTID_subtable.wounded === "true") {
    // --if (!(ActionWoundManager.is_heavy_wounded_by_id(npc.id())) {
    if (!isObjectWounded(npc)) {
      priority = -1;
    } else {
      priority = priority + 1;
    }
  } else {
    // --if(ActionWoundManager.is_heavy_wounded_by_id(npc.id())) {
    if (isObjectWounded(npc)) {
      priority = -1;
    } else {
      priority = priority + 1;
    }
  }

  if (f_comm === false || f_level === false) {
    priority = -1;
  }

  if (PRT_subtable.get(npc.id()).get("ignore_once") !== null) {
    if (PTID_subtable.once === "true") {
      priority = -1;
    }
  }

  if (PRT_subtable.get(npc_id).get(phrase_id) !== null && PRT_subtable.get(npc_id).get(phrase_id) === 255) {
    priority = 255;
  }

  for (const [k, v] of PTID_subtable.info) {
    if (v.name) {
      if (v.required === true) {
        if (!hasAlifeInfo(v.name)) {
          priority = -1;
          break;
        }
      } else {
        if (hasAlifeInfo(v.name)) {
          priority = -1;
          break;
        }
      }
    }
  }

  PRT_subtable.get(npc_id).set(phrase_id, priority);

  return priority;
}

// -- Set phrase end action
/**
 * todo;
 */
export function told(PRT_subtable: TPRTTable, npc: XR_game_object): void {
  PRT_subtable.get(npc.id()).told = true;
}

/**
 * todo;
 */
export function action(
  PT_subtable: LuaTable<string, IPhrasesDescriptor>,
  PRT_subtable: TPRTTable,
  cur_phrase_id: string,
  npc: XR_game_object
) {
  if (!PRT_subtable.get(npc.id()).ignore_once) {
    if (PT_subtable.get(cur_phrase_id).once === "true") {
      set_phrase_highest_priority(PRT_subtable, npc.id(), cur_phrase_id);
    }

    PRT_subtable.get(npc.id()).ignore_once = true;
  }
}

// -- Set the highest priority to selected phrase
/**
 * todo;
 */
export function set_phrase_highest_priority(PRT_subtable: TPRTTable, npcId: number, phrase_id: string) {
  if (PRT_subtable.get(npcId) === null) {
    PRT_subtable.set(npcId, new LuaTable());
  }

  PRT_subtable.get(npcId).set(phrase_id, 255);
}

// -- Reset phrase priority
/**
 * todo;
 */
export function reset_phrase_priority(
  PT_subtable: TPHRTable,
  PRT_subtable: TPRTTable,
  npc: XR_game_object,
  phrase_id: Optional<string>
): void {
  const npcId: number = npc.id();

  if (phrase_id === null) {
    logger.warn("Null provided for reset_phrase_priority");
  }

  if (PRT_subtable.get(npcId) !== null) {
    PRT_subtable.get(npcId).set(phrase_id!, -1);
  } else {
    PRT_subtable.set(npcId, new LuaTable());
    PRT_subtable.get(npcId).set(
      phrase_id!,
      calculate_priority(PRT_subtable, PT_subtable.get(phrase_id!), npc, phrase_id!)
    );
  }
}

// -- Is the phrase priority the highest?
/**
 * todo;
 */
export function is_highest_priority_phrase(
  PT_subtable: TPHRTable,
  PRT_subtable: TPRTTable,
  npc: XR_game_object,
  phrase_id: string
) {
  const npcId = npc.id();

  if (PRT_subtable.get(npcId) !== null) {
    const pr = PRT_subtable.get(npcId).get(phrase_id);

    if (pr < 0) {
      return false;
    }

    for (const [phr_id, priority] of PRT_subtable.get(npcId)) {
      if (phr_id !== "ignore_once" && phr_id !== "told") {
        if (priority > pr) {
          return false;
        }
      }
    }

    return true;
  } else {
    reset_phrase_priority(PT_subtable, PRT_subtable, npc, phrase_id);

    return false;
  }
}

/**
 * todo;
 */
// -- Get the phrase with the highest priority
export function get_highest_priority_phrase(
  PT_subtable: TPHRTable,
  PRT_subtable: TPRTTable,
  npc: XR_game_object
): LuaMultiReturn<[number, string | 0]> {
  const npc_id = npc.id();

  if (PRT_subtable.get(npc_id) !== null) {
    let id: string | 0 = 0;
    let pr: number = -1;

    for (const [phr_id, priority] of PRT_subtable.get(npc_id)) {
      if (phr_id !== "ignore_once" && phr_id !== "told") {
        if (priority > pr) {
          pr = priority;
          id = phr_id;
        }
      }
    }

    return $multi(pr, id);
  } else {
    reset_phrase_priority(PT_subtable, PRT_subtable, npc, null);

    return $multi(-1, 0);
  }
}

/**
 * todo;
 */
export function init_hello_dialogs(dialog: XR_CPhraseDialog): void {
  init_start_dialogs(dialog, "hello");
}

// -- Fill phrase priority table for hello start dialog
/**
 * todo;
 */
export function fill_priority_hello_table(
  actor: XR_game_object,
  npc: XR_game_object,
  dialog_name: string,
  phrase_id: string
): void {
  fill_priority_table(npc, phrase_table.get("hello"), priority_table.get("hello"));
}

// -- Fill phrase priority table for new dialog
/**
 * todo;
 */
export function fill_priority_job_table(
  actor: XR_game_object,
  npc: XR_game_object,
  dialog_name: string,
  phrase_id: string
): void {
  fill_priority_table(npc, phrase_table.get("job"), priority_table.get("job"));
}

/**
 * todo;
 */
export function fill_priority_anomalies_table(
  actor: XR_game_object,
  npc: XR_game_object,
  dialog_name: string,
  phrase_id: string
): void {
  fill_priority_table(npc, phrase_table.get("anomalies"), priority_table.get("anomalies"));
}

/**
 * todo;
 */
export function fill_priority_information_table(
  actor: XR_game_object,
  npc: XR_game_object,
  dialog_name: string,
  phrase_id: string
): void {
  fill_priority_table(npc, phrase_table.get("information"), priority_table.get("information"));
}

// -- Calculate precondition for phrases in hello start dialog
/**
 * todo;
 */
export function precondition_hello_dialogs(
  npc: XR_game_object,
  actor: XR_game_object,
  dialog_name: string,
  parent_id: string,
  id: string
): boolean {
  return precondition(npc, phrase_table.get("hello"), priority_table.get("hello"), id);
}

// -- Set phrase end action for hello start dialog
/**
 * todo;
 */
export function action_hello_dialogs(
  npc: XR_game_object,
  actor: XR_game_object,
  dialog_name: string,
  id: string
): void {
  action(phrase_table.get("hello"), priority_table.get("hello"), id, npc);
}

// -- Calculate precondition for default phrase in occupation dialog
/**
 * todo;
 */
export function precondition_job_dialogs_no_more(
  npc: XR_game_object,
  actor: XR_game_object,
  dialog_name: string,
  parent_id: string,
  id: string
) {
  return is_told(npc, "job");
}

/**
 * todo;
 */
export function precondition_job_dialogs_do_not_know(
  npc: XR_game_object,
  actor: XR_game_object,
  dialog_name: string,
  parent_id: string,
  id: string
) {
  return precondition_no_more(npc, "job");
}

// -- Calculate preconditions for phrases in occupation dialog
/**
 * todo;
 */
export function precondition_job_dialogs(
  npc: XR_game_object,
  actor: XR_game_object,
  dialog_name: string,
  parent_id: string,
  id: string
): boolean {
  return precondition(npc, phrase_table.get("job"), priority_table.get("job"), id);
}

// -- Set phrase } action for occupation dialog
/**
 * todo;
 */
export function action_job_dialogs(npc: XR_game_object, actor: XR_game_object, dialog_name: string, id: string): void {
  action(phrase_table.get("job"), priority_table.get("job"), id, npc);
  told(priority_table.get("job"), npc);
}

// -- Calculate precondition for default phrase in anomalies dialog
/**
 * todo;
 */
export function precondition_anomalies_dialogs_no_more(
  npc: XR_game_object,
  actor: XR_game_object,
  dialog_name: string,
  parent_id: string,
  id: string
): boolean {
  return is_told(npc, "anomalies");
}

/**
 * todo;
 */
export function precondition_anomalies_dialogs_do_not_know(
  npc: XR_game_object,
  actor: XR_game_object,
  dialog_name: string,
  parent_id: string,
  id: string
): boolean {
  return precondition_no_more(npc, "anomalies");
}

// -- Calculate preconditions for phrases in anomalies dialog
/**
 * todo;
 */
export function precondition_anomalies_dialogs(
  npc: XR_game_object,
  actor: XR_game_object,
  dialog_name: string,
  parent_id: string,
  id: string
): boolean {
  const smart = getObjectBoundSmart(npc);

  if (smart !== null && tostring(smart.name()) === phrase_table.get("anomalies").get(id).smart) {
    priority_table.get("anomalies").get(npc.id()).id = -1;

    return false;
  }

  return precondition(npc, phrase_table.get("anomalies"), priority_table.get("anomalies"), id);
}

// -- Set phrase end action for information dialog
/**
 * todo;
 */
export function action_anomalies_dialogs(
  npc: XR_game_object,
  actor: XR_game_object,
  dialog_name: string,
  id: string
): void {
  action(phrase_table.get("anomalies"), priority_table.get("anomalies"), id, npc);
  told(priority_table.get("anomalies"), npc);
}

// -- Calculate precondition for default phrase in information dialog
/**
 * todo;
 */
export function precondition_information_dialogs_no_more(
  npc: XR_game_object,
  actor: XR_game_object,
  dialog_name: string,
  parent_id: string,
  id: string
): boolean {
  return is_told(npc, "information");
}

/**
 * todo;
 */
export function precondition_information_dialogs_do_not_know(
  npc: XR_game_object,
  actor: XR_game_object,
  dialog_name: string,
  parent_id: string,
  id: string
): boolean {
  return precondition_no_more(npc, "information");
}

// -- Calculate preconditions for phrases in information dialog
/**
 * todo;
 */
export function precondition_information_dialogs(
  npc: XR_game_object,
  actor: XR_game_object,
  dialog_name: string,
  parent_id: string,
  id: string
): boolean {
  return precondition(npc, phrase_table.get("information"), priority_table.get("information"), id);
}

/**
 * todo;
 */
export function action_information_dialogs(
  npc: XR_game_object,
  actor: XR_game_object,
  dialog_name: string,
  id: string
): void {
  action(phrase_table.get("information"), priority_table.get("information"), id, npc);
  told(priority_table.get("information"), npc);
}

/**
 * todo;
 */
export function precondition_is_phrase_disabled(
  fs: XR_game_object,
  ss: XR_game_object,
  dialogName: string,
  parentDialogId: string,
  phraseId: string
) {
  const npc = getNpcSpeaker(fs, ss);

  if (phraseId === "") {
    phraseId = dialogName;
  }

  if (
    (disabled_phrases.get(npc.id()) && disabled_phrases.get(npc.id()).get(phraseId)) ||
    (quest_disabled_phrases.get(npc.id()) && quest_disabled_phrases.get(npc.id()).get(phraseId))
  ) {
    return false;
  } else {
    return true;
  }
}

/**
 * todo;
 */
export function action_disable_phrase(
  fs: XR_game_object,
  ss: XR_game_object,
  dialogName: string,
  phraseId: string
): void {
  const npc = getNpcSpeaker(fs, ss);

  if (phraseId === "0") {
    phraseId = dialogName;
  }

  if (disabled_phrases.get(npc.id()) === null) {
    disabled_phrases.set(npc.id(), new LuaTable());
  }

  disabled_phrases.get(npc.id()).set(phraseId, true);
}

/**
 * todo;
 */
export function action_disable_quest_phrase(
  fs: XR_game_object,
  ss: XR_game_object,
  dialogName: string,
  phraseId: string
): void {
  const npc = getNpcSpeaker(fs, ss);

  if (phraseId === "0") {
    phraseId = dialogName;
  }

  if (quest_disabled_phrases.get(npc.id()) === null) {
    quest_disabled_phrases.set(npc.id(), new LuaTable());
  }

  quest_disabled_phrases.get(npc.id()).set(phraseId, true);
}

/**
 * todo;
 */
export function create_bye_phrase(): string {
  if (rnd === 0) {
    rnd = math.random(1, 99);
  }

  if (rnd >= 66) {
    return game.translate_string(captions.actor_break_dialog_1);
  } else if (rnd >= 33) {
    return game.translate_string(captions.actor_break_dialog_2);
  } else {
    return game.translate_string(captions.actor_break_dialog_3);
  }
}

/**
 * todo;
 */
export function uni_dialog_precond(first_speaker: XR_game_object, second_speaker: XR_game_object): boolean {
  const npc = getNpcSpeaker(first_speaker, second_speaker);
  const community: TCommunity = getCharacterCommunity(npc);

  return (
    community === communities.stalker ||
    community === communities.bandit ||
    community === communities.freedom ||
    community === communities.dolg
  );
}
