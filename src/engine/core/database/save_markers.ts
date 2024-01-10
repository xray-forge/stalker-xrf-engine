import { registry } from "@/engine/core/database/registry";
import { assert } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NetPacket, NetProcessor, TCount, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Open save marker and verify net packet packet size.
 *
 * @param packet - net packet to save data in
 * @param markerName - net packet transaction marker to verify data integrity
 */
export function openSaveMarker(packet: NetPacket, markerName: TName): void {
  const packetSize: TCount = packet.w_tell();

  assert(packetSize < 16_384, "You are saving too much in '%s' - '%s'.", markerName, packetSize);
  registry.saveMarkers.set(markerName, packet.w_tell());
}

/**
 * Close save marker and verify net packet packet size.
 *
 * @param packet - net packet to save data in
 * @param markerName - net packet transaction marker to verify data integrity
 * @returns marker transaction saving size
 */
export function closeSaveMarker(packet: NetPacket, markerName: TName): TCount {
  assert(registry.saveMarkers.get(markerName) !== null, "Trying to check without marker: '%s'.", markerName);

  const markerDif: TCount = packet.w_tell() - registry.saveMarkers.get(markerName);

  if (markerDif >= 10_240) {
    logger.format("Saving more than 10240: %s %s", markerName, markerDif);
  } else if (markerDif >= 8000) {
    logger.format("Saving more than 8000: %s %s", markerName, markerDif);
  }

  packet.w_u16(markerDif);

  return markerDif;
}

/**
 * Open load marker.
 *
 * @param reader - reader to load data from
 * @param markerName - reader transaction marker to verify data integrity
 */
export function openLoadMarker(reader: NetProcessor, markerName: TName): void {
  registry.saveMarkers.set(markerName, reader.r_tell());
}

/**
 * Close load marker and verify net reader size.
 *
 * @param reader - reader to load data from
 * @param markerName - reader transaction marker to verify data integrity
 * @returns marker transaction loading size
 */
export function closeLoadMarker(reader: NetProcessor, markerName: TName): TCount {
  assert(registry.saveMarkers.get(markerName) !== null, "Trying to check without marker: '%s'", markerName);

  const actualDiff: TCount = reader.r_tell() - registry.saveMarkers.get(markerName);
  const expectedDiff: TCount = reader.r_u16();

  assert(
    expectedDiff === actualDiff,
    "Incorrect load '%s': <expected: %s>, <actual: %s>.",
    markerName,
    expectedDiff,
    actualDiff
  );

  return actualDiff;
}
