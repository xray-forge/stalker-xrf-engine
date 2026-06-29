import { AbstractManager } from "@/engine/core/managers/abstract";
import { ServerObject, TNumberId } from "@/engine/lib/types";

/**
 * Manager handling stalkers loadouts.
 */
export class LoadoutManager extends AbstractManager {
  /**
   * @param object - Game object loadout is generated for.
   * @param id - Id of game object for loadout generation.
   * @param iniData - Object spawn ini data as string.
   * @returns Whether loadout was generated or engine should follow default loadout generation logics.
   */
  public onGenerateServerObjectLoadout(object: ServerObject, id: TNumberId, iniData: string): boolean {
    return false;
  }
}
