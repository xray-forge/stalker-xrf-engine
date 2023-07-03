import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { TConditionList } from "@/engine/core/utils/ini/ini_types";
import { TDistance, TName } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemeCoverState extends IBaseSchemeState {
  smartTerrainName: TName;
  animationConditionList: TConditionList;
  soundIdle: string;
  useAttackDirection: boolean;
  radiusMin: TDistance;
  radiusMax: TDistance;
}
