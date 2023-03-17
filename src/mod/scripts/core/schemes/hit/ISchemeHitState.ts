import { TIndex, TNumberId } from "@/mod/lib/types";
import { ISchemeAbuseState } from "@/mod/scripts/core/schemes/abuse";
import { HitManager } from "@/mod/scripts/core/schemes/hit/HitManager";

/**
 * todo;
 */
export interface ISchemeHitState extends ISchemeAbuseState {
  action: HitManager;
  bone_index: TIndex;
  who: TNumberId;
  deadly_hit: boolean;
}
