import { game, level, time_global, XR_game_object } from "xray16";

import { Optional } from "@/mod/lib/types";
import { IStoredObject, storage, zoneByName } from "@/mod/scripts/core/db";
import { cond_name } from "@/mod/scripts/core/schemes/cond_name";
import { switchToSection } from "@/mod/scripts/core/schemes/switchToSection";
import { see_actor } from "@/mod/scripts/utils/alife";
import { isNpcInZone } from "@/mod/scripts/utils/checkers";
import { pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { getDistanceBetween } from "@/mod/scripts/utils/physics";

/**
 * todo;
 * todo;
 * todo;
 */
export function trySwitchToAnotherSection(
  npc: XR_game_object,
  st: IStoredObject,
  actor: Optional<XR_game_object>
): boolean {
  const l = st.logic;
  const npc_id = npc.id();

  if (!actor) {
    abort("try_switch_to_another_section(): error in implementation of scheme '%s': actor is null", st.scheme);
  }

  if (!l) {
    abort("Can't find script switching information in storage, scheme '%s'", storage.get(npc.id()).active_scheme);
  }

  let switched: boolean = false;

  for (const [n, c] of l) {
    if (cond_name(c.name, "on_actor_dist_le")) {
      if (see_actor(npc) && getDistanceBetween(actor, npc) <= c.v1) {
        switched = switchToSection(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else if (cond_name(c.name, "on_actor_dist_le_nvis")) {
      if (getDistanceBetween(actor, npc) <= c.v1) {
        switched = switchToSection(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else if (cond_name(c.name, "on_actor_dist_ge")) {
      if (see_actor(npc) && getDistanceBetween(actor, npc) > c.v1) {
        switched = switchToSection(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else if (cond_name(c.name, "on_actor_dist_ge_nvis")) {
      if (getDistanceBetween(actor, npc) > c.v1) {
        switched = switchToSection(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else if (cond_name(c.name, "on_signal")) {
      if (st.signals && st.signals[c.v1]) {
        switched = switchToSection(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
      // -- FIXME: �� ����������� ��� �����, �������� ���� on_info, �� ��������� ��������� ��� ����������� � ������
    } else if (cond_name(c.name, "on_info")) {
      switched = switchToSection(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
    } else if (cond_name(c.name, "on_timer")) {
      if (time_global() >= storage.get(npc_id).activation_time + c.v1) {
        switched = switchToSection(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else if (cond_name(c.name, "on_game_timer")) {
      if (game.get_game_time().diffSec(storage.get(npc_id).activation_game_time) >= c.v1) {
        switched = switchToSection(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else if (cond_name(c.name, "on_actor_in_zone")) {
      if (isNpcInZone(actor, zoneByName.get(c.v1))) {
        switched = switchToSection(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else if (cond_name(c.name, "on_actor_not_in_zone")) {
      if (!isNpcInZone(actor, zoneByName.get(c.v1))) {
        switched = switchToSection(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else if (cond_name(c.name, "on_npc_in_zone")) {
      if (isNpcInZone(level.object_by_id(c.npc_id), zoneByName.get(c.v2))) {
        switched = switchToSection(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else if (cond_name(c.name, "on_npc_not_in_zone")) {
      if (!isNpcInZone(level.object_by_id(c.npc_id), zoneByName.get(c.v2))) {
        switched = switchToSection(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else if (cond_name(c.name, "on_actor_inside")) {
      if (isNpcInZone(actor, npc)) {
        // --                printf("_bp: TRUE")
        switched = switchToSection(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else if (cond_name(c.name, "on_actor_outside")) {
      if (!isNpcInZone(actor, npc)) {
        switched = switchToSection(npc, st.ini!, pickSectionFromCondList(actor, npc, c.condlist)!);
      }
    } else {
      abort(
        "WARNING: object '%s': try_switch_to_another_section: unknown condition '%s' encountered",
        npc.name(),
        c.name
      );
    }

    if (switched === true) {
      break;
    }
  }

  return switched;
}
