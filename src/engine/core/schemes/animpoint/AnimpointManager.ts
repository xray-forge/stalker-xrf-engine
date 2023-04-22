import { level, vector, XR_game_object, XR_vector } from "xray16";

import { registry } from "@/engine/core/database";
import { EStalkerState } from "@/engine/core/objects/state";
import { states } from "@/engine/core/objects/state_lib/state_lib";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { associations } from "@/engine/core/schemes/animpoint/animpoint_predicates";
import { ISchemeAnimpointState } from "@/engine/core/schemes/animpoint/ISchemeAnimpointState";
import { IStoryAnimationDescriptor } from "@/engine/core/schemes/animpoint/types";
import { CampStoryManager } from "@/engine/core/schemes/camper/CampStoryManager";
import { abort } from "@/engine/core/utils/assertion";
import { angleToDirection } from "@/engine/core/utils/vector";
import { LuaArray, Optional, TName, TNumberId, TRate } from "@/engine/lib/types";

/**
 * todo;
 */
const associativeTable: LuaTable<TName, IStoryAnimationDescriptor> = $fromObject<TName, IStoryAnimationDescriptor>({
  idle: {
    director: $fromArray(["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"]),
    listener: $fromArray(["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"]),
  },
  harmonica: {
    director: $fromArray(["_harmonica"]),
    listener: $fromArray(["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"]),
  },
  guitar: {
    director: $fromArray(["_guitar"]),
    listener: $fromArray(["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"]),
  },
  story: {
    director: $fromArray(["", "_weapon"]),
    listener: $fromArray(["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"]),
  },
});

/**
 * todo;
 */
export class AnimpointManager extends AbstractSchemeManager<ISchemeAnimpointState> {
  public isStarted: boolean = false;

  public objectId: Optional<TNumberId> = null;
  public current_action: Optional<EStalkerState> = null;
  public avail_actions: Optional<LuaTable<number>> = null;

  public camp: Optional<CampStoryManager> = null;
  public cover_name: Optional<string> = null;

  public position: Optional<XR_vector> = null;
  public position_vertex: Optional<number> = null;
  public vertex_position: Optional<XR_vector> = null;
  public smart_direction: Optional<XR_vector> = null;
  public look_position: Optional<XR_vector> = null;

  public constructor(object: XR_game_object, state: ISchemeAnimpointState) {
    super(object, state);
    this.objectId = object.id();
  }

  /**
   * todo: Description.
   */
  public initialize(): void {
    this.state.base_action = null;
    this.state.approvedActions = new LuaTable();
    this.state.description = null;
    this.camp = null;
    this.current_action = null;
    this.position = null;
    this.smart_direction = null;
    this.look_position = null;
    this.avail_actions = new LuaTable();
    this.isStarted = false;
    this.cover_name = null;
  }

  /**
   * todo: Description.
   */
  public override update(): void {
    const actionsList: LuaArray<EStalkerState> = new LuaTable();
    const description: Optional<EStalkerState> = this.state.description;

    if (!this.state.use_camp) {
      if (this.state.avail_animations === null) {
        if (this.state.approvedActions === null) {
          abort("animpoint not in camp and approvedActions is null. Name [%s]", this.state.cover_name);
        }

        for (const [k, v] of this.state.approvedActions!) {
          table.insert(actionsList, v.name);
        }
      } else {
        for (const [k, v] of this.state.avail_animations!) {
          table.insert(actionsList, v);
        }
      }

      this.current_action = actionsList.get(math.random(actionsList.length()));

      return;
    }

    if (this.objectId === null) {
      abort("Trying to use destroyed object!");
    }

    const [camp_action, is_director] = (
      this.camp as { get_camp_action: (npcId: number) => LuaMultiReturn<[string, boolean]> }
    ).get_camp_action(this.objectId);
    const tbl = is_director ? associativeTable.get(camp_action).director : associativeTable.get(camp_action).listener;

    let found = false;

    for (const [k, v] of this.state.approvedActions!) {
      for (const i of $range(1, tbl.length())) {
        if (description + tbl.get(i) === v.name) {
          table.insert(actionsList, v.name);
          found = true;
        }
      }
    }

    if (!found) {
      table.insert(actionsList, description as EStalkerState);
    }

    const rnd: number = math.random(actionsList.length());
    let action = actionsList.get(rnd);

    if (this.state.base_action) {
      if (this.state.base_action === description + "_weapon") {
        action = (description + "_weapon") as EStalkerState;
      }

      if (action === description + "_weapon" && this.state.base_action === description) {
        table.remove(actionsList, rnd);
        action = actionsList.get(math.random(actionsList.length()));
      }
    } else {
      if (action === description + "_weapon") {
        this.state.base_action = action;
      } else {
        this.state.base_action = description;
      }
    }

    this.current_action = action;
  }

