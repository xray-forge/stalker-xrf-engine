import type { AbuseManager } from "@/engine/core/schemes/abuse/AbuseManager";
import type { IBaseSchemeState } from "@/engine/core/schemes/base";

/**
 * todo;
 */
export interface ISchemeAbuseState extends IBaseSchemeState {
  abuseManager: AbuseManager;
}
