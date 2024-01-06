import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import { defaultCharacterDialogs } from "@/engine/configs/gameplay/character_dialogs";
import { defaultCharacterCritical } from "@/engine/configs/gameplay/loadouts/character_criticals";
import { defaultCharacterDrugs } from "@/engine/configs/gameplay/loadouts/character_drugs";
import { defaultCharacterDrugs2 } from "@/engine/configs/gameplay/loadouts/character_drugs_2";
import { defaultCharacterDrugs3 } from "@/engine/configs/gameplay/loadouts/character_drugs_3";
import { defaultCharacterDrugs4 } from "@/engine/configs/gameplay/loadouts/character_drugs_4";
import { defaultCharacterDrugsScientific } from "@/engine/configs/gameplay/loadouts/character_drugs_sci";
import { defaultCharacterFood } from "@/engine/configs/gameplay/loadouts/character_food";
import { defaultCharacterItems } from "@/engine/configs/gameplay/loadouts/character_items";
import { defaultCharacterItems2 } from "@/engine/configs/gameplay/loadouts/character_items_2";
import { defaultCharacterItems3 } from "@/engine/configs/gameplay/loadouts/character_items_3";
import { defaultCharacterSellWeapons } from "@/engine/configs/gameplay/loadouts/character_sell_weapons";
import { SpecificCharacter } from "@/engine/configs/gameplay/utils";
import { communities } from "@/engine/lib/constants/communities";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { GENERATE_STALKER_NAME } from "@/engine/lib/constants/names";

