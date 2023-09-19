import { IRegistryObjectState, registry } from "@/engine/core/database";
import { parseStringsList } from "@/engine/core/utils/ini/ini_parse";
import { readIniString } from "@/engine/core/utils/ini/ini_read";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NIL } from "@/engine/lib/constants/words";
import { ClientObject, IniFile, LuaArray, Optional, TName, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class ObjectRestrictionsManager {
  /**
   * Initialize restrictor manager for game object.
   */
  public static initializeForObject(object: ClientObject): ObjectRestrictionsManager {
    // logger.info("Initialize restrictor manager for object:", object.name());

    const state: Optional<IRegistryObjectState> = registry.objects.get(object.id());

    if (!state.restrictionsManager) {
      state.restrictionsManager = new ObjectRestrictionsManager(object);
    }

    return state.restrictionsManager!;
  }

  /**
   * Initialize restrictor manager for game object and activate it.
   */
  public static activateForObject(object: ClientObject, section: TSection): ObjectRestrictionsManager {
    const manager: ObjectRestrictionsManager = ObjectRestrictionsManager.initializeForObject(object);

    manager.activate(section);

    return manager;
  }

  public object: ClientObject;
  public baseOutRestrictions: LuaTable<string, boolean> = new LuaTable();
  public baseInRestrictions: LuaTable<string, boolean> = new LuaTable();

  public constructor(object: ClientObject) {
    this.object = object;

    for (const [, name] of parseStringsList(this.object.out_restrictions())) {
      this.baseOutRestrictions.set(name, true);
    }

    for (const [, name] of parseStringsList(this.object.in_restrictions())) {
      this.baseInRestrictions.set(name, true);
    }
  }

  /**
   * Activate restrictions and apply missing ones.
   */
  public activate(section: TSection): void {
    const objectName: TName = this.object.name();
    const ini: IniFile = registry.objects.get(this.object.id()).ini;

    // logger.info("Activate restrictions:", objectName, section);

    // Update OUT restrictors based on active / ini restrictors.
    const outRestrictorString: string = readIniString(ini, section, "out_restr", false, null, "");
    const newOutRestrictors: LuaArray<TName> = parseStringsList(outRestrictorString);
    const oldOutRestrictors: LuaArray<TName> = parseStringsList(this.object.out_restrictions());

    let restrictorsToAdd: LuaArray<TName> = new LuaTable();
    let restrictorsToRemove: LuaArray<TName> = new LuaTable();

    // Get OUT restrictors to remove.
    for (const [, name] of oldOutRestrictors) {
      let isExistingRestrictor: boolean = false;

      for (const [, newName] of newOutRestrictors) {
        if (name === newName) {
          isExistingRestrictor = true;
          break;
        }
      }

      // todo: Probably omit second check.
      if (!isExistingRestrictor && !this.baseOutRestrictions.get(name)) {
        table.insert(restrictorsToRemove, name);
      }
    }

    // Get OUT restrictors to add.
    for (const [, name] of newOutRestrictors) {
      let isExistingRestrictor: boolean = false;

      for (const [, oldName] of oldOutRestrictors) {
        if (name === oldName) {
          isExistingRestrictor = true;
          break;
        }
      }

      if (!isExistingRestrictor && name !== NIL) {
        table.insert(restrictorsToAdd, name);
      }
    }

    for (const [, name] of restrictorsToRemove) {
      logger.info("Remove 'OUT' restriction:", objectName, name);
      this.object.remove_restrictions(name, "");
    }

    for (const [, name] of restrictorsToAdd) {
      logger.info("Add 'OUT' restriction:", objectName, name);
      this.object.add_restrictions(name, "");
    }

    // Update IN restrictors based on active / ini restrictors.
    const inRestrictorString: string = readIniString(ini, section, "in_restr", false, null, "");
    const newInRestrictor: LuaArray<TName> = parseStringsList(inRestrictorString);
    const oldInRestrictor: LuaArray<TName> = parseStringsList(this.object.in_restrictions());

    restrictorsToAdd = new LuaTable();
    restrictorsToRemove = new LuaTable();

    // Get IN restrictors to remove.
    for (const [, name] of oldInRestrictor) {
      let isExisting: boolean = false;

      for (const [, newName] of newInRestrictor) {
        if (name === newName) {
          isExisting = true;
          break;
        }
      }

      // todo: Probably omit second check.
      if (!isExisting && !this.baseInRestrictions.get(name)) {
        table.insert(restrictorsToRemove, name);
      }
    }

    // Get IN restrictors to add.
    for (const [, name] of newInRestrictor) {
      let isExisting: boolean = false;

      for (const [, oldName] of oldInRestrictor) {
        if (name === oldName) {
          isExisting = true;
          break;
        }
      }

      if (!isExisting && name !== NIL) {
        table.insert(restrictorsToAdd, name);
      }
    }

    for (const [, name] of restrictorsToRemove) {
      logger.info("Remove 'IN' restriction:", objectName, name);
      this.object.remove_restrictions("", name);
    }

    for (const [, name] of restrictorsToAdd) {
      logger.info("Add 'IN' restriction:", objectName, name);
      this.object.add_restrictions("", name);
    }
  }
}
