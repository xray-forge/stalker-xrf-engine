import { TIndex, TNumberId } from "@/engine/lib/types";
import { ISchemeAbuseState } from "@/engine/scripts/core/schemes/abuse";
import { HitManager } from "@/engine/scripts/core/schemes/hit/HitManager";

/**
 * todo;
 */
export interface ISchemeHitState extends ISchemeAbuseState {
  action: HitManager;
  bone_index: TIndex;
  who: TNumberId;
  deadly_hit: boolean;
}
