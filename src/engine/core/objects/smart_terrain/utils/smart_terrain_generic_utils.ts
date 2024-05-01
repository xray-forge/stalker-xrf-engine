import type { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { TLabel } from "@/engine/lib/types";

/**
 * Get smart terrain name label.
 * Used for UI display or mentioning in strings.
 *
 * @returns translated name label
 */
export function getSmartTerrainNameCaption(terrain: SmartTerrain): TLabel {
  return string.format("st_%s_name", terrain.name());
}
