import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { TLabel } from "@/engine/lib/types";

/**
 * Get smart terrain name label.
 * Used for UI display or mentioning in strings.
 *
 * @returns translated name label
 */
export function getSmartTerrainNameCaption(smartTerrain: SmartTerrain): TLabel {
  return string.format("st_%s_name", smartTerrain.name());
}
