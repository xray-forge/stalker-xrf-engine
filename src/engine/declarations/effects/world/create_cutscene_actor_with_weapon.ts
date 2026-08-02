import { level, patrol } from "xray16";
import { GameObject, Patrol, ServerObject, ServerWeaponObject } from "xray16/alias";
import { abort, extern, Nillable, TIndex, TName, TRate, TSection } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { questItems } from "@/engine/constants/items/quest_items";
import { weapons } from "@/engine/constants/items/weapons";
import { registry } from "@/engine/core/database";
import { isStalker } from "@/engine/core/utils/class_ids";

import { logger } from "./shared";

/**
 * Spawn a cutscene actor at a patrol path and equip it with a clone of the actor's active weapon.
 *
 * @param actor - Actor game object whose active weapon is cloned for the cutscene actor.
 * @param object - Game object owning the logics scheme.
 * @param spawnSection - Section of the cutscene actor to spawn.
 * @param pathName - Patrol path used as the spawn location.
 * @param index - Patrol point index used for positioning the spawned actor.
 * @param yaw - Yaw angle in degrees applied to the spawned actor.
 * @param slotOverride - Nillable inventory slot used to pick the weapon instead of the active slot.
 */
extern(
  "xr_effects.create_cutscene_actor_with_weapon",
  (
    actor: GameObject,
    object: GameObject,
    [spawnSection, pathName, index = 0, yaw = 0, slotOverride = 0]: [
      Nillable<TSection>,
      Nillable<TName>,
      TIndex,
      TRate,
      TIndex,
    ]
  ): void => {
    logger.info("Create cutscene actor with weapon");

    if (!spawnSection) {
      abort("Wrong spawn section for 'spawn_object' function %s. For object %s", spawnSection, object.name());
    }

    if (!pathName) {
      abort("Wrong path_name for 'spawn_object' function %s. For object %s", pathName, object.name());
    }

    if (!level.patrol_path_exists(pathName)) {
      abort("Path %s doesnt exist. Function 'spawn_object' for object %s ", pathName, object.name());
    }

    const ptr: Patrol = new patrol(pathName);

    const serverObject: ServerObject = registry.simulator.create(
      spawnSection,
      ptr.point(index),
      ptr.level_vertex_id(0),
      ptr.game_vertex_id(0)
    )!;

    if (isStalker(serverObject)) {
      serverObject.o_torso()!.yaw = (yaw * math.pi) / 180;
    } else {
      serverObject.angle.y = (yaw * math.pi) / 180;
    }

    let slot: TIndex;
    let activeItem: Nillable<GameObject> = null;

    if (slotOverride === 0) {
      slot = actor.active_slot();
      if (slot !== 2 && slot !== 3) {
        return;
      }

      activeItem = actor.active_item();
    } else {
      if ($isNotNil(actor.item_in_slot(slotOverride))) {
        activeItem = actor.item_in_slot(slotOverride);
      } else {
        if ($isNotNil(actor.item_in_slot(3))) {
          activeItem = actor.item_in_slot(3);
        } else if ($isNotNil(actor.item_in_slot(2))) {
          activeItem = actor.item_in_slot(2);
        } else {
          return;
        }
      }
    }

    const actorWeapon: ServerWeaponObject = registry.simulator.object(activeItem!.id()) as ServerWeaponObject;
    let sectionName: TName = actorWeapon.section_name();

    if (sectionName === questItems.pri_a17_gauss_rifle) {
      sectionName = weapons.wpn_gauss;
    }

    if (activeItem) {
      const newWeapon: ServerWeaponObject = registry.simulator.create<ServerWeaponObject>(
        sectionName,
        ptr.point(index),
        ptr.level_vertex_id(0),
        ptr.game_vertex_id(0),
        serverObject.id
      );

      if (sectionName !== weapons.wpn_gauss) {
        newWeapon.clone_addons(actorWeapon);
      }
    }
  }
);
