import { ISchemeAbuseState } from "@/engine/core/schemes/stalker/abuse";
import { HitManager } from "@/engine/core/schemes/stalker/hit/HitManager";
import { TIndex, TNumberId } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeHitState extends ISchemeAbuseState {
  isDeadlyHit: boolean;
  who: TNumberId;
  action: HitManager;
  boneIndex: TIndex;
}
