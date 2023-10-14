import { TLabel, TName } from "@/engine/lib/types";

/**
 * Descriptor of map marks.
 */
export interface IMapSmartTerrainMarkDescriptor {
  hint: TLabel;
  target: TName;
  isVisible: boolean;
}
