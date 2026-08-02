import { GameObject } from "xray16/alias";
import { abort, extern, Nillable, TNumberId } from "xray16/lib";
import { $isNil, $isNotNil } from "xray16/macros";

import { registry } from "@/engine/core/database";
import { initTarget } from "@/engine/core/schemes/stalker/remark/actions";
import { releaseObject } from "@/engine/core/utils/spawn";

import { logger } from "./shared";

/**
 * Release the linked object or a target resolved from the provided story type and section parameters.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object released when no target parameters are provided.
 * @param parameters - Tuple describing the target to release, as type, section and Nillable value.
 */
extern(
  "xr_effects.destroy_object",
  (_: GameObject, object: GameObject, parameters: [Nillable<string>, Nillable<string>, Nillable<string>]): void => {
    if (!parameters[0] && !parameters[1]) {
      return releaseObject(object.id());
    }

    if (!parameters[0] || !parameters[1]) {
      abort("Wrong parameters in destroy_object function.");
    }

    const targetString: string = $isNotNil(parameters[2])
      ? parameters[0] + "|" + parameters[1] + "," + parameters[2]
      : parameters[0] + "|" + parameters[1];
    const [, targetId] = initTarget(object, targetString);

    if ($isNil(targetId)) {
      logger.info(
        "You are trying to set non-existant target [%s] for object [%s] in section [%s]:",
        targetString,
        targetId,
        registry.objects.get(object.id()).activeSection
      );
    }

    releaseObject(targetId as TNumberId);
  }
);
