import { level, vector, XR_game_object, XR_vector } from "xray16";

import { LuaArray, Optional, TNumberId } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { associations } from "@/mod/scripts/core/schemes/animpoint/animpoint_predicates";
import { ISchemeAnimpointState } from "@/mod/scripts/core/schemes/animpoint/ISchemeAnimpointState";
import { AbstractSchemeManager } from "@/mod/scripts/core/schemes/base/AbstractSchemeManager";
import { CampStoryManager } from "@/mod/scripts/core/schemes/camper/CampStoryManager";
import { states } from "@/mod/scripts/core/objects/state/lib/state_lib";
import { abort } from "@/mod/scripts/utils/debug";

/**
 * todo;
 */
function angleToDirection(angle: XR_vector): XR_vector {
  const yaw: number = angle.y;
  const pitch: number = angle.x;

  return new vector().setHP(yaw, pitch).normalize();
}

/**
 * todo;
 */
const associativeTable: LuaTable<
  string,
  {
    director: LuaArray<string>;
    listener: LuaArray<string>;
  }
> = {
  idle: {
    director: ["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"],
    listener: ["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"],
  },
  harmonica: {
    director: ["_harmonica"],
    listener: ["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"],
  },
  guitar: {
    director: ["_guitar"],
    listener: ["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"],
  },
  story: {
    director: ["", "_weapon"],
    listener: ["", "_eat_bread", "_eat_kolbasa", "_drink_vodka", "_drink_energy", "_weapon"],
  },
} as any;

/**
 * todo;
 */
export class AnimpointManager extends AbstractSchemeManager<ISchemeAnimpointState> {
  public camp: Optional<CampStoryManager> = null;
  public current_action: Optional<string> = null;
  public position: Optional<XR_vector> = null;
  public position_vertex: Optional<number> = null;
  public vertex_position: Optional<XR_vector> = null;
  public smart_direction: Optional<XR_vector> = null;
  public look_position: Optional<XR_vector> = null;
  public avail_actions: Optional<LuaTable<number>> = null;
  public cover_name: Optional<string> = null;
  public npcId: Optional<TNumberId> = null;
  public started: boolean = false;

  /**
   * todo;
   */
  public constructor(object: XR_game_object, state: ISchemeAnimpointState) {
    super(object, state);
    this.npcId = object.id();
  }

  /**
   * todo;
   */
  public initialize(): void {
    this.state.base_action = null;
    this.state.approved_actions = new LuaTable();
    this.state.description = null;
    this.camp = null;
    this.current_action = null;
    this.position = null;
    this.smart_direction = null;
    this.look_position = null;
    this.avail_actions = new LuaTable();
    this.started = false;
    this.cover_name = null;
  }

  /**
   * todo;
   */
  public activateScheme(loading: boolean, object: XR_game_object, switching_scheme: boolean): void {
    this.state.signals = new LuaTable();
    this.calculate_position();

    if (this.started === true) {
      if (!this.state.use_camp && this.cover_name === this.state.cover_name) {
        this.fill_approved_actions();

        const target_action = this.state.approved_actions!.get(math.random(this.state.approved_actions!.length())).name;

        const current_st_animstate = states.get(target_action).animstate;
        const target_st_animstate = states.get(this.current_action!).animstate;

        if (current_st_animstate === target_st_animstate) {
          if (target_action !== this.current_action) {
            this.current_action = this.state.approved_actions!.get(
              math.random(this.state.approved_actions!.length())
            ).name;
          }

          return;
        }
      }

      this.stop();
    }
  }

  /**
   * todo;
   */
  public calculate_position(): void {
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

    const description_name: string = smartcover.description()!;

    if (associations.get(description_name) === null) {
      if (this.state.avail_animations === null) {
        abort("Wrong animpoint smart_cover description %s, name %s", tostring(description_name), smartcover.name());
      }
    }

    this.state.description = description_name;
    this.avail_actions = associations.get(description_name);
    this.state.approved_actions = new LuaTable();

    /* --[[ ������� ������������� � :start().
        -- ���� ����� ����� ���������, �� �� ������� ���������� � ����� ������������.
        if this.state.avail_animations !== null {
          -- animations are set from custom_data?
          for k, v in pairs(this.state.avail_animations) do
            table.insert(this.state.approved_actions, {predicate = function() return true }, name = v})
      }
      else
      if this.avail_actions !== null {
      for k,v in pairs(this.avail_actions) do
    -- ������� �� ��������, ������� �� �������� �� �����������
    --printf("checking approved actions %s", this.npc_id)
      if v.predicate(this.npc_id)==true {
      table.insert(this.state.approved_actions, v)
    }
    }
    }
    }

    if(#this.state.approved_actions==0) {
      abort("There is no approved actions for stalker[%s] in animpoint[%s]",
       db.storage[this.npc_id].object:name(), this.object:name())
        }
    ]]*/
  }

