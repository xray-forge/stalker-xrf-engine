import { TIndex, TNumberId } from "xray16/lib";

import { ISchemeAbuseState } from "@/engine/core/schemes/stalker/abuse";
import { HitManager } from "@/engine/core/schemes/stalker/hit/HitManager";
import { EScheme } from "@/engine/lib/types";

/**
 * Hit scheme state.
 */
export interface ISchemeHitState extends ISchemeAbuseState {
  isDeadlyHit: boolean;
  who: TNumberId;
  action: HitManager;
  boneIndex: TIndex;
}

declare module "@/engine/core/database/database_types" {
  interface ISchemeStateMap {
    [EScheme.HIT]: ISchemeHitState;
  }
}
