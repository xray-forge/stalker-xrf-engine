import { world_property } from "xray16";

import { EActionId, EEvaluatorId } from "@/engine/core/ai/planner/types";
import { AbstractScheme } from "@/engine/core/ai/scheme";
import { IRegistryObjectState } from "@/engine/core/database";
import { ActionMeetWait } from "@/engine/core/schemes/stalker/meet/actions";
import { EvaluatorContact } from "@/engine/core/schemes/stalker/meet/evaluators";
import { ISchemeMeetState } from "@/engine/core/schemes/stalker/meet/meet_types";
import { MeetManager } from "@/engine/core/schemes/stalker/meet/MeetManager";
import { initializeMeetScheme } from "@/engine/core/schemes/stalker/meet/utils";
import { readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NIL } from "@/engine/lib/constants/words";
import { ActionPlanner, EScheme, ESchemeType, GameObject, IniFile, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, { file: "meet" });

/**
 * Scheme describing logics of `meet` state.
 * Controls whether object can interact/speak with actor in different states.
 *
 * For example: cannot speak when looting corpse/helping wounded, or can implement speaking with enemy stalkers.
 */
export class SchemeMeet extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.MEET;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.STALKER;

  public static override activate(
    object: GameObject,
    ini: IniFile,
    scheme: EScheme,
    section: TSection
  ): ISchemeMeetState {
    return AbstractScheme.assign(object, ini, scheme, section);
  }

  public static override add(
    object: GameObject,
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
    actionMeetWait.add_precondition(new world_property(EEvaluatorId.ANOMALY, false));
    actionMeetWait.add_precondition(new world_property(EEvaluatorId.ITEMS, false));

    actionMeetWait.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED_EXISTING, false));
    actionMeetWait.add_precondition(new world_property(EEvaluatorId.IS_CORPSE_EXISTING, false));

    actionMeetWait.add_precondition(new world_property(EEvaluatorId.IS_MEET_CONTACT, true));
    actionMeetWait.add_precondition(new world_property(EEvaluatorId.IS_WOUNDED, false));
    actionMeetWait.add_precondition(new world_property(EEvaluatorId.IS_ABUSED, false));
    actionMeetWait.add_effect(new world_property(EEvaluatorId.IS_MEET_CONTACT, false));
    planner.add_action(EActionId.MEET_WAITING_ACTIVITY, actionMeetWait);

    // Block alife when meeting.
    planner.action(EActionId.ALIFE).add_precondition(new world_property(EEvaluatorId.IS_MEET_CONTACT, false));

    // Block state reset for alife when meeting.
    planner
      .action(EActionId.STATE_TO_IDLE_ALIFE)
      .add_precondition(new world_property(EEvaluatorId.IS_MEET_CONTACT, false));

    state.meetManager = new MeetManager(object, state);

    AbstractScheme.subscribe(state, state.meetManager);
  }

  public static override reset(
    object: GameObject,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    // Read meet configuration from current logics section or from provided section, if it is valid.
    const meetSection: TSection =
      scheme === null || scheme === NIL
        ? readIniString(state.ini, state.sectionLogic, SchemeMeet.SCHEME_SECTION, false)
        : readIniString(state.ini, section, SchemeMeet.SCHEME_SECTION, false);

    initializeMeetScheme(object, state.ini, meetSection, state.meet as ISchemeMeetState);
  }
}
