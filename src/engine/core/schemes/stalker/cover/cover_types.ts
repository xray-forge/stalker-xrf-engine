import { TDistance, TName } from "xray16/lib";

import { TConditionList } from "@/engine/core/ini";
import { IBaseSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";

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

declare module "@/engine/core/schemes/state/types" {
  interface ISchemeStateMap {
    [EScheme.COVER]: ISchemeCoverState;
  }
}