  /**
   * todo: Description.
   */
  public activateScheme(loading: boolean, object: XR_game_object, switching_scheme: boolean): void {
    this.state.signals = new LuaTable();
    this.calculatePosition();

    if (this.isStarted === true) {
      if (!this.state.use_camp && this.cover_name === this.state.cover_name) {
        this.fillApprovedActions();

        const target_action = this.state.approvedActions!.get(math.random(this.state.approvedActions!.length())).name;

        const current_st_animstate = states.get(target_action).animstate;
        const target_st_animstate = states.get(this.current_action!).animstate;

        if (current_st_animstate === target_st_animstate) {
          if (target_action !== this.current_action) {
            this.current_action = this.state.approvedActions!.get(
              math.random(this.state.approvedActions!.length())
            ).name;
          }

          return;
        }
      }

      this.stop();
    }
  }

  /**
   * todo: Description.
   */
  public calculatePosition(): void {
    const smartcover = registry.smartCovers.get(this.state.cover_name);

    if (smartcover === null) {
      abort("There is no smart_cover with name [%s]", this.state.cover_name);
    }

    this.position = registry.smartCovers.get(this.state.cover_name).position;
    this.position_vertex = level.vertex_id(this.position);
    this.vertex_position = level.vertex_position(this.position_vertex);

    this.smart_direction = angleToDirection(smartcover.angle);

    const look_dir = this.smart_direction!.normalize();

    this.look_position = new vector().set(
      this.position.x + 10 * look_dir.x,
      this.position.y,
      this.position.z + 10 * look_dir.z
    );

    const description_name: EStalkerState = smartcover.description() as EStalkerState;

    if (associations.get(description_name) === null) {
      if (this.state.avail_animations === null) {
        abort("Wrong animpoint smart_cover description %s, name %s", tostring(description_name), smartcover.name());
      }
    }

    this.state.description = description_name;
    this.avail_actions = associations.get(description_name);
    this.state.approvedActions = new LuaTable();
  }

  /**
   * todo: Description.
   */
  public getAnimationParameters(): LuaMultiReturn<[Optional<XR_vector>, Optional<XR_vector>]> {
    return $multi(this.position, this.smart_direction);
  }

  /**
   * todo: Description.
   */
  public isPositionReached(): boolean {
    if (this.current_action !== null) {
      return true;
    }

    if (this.position === null) {
      return false;
    }

    const object: XR_game_object = registry.objects.get(this.objectId!).object!;

    if (object === null) {
      return false;
    }

    const distance_reached: boolean =
      object.position().distance_to_sqr(this.vertex_position!) <= this.state.reach_distance;
    const v1: number = -math.deg(math.atan2(this.smart_direction!.x, this.smart_direction!.z));
    const v2: number = -math.deg(math.atan2(object.direction().x, object.direction().z));
    const rot_y: TRate = math.min(math.abs(v1 - v2), 360 - math.abs(v1) - math.abs(v2));
    const direction_reached: boolean = rot_y < 50;

    return distance_reached && direction_reached;
  }

  /**
   * todo: Description.
   */
  public fillApprovedActions(): void {
    const isInCamp: boolean = this.camp !== null;

    if (this.state.avail_animations !== null) {
      for (const [k, v] of this.state.avail_animations!) {
        table.insert(this.state.approvedActions!, {
          predicate: () => true,
          name: v,
        });
      }
    } else {
      if (this.avail_actions !== null) {
        for (const [k, v] of this.avail_actions) {
          if (v.predicate(this.objectId, isInCamp) === true) {
            table.insert(this.state.approvedActions!, v);
          }
        }
      }
    }

    if (this.state.approvedActions!.length() === 0) {
      abort(
        "There is no approved actions for stalker[%s] in animpoint[%s]",
        registry.objects.get(this.objectId!).object!.name(),
        this.object.name()
      );
    }
  }

  /**
   * todo: Description.
   */
  public start(): void {
    if (this.state.use_camp) {
      this.camp = CampStoryManager.getCurrentCamp(this.position);
    }

    this.fillApprovedActions();

    if (this.camp !== null) {
      this.camp.register_npc(this.objectId!);
    } else {
      this.current_action = this.state.approvedActions!.get(math.random(this.state.approvedActions!.length())).name;
    }

    this.isStarted = true;
    this.cover_name = this.state.cover_name;
  }

  /**
   * todo: Description.
   */
  public stop(): void {
    if (this.camp !== null) {
      this.camp.unregister_npc(this.objectId!);
    }

    this.isStarted = false;
    this.current_action = null;
  }

  /**
   * todo: Description.
   */
  public getCurrentAction(): Optional<EStalkerState> {
    return this.current_action;
  }
}
