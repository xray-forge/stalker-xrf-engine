import { game_object } from "xray16";

import { IExtensionCheckResult } from "@/engine/core/utils/extensions";

/**
 * @returns Whether the current engine exposes the OpenXRay item-upgrade binding.
 */
export function check(): IExtensionCheckResult {
  return {
    enabled: type((game_object as unknown as game_object)?.add_upgrade) === "function",
    reason: "Requires the OpenXRay item upgrades API.",
  };
}
