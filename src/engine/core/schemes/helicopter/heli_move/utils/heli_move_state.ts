import type { GameObject } from "xray16/alias";
import type { TNumberId } from "xray16/lib";

import { HelicopterFireController } from "@/engine/core/schemes/helicopter/heli_move/fire";
import { HelicopterFlyController } from "@/engine/core/schemes/helicopter/heli_move/fly";
import { helicopterConfig } from "@/engine/core/schemes/helicopter/heli_move/HelicopterConfig";

/**
 * @param object - Target game object representing helicopter.
 * @returns Singleton of fire controller matching helicopter object.
 */
export function getHelicopterFireController(object: GameObject): HelicopterFireController {
  const objectId: TNumberId = object.id();

  if (helicopterConfig.HELICOPTER_FIRE_MANAGERS.has(objectId)) {
    return helicopterConfig.HELICOPTER_FIRE_MANAGERS.get(objectId);
  } else {
    const controller: HelicopterFireController = new HelicopterFireController(object);

    helicopterConfig.HELICOPTER_FIRE_MANAGERS.set(objectId, controller);

    return controller;
  }
}

/**
 * @param object - Target game object representing helicopter.
 * @returns Singleton of fly controller matching helicopter object.
 */
export function getHelicopterFlyController(object: GameObject): HelicopterFlyController {
  const objectId: TNumberId = object.id();

  if (helicopterConfig.HELICOPTER_FLY_MANAGERS.has(objectId)) {
    return helicopterConfig.HELICOPTER_FLY_MANAGERS.get(objectId);
  } else {
    const controller: HelicopterFlyController = new HelicopterFlyController(object);

    helicopterConfig.HELICOPTER_FLY_MANAGERS.set(objectId, controller);

    return controller;
  }
}
