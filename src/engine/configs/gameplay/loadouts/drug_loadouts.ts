import { ISpawnItemDescriptor } from "@/engine/configs/gameplay/utils";
import { drugs } from "@/engine/lib/constants/items/drugs";

export function loadoutCharacterDrugsBase(): Array<ISpawnItemDescriptor> {
  return [
    { section: drugs.medkit, probability: 0.2 },
    { section: drugs.bandage, probability: 0.4 },
  ];
}

export function loadoutCharacterDrugsExtended(): Array<ISpawnItemDescriptor> {
  return [
    { section: drugs.medkit, probability: 0.2 },
    { section: drugs.bandage, probability: 0.4 },
    { section: drugs.antirad, probability: 0.1 },
    { section: drugs.drug_booster, probability: 0.06 },
    { section: drugs.drug_coagulant, probability: 0.06 },
  ];
}

export function loadoutCharacterDrugsAdvanced(): Array<ISpawnItemDescriptor> {
  return [
    { section: drugs.medkit, probability: 0.3 },
    { section: drugs.bandage, probability: 0.5 },
    { section: drugs.antirad, probability: 0.2 },
    { section: drugs.drug_booster, probability: 0.08 },
    { section: drugs.drug_coagulant, probability: 0.08 },
    { section: drugs.drug_antidot, probability: 0.06 },
    { section: drugs.drug_radioprotector, probability: 0.06 },
  ];
}

export function loadoutCharacterDrugsElite(): Array<ISpawnItemDescriptor> {
  return [
    { section: drugs.medkit, probability: 0.4 },
    { section: drugs.bandage, probability: 0.6 },
    { section: drugs.antirad, probability: 0.3 },
    { section: drugs.drug_booster, probability: 0.1 },
    { section: drugs.drug_coagulant, probability: 0.1 },
    { section: drugs.drug_antidot, probability: 0.08 },
    { section: drugs.drug_radioprotector, probability: 0.08 },
    { section: drugs.drug_psy_blockade, probability: 0.04 },
    { section: drugs.drug_anabiotic, probability: 0.005 },
  ];
}

export function loadoutCharacterDrugsMilitary(): Array<ISpawnItemDescriptor> {
  return [{ section: drugs.medkit_army, probability: 0.2 }];
}

export function loadoutCharacterDrugsScientific(): Array<ISpawnItemDescriptor> {
  return [{ section: drugs.medkit_scientic, probability: 0.2 }];
}
