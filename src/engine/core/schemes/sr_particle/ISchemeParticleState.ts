import type { IBaseSchemeState } from "@/engine/core/schemes/base";
import type { Optional, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeParticleState extends IBaseSchemeState {
  name: TName;
  path: TName;
  mode: number;
  looped: Optional<boolean>;
}
