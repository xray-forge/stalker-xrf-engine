import { IBaseSchemeState } from "@/engine/core/schemes/base";
import { TName, TProbability, TRate } from "@/engine/lib/types";

/**
 * todo;
 */
export interface ISchemePsyAntennaState extends IBaseSchemeState {
  intensity: TRate;
  postprocess: TName;
  hit_intensity: TRate;
  phantom_prob: TProbability;
  mute_sound_threshold: TRate;
  no_static: boolean;
  no_mumble: boolean;
  hit_type: string;
  hit_freq: TRate;
}