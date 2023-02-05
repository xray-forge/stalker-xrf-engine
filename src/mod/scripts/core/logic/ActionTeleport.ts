import { level, patrol, sound_object, time_global, vector, XR_game_object, XR_ini_file, XR_vector } from "xray16";

import { post_processors } from "@/mod/globals/animation/post_processors";
import { sounds } from "@/mod/globals/sound/sounds";
import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { getActor, IStoredObject } from "@/mod/scripts/core/db";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { getConfigNumber, getConfigString } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionTeleport");

export enum ETeleportState {
  IDLE,
  ACTIVATED
}

export interface ITeleportPoint {
  point: string;
  look: string;
  prob: number;
}

export class ActionTeleport extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "sr_teleport";

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());
    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(
      object,
      state,
      new ActionTeleport(object, state)
    );
  }

  public static set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    additional: string
  ): void;
  public static set_scheme(object: XR_game_object, ini: XR_ini_file, scheme: string, section: string): void {
    logger.info("Set scheme:", object.name());

    const state: IStoredObject = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(
      object,
      ini,
      scheme,
      section
    );

    state.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, object);
    state.timeout = getConfigNumber(ini, section, "timeout", object, false, 900);
    state.points = new LuaTable();

    for (const i of $range(1, 10)) {
      const teleportPoint: ITeleportPoint = {
        point: getConfigString(ini, section, "point" + tostring(i), object, false, "", "none"),
        look: getConfigString(ini, section, "look" + tostring(i), object, false, "", "none"),
        prob: getConfigNumber(ini, section, "prob" + tostring(i), object, false, 100)
      };

      // todo: Break or continue?
      if (teleportPoint.point === "none" || teleportPoint.look === "none") {
        break;
      }

      table.insert(state.points, teleportPoint);
    }

    if (state.points.length() === 0) {
      abort("Wrong point nums in sr_teleport [%s]", tostring(section));
    }
  }

  public teleportState: ETeleportState = ETeleportState.IDLE;
  public timer: Optional<number> = null;

  public update(delta: number): void {
    const actor: Optional<XR_game_object> = getActor();

    if (!actor) {
      return;
    }

    if (this.teleportState === ETeleportState.IDLE) {
      if (this.object.inside(actor.position())) {
        this.teleportState = ETeleportState.ACTIVATED;
        this.timer = time_global();
        level.add_pp_effector(post_processors.teleport, 2006, false);
        // --set_postprocess("scripts\\teleport.ltx")
      }
    }

    if (this.teleportState === ETeleportState.ACTIVATED) {
      if (time_global() - this.timer! >= this.state.timeout!) {
        const temp: LuaTable<number, ITeleportPoint> = new LuaTable();
        let maxRandom: number = 0;

        for (const [k, v] of this.state.points!) {
          temp.set(k, v);
          maxRandom = maxRandom + v.prob;
        }

        let probability: number = math.random(0, maxRandom);

        for (const [k, teleportPoint] of temp) {
          probability = probability - teleportPoint.prob;
          if (probability <= 0) {
            this.teleportActor(actor, teleportPoint);
            break;
          }
        }

        this.teleportState = ETeleportState.IDLE;
      } else {
        return;
      }
    }

    if (get_global<AnyCallablesModule>("xr_logic").try_switch_to_another_section(this.object, this.state, actor)) {
      return;
    }
  }

  public teleportActor(actor: XR_game_object, teleportPoint: ITeleportPoint): void {
    logger.info("Teleporting actor:", teleportPoint.point);

    const pointPatrolVector: XR_vector = new patrol(teleportPoint.point).point(0);
    const lookDirectionVector: XR_vector = new patrol(teleportPoint.look).point(0).sub(pointPatrolVector);

    actor.set_actor_position(pointPatrolVector);
    actor.set_actor_direction(-lookDirectionVector.getH());

    new sound_object(sounds.affects_tinnitus3a).play_no_feedback(actor, sound_object.s2d, 0, new vector(), 1.0);
  }
}
