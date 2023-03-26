import { TXR_net_processor, XR_net_packet } from "xray16";

import { registry } from "@/engine/core/database/registry";
import { assert } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TCount, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo
 */
export function openLoadMarker(reader: TXR_net_processor, prefix: TName): void {
  const markerName: TName = "_" + prefix;

  registry.saveMarkers.set(markerName, reader.r_tell());
}

/**
 * todo
 */
export function closeLoadMarker(reader: TXR_net_processor, prefix: TName): void {
  const markerName: TName = "_" + prefix;

  assert(registry.saveMarkers.get(markerName), "Trying to check without marker: '%s'", markerName);

  const c_dif: TCount = reader.r_tell() - registry.saveMarkers.get(markerName);
  const dif: TCount = reader.r_u16();

  assert(dif === c_dif, "Incorrect load '%s': <dif: %s>, <cdif: %s>.", markerName, dif, c_dif);
}

/**
 * todo
 */
export function openSaveMarker(packet: XR_net_packet, prefix: TName): void {
  const markerName: TName = "_" + prefix;

  // log.info("Set save marker result:", result, p.w_tell(), mode);
  registry.saveMarkers.set(markerName, packet.w_tell());

  assert(packet.w_tell() < 16_000, "You are saving too much in '%s'.", prefix);
}

/**
 * todo
 */
export function closeSaveMarker(packet: XR_net_packet, prefix: TName): void {
  const markerName: TName = "_" + prefix;

  assert(registry.saveMarkers.get(markerName), "Trying to check without marker: %s", markerName);

  const markerDif: TCount = packet.w_tell() - registry.saveMarkers.get(markerName);

  if (markerDif >= 8000) {
    logger.info("Saving more than 8000:", prefix, markerDif);
  }

  if (markerDif >= 10240) {
    logger.info("Saving more than 10240:", prefix, markerDif);
  }

  packet.w_u16(markerDif);
}
