import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import {
  CharacterProfileCriticals,
  DefaultCharacterDialogs,
  loadoutCharacterDrugs,
  loadoutCharacterFood,
  loadoutCharacterItems,
} from "@/engine/configs/gameplay/loadouts";
import { CharacterDescriptionMapIcon, SpecificCharacter } from "@/engine/configs/gameplay/utils";
import { communities } from "@/engine/lib/constants/communities";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { detectors } from "@/engine/lib/constants/items/detectors";
import { drugs } from "@/engine/lib/constants/items/drugs";
import { food } from "@/engine/lib/constants/items/food";
import { helmets } from "@/engine/lib/constants/items/helmets";
import { misc } from "@/engine/lib/constants/items/misc";
import { outfits } from "@/engine/lib/constants/items/outfits";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { GENERATE_STALKER_NAME } from "@/engine/lib/constants/names";

export function ActorLoadout(): JSXNode {
  return (
    <Fragment>
      <SpecificCharacter
        id={"actor"}
        community={communities.actor}
        name={"st_actor_name"}
        icon={"ui_inGame2_Hero"}
        team={"Actor"}
        moneyMin={2500}
        noRandom={true}
        terrainSection={null}
        visual={"actors\\stalker_hero\\stalker_hero_1"}
        supplies={[
          { section: misc.device_torch },
          { section: detectors.detector_simple },
          { section: helmets.helm_respirator, cond: 0.8 },
          { section: outfits.stalker_outfit, cond: 0.75 },
          { section: drugs.bandage, count: 2 },
          { section: drugs.antirad, count: 1 },
          { section: drugs.medkit, count: 4 },
          { section: food.bread, count: 1 },
          { section: food.kolbasa, count: 1 },
          { section: food.conserva, count: 2 },
          { section: weapons.wpn_binoc },
          { section: weapons.wpn_knife },
          { section: weapons.wpn_pm_actor, cond: 0.9 },
          { section: weapons.wpn_ak74u, cond: 0.75 },
          { section: weapons.grenade_rgd5, count: 2 },
          { section: ammo.ammo_9x18_fmj, count: 3 },
          { section: ammo["ammo_5.45x39_fmj"], count: 3 },
        ]}
        mapIcon={<CharacterDescriptionMapIcon x={2} y={5} />}
      />

      <SpecificCharacter
        id={"mp_actor"}
        name={"actor_name"}
        community={communities.actor}
        icon={"ui_inGame2_Hero"}
        team={"mp_actor"}
        noRandom={true}
        terrainSection={null}
        mapIcon={<CharacterDescriptionMapIcon x={2} y={5} />}
        visual={"actors\\stalker_hero\\stalker_hero_1"}
      />

      <SpecificCharacter
        id={"actor_visual_stalker"}
        name={GENERATE_STALKER_NAME}
        community={communities.ecolog}
        icon={"ui_inGame2_Hero"}
        soundConfig={"characters_voice\\human_01\\stalker\\"}
        terrainSection={null}
        visual={"actors\\stalker_hero\\stalker_hero_1"}
        supplies={[
          { section: misc.device_torch },
          { section: misc.hand_radio },
          { section: misc.hand_radio_r },
          { section: weapons.wpn_binoc },
          { section: weapons.wpn_knife },
          { section: ammo.ammo_9x18_fmj },
          { section: ammo.ammo_9x19_fmj },
          { section: ammo["ammo_11.43x23_fmj"] },
          { section: ammo["ammo_5.45x39_fmj"] },
          { section: ammo["ammo_5.56x45_ss190"] },
          { section: ammo.ammo_pkm_100 },
          { section: ammo["ammo_7.62x54_7h1"] },
          { section: ammo.ammo_gauss_cardan },
          { section: ammo.ammo_9x39_pab9 },
          { section: ammo.ammo_12x70_buck },
          { section: ammo["ammo_og-7b"] },
          { section: ammo["ammo_vog-25"] },
          ...loadoutCharacterItems(),
          ...loadoutCharacterDrugs(),
          ...loadoutCharacterFood(),
        ]}
      >
        <CharacterProfileCriticals />
        <DefaultCharacterDialogs />
      </SpecificCharacter>
    </Fragment>
  );
}
