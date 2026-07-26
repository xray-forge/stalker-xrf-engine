import { TIndex, TNumberId } from "xray16/lib";

import { ISchemeAbuseState } from "@/engine/core/schemes/stalker/abuse";
import { HitController } from "@/engine/core/schemes/stalker/hit/HitController";
import { EScheme } from "@/engine/core/schemes/types";

/**
 * Hit scheme state.
 */
export interface ISchemeHitState extends ISchemeAbuseState {
  isDeadlyHit: boolean;
  who: TNumberId;
  action: HitController;
  boneIndex: TIndex;
}

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.HIT]: ISchemeHitState;
  }
}
