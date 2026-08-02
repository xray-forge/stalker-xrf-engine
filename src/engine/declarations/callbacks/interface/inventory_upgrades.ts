import { extern, TLabel, TName, TNotCastedBoolean, TRate, TSection } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { UpgradesManager } from "@/engine/core/managers/upgrades/UpgradesManager";
import {
  getRepairItemAskReplicLabel,
  getUpgradeCostLabel,
  issueUpgradeProperty,
} from "@/engine/core/managers/upgrades/utils/upgrades_label_utils";
import { canRepairItem } from "@/engine/core/managers/upgrades/utils/upgrades_price_utils";

/** Item upgrade callbacks. */
extern("inventory_upgrades", {
  get_upgrade_cost: (section: TSection): TLabel => getUpgradeCostLabel(section),
  can_repair_item: (section: TSection, condition: TRate, mechanicName: TName): boolean =>
    canRepairItem(section, condition, mechanicName),
  can_upgrade_item: (section: TSection, mechanicName: TName): boolean =>
    getManager(UpgradesManager).canUpgradeItem(section, mechanicName),
  effect_repair_item: (section: TSection, condition: TRate) =>
    getManager(UpgradesManager).getRepairItemPayment(section, condition),
  effect_functor_a: (name: TName, section: TSection, loading: TNotCastedBoolean) =>
    getManager(UpgradesManager).getUpgradeItemPayment(name, section, loading),
  prereq_functor_a: (name: TName, section: TSection): TLabel =>
    getManager(UpgradesManager).getPreRequirementsFunctorA(name, section),
  precondition_functor_a: (name: TName, section: TSection) =>
    getManager(UpgradesManager).getPreconditionFunctorA(name, section),
  property_functor_a: (data: string, name: TName): TLabel =>
    getManager(UpgradesManager).getPropertyFunctorA(data, name),
  property_functor_b: (data: string, upgrade: TName): TName => issueUpgradeProperty(data, upgrade),
  property_functor_c: (data: string, upgrade: TName): TName => issueUpgradeProperty(data, upgrade),
  question_repair_item: (section: TSection, condition: TRate, canRepair: boolean, mechanicName: TName): TLabel =>
    getRepairItemAskReplicLabel(section, condition, canRepair, mechanicName),
});
