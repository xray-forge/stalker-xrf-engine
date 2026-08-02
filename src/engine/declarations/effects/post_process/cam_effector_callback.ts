import { extern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { getActiveSchemeState } from "@/engine/core/schemes/state";

import { logger, postProcessState } from "./shared";

/**
 * Callback for camera effects handling.
 * Sets signal for latest played effector logics.
 */
extern("xr_effects.cam_effector_callback", (): void => {
  logger.info("Run cam effector callback");

  if (!postProcessState.camEffectorPlayingObjectId) {
    return;
  }

  const state: IRegistryObjectState = registry.objects.get(postProcessState.camEffectorPlayingObjectId);

  const activeSchemeState = $isNotNil(state) ? getActiveSchemeState(state) : null;

  if (!activeSchemeState?.signals) {
    return;
  }

  activeSchemeState.signals.set("cameff_end", true);

  // todo: probably reset playing object ID global and move it out.
});
