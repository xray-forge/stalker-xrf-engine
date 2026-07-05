import type { GameObject } from "xray16/alias";
import type { TNumberId } from "xray16/lib";

import { HelicopterFireManager } from "@/engine/core/schemes/helicopter/heli_move/fire";
import { HelicopterFlyManager } from "@/engine/core/schemes/helicopter/heli_move/fly";
import { helicopterConfig } from "@/engine/core/schemes/helicopter/heli_move/HelicopterConfig";

/**
 * @param object - Target game object representing helicopter.
 * @returns Singleton of fire manager matching helicopter object.
 */
export function getHelicopterFireManager(object: GameObject): HelicopterFireManager {
  const objectId: TNumberId = object.id();

  if (helicopterConfig.HELICOPTER_FIRE_MANAGERS.has(objectId)) {
    return helicopterConfig.HELICOPTER_FIRE_MANAGERS.get(objectId);
  } else {
    const manager: HelicopterFireManager = new HelicopterFireManager(object);

    helicopterConfig.HELICOPTER_FIRE_MANAGERS.set(objectId, manager);

    return manager;
  }
}

/**
 * @param object - Target game object representing helicopter.
 * @returns Singleton of fly manager matching helicopter object.
 */
export function getHelicopterFlyManager(object: GameObject): HelicopterFlyManager {
  const objectId: TNumberId = object.id();

  if (helicopterConfig.HELICOPTER_FLY_MANAGERS.has(objectId)) {
    return helicopterConfig.HELICOPTER_FLY_MANAGERS.get(objectId);
  } else {
    const manager: HelicopterFlyManager = new HelicopterFlyManager(object);

    helicopterConfig.HELICOPTER_FLY_MANAGERS.set(objectId, manager);

    return manager;
  }
}
