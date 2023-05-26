import { game_object, level, vector } from "xray16";

import { registry } from "@/engine/core/database";
import { SmartCover } from "@/engine/core/objects";
import { EStalkerState } from "@/engine/core/objects/state";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import {
  animpointPredicateAlways,
  associations,
  associativeTable,
} from "@/engine/core/schemes/animpoint/animpoint_predicates";
import { ISchemeAnimpointState } from "@/engine/core/schemes/animpoint/ISchemeAnimpointState";
import { IAnimpointAction } from "@/engine/core/schemes/animpoint/types";
import { CampStoryManager } from "@/engine/core/schemes/camper/CampStoryManager";
import { abort, assertDefined } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { angleToDirection } from "@/engine/core/utils/vector";
import { LuaArray, Optional, TName, TNumberId, TRate } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class AnimpointManager extends AbstractSchemeManager<ISchemeAnimpointState> {
  public isStarted: boolean = false;

  public currentAction: Optional<EStalkerState> = null;
  public availableActions: Optional<LuaArray<IAnimpointAction>> = null;

  public camp: Optional<CampStoryManager> = null;
  public coverName: Optional<TName> = null;

  public position: Optional<vector> = null;
  public positionLevelVertexId: Optional<TNumberId> = null;
  public vertexPosition: Optional<vector> = null;
  public smartCoverDirection: Optional<vector> = null;
  public lookPosition: Optional<vector> = null;

  /**
   * todo: Description.
   */
  public override update(): void {
    const actionsList: LuaArray<EStalkerState> = new LuaTable();
    const description: Optional<EStalkerState> = this.state.description;

    if (this.state.use_camp) {
      const [campAction, isDirector] = (
        this.camp as { get_camp_action: (npcId: number) => LuaMultiReturn<[string, boolean]> }
      ).get_camp_action(this.object.id());
      const campActionsList = isDirector
        ? associativeTable.get(campAction).director
        : associativeTable.get(campAction).listener;

      let isFound: boolean = false;

      for (const [id, action] of this.state.approvedActions!) {
        for (const it of $range(1, campActionsList.length())) {
          if (description + campActionsList.get(it) === action.name) {
            table.insert(actionsList, action.name);
            isFound = true;
          }
        }
      }

      if (!isFound) {
        table.insert(actionsList, description as EStalkerState);
      }

      const randomNumber: number = math.random(actionsList.length());
      let action = actionsList.get(randomNumber);

      if (this.state.actionNameBase) {
        if (this.state.actionNameBase === description + "_weapon") {
          action = (description + "_weapon") as EStalkerState;
        }

        if (action === description + "_weapon" && this.state.actionNameBase === description) {
          table.remove(actionsList, randomNumber);
          action = actionsList.get(math.random(actionsList.length()));
        }
      } else {
        this.state.actionNameBase = action === description + "_weapon" ? action : description;
      }

      this.currentAction = action;
    } else {
      if (this.state.availableAnimations === null) {
        if (this.state.approvedActions === null) {
          abort("animpoint not in camp and approvedActions is null. Name [%s]", this.state.cover_name);
        }

        for (const [index, action] of this.state.approvedActions!) {
          table.insert(actionsList, action.name);
        }
      } else {
        for (const [index, state] of this.state.availableAnimations!) {
          table.insert(actionsList, state);
        }
      }

      this.currentAction = actionsList.get(math.random(actionsList.length()));
    }
  }

  /**
   * todo: Description.
   */
  public calculatePosition(): void {
    const smartCover: Optional<SmartCover> = registry.smartCovers.get(this.state.cover_name);

    assertDefined(smartCover, "There is no smart_cover with name [%s]", this.state.cover_name);

    this.position = registry.smartCovers.get(this.state.cover_name).position;
    this.positionLevelVertexId = level.vertex_id(this.position);
    this.vertexPosition = level.vertex_position(this.positionLevelVertexId);

    this.smartCoverDirection = angleToDirection(smartCover.angle);

    const lookDirection: vector = this.smartCoverDirection!.normalize();

    this.lookPosition = new vector().set(
      this.position.x + 10 * lookDirection.x,
      this.position.y,
      this.position.z + 10 * lookDirection.z
    );

    const descriptionState: EStalkerState = smartCover.description() as EStalkerState;

    if (associations.get(descriptionState) === null) {
      if (this.state.availableAnimations === null) {
        abort("Wrong animpoint smart_cover description %s, name %s", tostring(descriptionState), smartCover.name());
      }
    }

    this.state.description = descriptionState;
    this.availableActions = associations.get(descriptionState);
    this.state.approvedActions = new LuaTable();
  }

  /**
   * todo: Description.
   */
  public getAnimationParameters(): LuaMultiReturn<[Optional<vector>, Optional<vector>]> {
    return $multi(this.position, this.smartCoverDirection);
  }

  /**
   * todo: Description.
   */
  public isPositionReached(): boolean {
    if (this.currentAction !== null) {
      return true;
    }

    if (this.position === null) {
      return false;
    }

    const object: game_object = registry.objects.get(this.object.id()).object!;

    if (object === null) {
      return false;
    }

    const distance_reached: boolean =
      object.position().distance_to_sqr(this.vertexPosition!) <= this.state.reach_distance;
    const v1: number = -math.deg(math.atan2(this.smartCoverDirection!.x, this.smartCoverDirection!.z));
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

    if (this.state.availableAnimations !== null) {
      for (const [k, v] of this.state.availableAnimations!) {
        table.insert(this.state.approvedActions!, {
          predicate: animpointPredicateAlways,
          name: v,
        });
      }
    } else {
      if (this.availableActions !== null) {
        for (const [k, action] of this.availableActions) {
          if (action.predicate(this.object.id(), isInCamp)) {
            table.insert(this.state.approvedActions!, action);
          }
        }
      }
    }

    if (this.state.approvedActions!.length() === 0) {
      abort("There is no approved actions for stalker[%s] in animpoint", this.object.name());
    }
  }

  /**
   * todo: Description.
   */
  public getCurrentAction(): Optional<EStalkerState> {
    return this.currentAction;
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
      this.camp.register_npc(this.object.id());
    } else {
      this.currentAction = this.state.approvedActions!.get(math.random(this.state.approvedActions!.length())).name;
    }

    this.isStarted = true;
    this.coverName = this.state.cover_name;
  }

  /**
   * todo: Description.
   */
  public stop(): void {
    if (this.camp !== null) {
      this.camp.unregister_npc(this.object.id());
    }

    this.isStarted = false;
    this.currentAction = null;
  }
}
