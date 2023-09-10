import { IBaseSchemeState } from "@/engine/core/objects/ai/scheme";
import { TConditionList } from "@/engine/core/utils/ini/ini_types";
import { TDistance, TName } from "@/engine/lib/types";

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
