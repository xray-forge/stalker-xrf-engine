import type { Optional, TName } from "@/mod/lib/types";
import type { IBaseSchemeState } from "@/mod/scripts/core/schemes/base";

/**
 * todo;
 */
export interface ISchemeParticleState extends IBaseSchemeState {
  name: TName;
  path: TName;
  mode: number;
  looped: Optional<boolean>;
}
