import { alife, system_ini, XR_game_object, XR_ini_file, XR_vector } from "xray16";

import { TAmmoItem } from "@/mod/globals/items/ammo";
import { TSection } from "@/mod/lib/types/configuration";

/**
 * todo: description
 */
export function spawnItemsForObject(
  object: XR_game_object,
  name: TSection,
  count: number = 1,
  probability: number = 1
): void {
  if (count < 1) {
    return;
  }

  const id: number = object.id();
  const lvid: number = object.level_vertex_id();
  const gvid: number = object.game_vertex_id();
  const position: XR_vector = object.position();

  if (probability === 1) {
    for (const i of $range(1, count)) {
      alife().create(name, position, lvid, gvid, id);
    }
  } else {
    for (const i of $range(1, count)) {
      if (math.random(100) <= probability) {
        alife().create(name, position, lvid, gvid, id);
      }
    }
  }
}

/**
 * todo;
 */
export function spawnAmmoForObject(object: XR_game_object, name: TAmmoItem, count: number): void {
  if (count < 1) {
    return;
  }

  const id: number = object.id();
  const lvid: number = object.level_vertex_id();
  const gvid: number = object.game_vertex_id();
  const position: XR_vector = object.position();

  const ini: XR_ini_file = system_ini();
  const num_in_box = ini.r_u32(name, "box_size");

  while (count > num_in_box) {
    alife().create_ammo(name, position, lvid, gvid, id, num_in_box);

    count = count - num_in_box;
  }

  alife().create_ammo(name, position, lvid, gvid, id, count);
}
