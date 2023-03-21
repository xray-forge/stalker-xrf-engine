import { TXR_net_processor, XR_game_object, XR_net_packet } from "xray16";

import { registry } from "@/engine/core/database/registry";
import { abort } from "@/engine/core/utils/debug";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getTableSize } from "@/engine/core/utils/table";
import { Optional, TCount, TName, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Valid type representation stored in portable store.
 */
export type TPortableStoreValue = Optional<string | number | boolean>;

/**
 * Check whether provided value is correct for saving in portable store.
 */
export enum EPortableStoreType {
  NUMBER = 0,
  STRING = 1,
  BOOLEAN = 2,
}

/**
 * Check whether provided value is correct for saving in portable store.
 */
export function isValidPortableStoreValue(value: unknown): boolean {
  if (value === null) {
    return true;
  }

  const valueType: string = type(value);

  return valueType === "string" || valueType === "number" || valueType === "boolean";
}

/**
 * todo;
 * todo;
 * todo;
 */
export function portableStoreSet<T extends TPortableStoreValue>(object: XR_game_object, key: TName, value: T): void {
  if (!isValidPortableStoreValue(value)) {
    abort("database/portable store: not registered type tried to set: [%s]:[%s].", key, type(value));
  }

  const objectId: TNumberId = object.id();

  if (registry.objects.get(objectId).pstor === null) {
    registry.objects.get(objectId).pstor = new LuaTable();
  }

  registry.objects.get(objectId)!.pstor!.set(key, value);
}

/**
 * todo;
 * todo;
 * todo;
 */
export function portableStoreGet<T extends TPortableStoreValue>(object: XR_game_object, key: TName): Optional<T>;
export function portableStoreGet<T extends TPortableStoreValue>(object: XR_game_object, key: TName, defaultValue: T): T;
export function portableStoreGet<T extends TPortableStoreValue>(
  object: XR_game_object,
  key: TName,
  defaultValue?: T
): Optional<T> {
  const objectId: TNumberId = object.id();

  if (registry.objects.get(objectId).pstor !== null) {
    const value: Optional<T> = registry.objects.get(objectId).pstor!.get(key);

    if (value !== null) {
      return value;
    }
  }

  return defaultValue as T;
}

/**
 * todo;
 * todo;
 * todo;
 */
export function savePortableStore(object: XR_game_object, packet: XR_net_packet): void {
  const objectId: TNumberId = object.id();
  let portableStore: Optional<LuaTable<string>> = registry.objects.get(objectId).pstor;

  if (portableStore === null) {
    portableStore = new LuaTable<string>();
    registry.objects.get(objectId).pstor = portableStore;
  }

  packet.w_u32(getTableSize(portableStore));

  for (const [key, value] of portableStore) {
    packet.w_stringZ(key);

    const valueType: string = type(value);

    if (valueType === "number") {
      packet.w_u8(EPortableStoreType.NUMBER);
      packet.w_float(value);
    } else if (valueType === "string") {
      packet.w_u8(EPortableStoreType.STRING);
      packet.w_stringZ(value);
    } else if (valueType === "boolean") {
      packet.w_u8(EPortableStoreType.BOOLEAN);
      packet.w_bool(value);
    } else {
      abort("database/portable store: not registered type tried to save: [%s]:[%s].", key, type(value));
    }
  }
}

/**
 * todo
 * todo
 * todo
 * todo
 */
export function loadPortableStore(object: XR_game_object, reader: TXR_net_processor): void {
  const objectId: TNumberId = object.id();
  let portableStore: Optional<LuaTable<string>> = registry.objects.get(objectId).pstor;

  if (portableStore === null) {
    portableStore = new LuaTable();
    registry.objects.get(objectId).pstor = portableStore;
  }

  const count: TCount = reader.r_u32();

  for (const it of $range(1, count)) {
    const key: TName = reader.r_stringZ();
    const type: EPortableStoreType = reader.r_u8();

    if (type === EPortableStoreType.NUMBER) {
      portableStore.set(key, reader.r_float());
    } else if (type === EPortableStoreType.STRING) {
      portableStore.set(key, reader.r_stringZ());
    } else if (type === EPortableStoreType.BOOLEAN) {
      portableStore.set(key, reader.r_bool());
    } else {
      abort("database/portable store: not registered type tried to load: [%s]:[%s].", key, type);
    }
  }
}
