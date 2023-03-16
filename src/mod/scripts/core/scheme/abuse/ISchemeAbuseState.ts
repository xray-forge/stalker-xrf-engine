import type { AbuseManager } from "@/mod/scripts/core/scheme/abuse/AbuseManager";
import type { IBaseSchemeState } from "@/mod/scripts/core/scheme/base";

/**
 * todo;
 */
export interface ISchemeAbuseState extends IBaseSchemeState {
  abuse_manager: AbuseManager;
}
