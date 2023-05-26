import { game_object, net_packet, TXR_net_processor } from "xray16";

import { registry } from "@/engine/core/database/registry";
import { IRegistryObjectState } from "@/engine/core/database/types";
import { abort } from "@/engine/core/utils/assertion";
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
 *
 * @param value - value to check portable store type validity
 * @returns whether value is valid to be stored in portable store
 */
export function isValidPortableStoreValue(value: unknown): boolean {
  if (value === null) {
    return true;
  }

  const valueType: string = type(value);

  return valueType === "string" || valueType === "number" || valueType === "boolean";
}

/**
 * Set value in object portable store by key.
 *
 * @param object - game object to set portable value for
 * @param key - portable store key to set
 * @param value - value to set in portable store
 */
export function setPortableStoreValue<T extends TPortableStoreValue>(object: game_object, key: TName, value: T): void {
  if (!isValidPortableStoreValue(value)) {
    abort("database/portable store: not registered type tried to set: [%s]:[%s].", key, type(value));
  }

  let portableStore: Optional<LuaTable<TName>> = registry.objects.get(object.id()).portableStore;

  if (!portableStore) {
    portableStore = new LuaTable();
    registry.objects.get(object.id()).portableStore = portableStore;
  }

  portableStore.set(key, value);
}

/**
 * Get value from object portable store.
 *
 * @param object - game object to load portable store value from
 * @param key - portable store key to get value
 */
export function getPortableStoreValue<T extends TPortableStoreValue>(object: game_object, key: TName): Optional<T>;
export function getPortableStoreValue<T extends TPortableStoreValue>(
  object: game_object,
  key: TName,
  defaultValue: T
): T;
export function getPortableStoreValue<T extends TPortableStoreValue>(
  object: game_object,
  key: TName,
  defaultValue: Optional<T> = null
): Optional<T> {
  const objectId: TNumberId = object.id();

  if (registry.objects.get(objectId).portableStore) {
    const value: Optional<T> = registry.objects.get(objectId).portableStore!.get(key);

    if (value !== null) {
      return value;
    }
  }

  return defaultValue as T;
}

/**
 * Save object portable store data into net packet.
 *
 * @param object - game object to save portable store for
 * @param packet - net packet to save data in
 */
export function savePortableStore(object: game_object, packet: net_packet): void {
  const objectId: TNumberId = object.id();
  let portableStore: Optional<LuaTable<string>> = registry.objects.get(objectId).portableStore;

  if (!portableStore) {
    portableStore = new LuaTable<string>();
    registry.objects.get(objectId).portableStore = portableStore;
  }

  packet.w_u32(getTableSize(portableStore));

  for (const [key, value] of portableStore) {
    packet.w_stringZ(key);

    const valueType: string = type(value);

    switch (valueType) {
      case "number":
        packet.w_u8(EPortableStoreType.NUMBER);
        packet.w_float(value);
        break;

      case "string":
        packet.w_u8(EPortableStoreType.STRING);
        packet.w_stringZ(value);
        break;

      case "boolean":
        packet.w_u8(EPortableStoreType.BOOLEAN);
        packet.w_bool(value);
        break;

      default:
        abort("database/portable store: not registered type tried to save: [%s]:[%s].", key, type(value));
    }
  }
}

/**
 * Load object portable store data from net packet.
 *
 * @param object - game object to load portable store for
 * @param reader - net processor to load data from
 */
export function loadPortableStore(object: game_object, reader: TXR_net_processor): void {
  const objectId: TNumberId = object.id();
  let portableStore: Optional<LuaTable<string>> = registry.objects.get(objectId).portableStore;

  if (!portableStore) {
    portableStore = new LuaTable();
    registry.objects.get(objectId).portableStore = portableStore;
  }

  const count: TCount = reader.r_u32();

  for (const it of $range(1, count)) {
    const key: TName = reader.r_stringZ();
    const type: EPortableStoreType = reader.r_u8();

    switch (type) {
      case EPortableStoreType.NUMBER:
        portableStore.set(key, reader.r_float());
        break;

      case EPortableStoreType.BOOLEAN:
        portableStore.set(key, reader.r_bool());
        break;

      case EPortableStoreType.STRING:
        portableStore.set(key, reader.r_stringZ());
        break;

      default:
        abort("database/portable store: not registered type tried to load: [%s]:[%s].", key, type);
    }
  }
}

/**
 * Initialize object portable store if it does not exist.
 *
 * @param object - client game object for portable store initialization
 */
export function initializePortableStore(object: game_object): void {
  const state: IRegistryObjectState = registry.objects.get(object.id());

  if (!state.portableStore) {
    state.portableStore = new LuaTable();
  }
}

/**
 * Initialize object portable store if it does not exist.
 *
 * @param object - client game object for portable store destruction
 */
export function destroyPortableStore(object: game_object): void {
  const state: Optional<IRegistryObjectState> = registry.objects.get(object.id());

  if (state !== null) {
    state.portableStore = null;
  }
}
