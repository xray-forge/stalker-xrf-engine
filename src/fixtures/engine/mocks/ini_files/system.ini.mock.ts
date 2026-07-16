import { mockArtefacts } from "@/fixtures/engine/mocks/ini_files/artefacts.ltx.mock";
import { mockConsumables } from "@/fixtures/engine/mocks/ini_files/consumable.ltx.mock";
import { mockDevices } from "@/fixtures/engine/mocks/ini_files/devices.ltx.mock";
import { mockEffectors } from "@/fixtures/engine/mocks/ini_files/effectors.ltx.mock";
import { mockGameRelations } from "@/fixtures/engine/mocks/ini_files/game_relations.ltx.mock";
import { mockHelicopter } from "@/fixtures/engine/mocks/ini_files/helicopter.ltx.mock";
import { mockOutfit } from "@/fixtures/engine/mocks/ini_files/outfit.ltx.mock";
import { mockSpawnSections } from "@/fixtures/engine/mocks/ini_files/spawn_sections.ltx.mock";
import { mockSquadDescription } from "@/fixtures/engine/mocks/ini_files/squad_descr.ltx.mock";
import { mockUpgradesLtx } from "@/fixtures/engine/mocks/ini_files/upgrades.ltx.mock";
import { mockWeaponLtx } from "@/fixtures/engine/mocks/ini_files/weapons.ltx.mock";

export const mockSystemIni = {
  ...mockArtefacts,
  ...mockConsumables,
  ...mockDevices,
  ...mockEffectors,
  ...mockGameRelations,
  ...mockHelicopter,
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
  stalker_with_custom_data: {
    custom_data: "some_custom_data.ltx",
  },
};
