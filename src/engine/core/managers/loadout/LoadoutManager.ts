import { AbstractManager } from "@/engine/core/managers/abstract";
import { ServerObject, TNumberId } from "@/engine/lib/types";

/**
 * Manager handling stalkers loadouts,
 */
export class LoadoutManager extends AbstractManager {
  /**
   * @param object - game object loadout is generated for
   * @param id - id of game object for loadout generation
   * @param iniData - object spawn ini data as string
   * @returns whether loadout was generated or engine should follow default loadout generation logics
   */
  public onGenerateServerObjectLoadout(object: ServerObject, id: TNumberId, iniData: string): boolean {
    return false;
  }
}
