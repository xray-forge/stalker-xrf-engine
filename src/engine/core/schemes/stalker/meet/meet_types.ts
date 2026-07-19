import type { Nillable, TDistance, TSection } from "xray16/lib";

import type { TConditionList } from "@/engine/core/ini";
import type { MeetManager } from "@/engine/core/schemes/stalker/meet/MeetManager";
import type { IBaseSchemeState } from "@/engine/core/schemes/state";
import type { EScheme } from "@/engine/core/schemes/types";

/**
 * Approximate meet distance to simplify logical checks.
 */
export const enum EMeetDistance {
  CLOSE = 1,
  FAR = 2,
}

/**
 * Scheme state representing `meet` configuration for specific object.
 */
export interface ISchemeMeetState extends IBaseSchemeState {
  isMeetInitialized: boolean;
  meetManager: MeetManager;
  meetSection: Nillable<TSection>;
  abuse: TConditionList;
  use: TConditionList;
  useText: TConditionList;
  useSound: TConditionList;
  meetDialog: TConditionList;
  isMeetOnlyAtPathEnabled: boolean;
  isTradeEnabled: TConditionList;
  isBreakAllowed: TConditionList;
  isMeetOnTalking: boolean;
  // Distance to reset state.
  resetDistance: TDistance;
  // Distance considered close for meeting.
  closeDistance: TConditionList;
  closeAnimation: TConditionList;
  closeSoundDistance: TConditionList;
  closeSoundHello: TConditionList;
  closeSoundBye: TConditionList;
  closeVictim: TConditionList;
  farDistance: TConditionList;
  farAnimation: TConditionList;
  farSoundDistance: TConditionList;
  farSound: TConditionList;
  farVictim: TConditionList;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.MEET]: ISchemeMeetState;
  }
}
