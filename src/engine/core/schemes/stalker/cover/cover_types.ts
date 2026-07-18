import { TDistance, TName } from "xray16/lib";

import { IBaseSchemeState } from "@/engine/core/database/database_types";
import { TConditionList } from "@/engine/core/utils/ini";
import { EScheme } from "@/engine/lib/types";

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

declare module "@/engine/core/database/database_types" {
  interface ISchemeStateMap {
    [EScheme.COVER]: ISchemeCoverState;
  }
}
