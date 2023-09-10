import { world_property } from "xray16";

import { IRegistryObjectState } from "@/engine/core/database";
import { AbstractScheme } from "@/engine/core/objects/ai/scheme";
import { EActionId, EEvaluatorId } from "@/engine/core/objects/ai/types";
import { ActionMeetWait } from "@/engine/core/schemes/meet/actions";
import { EvaluatorContact } from "@/engine/core/schemes/meet/evaluators";
import { ISchemeMeetState } from "@/engine/core/schemes/meet/ISchemeMeetState";
import { MeetManager } from "@/engine/core/schemes/meet/MeetManager";
import { initializeMeetScheme } from "@/engine/core/schemes/meet/utils";
import { readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NIL } from "@/engine/lib/constants/words";
import { ActionPlanner, ClientObject, EScheme, ESchemeType, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Scheme describing logics of `meet` state.
 * Controls whether object can interact/speak with actor in different states.
 *
 * For example: cannot speak when looting corpse/helping wounded, or can implement speaking with enemy stalkers.
 */
export class SchemeMeet extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.MEET;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  /**
   * Activate meet scheme.
   */
  public static override activate(object: ClientObject, ini: IniFile, scheme: EScheme, section: TSection): void {
    AbstractScheme.assign(object, ini, scheme, section);
  }

  /**
   * Add meet scheme related actions / evaluators and state.
   */
  public static override add(
    object: ClientObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection,
    state: ISchemeMeetState
  ): void {
    const planner: ActionPlanner = object.motivation_action_manager();

    // Evaluators:
    planner.add_evaluator(EEvaluatorId.IS_MEET_CONTACT, new EvaluatorContact(state));

    // Actions:
    const actionMeetWait: ActionMeetWait = new ActionMeetWait(state);

    actionMeetWait.add_precondition(new world_property(EEvaluatorId.ALIVE, true));
    actionMeetWait.add_precondition(new world_property(EEvaluatorId.ENEMY, false));
    actionMeetWait.add_precondition(new world_property(EEvaluatorId.DANGER, false));
    actionMeetWait.add_precondition(new world_property(EEvaluatorId.ANONALY, false));
    actionMeetWait.add_precondition(new world_property(EEvaluatorId.ITEMS, false));

    actionMeetWait.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED_EXISTING, false));
    actionMeetWait.add_precondition(new world_property(EEvaluatorId.IS_CORPSE_EXISTING, false));

    actionMeetWait.add_precondition(new world_property(EEvaluatorId.IS_MEET_CONTACT, true));
    actionMeetWait.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED, false));
    actionMeetWait.add_precondition(new world_property(EEvaluatorId.IS_ABUSED, false));
    actionMeetWait.add_effect(new world_property(EEvaluatorId.IS_MEET_CONTACT, false));
    planner.add_action(EActionId.MEET_WAITING_ACTIVITY, actionMeetWait);

    planner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.IS_MEET_CONTACT, false));

    planner
      .action(EActionId.STATE_TO_IDLE_ALIFE)
      .add_precondition(new world_property(EEvaluatorId.IS_MEET_CONTACT, false));

    state.meetManager = new MeetManager(object, state);

    SchemeMeet.subscribe(object, state, state.meetManager);
  }

  /**
   * Reset scheme state and read new ini configuration based on current logics.
   */
  public static override reset(
    object: ClientObject,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    // Read meet configuration from current logics section or from provided section, if it is valid.
    const meetSection: TSection =
      scheme === null || scheme === NIL
        ? readIniString(state.ini, state.sectionLogic, SchemeMeet.SCHEME_SECTION, false, "")
        : readIniString(state.ini, section, SchemeMeet.SCHEME_SECTION, false, "");

    initializeMeetScheme(object, state.ini, meetSection, state.meet as ISchemeMeetState);
  }
}
