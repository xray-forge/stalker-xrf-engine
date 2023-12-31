import { detectors } from "@/engine/lib/constants/items/detectors";
import { mockArtefacts } from "@/fixtures/xray/mocks/ini/files/artefacts.ltx.mock";
import { mockConsumables } from "@/fixtures/xray/mocks/ini/files/consumable.ltx.mock";
import { mockDevices } from "@/fixtures/xray/mocks/ini/files/devices.ltx.mock";
import { mockOutfit } from "@/fixtures/xray/mocks/ini/files/outfit.ltx.mock";
import { mockSpawnSections } from "@/fixtures/xray/mocks/ini/files/spawn_sections.ltx.mock";
import { mockSquadDescription } from "@/fixtures/xray/mocks/ini/files/squad_descr.ltx.mock";
import { mockUpgradesLtx } from "@/fixtures/xray/mocks/ini/files/upgrades.ltx.mock";
import { mockWeaponLtx } from "@/fixtures/xray/mocks/ini/files/weapons.ltx.mock";

export const mockSystemIni = {
  ...mockArtefacts,
  ...mockConsumables,
  ...mockDevices,
  ...mockOutfit,
  ...mockSpawnSections,
  ...mockSquadDescription,
  ...mockUpgradesLtx,
  ...mockWeaponLtx,
  actor: {
    quick_item_1: "qi_1",
    quick_item_2: "qi_2",
    quick_item_3: "qi_3",
    quick_item_4: "qi_4",
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