  /**
   * todo;
   */
  public get_animation_params(): LuaMultiReturn<[Optional<XR_vector>, Optional<XR_vector>]> {
    return $multi(this.position, this.smart_direction);
  }

  /**
   * todo;
   */
  public position_riched(): boolean {
    if (this.current_action !== null) {
      return true;
    }

    if (this.position === null) {
      return false;
    }

    const npc: XR_game_object = registry.objects.get(this.npcId!).object!;

    if (npc === null) {
      return false;
    }

    const distance_reached: boolean =
      npc.position().distance_to_sqr(this.vertex_position!) <= this.state.reach_distance;
    const v1: number = -math.deg(math.atan2(this.smart_direction!.x, this.smart_direction!.z));
    const v2: number = -math.deg(math.atan2(npc.direction().x, npc.direction().z));
    const rot_y: number = math.min(math.abs(v1 - v2), 360 - math.abs(v1) - math.abs(v2));
    const direction_reached: boolean = rot_y < 50;

    return distance_reached && direction_reached;
  }

  /**
   * todo;
   */
  public fill_approved_actions(): void {
    const is_in_camp = this.camp !== null;

    if (this.state.avail_animations !== null) {
      for (const [k, v] of this.state.avail_animations!) {
        table.insert(this.state.approved_actions!, {
          predicate: () => true,
          name: v,
        });
      }
    } else {
      if (this.avail_actions !== null) {
        for (const [k, v] of this.avail_actions) {
          if (v.predicate(this.npcId, is_in_camp) === true) {
            table.insert(this.state.approved_actions!, v);
          }
        }
      }
    }

    if (this.state.approved_actions!.length() === 0) {
      abort(
        "There is no approved actions for stalker[%s] in animpoint[%s]",
        registry.objects.get(this.npcId!).object!.name(),
        this.object.name()
      );
    }
  }

  /**
   * todo;
   */
  public start(): void {
    if (this.state.use_camp) {
      this.camp = CampStoryManager.get_current_camp(this.position);
    }

    this.fill_approved_actions();

    if (this.camp !== null) {
      this.camp.register_npc(this.npcId!);
    } else {
      this.current_action = this.state.approved_actions!.get(math.random(this.state.approved_actions!.length())).name;
    }

    this.started = true;
    this.cover_name = this.state.cover_name;
  }

  /**
   * todo;
   */
  public stop(): void {
    if (this.camp !== null) {
      this.camp.unregister_npc(this.npcId!);
    }

    this.started = false;
    this.current_action = null;
  }

  /**
   * todo;
   */
  public get_action(): Optional<string> {
    return this.current_action;
  }

  /**
   * todo;
   */
  public override update(): void {
    const tmp_actions: LuaTable<number, string> = new LuaTable();
    const descr = this.state.description;

    if (!this.state.use_camp) {
      if (this.state.avail_animations === null) {
        if (this.state.approved_actions === null) {
          abort("animpoint not in camp and approved_actions is null. Name [%s]", this.state.cover_name);
        }

        for (const [k, v] of this.state.approved_actions!) {
          table.insert(tmp_actions, v.name);
        }
      } else {
        for (const [k, v] of this.state.avail_animations!) {
          table.insert(tmp_actions, v);
        }
      }

      this.current_action = tmp_actions.get(math.random(tmp_actions.length()));

      return;
    }

    if (this.npcId === null) {
      abort("Trying to use destroyed object!");
    }

    const [camp_action, is_director] = (
      this.camp as { get_camp_action: (npcId: number) => LuaMultiReturn<[string, boolean]> }
    ).get_camp_action(this.npcId);
    const tbl = is_director ? associativeTable.get(camp_action).director : associativeTable.get(camp_action).listener;

    let found = false;

    for (const [k, v] of this.state.approved_actions!) {
      for (const i of $range(1, tbl.length())) {
        if (descr + tbl.get(i) === v.name) {
          table.insert(tmp_actions, v.name);
          found = true;
        }
      }
    }

    if (!found) {
      table.insert(tmp_actions, descr as string);
    }

    const rnd: number = math.random(tmp_actions.length());
    let action = tmp_actions.get(rnd);

    if (this.state.base_action) {
      if (this.state.base_action === descr + "_weapon") {
        action = descr + "_weapon";
      }

      if (action === descr + "_weapon" && this.state.base_action === descr) {
        table.remove(tmp_actions, rnd);
        action = tmp_actions.get(math.random(tmp_actions.length()));
      }
    } else {
      if (action === descr + "_weapon") {
        this.state.base_action = action;
      } else {
        this.state.base_action = descr;
      }
    }

    this.current_action = action;
  }
}
