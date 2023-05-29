import { action_base, LuabindClass } from "xray16";

import { registry, setStalkerState } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { EStalkerState } from "@/engine/core/objects/state";
import { StalkerMoveManager } from "@/engine/core/objects/state/StalkerMoveManager";
import { associations } from "@/engine/core/schemes/animpoint/animpoint_predicates";
import { IAnimpointAction } from "@/engine/core/schemes/animpoint/types";
import { CampStoryManager } from "@/engine/core/schemes/camper/CampStoryManager";
import { ISchemeWalkerState } from "@/engine/core/schemes/walker";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parsePathWaypoints } from "@/engine/core/utils/parse";
import { ClientObject, Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

const ASSOC_TBL = {
  idle: { director: ["wait"] },
  harmonica: { director: ["play_harmonica"] },
  guitar: { director: ["play_guitar"] },
  story: { director: ["wait"] },
};

/**
 * todo;
 */
@LuabindClass()
export class ActionWalkerActivity extends action_base {
  public readonly state: ISchemeWalkerState;
  public readonly moveManager: StalkerMoveManager;

  public availableActions: LuaTable<number, IAnimpointAction>;

  public isInCamp: Optional<boolean> = null;
  public campStoryManager: Optional<CampStoryManager> = null;

  /**
   * todo: Description.
   */
  public constructor(state: ISchemeWalkerState, object: ClientObject) {
    super(null, ActionWalkerActivity.__name);

    this.state = state;
    this.moveManager = registry.objects.get(object.id()).moveManager!;

    this.state.description = EStalkerState.WALKER_CAMP;
    this.availableActions = associations.get(this.state.description);
    this.state.approvedActions = new LuaTable();

    for (const [k, v] of this.availableActions) {
      if (v.predicate(object.id()) === true) {
        table.insert(this.state.approvedActions, v);
      }
    }
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_desired_position();
    this.object.set_desired_direction();
    this.resetScheme(null, this.object);
  }

  /**
   * todo: Description.
   */
  public activateScheme(isLoading: boolean, object: ClientObject): void {
    this.state.signals = new LuaTable();
    this.resetScheme(isLoading, object);
  }

  /**
   * todo: Description.
   */
  public resetScheme(loading: Optional<boolean>, npc: ClientObject): void {
    if (this.state.path_walk_info === null) {
      this.state.path_walk_info = parsePathWaypoints(this.state.path_walk);
    }

    if (this.state.path_look_info === null) {
      this.state.path_look_info = parsePathWaypoints(this.state.path_look);
    }

    this.moveManager.reset(
      this.state.path_walk,
      this.state.path_walk_info as any, // todo cmp of string and table?
      this.state.path_look,
      this.state.path_look_info,
      this.state.team,
      this.state.suggested_state,
      null,
      null,
      null,
      null
    );
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();

    this.moveManager.update();

    const camp = CampStoryManager.getCurrentCamp(this.object.position());

    if (camp !== null && this.state.use_camp === true) {
      this.campStoryManager = camp;
      this.campStoryManager.register_npc(this.object.id());
      this.isInCamp = true;
    } else {
      if (this.isInCamp === true) {
        this.campStoryManager!.unregister_npc(this.object.id());
        this.isInCamp = null;
      }
    }

    if (!this.isInCamp && this.state.sound_idle !== null) {
      GlobalSoundManager.getInstance().playSound(this.object.id(), this.state.sound_idle, null, null);
    }
  }

  /**
   * todo: Description.
   */
  public update(): void {
    if (this.campStoryManager === null) {
      return;
    }

    const [campAction, isDirector] = this.campStoryManager.get_camp_action(this.object.id());

    if (!isDirector) {
      return;
    }

    const tbl = ASSOC_TBL[campAction as keyof typeof ASSOC_TBL].director as any as LuaTable<number>;
    const anim = tbl.get(math.random(tbl.length()));

    setStalkerState(this.object, anim);
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    this.moveManager.finalize();

    if (this.isInCamp === true) {
      this.campStoryManager!.unregister_npc(this.object.id());
      this.isInCamp = null;
    }

    super.finalize();
  }

  /**
   * todo: Description.
   */
  public isPositionReached(): boolean {
    return this.moveManager.isArrivedToFirstWaypoint();
  }

  /**
   * todo: Description.
   */
  public net_destroy(object: ClientObject): void {
    if (this.isInCamp === true) {
      this.campStoryManager!.unregister_npc(object.id());
      this.isInCamp = null;
    }
  }
}