export function FreedomLoadout(): JSXNode {
  return (
    <Fragment>
      <SpecificCharacter
        id={"stalker_freedom_default"}
        class={"Stalker_freedom"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_2_mask"}
        community={communities.freedom}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_2_mask"}
        supplies={[
          { section: weapons.wpn_sig550 },
          { section: weapons.wpn_beretta },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.56x45_ss190"] },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_0_default_0"}
        class={"sim_default_freedom_0"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_1"}
        community={communities.freedom}
        rank={30}
        moneyMin={500}
        moneyMax={1000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_1"}
        supplies={[
          { section: weapons.wpn_mp5 },
          { section: weapons.wpn_hpsa },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_0_default_1"}
        class={"sim_default_freedom_0"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_1"}
        community={communities.freedom}
        rank={30}
        moneyMin={500}
        moneyMax={1000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_1"}
        supplies={[
          { section: weapons.wpn_mp5 },
          { section: weapons.wpn_pm },
          { section: ammo.ammo_9x19_fmj },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_0_default_2"}
        class={"sim_default_freedom_0"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_1"}
        community={communities.freedom}
        rank={30}
        moneyMin={500}
        moneyMax={1000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_1"}
        supplies={[
          { section: weapons.wpn_l85 },
          { section: weapons.wpn_pm },
          { section: ammo["ammo_5.56x45_ss190"] },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_0_default_3"}
        class={"sim_default_freedom_0"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_2_mask"}
        community={communities.freedom}
        rank={30}
        moneyMin={500}
        moneyMax={1000}
        soundConfig={"characters_voice\\human_01\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_2_mask"}
        supplies={[
          { section: weapons.wpn_mp5 },
          { section: weapons.wpn_hpsa },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_0_default_4"}
        class={"sim_default_freedom_0"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_2_mask"}
        community={communities.freedom}
        rank={30}
        moneyMin={500}
        moneyMax={1000}
        soundConfig={"characters_voice\\human_01\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_2_mask"}
        supplies={[
          { section: weapons.wpn_mp5 },
          { section: weapons.wpn_pm },
          { section: ammo.ammo_9x19_fmj },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_0_default_5"}
        class={"sim_default_freedom_0"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_2_mask"}
        community={communities.freedom}
        rank={30}
        moneyMin={500}
        moneyMax={1000}
        soundConfig={"characters_voice\\human_01\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_2_mask"}
        supplies={[
          { section: weapons.wpn_wincheaster1300 },
          { section: weapons.wpn_pm },
          { section: ammo.ammo_12x70_buck },
          { section: ammo.ammo_9x18_fmj },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_1_default_0"}
        class={"sim_default_freedom_1"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_1"}
        community={communities.freedom}
        rank={35}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_2_mask"}
        supplies={[
          { section: weapons.wpn_wincheaster1300 },
          { section: weapons.wpn_beretta },
          { section: weapons.grenade_rgd5 },
          { section: ammo.ammo_12x70_buck },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterFood,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_1_default_1"}
        class={"sim_default_freedom_1"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_1"}
        community={communities.freedom}
        rank={35}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_1"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_hpsa },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterFood,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_1_default_2"}
        class={"sim_default_freedom_1"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_2_mask"}
        community={communities.freedom}
        rank={35}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_01\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_2_mask"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_colt1911 },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_1_default_3"}
        class={"sim_default_freedom_1"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_2_mask"}
        community={communities.freedom}
        rank={35}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_01\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_2_mask"}
        supplies={[
          { section: weapons.wpn_l85 },
          { section: weapons.wpn_beretta },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.56x45_ss190"] },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_1_default_4"}
        class={"sim_default_freedom_1"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_2"}
        community={communities.freedom}
        rank={35}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_2"}
        supplies={[
          { section: weapons.wpn_wincheaster1300 },
          { section: weapons.wpn_hpsa },
          { section: weapons.grenade_rgd5 },
          { section: ammo.ammo_12x70_buck },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_1_default_5"}
        class={"sim_default_freedom_1"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_2"}
        community={communities.freedom}
        rank={35}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_2"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_beretta },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_1_default_6"}
        class={"sim_default_freedom_1"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_2"}
        community={communities.freedom}
        rank={35}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_2"}
        supplies={[
          { section: weapons.wpn_mp5, silencer: true },
          { section: weapons.wpn_colt1911 },
          { section: weapons.grenade_rgd5 },
          { section: ammo.ammo_9x19_fmj },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_1_default_7"}
        class={"sim_default_freedom_1"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_2"}
        community={communities.freedom}
        rank={35}
        moneyMin={1000}
        moneyMax={2000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_2"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_hpsa },
          { section: weapons.grenade_rgd5 },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo.ammo_9x19_fmj },
          ...defaultCharacterItems,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_2_default_0"}
        class={"sim_default_freedom_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_1"}
        community={communities.freedom}
        rank={40}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_1"}
        supplies={[
          { section: weapons.wpn_lr300, silencer: true, scope: true },
          { section: weapons.wpn_colt1911 },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.56x45_ss190"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_2_default_1"}
        class={"sim_default_freedom_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_2_mask"}
        community={communities.freedom}
        rank={40}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_01\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_2_mask"}
        supplies={[
          { section: weapons.wpn_l85 },
          { section: weapons.wpn_beretta },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo.ammo_9x19_pbp },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_2_default_2"}
        class={"sim_default_freedom_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_2_mask"}
        community={communities.freedom}
        rank={40}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_02\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_2_mask"}
        supplies={[
          { section: weapons.wpn_lr300, scope: true, silencer: true },
          { section: weapons.wpn_beretta },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo.ammo_9x19_pbp },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_2_default_3"}
        class={"sim_default_freedom_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_2"}
        community={communities.freedom}
        rank={40}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_2"}
        supplies={[
          { section: weapons.wpn_mp5, silencer: true },
          { section: weapons.wpn_hpsa },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo.ammo_9x19_pbp },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_2_default_4"}
        class={"sim_default_freedom_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_2"}
        community={communities.freedom}
        rank={40}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_2"}
        supplies={[
          { section: weapons.wpn_l85 },
          { section: weapons.wpn_beretta },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo.ammo_9x19_pbp },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_2_default_5"}
        class={"sim_default_freedom_2"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_2"}
        community={communities.freedom}
        rank={40}
        moneyMin={1500}
        moneyMax={2500}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_2"}
        supplies={[
          { section: weapons.wpn_ak74 },
          { section: weapons.wpn_colt1911 },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo["ammo_5.45x39_ap"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs2,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_3_default_0"}
        class={"sim_default_freedom_3"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_1"}
        community={communities.freedom}
        rank={50}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_1"}
        supplies={[
          { section: weapons.wpn_svd },
          { section: weapons.wpn_colt1911 },
          { section: ammo["ammo_7.62x54_7h1"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
          ...defaultCharacterDrugsScientific,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_3_default_1"}
        class={"sim_default_freedom_3"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_2"}
        community={communities.freedom}
        rank={50}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_1"}
        supplies={[
          { section: weapons.wpn_sig550 },
          { section: weapons.wpn_desert_eagle },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
          ...defaultCharacterDrugsScientific,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_3_default_2"}
        class={"sim_default_freedom_3"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_3"}
        community={communities.freedom}
        rank={50}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_02\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_3"}
        supplies={[
          { section: weapons.wpn_g36 },
          { section: weapons.wpn_walther },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo.ammo_9x19_pbp },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
          ...defaultCharacterDrugsScientific,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_3_default_3"}
        class={"sim_default_freedom_3"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_3"}
        community={communities.freedom}
        rank={50}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_02\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_3"}
        supplies={[
          { section: weapons.wpn_sig550 },
          { section: weapons.wpn_sig220 },
          { section: weapons.grenade_f1, count: 3 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
          ...defaultCharacterDrugsScientific,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_3_default_4"}
        class={"sim_default_freedom_3"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_2_mask"}
        community={communities.freedom}
        rank={50}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_02\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_2_mask"}
        supplies={[
          { section: weapons.wpn_svd },
          { section: weapons.wpn_mp5, silencer: true },
          { section: ammo["ammo_7.62x54_7h1"] },
          { section: ammo.ammo_9x19_pbp },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
          ...defaultCharacterDrugsScientific,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_3_default_5"}
        class={"sim_default_freedom_3"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_1"}
        community={communities.freedom}
        rank={50}
        moneyMin={2500}
        moneyMax={5000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_1"}
        supplies={[
          { section: weapons.wpn_svu },
          { section: weapons.wpn_colt1911 },
          { section: ammo["ammo_7.62x54_7h1"] },
          { section: ammo["ammo_11.43x23_fmj"] },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
          ...defaultCharacterDrugsScientific,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_4_default_0"}
        class={"sim_default_freedom_4"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_1"}
        community={communities.freedom}
        rank={70}
        moneyMin={5000}
        moneyMax={10000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_1"}
        supplies={[
          { section: weapons.wpn_vintorez },
          { section: weapons.wpn_sig220, silencer: true },
          { section: ammo["ammo_7.62x54_7h1"] },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItems2,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs3,
          ...defaultCharacterDrugsScientific,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_4_default_1"}
        class={"sim_default_freedom_4"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_2_mask"}
        community={communities.freedom}
        rank={70}
        moneyMin={5000}
        moneyMax={10000}
        soundConfig={"characters_voice\\human_02\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_2_mask"}
        supplies={[
          { section: weapons.wpn_svu },
          { section: weapons.wpn_walther },
          { section: ammo["ammo_7.62x54_7h1"] },
          { section: ammo.ammo_9x19_pbp },
          ...defaultCharacterItems3,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs4,
          ...defaultCharacterDrugsScientific,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_4_default_2"}
        class={"sim_default_freedom_4"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_2_mask"}
        community={communities.freedom}
        rank={70}
        moneyMin={5000}
        moneyMax={10000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_4"}
        supplies={[
          { section: weapons.wpn_sig550 },
          { section: weapons.wpn_colt1911 },
          { section: weapons.grenade_f1, count: 4 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItems3,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs4,
          ...defaultCharacterDrugsScientific,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_4_default_3"}
        class={"sim_default_freedom_4"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_4"}
        community={communities.freedom}
        rank={70}
        moneyMin={5000}
        moneyMax={10000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_4"}
        supplies={[
          { section: weapons.wpn_sig550 },
          { section: weapons.wpn_desert_eagle },
          { section: weapons.grenade_f1, count: 1 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItems3,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs4,
          ...defaultCharacterDrugsScientific,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_4_default_4"}
        class={"sim_default_freedom_4"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_4"}
        community={communities.freedom}
        rank={70}
        moneyMin={5000}
        moneyMax={10000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_4"}
        supplies={[
          { section: weapons.wpn_g36 },
          { section: weapons.wpn_desert_eagle },
          { section: weapons.grenade_f1, count: 1 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItems3,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs4,
          ...defaultCharacterDrugsScientific,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>

      <SpecificCharacter
        id={"sim_default_freedom_4_default_5"}
        class={"sim_default_freedom_4"}
        name={GENERATE_STALKER_NAME}
        icon={"ui_inGame2_Freedom_4"}
        community={communities.freedom}
        rank={70}
        moneyMin={5000}
        moneyMax={10000}
        soundConfig={"characters_voice\\human_03\\freedom\\"}
        visual={"actors\\stalker_freedom\\stalker_freedom_4"}
        supplies={[
          { section: weapons.wpn_g36 },
          { section: weapons.wpn_colt1911 },
          { section: weapons.grenade_f1, count: 1 },
          { section: ammo["ammo_5.56x45_ap"] },
          { section: ammo["ammo_11.43x23_hydro"] },
          ...defaultCharacterItems3,
          ...defaultCharacterFood,
          ...defaultCharacterDrugs4,
          ...defaultCharacterDrugsScientific,
          ...defaultCharacterSellWeapons,
        ]}
      >
        {defaultCharacterCritical}
        {defaultCharacterDialogs}
      </SpecificCharacter>
    </Fragment>
  );
}