import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import {
  CharacterProfileCriticals,
  DefaultCharacterDialogs,
  loadoutBeretta,
  loadoutBm16,
  loadoutCharacterDrugsBase,
  loadoutCharacterDrugsExtended,
  loadoutCharacterFood,
  loadoutCharacterItems,
  loadoutCharacterItemsWithoutDetector,
  loadoutCharacterSellWeapons,
  loadoutColt1911,
  loadoutDesertEagle,
  loadoutF1Grenades,
  loadoutPm,
  loadoutProtecta,
  loadoutRgd5Grenades,
  loadoutSig550,
  loadoutSpas12,
  profileIcon,
} from "@/engine/configs/gameplay/loadouts";
import { SpecificCharacter } from "@/engine/configs/gameplay/utils";
import { communities } from "@/engine/lib/constants/communities";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { GENERATE_BANDIT_NAME } from "@/engine/lib/constants/names";

export function BanditLoadout(): JSXNode {
  return (
    <Fragment>
      <SpecificCharacter
        id={"stalker_bandit_default"}
        class={"Stalker_bandit"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_1}
        soundConfig={"characters_voice\\human_01\\stalker\\"}
        rank={0}
        supplies={[
          ...loadoutSig550(),
          ...loadoutBeretta(),
          ...loadoutRgd5Grenades(),
          ...loadoutCharacterItems(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_0_default_0"}
        class={"sim_default_bandit_0"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_1}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        rank={20}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          ...loadoutBm16(),
          ...loadoutPm(),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_0_default_1"}
        class={"sim_default_bandit_0"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_1}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        rank={20}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_bm16 },
          { section: weapons.wpn_fort },
          { section: ammo["ammo_12x70_buck"] },
          { section: ammo.ammo_9x19_fmj },
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_0_default_2"}
        class={"sim_default_bandit_0"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_1}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        rank={20}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_pm },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_fmj },
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_1_default_0"}
        class={"sim_default_bandit_1"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_1}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        rank={30}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_hpsa },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_fmj },
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_1_default_1"}
        class={"sim_default_bandit_1"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_3}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={30}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_hpsa },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_fmj },
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_1_default_2"}
        class={"sim_default_bandit_1"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_3_mask}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={30}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_pm },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_1_default_3"}
        class={"sim_default_bandit_1"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_3_mask}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={30}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_pm },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_1_default_4"}
        class={"sim_default_bandit_1"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_4}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={30}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_hpsa },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_fmj },
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_1_default_5"}
        class={"sim_default_bandit_1"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_1}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        rank={30}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_fort },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x18_fmj },
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsBase(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_2_default_0"}
        class={"sim_default_bandit_2"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_3}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={35}
        moneyMin={250}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_wincheaster1300 },
          { section: weapons.wpn_hpsa },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_12x76_zhekan"] },
          { section: ammo.ammo_9x19_fmj },
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_2_default_1"}
        class={"sim_default_bandit_2"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_2}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        rank={35}
        moneyMin={500}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_beretta },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_fmj },
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_2_default_2"}
        class={"sim_default_bandit_2"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_2}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        rank={35}
        moneyMin={500}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_mp5 },
          { section: weapons.wpn_beretta },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo.ammo_9x19_pbp },
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_2_default_3"}
        class={"sim_default_bandit_2"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_3_mask}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={35}
        moneyMin={500}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_hpsa },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_pbp },
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_2_default_4"}
        class={"sim_default_bandit_2"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_2}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        rank={35}
        moneyMin={500}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_mp5 },
          { section: weapons.wpn_colt1911 },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo.ammo_9x19_pbp },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_2_default_5"}
        class={"sim_default_bandit_2"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_4}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={35}
        moneyMin={500}
        moneyMax={1750}
        supplies={[
          { section: weapons.wpn_ak74u },
          { section: weapons.wpn_colt1911 },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_pbp },
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_3_default_0"}
        class={"sim_default_bandit_3"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_3}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={45}
        moneyMin={3000}
        moneyMax={4000}
        supplies={[
          ...loadoutSpas12(true),
          ...loadoutColt1911(),
          ...loadoutF1Grenades(3),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_3_default_1"}
        class={"sim_default_bandit_3"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_3_mask}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={45}
        moneyMin={3000}
        moneyMax={4000}
        supplies={[
          { section: weapons.wpn_spas12 },
          { section: weapons.wpn_beretta },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo.ammo_12x70_buck },
          { section: ammo["ammo_9x19_pbp"] },
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_3_default_2"}
        class={"sim_default_bandit_3"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_4}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={45}
        moneyMin={3000}
        moneyMax={4000}
        supplies={[
          { section: weapons.wpn_spas12 },
          { section: weapons.wpn_beretta },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo.ammo_12x70_buck },
          { section: ammo["ammo_9x19_pbp"] },
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_3_default_3"}
        class={"sim_default_bandit_3"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_2}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        rank={45}
        moneyMin={3000}
        moneyMax={4000}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_colt1911 },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo["ammo_5.45x39_ap"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_3_default_4"}
        class={"sim_default_bandit_3"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_2}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        rank={45}
        moneyMin={3000}
        moneyMax={4000}
        supplies={[
          { section: weapons.wpn_lr300 },
          { section: weapons.wpn_beretta },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_9x19_pbp"] },
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_4_default_0"}
        class={"sim_default_bandit_4"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_4}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={55}
        moneyMin={3000}
        moneyMax={4000}
        supplies={[
          { section: weapons.wpn_sig550 },
          { section: weapons.wpn_desert_eagle },
          { section: weapons.grenade_f1, count: 4 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_4_default_1"}
        class={"sim_default_bandit_4"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_3}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={55}
        moneyMin={3000}
        moneyMax={8000}
        supplies={[
          { section: weapons.wpn_sig550 },
          { section: weapons.wpn_colt1911 },
          { section: weapons.grenade_f1, count: 4 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_4_default_2"}
        class={"sim_default_bandit_4"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_2}
        soundConfig={"characters_voice\\human_01\\bandit\\"}
        rank={55}
        moneyMin={3000}
        moneyMax={8000}
        supplies={[
          ...loadoutSig550({ ap: true }),
          ...loadoutDesertEagle(),
          ...loadoutF1Grenades(4),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_4_default_3"}
        class={"sim_default_bandit_4"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_2}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={55}
        moneyMin={3000}
        moneyMax={8000}
        supplies={[
          ...loadoutProtecta(true),
          ...loadoutDesertEagle(true),
          ...loadoutF1Grenades(4),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_bandit_4_default_4"}
        class={"sim_default_bandit_4"}
        name={GENERATE_BANDIT_NAME}
        community={communities.bandit}
        icon={profileIcon.ui_inGame2_bandit_3_mask}
        soundConfig={"characters_voice\\human_02\\bandit\\"}
        rank={55}
        moneyMin={3000}
        moneyMax={8000}
        supplies={[
          ...loadoutProtecta(true),
          ...loadoutDesertEagle(true),
          ...loadoutF1Grenades(4),
          ...loadoutCharacterItemsWithoutDetector(),
          ...loadoutCharacterDrugsExtended(),
          ...loadoutCharacterFood(),
          ...loadoutCharacterSellWeapons(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>
    </Fragment>
  );
}
