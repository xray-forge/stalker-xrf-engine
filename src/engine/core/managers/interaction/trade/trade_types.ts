import { TConditionList } from "@/engine/core/utils/ini";
import { IniFile, Optional, TPath, TRate, TSection, TTimestamp } from "@/engine/lib/types";

/**
 * Descriptor of current trading state of game objects.
 */
export interface ITradeManagerDescriptor {
  config: IniFile;
  configPath: TPath;
  // By condition sections:
  buyCondition: TConditionList;
  buyItemFactorCondition: TConditionList;
  sellCondition: TConditionList;
  buySupplies: TConditionList;
  // Lifecycle configuration:
  updateAt: TTimestamp;
  resupplyAt: TTimestamp;
  // Currently used buy condition.
  currentBuyCondition: Optional<TSection>;
  currentSellCondition: Optional<TSection>;
  currentBuyItemConditionFactor: TRate;
  currentBuySupplies: Optional<TSection>;
}
