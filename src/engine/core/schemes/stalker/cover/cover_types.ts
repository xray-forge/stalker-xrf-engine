import { TDistance, TName } from "xray16/lib";

import type { IBaseSchemeState } from "@/engine/core/database/database_types";
import { TConditionList } from "@/engine/core/utils/ini";

/**
 * State describing smart cover scheme configuration.
 */
export interface ISchemeCoverState extends IBaseSchemeState {
  smartTerrainName: TName;
  animationConditionList: TConditionList;
  // Sound to play by stalkers when idle and not doing anything
  soundIdle: string;
  useAttackDirection: boolean;
  radiusMin: TDistance;
  radiusMax: TDistance;
}
