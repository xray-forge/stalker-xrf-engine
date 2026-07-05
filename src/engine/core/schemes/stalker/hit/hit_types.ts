import { TIndex, TNumberId } from "xray16/lib";

import { ISchemeAbuseState } from "@/engine/core/schemes/stalker/abuse";
import { HitManager } from "@/engine/core/schemes/stalker/hit/HitManager";

/**
 * Hit scheme state.
 */
export interface ISchemeHitState extends ISchemeAbuseState {
  isDeadlyHit: boolean;
  who: TNumberId;
  action: HitManager;
  boneIndex: TIndex;
}
