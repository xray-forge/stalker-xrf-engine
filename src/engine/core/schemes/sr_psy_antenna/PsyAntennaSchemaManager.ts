import { get_hud, level, XR_game_object } from "xray16";

import { registry } from "@/engine/core/database";
import { portableStoreGet, portableStoreSet } from "@/engine/core/database/portable_store";
import { PsyAntennaManager } from "@/engine/core/managers/PsyAntennaManager";
import { AbstractSchemeManager } from "@/engine/core/schemes/base/AbstractSchemeManager";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/base/trySwitchToAnotherSection";
import { ISchemePsyAntennaState } from "@/engine/core/schemes/sr_psy_antenna/ISchemePsyAntennaState";
import { NIL } from "@/engine/lib/constants/words";

const state_outside: number = 0;
const state_inside: number = 1;
const state_void: number = 2;

/**
 * todo;
 */
export class PsyAntennaSchemaManager extends AbstractSchemeManager<ISchemePsyAntennaState> {
  public antennaState: number = state_void;
  public antennaManager: PsyAntennaManager = PsyAntennaManager.getInstance();

  /**
   * todo: Description.
   */
  public override resetScheme(loading?: boolean): void {
    if (loading) {
      this.antennaState = portableStoreGet(this.object, "inside")!;
    }

    if (this.antennaState === state_inside) {
      this.zone_leave();
    }

    this.antennaState = state_void;

    this.switch_state(registry.actor);
  }

  /**
   * todo: Description.
   */
  public override deactivate(): void {
    if (this.antennaState === state_inside) {
      this.zone_leave();
    }
  }

  /**
   * todo: Description.
   */
  public override update(): void {
    const actor = registry.actor;

    if (trySwitchToAnotherSection(this.object, this.state, actor)) {
      return;
    }

    this.switch_state(actor);
  }

  /**
   * todo: Description.
   */
  public switch_state(actor: XR_game_object): void {
    if (this.antennaState !== state_inside) {
      if (this.object.inside(actor.position())) {
        this.zone_enter();

        return;
      }
    } else {
      if (!this.object.inside(actor.position())) {
        this.zone_leave();

        return;
      }
    }
  }

  /**
   * todo: Description.
   */
  public zone_enter(): void {
    this.antennaState = state_inside;

    get_hud().enable_fake_indicators(true);

    this.antennaManager.sound_intensity_base = this.antennaManager.sound_intensity_base + this.state.intensity;
    this.antennaManager.mute_sound_threshold =
      this.antennaManager.mute_sound_threshold + this.state.mute_sound_threshold;
    this.antennaManager.hit_intensity = this.antennaManager.hit_intensity + this.state.hit_intensity;
    this.antennaManager.phantom_spawn_probability =
      this.antennaManager.phantom_spawn_probability + this.state.phantom_prob;

    this.antennaManager.no_static = this.state.no_static;
    this.antennaManager.no_mumble = this.state.no_mumble;
    this.antennaManager.hit_type = this.state.hit_type;
    this.antennaManager.hit_freq = this.state.hit_freq;

    if (this.state.postprocess === NIL) {
      return;
    }

    if (!this.antennaManager.postprocess.has(this.state.postprocess)) {
      this.antennaManager.postprocess_count = this.antennaManager.postprocess_count + 1;
      this.antennaManager.postprocess.set(this.state.postprocess, {
        intensity_base: 0,
        intensity: 0,
        idx: 1500 + this.antennaManager.postprocess_count,
      });

      level.add_pp_effector(
        this.state.postprocess,
        this.antennaManager.postprocess.get(this.state.postprocess).idx,
        true
      );
      level.set_pp_effector_factor(this.antennaManager.postprocess.get(this.state.postprocess).idx, 0.01);
    }

    this.antennaManager.postprocess.get(this.state.postprocess).intensity_base =
      this.antennaManager.postprocess.get(this.state.postprocess).intensity_base + this.state.intensity;
  }

  /**
   * todo: Description.
   */
  public zone_leave(): void {
    this.antennaState = state_outside;

    get_hud().enable_fake_indicators(false);

    this.antennaManager.sound_intensity_base = this.antennaManager.sound_intensity_base - this.state.intensity;
    this.antennaManager.mute_sound_threshold =
      this.antennaManager.mute_sound_threshold - this.state.mute_sound_threshold;
    this.antennaManager.hit_intensity = this.antennaManager.hit_intensity - this.state.hit_intensity;

    this.antennaManager.phantom_spawn_probability =
      this.antennaManager.phantom_spawn_probability - this.state.phantom_prob;

    if (this.state.postprocess === NIL) {
      return;
    }

    if (this.antennaManager.postprocess.has(this.state.postprocess)) {
      this.antennaManager.postprocess.get(this.state.postprocess).intensity_base =
        this.antennaManager.postprocess.get(this.state.postprocess).intensity_base - this.state.intensity;
    }
  }

  /**
   * todo: Description.
   */
  public save(): void {
    portableStoreSet(this.object, "inside", this.antennaState);
  }
}
