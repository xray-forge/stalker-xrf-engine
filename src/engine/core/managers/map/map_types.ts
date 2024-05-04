import { TInfoPortion } from "@/engine/lib/constants/info_portions";
import { TLabel, TName } from "@/engine/lib/types";

/**
 * Descriptor of map marks.
 */
export interface IMapGenericSpotDescriptor {
  hint: TLabel;
  target: TName;
  isVisible: boolean;
}

/**
 * Descriptor of anomaly scan for marks.
 */
export interface IMapAnomalyScanDescriptor {
  target: TName;
  hint: TLabel;
  zone: TName;
  group: TInfoPortion;
}

/**
 * Descriptor of map sleep marks.
 */
export interface IMapSleepSpotDescriptor {
  hint: TLabel;
  target: TName;
}

/**
 * Generic mark descriptor.
 */
export interface IMapMarkDescriptor {
  hint: TLabel;
  icon: TName;
}
