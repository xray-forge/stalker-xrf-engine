import { packGame } from "#/pack/pack_game";
import { packMod } from "#/pack/pack_mod";

/**
 * Generic pack command parameters interface.
 */
export interface IPackParameters {
  clean?: boolean;
  verbose?: boolean;
  optimize?: boolean;
  engine?: string;
  skipEngine: boolean;
  build?: boolean;
  compress?: boolean;
  assetOverrides?: boolean;
}

export enum EPackageType {
  MOD = "mod",
  GAME = "game",
}

/**
 * Handle packaging command.
 */
export async function pack(type: EPackageType, parameters: IPackParameters): Promise<void> {
  switch (type) {
    case EPackageType.GAME:
      return packGame(parameters);

    case EPackageType.MOD:
      return packMod(parameters);

    default:
      throw new Error(
        `Unexpected command type provided: '${type}', expected '${Object.values(EPackageType).join(",")}'.`
      );
  }
}
