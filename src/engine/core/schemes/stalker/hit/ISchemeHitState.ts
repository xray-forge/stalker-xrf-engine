import { ISchemeAbuseState } from "@/engine/core/schemes/stalker/abuse";
import { HitManager } from "@/engine/core/schemes/stalker/hit/HitManager";
import { TIndex, TNumberId } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeHitState extends ISchemeAbuseState {
  action: HitManager;
  bone_index: TIndex;
  who: TNumberId;
  deadly_hit: boolean;
}
