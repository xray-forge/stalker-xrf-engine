import { alife, system_ini, XR_game_object, XR_ini_file, XR_vector } from "xray16";

import { TAmmoItem } from "@/mod/globals/items/ammo";
import { TSection } from "@/mod/lib/types";
import { isAmmoSection } from "@/mod/scripts/utils/checkers/is";

/**
 * todo: description
 */
export function spawnItemsForObject(
  object: XR_game_object,
  section: TSection,
  count: number = 1,
  probability: number = 100
): void {
  if (count < 1) {
    return;
  } else if (isAmmoSection(section)) {
    return spawnAmmoForObject(object, section, count, probability);
  }

  const id: number = object.id();
  const lvid: number = object.level_vertex_id();
  const gvid: number = object.game_vertex_id();
  const position: XR_vector = object.position();

  for (const i of $range(1, count)) {
    if (math.random(100) <= probability) {
      alife().create(section, position, lvid, gvid, id);
    }
  }
}

/**
 * todo;
 */
export function spawnAmmoForObject(
  object: XR_game_object,
  section: TAmmoItem,
  count: number,
  probability: number = 1
): void {
  if (count < 1) {
    return;
  }

  const id: number = object.id();
  const lvid: number = object.level_vertex_id();
  const gvid: number = object.game_vertex_id();
  const position: XR_vector = object.position();

  const ini: XR_ini_file = system_ini();
  const num_in_box = ini.r_u32(section, "box_size");

  if (math.random(100) <= probability) {
    while (count > num_in_box) {
      alife().create_ammo(section, position, lvid, gvid, id, num_in_box);

      count = count - num_in_box;
    }

    alife().create_ammo(section, position, lvid, gvid, id, count);
  }
}
