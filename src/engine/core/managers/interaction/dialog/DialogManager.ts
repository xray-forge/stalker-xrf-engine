import { CPhraseScript, level } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  DIALOG_MANAGER_LTX,
  openLoadMarker,
  openSaveMarker,
  registry,
} from "@/engine/core/database";
import { AbstractCoreManager } from "@/engine/core/managers/base/AbstractCoreManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import {
  EGenericDialogCategory,
  IPhrasesDescriptor,
  TPHRTable,
  TPRTTable,
} from "@/engine/core/managers/interaction/dialog/types";
import { assert } from "@/engine/core/utils/assertion";
import { parseInfoPortions, parseStringsList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getCharacterCommunity, isObjectWounded } from "@/engine/core/utils/object";
import { hasAlifeInfo } from "@/engine/core/utils/object/object_info_portion";
import { FALSE, TRUE } from "@/engine/lib/constants/words";
import {
  ClientObject,
  LuaArray,
  NetPacket,
  NetProcessor,
  Optional,
  Phrase,
  PhraseDialog,
  PhraseScript,
  TIndex,
  TName,
  TNumberId,
  TRate,
  TStringId,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

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

  public phrasesMap: LuaTable<EGenericDialogCategory, TPHRTable> = $fromObject({
    hello: new LuaTable(),
    job: new LuaTable(),
    anomalies: new LuaTable(),
    place: new LuaTable(),
    information: new LuaTable(),
  } as Record<EGenericDialogCategory, TPHRTable>);

  public priorityTable: LuaTable<EGenericDialogCategory, TPRTTable> = $fromObject({
    hello: new LuaTable(),
    job: new LuaTable(),
    anomalies: new LuaTable(),
    place: new LuaTable(),
    information: new LuaTable(),
  } as Record<EGenericDialogCategory, TPRTTable>);

  /**
   * todo;
   */
  public override initialize(): void {
    logger.info("Fill phrases table");

    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.NPC_INTERACTION, this.onInteractWithObject, this);

    for (const it of $range(0, DIALOG_MANAGER_LTX.line_count("list") - 1)) {
      const [, id] = DIALOG_MANAGER_LTX.r_line("list", it, "", "");

      assert(DIALOG_MANAGER_LTX.line_exist(id, "category"), "Dialog manager error. ! categoried section [%s].", id);

      let category: EGenericDialogCategory = DIALOG_MANAGER_LTX.r_string(id, "category") as EGenericDialogCategory;

      switch (category) {
        case EGenericDialogCategory.HELLO:
        case EGenericDialogCategory.ANOMALIES:
        case EGenericDialogCategory.PLACE:
        case EGenericDialogCategory.JOB:
        case EGenericDialogCategory.INFORMATION:
          // nothing
          break;

        default:
          category = EGenericDialogCategory.DEFAULT;
          break;
      }

      if (category !== EGenericDialogCategory.DEFAULT) {
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
          smart: null as Optional<TName>,
        };

        if (DIALOG_MANAGER_LTX.line_exist(id, "info") && DIALOG_MANAGER_LTX.r_string(id, "info") !== "") {
          parseInfoPortions(phrases.info, DIALOG_MANAGER_LTX.r_string(id, "info"));
        }

        if (category === EGenericDialogCategory.ANOMALIES || category === EGenericDialogCategory.PLACE) {
          phrases.smart = DIALOG_MANAGER_LTX.line_exist(id, "smart") ? DIALOG_MANAGER_LTX.r_string(id, "smart") : "";
        }

        this.phrasesMap.get(category).set(phrases.id, phrases);
      }
    }
  }

  public initializeNewDialog(dialog: PhraseDialog): void {
    logger.info("Init new dialog");

    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.unregisterCallback(EGameEvent.NPC_INTERACTION, this.onInteractWithObject);

    const actorTable: LuaArray<EGenericDialogCategory> = $fromArray<EGenericDialogCategory>([
      EGenericDialogCategory.JOB,
      EGenericDialogCategory.ANOMALIES,
      EGenericDialogCategory.INFORMATION,
    ]);
    const startPhraseTable: LuaArray<TName> = $fromArray([
      "dm_universal_npc_start_0",
      "dm_universal_npc_start_1",
      "dm_universal_npc_start_2",
      "dm_universal_npc_start_3",
    ]);
    const precondTable: LuaArray<TName> = $fromArray([
      "dialogs.npc_stalker",
      "dialogs.npc_bandit",
      "dialogs.npc_freedom",
      "dialogs.npc_dolg",
    ]);

    const actorPhrase: Phrase = dialog.AddPhrase("dm_universal_actor_start", tostring(0), "", -10000);
    const actorScript: PhraseScript = actorPhrase.GetPhraseScript();

    for (const j of $range(1, 4)) {
      const npcPhrase: Phrase = dialog.AddPhrase(startPhraseTable.get(j), tostring(j), tostring(0), -10000);
      const npcPhraseScript: PhraseScript = npcPhrase.GetPhraseScript();

      npcPhraseScript.AddPrecondition(precondTable.get(j));

      for (const it of $range(1, actorTable.length())) {
        const index: TIndex = this.getNextPhraseId();
        const str: string = actorTable.get(it);
        let phrase: Phrase = dialog.AddPhrase("dm_" + str + "_general", tostring(index), tostring(j), -10000);
        let script: PhraseScript = phrase.GetPhraseScript();

        if (str === EGenericDialogCategory.ANOMALIES) {
          script.AddPrecondition("dialogs.npc_stalker");
        }

        // --script.AddPrecondition("dialog_manager.precondition_is_phrase_disabled")
        script.AddAction("dialog_manager.fill_priority_" + str + "_table");
        // --script.AddAction("dialog_manager.action_disable_phrase")

        for (const k of $range(1, 3)) {
          const answerNoMore: Phrase = dialog.AddPhrase(
            "dm_" + str + "_no_more_" + tostring(k),
            tostring(this.getNextPhraseId()),
            tostring(index),
            -10000
          );
          const scriptNoMore: PhraseScript = answerNoMore.GetPhraseScript();

          scriptNoMore.AddPrecondition("dialog_manager.precondition_" + str + "_dialogs_no_more");

          const answerDoNotKnow: Phrase = dialog.AddPhrase(
            "dm_" + str + "_do_not_know_" + tostring(k),
            tostring(this.getNextPhraseId()),
            tostring(index),
            -10000
          );
          const scriptDoNotKnow: PhraseScript = answerDoNotKnow.GetPhraseScript();

          scriptDoNotKnow.AddPrecondition("dialog_manager.precondition_" + str + "_dialogs_do_not_know");
        }

        for (const [, phraseDescriptor] of this.phrasesMap.get(str as EGenericDialogCategory)) {
          phrase = dialog.AddPhrase(phraseDescriptor.name, tostring(phraseDescriptor.id), tostring(index), -10000);

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
  public initializeStartDialogs(dialog: PhraseDialog, data: EGenericDialogCategory): void {
    logger.info("Initialize start dialogs:", data);

    dialog.AddPhrase("", tostring(0), "", -10000);

    let phrase: Phrase = dialog.AddPhrase("", tostring(1), tostring(0), -10000);
    let script: CPhraseScript = phrase.GetPhraseScript();

    script.AddAction(string.format("dialog_manager.fill_priority_%s_table", data));

    let ph: boolean = false;

    for (const [, phraseDescriptor] of this.phrasesMap.get(data)) {
      ph = true;

      phrase = dialog.AddPhrase(phraseDescriptor.name, tostring(phraseDescriptor.id), tostring(1), -10000);

      script = phrase.GetPhraseScript();
      script.AddPrecondition(string.format("dialog_manager.precondition_%s_dialogs", data));
      script.AddAction(string.format("dialog_manager.action_%s_dialogs", data));

      if (phraseDescriptor.wounded === TRUE) {
        script.AddPrecondition("dialogs.is_wounded");

        const medkitId: TNumberId = this.getNextPhraseId();
        const sorryId: TNumberId = this.getNextPhraseId();

        phrase = dialog.AddPhrase("dm_wounded_medkit", tostring(medkitId), tostring(phraseDescriptor.id), -10000);
        script = phrase.GetPhraseScript();
        script.AddPrecondition("dialogs.actor_have_medkit");
        script.AddAction("dialogs.transfer_medkit");
        script.AddAction("dialogs.break_dialog");
        phrase = dialog.AddPhrase("dm_wounded_sorry", tostring(sorryId), tostring(phraseDescriptor.id), -10000);
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
  public fillPriorityTable(object: ClientObject, PTSubtable: TPHRTable, PRTSubtable: TPRTTable): void {
    const objectId: TNumberId = object.id();

    if (PRTSubtable.get(objectId) === null) {
      // -- if (subtable for npc is ! set - create it
      PRTSubtable.set(objectId, new LuaTable());
    }

    for (const [num, phrase] of PTSubtable) {
      // Calculate priority for each phrase
      this.calculatePhrasePriority(PRTSubtable, phrase, object, phrase.id);
    }
  }

  /**
   * todo;
   */
  public calculatePhrasePriority(
    PRTSubtable: TPRTTable,
    PTIDSubtable: IPhrasesDescriptor,
    object: ClientObject,
    phraseId: TStringId
  ): TRate {
    const objectId: TNumberId = object.id();

    let fLevel: boolean = false;
    let fComm: boolean = false;
    let priority: number = -1;

    if (PTIDSubtable.npc_community === "not_set") {
      fComm = true;
    } else if (PTIDSubtable.npc_community.get(1) === "all") {
      priority = priority + 1;
      fComm = true;
    } else {
      for (const i of $range(1, PTIDSubtable.npc_community.length())) {
        if (PTIDSubtable.npc_community.get(i) === getCharacterCommunity(object)) {
          priority = priority + 2;
          fComm = true;
          break;
        }
      }

      priority = priority - 1;
    }

    if (PTIDSubtable.level === "not_set") {
      fLevel = true;
    } else if (PTIDSubtable.level.get(1) === "all") {
      priority = priority + 1;
      fLevel = true;
    } else {
      for (const i of $range(1, PTIDSubtable.level.length())) {
        if (PTIDSubtable.level.get(i) === level.name()) {
          priority = priority + 2;
          fLevel = true;
          break;
        }
      }
    }

    if (PTIDSubtable.actor_community === "not_set") {
      priority = priority + 0;
    } else if (PTIDSubtable.actor_community === "all") {
      priority = priority + 1;
    } else {
      for (const i of $range(1, PTIDSubtable.actor_community.length())) {
        if (PTIDSubtable.actor_community.get(i) === getCharacterCommunity(registry.actor)) {
          priority = priority + 2;
          break;
        }
      }
    }

    if (PTIDSubtable.wounded === TRUE) {
      // --if (!(ActionWoundManager.is_heavy_wounded_by_id(npc.id())) {
      priority = isObjectWounded(object.id()) ? priority + 1 : -1;
    } else {
      // --if(ActionWoundManager.is_heavy_wounded_by_id(npc.id())) {
      priority = isObjectWounded(object.id()) ? -1 : priority + 1;
    }

    if (fComm === false || fLevel === false) {
      priority = -1;
    }

    if (PRTSubtable.get(object.id()).get("ignore_once") !== null) {
      if (PTIDSubtable.once === TRUE) {
        priority = -1;
      }
    }

    if (PRTSubtable.get(objectId).get(phraseId) !== null && PRTSubtable.get(objectId).get(phraseId) === 255) {
      priority = 255;
    }

    for (const [k, condition] of PTIDSubtable.info) {
      if (condition.name) {
        if (condition.required === true) {
          if (!hasAlifeInfo(condition.name)) {
            priority = -1;
            break;
          }
        } else {
          if (hasAlifeInfo(condition.name)) {
            priority = -1;
            break;
          }
        }
      }
    }

    PRTSubtable.get(objectId).set(phraseId, priority);

    return priority;
  }

  /**
   * todo;
   */
  public isTold(object: ClientObject, phrase: EGenericDialogCategory): boolean {
    return this.priorityTable.get(phrase).get(object.id())?.told === true;
  }

  /**
   * todo;
   */
  public resetForObject(object: ClientObject): void {
    this.disabledPhrases.delete(object.id());
  }

  /**
   * todo;
   */
  public saveObjectDialogs(packet: NetPacket, object: ClientObject): void {
    openSaveMarker(packet, DialogManager.name);

    const objectId: TNumberId = object.id();

    packet.w_bool(this.priorityTable.get(EGenericDialogCategory.HELLO).get(objectId) !== null);
    packet.w_bool(this.priorityTable.get(EGenericDialogCategory.JOB).get(objectId) !== null);
    packet.w_bool(this.priorityTable.get(EGenericDialogCategory.ANOMALIES).get(objectId) !== null);
    packet.w_bool(this.priorityTable.get(EGenericDialogCategory.PLACE).get(objectId) !== null);
    packet.w_bool(this.priorityTable.get(EGenericDialogCategory.INFORMATION).get(objectId) !== null);

    closeSaveMarker(packet, DialogManager.name);
  }

  /**
   * todo;
   */
  public loadObjectDialogs(reader: NetProcessor, object: ClientObject): void {
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
  public onInteractWithObject(object: ClientObject, who: ClientObject): void {
    registry.activeSpeaker = object;
  }
}
