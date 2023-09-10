import type { IBaseSchemeState } from "@/engine/core/objects/ai/scheme";
import type { MeetManager } from "@/engine/core/schemes/meet/MeetManager";
import type { TConditionList } from "@/engine/core/utils/ini/ini_types";
import type { Optional, TDistance, TSection } from "@/engine/lib/types";

/**
 * Approximate meet distance to simplify logical checks.
 */
export enum EMeetDistance {
  CLOSE = 1,
  FAR = 2,
}

/**
 * Scheme state representing `meet` configuration for specific object.
 */
export interface ISchemeMeetState extends IBaseSchemeState {
  isMeetInitialized: boolean;
  meetManager: MeetManager;
  meetSection: Optional<TSection>;
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
