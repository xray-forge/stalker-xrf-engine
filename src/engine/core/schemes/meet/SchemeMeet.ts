import { game_object, stalker_ids, world_property } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { AbstractScheme, EActionId, EEvaluatorId } from "@/engine/core/schemes";
import { SchemeAbuse } from "@/engine/core/schemes/abuse/SchemeAbuse";
import { SchemeCorpseDetection } from "@/engine/core/schemes/corpse_detection/SchemeCorpseDetection";
import { SchemeHelpWounded } from "@/engine/core/schemes/help_wounded/SchemeHelpWounded";
import { ActionMeetWait } from "@/engine/core/schemes/meet/actions";
import { EvaluatorContact } from "@/engine/core/schemes/meet/evaluators";
import { ISchemeMeetState } from "@/engine/core/schemes/meet/ISchemeMeetState";
import { MeetManager } from "@/engine/core/schemes/meet/MeetManager";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded";
import { isObjectWounded } from "@/engine/core/utils/check/check";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { readIniString } from "@/engine/core/utils/ini/getters";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList } from "@/engine/core/utils/parse";
import { getObjectsRelationSafe } from "@/engine/core/utils/relation";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import { FALSE, NIL, TRUE } from "@/engine/lib/constants/words";
import {
  ActionPlanner,
  AnyObject,
  ClientObject,
  EScheme,
  ESchemeType,
  IniFile,
  Optional,
  TName,
  TSection,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class SchemeMeet extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.MEET;
  public static readonly SCHEME_SECTION_ACTOR_DIALOGS: EScheme = EScheme.ACTOR_DIALOGS;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * todo: Description.
   */
  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    AbstractScheme.assign(object, ini, scheme, section);
  }

  /**
   * todo: Description.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMeetState
  ): void {
    const actionPlanner: ActionPlanner = object.motivation_action_manager();

    // Evaluators:
    actionPlanner.add_evaluator(EEvaluatorId.IS_MEET_CONTACT, new EvaluatorContact(state));

    // Actions:
    const actionMeetWait: ActionMeetWait = new ActionMeetWait(state);

    actionMeetWait.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionMeetWait.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionMeetWait.add_precondition(new world_property(stalker_ids.property_danger, false));
    actionMeetWait.add_precondition(new world_property(stalker_ids.property_anomaly, false));

    actionMeetWait.add_precondition(new world_property(stalker_ids.property_items, false));
    actionMeetWait.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED_EXISTING, false));
    actionMeetWait.add_precondition(new world_property(EEvaluatorId.IS_CORPSE_EXISTING, false));

    actionMeetWait.add_precondition(new world_property(EEvaluatorId.IS_MEET_CONTACT, true));
    actionMeetWait.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED, false));
    actionMeetWait.add_precondition(new world_property(EEvaluatorId.IS_ABUSED, false));
    actionMeetWait.add_effect(new world_property(EEvaluatorId.IS_MEET_CONTACT, false));
    actionPlanner.add_action(EActionId.MEET_WAITING_ACTIVITY, actionMeetWait);

    actionPlanner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.IS_MEET_CONTACT, false));

    actionPlanner
      .action(EActionId.STATE_TO_IDLE_ALIFE)
      .add_precondition(new world_property(EEvaluatorId.IS_MEET_CONTACT, false));

    state.meetManager = new MeetManager(object, state);

    SchemeMeet.subscribe(object, state, state.meetManager);
  }

  /**
   * todo: Description.
   */
  public static override reset(
    object: ClientObject,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    const meetSection: TSection =
      scheme === null || scheme === NIL
        ? readIniString(state.ini, state.section_logic, SchemeMeet.SCHEME_SECTION, false, "")
        : readIniString(state.ini, section, SchemeMeet.SCHEME_SECTION, false, "");

    SchemeMeet.initializeMeetScheme(object, state.ini, meetSection, state.meet as ISchemeMeetState, scheme);
  }

  /**
   * todo: Description.
   */
  public static override disable(object: ClientObject, scheme: EScheme): void {
    const state: IRegistryObjectState = registry.objects.get(object.id());

    state[EScheme.ACTOR_DIALOGS] = null;
  }

  /**
   * todo: Description.
   */
  public static initializeMeetScheme(
    object: ClientObject,
    ini: IniFile,
    section: TSection,
    state: ISchemeMeetState,
    scheme: EScheme
  ): void {
    if (tostring(section) === state.meet_section && tostring(section) !== NIL) {
      return;
    }

    state.meet_section = tostring(section);

    const def: AnyObject = {};
    const relation = getObjectsRelationSafe(object, registry.actor);

    if (relation === game_object.enemy) {
      def.close_distance = "0";
      def.close_anim = NIL;
      def.close_snd_distance = "0";
      def.close_snd_hello = NIL;
      def.close_snd_bye = NIL;
      def.close_victim = NIL;
      def.far_distance = "0";
      def.far_anim = NIL;
      def.far_snd_distance = "0";
      def.far_snd = NIL;
      def.far_victim = NIL;
      def.snd_on_use = NIL;
      def.use = FALSE;
      def.meet_dialog = NIL;
      def.abuse = FALSE;
      def.trade_enable = TRUE;
      def.allow_break = TRUE;
      def.meet_on_talking = FALSE;
      def.use_text = NIL;
    } else {
      def.close_distance = "{=is_wounded} 0, {!is_squad_commander} 0, 3";
      def.close_anim = "{=is_wounded} nil, {!is_squad_commander} nil, {=actor_has_weapon} threat_na, talk_default";
      def.close_snd_distance = "{=is_wounded} 0, {!is_squad_commander} 0, 3";
      def.close_snd_hello =
        "{=is_wounded} nil, {!is_squad_commander} nil, {=actor_enemy} nil," +
        " {=actor_has_weapon} meet_hide_weapon, meet_hello";
      def.close_snd_bye =
        "{=is_wounded} nil, {!is_squad_commander} nil, {=actor_enemy} nil, {=actor_has_weapon} nil, meet_hello";
      def.close_victim = "{=is_wounded} nil, {!is_squad_commander} nil, actor";
      def.far_distance = "{=is_wounded} 0, {!is_squad_commander} 0, 5";
      def.far_anim = NIL;
      def.far_snd_distance = "{=is_wounded} 0, {!is_squad_commander} 0, 5";
      def.far_snd = NIL;
      def.far_victim = NIL;
      def.snd_on_use =
        "{=is_wounded} nil, {!is_squad_commander} meet_use_no_talk_leader, {=actor_enemy} nil," +
        " {=has_enemy} meet_use_no_fight, {=actor_has_weapon} meet_use_no_weapon, {!dist_to_actor_le(3)} v";
      def.use =
        "{=is_wounded} false, {!is_squad_commander} false, {=actor_enemy} false, {=has_enemy} false," +
        " {=actor_has_weapon} false, {=dist_to_actor_le(3)} true, false";
      def.meet_dialog = NIL;
      def.abuse = "{=has_enemy} false, true";
      def.trade_enable = TRUE;
      def.allow_break = TRUE;
      def.meet_on_talking = TRUE;
      def.use_text = NIL;
    }

    if (tostring(section) === "no_meet") {
      state.close_distance = parseConditionsList("0");
      state.close_anim = parseConditionsList(NIL);
      state.close_snd_distance = parseConditionsList("0");
      state.close_snd_hello = parseConditionsList(NIL);
      state.close_snd_bye = parseConditionsList(NIL);
      state.close_victim = parseConditionsList(NIL);

      state.far_distance = parseConditionsList("0");
      state.far_anim = parseConditionsList(NIL);
      state.far_snd_distance = parseConditionsList("0");
      state.far_snd = parseConditionsList(NIL);
      state.far_victim = parseConditionsList(NIL);

      state.snd_on_use = parseConditionsList(NIL);
      state.use = parseConditionsList(FALSE);
      state.meet_dialog = parseConditionsList(NIL);
      state.abuse = parseConditionsList(FALSE);
      state.trade_enable = parseConditionsList(TRUE);
      state.allow_break = parseConditionsList(TRUE);
      state.meet_on_talking = parseConditionsList(FALSE);
      state.use_text = parseConditionsList(NIL);

      state.reset_distance = logicsConfig.MEET_RESET_DISTANCE;
      state.meet_only_at_path = true;
    } else {
      state.close_distance = parseConditionsList(
        readIniString(ini, section, "close_distance", false, "", def.close_distance)
      );
      state.close_anim = parseConditionsList(readIniString(ini, section, "close_anim", false, "", def.close_anim));
      state.close_snd_distance = parseConditionsList(
        readIniString(ini, section, "close_snd_distance", false, "", def.close_distance)
      );
      state.close_snd_hello = parseConditionsList(
        readIniString(ini, section, "close_snd_hello", false, "", def.close_snd_hello)
      );
      state.close_snd_bye = parseConditionsList(
        readIniString(ini, section, "close_snd_bye", false, "", def.close_snd_bye)
      );
      state.close_victim = parseConditionsList(
        readIniString(ini, section, "close_victim", false, "", def.close_victim)
      );

      state.far_distance = parseConditionsList(
        readIniString(ini, section, "far_distance", false, "", def.far_distance)
      );
      state.far_anim = parseConditionsList(readIniString(ini, section, "far_anim", false, "", def.far_anim));
      state.far_snd_distance = parseConditionsList(
        readIniString(ini, section, "far_snd_distance", false, "", def.far_snd_distance)
      );
      state.far_snd = parseConditionsList(readIniString(ini, section, "far_snd", false, "", def.far_snd));
      state.far_victim = parseConditionsList(readIniString(ini, section, "far_victim", false, "", def.far_victim));

      state.snd_on_use = parseConditionsList(readIniString(ini, section, "snd_on_use", false, "", def.snd_on_use));
      state.use = parseConditionsList(readIniString(ini, section, "use", false, "", def.use));
      state.meet_dialog = parseConditionsList(readIniString(ini, section, "meet_dialog", false, "", def.meet_dialog));
      state.abuse = parseConditionsList(readIniString(ini, section, "abuse", false, "", def.abuse));
      state.trade_enable = parseConditionsList(
        readIniString(ini, section, "trade_enable", false, "", def.trade_enable)
      );
      state.allow_break = parseConditionsList(readIniString(ini, section, "allow_break", false, "", def.allow_break));
      state.meet_on_talking = parseConditionsList(
        readIniString(ini, section, "meet_on_talking", false, "", def.meet_on_talking)
      );
      state.use_text = parseConditionsList(readIniString(ini, section, "use_text", false, "", def.use_text));

      state.reset_distance = logicsConfig.MEET_RESET_DISTANCE;
      state.meet_only_at_path = true;
    }

    state.meetManager.initialize();
  }

  /**
   * todo: Description.
   */
  public static updateObjectInteractionAvailability(object: ClientObject): void {
    if (isObjectWounded(object)) {
      if (object.relation(registry.actor) === game_object.enemy) {
        object.disable_talk();
      } else {
        const state: Optional<ISchemeWoundedState> = registry.objects.get(object.id())[
          EScheme.WOUNDED
        ] as ISchemeWoundedState;

        if (state.enable_talk) {
          object.enable_talk();
        } else {
          object.disable_talk();
        }
      }

      return;
    }

    const state: ISchemeMeetState = registry.objects.get(object.id())[EScheme.MEET] as ISchemeMeetState;
    const use: Optional<string> = state.meetManager.use;

    if (use === TRUE) {
      if (SchemeCorpseDetection.isUnderCorpseDetection(object) || SchemeHelpWounded.isUnderHelpWounded(object)) {
        object.disable_talk();
      } else {
        object.enable_talk();
      }
    } else if (use === FALSE) {
      object.disable_talk();
      if (object.is_talking()) {
        object.stop_talk();
      }
    }
  }

  /**
   * todo: Description.
   */
  public static onMeetWithObject(object: ClientObject): void {
    if (!object.alive()) {
      return;
    }

    const state: Optional<ISchemeMeetState> = registry.objects.get(object.id())[EScheme.MEET] as ISchemeMeetState;

    if (state === null) {
      return;
    }

    logger.info("Activate meet interaction:", object.name());

    const actor: ClientObject = registry.actor;
    const sound: Optional<TName> = pickSectionFromCondList(actor, object, state.snd_on_use);

    if (tostring(sound) !== NIL) {
      GlobalSoundManager.getInstance().playSound(object.id(), sound, null, null);
    }

    const meetManager: MeetManager = state.meetManager;

    if (
      meetManager.use === FALSE &&
      meetManager.abuseMode === TRUE &&
      getObjectsRelationSafe(object, actor) !== game_object.enemy
    ) {
      SchemeAbuse.addAbuse(object, 1);
    }
  }
}
