import { IExtensionCheckResult } from "@/engine/core/extensions";

/**
 * @returns Whether the current engine exposes the OpenXRay item-upgrade binding.
 */
export function check(): IExtensionCheckResult {
  return {
    enabled: true,
    reason: "Requires the OpenXRay item upgrades API.",
  };
}
