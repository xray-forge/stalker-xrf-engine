import { IRegistryObjectState } from "@/engine/core/database/database_types";
import { registry } from "@/engine/core/database/registry";
import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NetPacket, NetProcessor, Optional, TCount, TName, TNumberId } from "@/engine/lib/types";

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
 * @param objectId - game object id to set portable value for
 * @param key - portable store key to set
 * @param value - value to set in portable store
 */
export function setPortableStoreValue<T extends TPortableStoreValue>(objectId: TNumberId, key: TName, value: T): void {
  if (!isValidPortableStoreValue(value)) {
    abort("Portable store received not registered type to set: '%s' - '%s'.", key, type(value));
  }

  let portableStore: Optional<LuaTable<TName>> = registry.objects.get(objectId).portableStore;

  if (!portableStore) {
    portableStore = new LuaTable();
    registry.objects.get(objectId).portableStore = portableStore;
  }

  portableStore.set(key, value);
}

/**
 * Get value from object portable store.
 *
 * @param objectId - game object id to load portable store value from
 * @param key - portable store key to get value
 */
export function getPortableStoreValue<T extends TPortableStoreValue>(objectId: TNumberId, key: TName): Optional<T>;
export function getPortableStoreValue<T extends TPortableStoreValue>(
  objectId: TNumberId,
  key: TName,
  defaultValue: T
): T;
export function getPortableStoreValue<T extends TPortableStoreValue>(
  objectId: TNumberId,
  key: TName,
  defaultValue: Optional<T> = null
): Optional<T> {
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
 * @param objectId - game object id to save portable store for
 * @param packet - net packet to save data in
 */
export function savePortableStore(objectId: TNumberId, packet: NetPacket): void {
  let portableStore: Optional<LuaTable<string>> = registry.objects.get(objectId).portableStore;

  if (!portableStore) {
    portableStore = new LuaTable<string>();
    registry.objects.get(objectId).portableStore = portableStore;
  }

  packet.w_u32(table.size(portableStore));

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
        abort("Portable store: not registered type tried to save '%s' - '%s'.", key, type(value));
    }
  }
}

/**
 * Load object portable store data from net packet.
 *
 * @param objectId - game object id to load portable store for
 * @param reader - net processor to load data from
 */
export function loadPortableStore(objectId: TNumberId, reader: NetProcessor): void {
  let portableStore: Optional<LuaTable<string>> = registry.objects.get(objectId).portableStore;

  if (!portableStore) {
    portableStore = new LuaTable();
    registry.objects.get(objectId).portableStore = portableStore;
  }

  const count: TCount = reader.r_u32();

  for (const _ of $range(1, count)) {
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
        abort("Portable store: not registered type tried to load: '%s' - '%s'.", key, type);
    }
  }
}

/**
 * Initialize object portable store if it does not exist.
 *
 * @param objectId - client game object id for portable store initialization
 */
export function initializePortableStore(objectId: TNumberId): void {
  const state: IRegistryObjectState = registry.objects.get(objectId);

  if (!state.portableStore) {
    state.portableStore = new LuaTable();
  }
}

/**
 * Initialize object portable store if it does not exist.
 *
 * @param objectId - client game object id for portable store destruction
 */
export function destroyPortableStore(objectId: TNumberId): void {
  const state: Optional<IRegistryObjectState> = registry.objects.get(objectId);

  if (state !== null) {
    state.portableStore = null;
  }
}
