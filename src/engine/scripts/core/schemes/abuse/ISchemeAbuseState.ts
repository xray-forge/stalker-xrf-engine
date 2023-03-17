import type { AbuseManager } from "@/engine/scripts/core/schemes/abuse/AbuseManager";
import type { IBaseSchemeState } from "@/engine/scripts/core/schemes/base";

/**
 * todo;
 */
export interface ISchemeAbuseState extends IBaseSchemeState {
  abuse_manager: AbuseManager;
}
