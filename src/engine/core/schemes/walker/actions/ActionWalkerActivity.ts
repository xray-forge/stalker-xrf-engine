import { action_base, LuabindClass } from "xray16";

import { registry, setStalkerState } from "@/engine/core/database";
import { getCampForPosition } from "@/engine/core/database/camp";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { StalkerMoveManager } from "@/engine/core/objects/ai/state/StalkerMoveManager";
import { EStalkerState } from "@/engine/core/objects/animation";
import { animpoint_predicates } from "@/engine/core/objects/animation/predicates/animpoint_predicates";
import { CampManager } from "@/engine/core/objects/camp/CampManager";
import { IAnimpointActionDescriptor } from "@/engine/core/schemes/animpoint/types";
import { ISchemeEventHandler } from "@/engine/core/schemes/base";
import { ISchemeWalkerState } from "@/engine/core/schemes/walker";
import { parseWaypointsData } from "@/engine/core/utils/ini/ini_parse";
import { LuaLogger } from "@/engine/core/utils/logging";
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
export class ActionWalkerActivity extends action_base implements ISchemeEventHandler {
  public readonly state: ISchemeWalkerState;
  public readonly moveManager: StalkerMoveManager;

  public availableActions: LuaTable<number, IAnimpointActionDescriptor>;

  public isInCamp: Optional<boolean> = null;
  public campStoryManager: Optional<CampManager> = null;

  public constructor(state: ISchemeWalkerState, object: ClientObject) {
    super(null, ActionWalkerActivity.__name);

    this.state = state;
    this.moveManager = registry.objects.get(object.id()).moveManager!;

    this.state.description = EStalkerState.WALKER_CAMP;
    this.availableActions = animpoint_predicates.get(this.state.description);
    this.state.approvedActions = new LuaTable();

    for (const [, animpointAction] of this.availableActions) {
      if (animpointAction.predicate(object)) {
        table.insert(this.state.approvedActions, animpointAction);
      }
    }
  }

  /**
   * Initialize action and start processing of walker action.
   */
  public override initialize(): void {
    logger.info("Activate walker scheme:", this.object.name());

    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();

    this.resetScheme(false, this.object);
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    logger.info("Deactivate walker scheme:", this.object.name());

    this.moveManager.finalize();

    if (this.isInCamp === true) {
      this.campStoryManager!.unregisterObject(this.object.id());
      this.isInCamp = null;
    }

    super.finalize();
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();

    this.moveManager.update();

    const camp: Optional<CampManager> = getCampForPosition(this.object.position());

    if (camp !== null && this.state.use_camp === true) {
      this.campStoryManager = camp;
      this.campStoryManager.registerObject(this.object.id());
      this.isInCamp = true;
    } else {
      if (this.isInCamp === true) {
        this.campStoryManager!.unregisterObject(this.object.id());
        this.isInCamp = null;
      }
    }

    if (!this.isInCamp && this.state.sound_idle !== null) {
      GlobalSoundManager.getInstance().playSound(this.object.id(), this.state.sound_idle);
    }
  }

  /**
   * todo: Description.
   */
  public update(): void {
    if (this.campStoryManager === null) {
      return;
    }

    const [campAction, isDirector] = this.campStoryManager.getCampAction(this.object.id());

    if (!isDirector) {
      return;
    }

    const list = ASSOC_TBL[campAction as keyof typeof ASSOC_TBL].director as any as LuaTable<number>;
    const anim = list.get(math.random(list.length()));

    setStalkerState(this.object, anim);
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
      this.campStoryManager!.unregisterObject(object.id());
      this.isInCamp = null;
    }
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
  public resetScheme(isLoading: boolean, object: ClientObject): void {
    if (this.state.path_walk_info === null) {
      this.state.path_walk_info = parseWaypointsData(this.state.path_walk);
    }

    if (this.state.path_look_info === null) {
      this.state.path_look_info = parseWaypointsData(this.state.path_look);
    }

    this.moveManager.reset(
      this.state.path_walk,
      this.state.path_walk_info,
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
}
