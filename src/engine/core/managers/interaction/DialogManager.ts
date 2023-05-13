import { level, TXR_net_processor, XR_CPhraseDialog, XR_CPhraseScript, XR_game_object, XR_net_packet } from "xray16";

import { closeLoadMarker, closeSaveMarker, DIALOG_MANAGER_LTX, openSaveMarker, registry } from "@/engine/core/database";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { AbstractCoreManager } from "@/engine/core/managers/base/AbstractCoreManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { abort } from "@/engine/core/utils/assertion";
import { isObjectWounded } from "@/engine/core/utils/check/check";
import { hasAlifeInfo } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getCharacterCommunity } from "@/engine/core/utils/object";
import { parseInfoPortions1, parseStringsList } from "@/engine/core/utils/parse";
import { FALSE, TRUE } from "@/engine/lib/constants/words";
import { LuaArray, Optional, TName, TNumberId, TRate, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export interface IPhrasesDescriptor {
  id: TStringId;
  name: TName;
  npc_community: LuaArray<any> | "not_set";
  level: LuaArray<any> | "not_set";
  actor_community: LuaArray<any> | "not_set" | "all";
  wounded: string;
  once: string;
  info: LuaTable;
  smart: Optional<string>;
  told?: boolean;
}

/**
 * todo;
 */
export type TPHRTable = LuaTable<string, IPhrasesDescriptor>;

/**
 * todo;
 */
export type TPRTTable = LuaTable<
  number,
  LuaTable<string, number> & { told?: boolean; ignore_once?: Optional<boolean>; id?: -1 }
>;

/**
 * todo;
 */
export class DialogManager extends AbstractCoreManager {
  private static ID_COUNTER: TNumberId = 5;

  private getNextPhraseId(): TNumberId {
    return ++DialogManager.ID_COUNTER;
  }

  // -- temporary table of phrases which have been disabled during a conversation
  public disabledPhrases: LuaTable<TNumberId, LuaTable<string, boolean>> = new LuaTable();
  // -- temporary table of phrases which have been disabled during a conversation | npc id -> phrase id -> boolean
  public questDisabledPhrases: LuaTable<TNumberId, LuaTable<string, boolean>> = new LuaTable();

  public phrasesMap: LuaTable<TName, TPHRTable> = $fromObject<TName, TPHRTable>({
    hello: new LuaTable(),
    job: new LuaTable(),
    anomalies: new LuaTable(),
    place: new LuaTable(),
    information: new LuaTable(),
  });

  public priority_table: LuaTable<TName, TPRTTable> = $fromObject<TName, TPRTTable>({
    hello: new LuaTable(),
    job: new LuaTable(),
    anomalies: new LuaTable(),
    place: new LuaTable(),
    information: new LuaTable(),
  });

  /**
   * todo;
   */
  public override initialize(): void {
    logger.info("Fill phrases table");

    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.NPC_INTERACTION, this.onInteractWithObject, this);

    let category = "";

    for (const it of $range(0, DIALOG_MANAGER_LTX.line_count("list") - 1)) {
      const [temp1, id, temp2] = DIALOG_MANAGER_LTX.r_line("list", it, "", "");

      if (DIALOG_MANAGER_LTX.line_exist(id, "category")) {
        category = DIALOG_MANAGER_LTX.r_string(id, "category");

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
          id: tostring(this.getNextPhraseId()),
          name: id,
          npc_community: DIALOG_MANAGER_LTX.line_exist(id, "npc_community")
            ? parseStringsList(DIALOG_MANAGER_LTX.r_string(id, "npc_community"))
            : "not_set",
          level: DIALOG_MANAGER_LTX.line_exist(id, "level")
            ? parseStringsList(DIALOG_MANAGER_LTX.r_string(id, "level"))
            : "not_set",
          actor_community: DIALOG_MANAGER_LTX.line_exist(id, "actor_community")
            ? parseStringsList(DIALOG_MANAGER_LTX.r_string(id, "actor_community"))
            : "not_set",
          wounded: DIALOG_MANAGER_LTX.line_exist(id, "wounded") ? DIALOG_MANAGER_LTX.r_string(id, "wounded") : FALSE,
          once: DIALOG_MANAGER_LTX.line_exist(id, "once") ? DIALOG_MANAGER_LTX.r_string(id, "once") : "always",
          info: new LuaTable(),
          smart: null as Optional<string>,
        };

        if (DIALOG_MANAGER_LTX.line_exist(id, "info") && DIALOG_MANAGER_LTX.r_string(id, "info") !== "") {
          parseInfoPortions1(phrases.info, DIALOG_MANAGER_LTX.r_string(id, "info"));
        }

        if (category === "anomalies" || category === "place") {
          if (DIALOG_MANAGER_LTX.line_exist(id, "smart")) {
            phrases.smart = DIALOG_MANAGER_LTX.r_string(id, "smart");
          } else {
            phrases.smart = "";
          }
        }

        this.phrasesMap.get(category).set(phrases.id, phrases);
      }
    }
  }

  public initializeNewDialog(dialog: XR_CPhraseDialog): void {
    logger.info("Init new dialog");

    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.unregisterCallback(EGameEvent.NPC_INTERACTION, this.onInteractWithObject);

    const actor_table: LuaArray<TName> = $fromArray(["job", "anomalies", "information"]);
    const start_phrase_table: LuaArray<TName> = $fromArray([
      "dm_universal_npc_start_0",
      "dm_universal_npc_start_1",
      "dm_universal_npc_start_2",
      "dm_universal_npc_start_3",
    ]);
    const precond_table: LuaArray<TName> = $fromArray([
      "dialogs.npc_stalker",
      "dialogs.npc_bandit",
      "dialogs.npc_freedom",
      "dialogs.npc_dolg",
    ]);

    const actorPhrase = dialog.AddPhrase("dm_universal_actor_start", tostring(0), "", -10000);
    const actorScript = actorPhrase.GetPhraseScript();

    for (const j of $range(1, 4)) {
      const npc_phrase = dialog.AddPhrase(start_phrase_table.get(j), tostring(j), tostring(0), -10000);
      const npc_phrase_script = npc_phrase.GetPhraseScript();

      npc_phrase_script.AddPrecondition(precond_table.get(j));

      for (const i of $range(1, actor_table.length())) {
        const index = this.getNextPhraseId();
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
            tostring(this.getNextPhraseId()),
            tostring(index),
            -10000
          );
          const script_no_more = answer_no_more.GetPhraseScript();

          script_no_more.AddPrecondition("dialog_manager.precondition_" + str + "_dialogs_no_more");

          const answer_do_not_know = dialog.AddPhrase(
            "dm_" + str + "_do_not_know_" + tostring(k),
            tostring(this.getNextPhraseId()),
            tostring(index),
            -10000
          );
          const script_do_not_know = answer_do_not_know.GetPhraseScript();

          script_do_not_know.AddPrecondition("dialog_manager.precondition_" + str + "_dialogs_do_not_know");
        }

        for (const [k, v] of this.phrasesMap.get(str)) {
          phrase = dialog.AddPhrase(v.name, tostring(v.id), tostring(index), -10000);

          // todo: Unreal condition?
          if (phrase !== null) {
            script = phrase.GetPhraseScript();
            script.AddPrecondition("dialog_manager.precondition_" + str + "_dialogs");
            script.AddAction("dialog_manager.action_" + str + "_dialogs");
          }
        }
      }

      dialog.AddPhrase("dm_universal_actor_exit", tostring(this.getNextPhraseId()), tostring(j), -10000);
    }
  }

  /**
   * todo;
   */
  public initializeStartDialogs(dialog: XR_CPhraseDialog, data: string): void {
    logger.info("Initialize start dialogs");

    dialog.AddPhrase("", tostring(0), "", -10000);

    let phrase = dialog.AddPhrase("", tostring(1), tostring(0), -10000);
    let script: XR_CPhraseScript = phrase.GetPhraseScript();

    script.AddAction(string.format("dialog_manager.fill_priority_%s_table", data));

    let ph = false;

    for (const [k, v] of this.phrasesMap.get(data)) {
      ph = true;

      phrase = dialog.AddPhrase(v.name, tostring(v.id), tostring(1), -10000);

      script = phrase.GetPhraseScript();
      script.AddPrecondition(string.format("dialog_manager.precondition_%s_dialogs", data));
      script.AddAction(string.format("dialog_manager.action_%s_dialogs", data));

      if (v.wounded === TRUE) {
        script.AddPrecondition("dialogs.is_wounded");

        const medkit_id: TNumberId = this.getNextPhraseId();
        const sorry_id: TNumberId = this.getNextPhraseId();

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
      phrase = dialog.AddPhrase(string.format("dm_%s_general", data), tostring(null), tostring(1), -10000);
    }
  }

  /**
   * todo;
   */
  public fillPriorityTable(object: XR_game_object, PT_subtable: TPHRTable, PRT_subtable: TPRTTable): void {
    const objectId: TNumberId = object.id();

    if (PRT_subtable.get(objectId) === null) {
      // -- if (subtable for npc is ! set - create it
      PRT_subtable.set(objectId, new LuaTable());
    }

    for (const [num, phrase] of PT_subtable) {
      // Calculate priority for each phrase
      this.calculatePhrasePriority(PRT_subtable, phrase, object, phrase.id);
    }
  }

  /**
   * todo;
   */
  public calculatePhrasePriority(
    PRT_subtable: TPRTTable,
    PTID_subtable: IPhrasesDescriptor,
    object: XR_game_object,
    phraseId: TStringId
  ): TRate {
    const objectId: TNumberId = object.id();

    let f_level = false;
    let f_comm = false;
    let priority: number = -1;

    if (PTID_subtable.npc_community === "not_set") {
      f_comm = true;
    } else if (PTID_subtable.npc_community.get(1) === "all") {
      priority = priority + 1;
      f_comm = true;
    } else {
      for (const i of $range(1, PTID_subtable.npc_community.length())) {
        if (PTID_subtable.npc_community.get(i) === getCharacterCommunity(object)) {
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

    if (PTID_subtable.wounded === TRUE) {
      // --if (!(ActionWoundManager.is_heavy_wounded_by_id(npc.id())) {
      if (!isObjectWounded(object)) {
        priority = -1;
      } else {
        priority = priority + 1;
      }
    } else {
      // --if(ActionWoundManager.is_heavy_wounded_by_id(npc.id())) {
      if (isObjectWounded(object)) {
        priority = -1;
      } else {
        priority = priority + 1;
      }
    }

    if (f_comm === false || f_level === false) {
      priority = -1;
    }

    if (PRT_subtable.get(object.id()).get("ignore_once") !== null) {
      if (PTID_subtable.once === TRUE) {
        priority = -1;
      }
    }

    if (PRT_subtable.get(objectId).get(phraseId) !== null && PRT_subtable.get(objectId).get(phraseId) === 255) {
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

    PRT_subtable.get(objectId).set(phraseId, priority);

    return priority;
  }

  /**
   * todo;
   */
  public isTold(object: XR_game_object, phrase: TStringId): boolean {
    return this.priority_table.get(phrase).get(object.id())?.told === true;
  }

  /**
   * todo;
   */
  public resetForObject(object: XR_game_object): void {
    this.disabledPhrases.delete(object.id());
  }

  /**
   * todo;
   */
  public saveObjectDialogs(packet: XR_net_packet, object: XR_game_object): void {
    openSaveMarker(packet, DialogManager.name);

    const objectId: TNumberId = object.id();

    packet.w_bool(this.priority_table.get("hello").get(objectId) !== null);
    packet.w_bool(this.priority_table.get("job").get(objectId) !== null);
    packet.w_bool(this.priority_table.get("anomalies").get(objectId) !== null);
    packet.w_bool(this.priority_table.get("place").get(objectId) !== null);
    packet.w_bool(this.priority_table.get("information").get(objectId) !== null);

    closeSaveMarker(packet, DialogManager.name);
  }

  /**
   * todo;
   */
  public loadObjectDialogs(reader: TXR_net_processor, object: XR_game_object): void {
    openLoadMarker(reader, DialogManager.name);

    reader.r_bool();
    reader.r_bool();
    reader.r_bool();
    reader.r_bool();
    reader.r_bool();

    closeLoadMarker(reader, DialogManager.name);
  }

  /**
   * On interaction with new game object.
   */
  public onInteractWithObject(object: XR_game_object, who: XR_game_object): void {
    registry.activeSpeaker = object;
  }
}
