import { ISchemeAbuseState } from "@/mod/scripts/core/schemes/abuse";
import { HitManager } from "@/mod/scripts/core/schemes/hit/HitManager";

/**
 * todo;
 */
export interface ISchemeHitState extends ISchemeAbuseState {
  action: HitManager;
}
