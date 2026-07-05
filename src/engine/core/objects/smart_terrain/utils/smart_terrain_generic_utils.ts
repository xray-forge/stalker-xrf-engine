import { TLabel } from "xray16/lib";

import type { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";

/**
 * Get smart terrain name label.
 * Used for UI display or mentioning in strings.
 *
 * @returns Translated name label.
 */
export function getSmartTerrainNameCaption(terrain: SmartTerrain): TLabel {
  return string.format("st_%s_name", terrain.name());
}
