import type { AbuseManager } from "@/mod/scripts/core/schemes/abuse/AbuseManager";
import type { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";

/**
 * todo;
 */
export interface ISchemeAbuseState extends IBaseSchemeState {
  abuse_manager: AbuseManager;
}
