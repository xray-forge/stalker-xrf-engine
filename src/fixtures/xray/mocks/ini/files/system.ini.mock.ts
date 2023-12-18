import { detectors } from "@/engine/lib/constants/items/detectors";
import { mockUpgradesLtx } from "@/fixtures/xray/mocks/ini/files/upgrades.ltx.mock";
import { mockWeaponLtx } from "@/fixtures/xray/mocks/ini/files/weapons.ltx.mock";

export const mockSystemIni = {
  ...mockUpgradesLtx,
  ...mockWeaponLtx,
  actor: {
    quick_item_1: "qi_1",
    quick_item_2: "qi_2",
    quick_item_3: "qi_3",
    quick_item_4: "qi_4",
  },
  [detectors.detector_advanced]: {
    inv_name: "st_detector2",
  },
  existing: {},
  sim_default_first: {},
  sim_default_second: {},
  simulation_first: {},
  first_sim_squad_example: {},
  without_outfit: {},
  outfit_base: {},
  first_outfit: {},
  first_outfit_immunities: {},
  second_outfit: {},
  second_outfit_bones: {},
  up_outfit: {},
  sect_outfit: {},
  prop_outfit: {},
  af_base: {},
  af_first: {},
  af_second: {},
  af_second_absorbation: {},
  af_activation_first: {},
  ammo_base: {},
  helm_first: {},
  helm_second: {},
  squad: {},
  test_squad: {
    faction: "stalker",
    npc: "test_npc_1, test_npc_2",
  },
  stalker_none_1: {
    set_visual: "",
  },
  stalker_freedom_1: {
    set_visual: "actors\\stalker_neutral\\stalker_neutral_2",
  },
  stalker_actor_1: {
    set_visual: "actor_visual",
  },
  game_relations: {
    rating: "novice, 300, experienced, 600, veteran, 900, master",
    monster_rating: "weak, 400, normal, 800, strong",
  },
};
