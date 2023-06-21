import { level } from "xray16";

import { registry } from "@/engine/core/database";
import { SmartCover } from "@/engine/core/objects";
import { EStalkerState } from "@/engine/core/objects/state";
import { states } from "@/engine/core/objects/state_lib/state_lib";
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
import { angleToDirection, createVector } from "@/engine/core/utils/vector";
import { ClientObject, LuaArray, Optional, TName, TNumberId, TRate, Vector } from "@/engine/lib/types";

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

  public position: Optional<Vector> = null;
  public positionLevelVertexId: Optional<TNumberId> = null;
  public vertexPosition: Optional<Vector> = null;
  public smartCoverDirection: Optional<Vector> = null;
  public lookPosition: Optional<Vector> = null;

  public override activateScheme(isLoading: boolean, object: ClientObject): void {
    this.state.signals = new LuaTable();

    this.calculatePosition();

    if (this.isStarted) {
      if (!this.state.useCamp && this.coverName === this.state.coverName) {
        this.fillApprovedActions();

        const targetAction: EStalkerState = this.state.approvedActions.get(
          math.random(this.state.approvedActions.length())
        ).name;

        const currentStateAnimstate: Optional<EStalkerState> = states.get(targetAction).animstate;
        const targetStateAnimstate: Optional<EStalkerState> = states.get(this.currentAction as EStalkerState).animstate;

        if (currentStateAnimstate === targetStateAnimstate) {
          if (targetAction !== this.currentAction) {
            this.currentAction = this.state.approvedActions.get(math.random(this.state.approvedActions.length())).name;
          }

          return;
        }
      }

      this.stop();
    }
  }

  public update(): void {
    const actionsList: LuaArray<EStalkerState> = new LuaTable();
    const description: Optional<EStalkerState> = this.state.description;

    if (this.state.useCamp) {
      const [campAction, isDirector] = this.camp!.getCampAction(this.object.id());
      const campActionsList = isDirector
        ? associativeTable.get(campAction as TName).director
        : associativeTable.get(campAction as TName).listener;

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
      let action: EStalkerState = actionsList.get(randomNumber);

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
        assertDefined(
          this.state.approvedActions,
          "animpoint not in camp and approvedActions is null. Name [%s]",
          this.state.coverName
        );

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
    const smartCover: Optional<SmartCover> = registry.smartCovers.get(this.state.coverName);

    assertDefined(smartCover, "There is no smart_cover with name [%s]", this.state.coverName);

    this.position = registry.smartCovers.get(this.state.coverName).position;
    this.positionLevelVertexId = level.vertex_id(this.position);
    this.vertexPosition = level.vertex_position(this.positionLevelVertexId);

    this.smartCoverDirection = angleToDirection(smartCover.angle);

    const lookDirection: Vector = this.smartCoverDirection!.normalize();

    this.lookPosition = createVector(
      this.position.x + 10 * lookDirection.x,
      this.position.y,
      this.position.z + 10 * lookDirection.z
    );

    const descriptionState: EStalkerState = smartCover.description() as EStalkerState;

    if (associations.get(descriptionState) === null) {
      assertDefined(
        this.state.availableAnimations,
        "Wrong animpoint smart_cover description %s, name %s",
        tostring(descriptionState),
        smartCover.name()
      );
    }

    this.state.description = descriptionState;
    this.availableActions = associations.get(descriptionState);
    this.state.approvedActions = new LuaTable();
  }

  /**
   * todo: Description.
   */
  public getAnimationParameters(): LuaMultiReturn<[Optional<Vector>, Optional<Vector>]> {
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

    const object: ClientObject = registry.objects.get(this.object.id()).object;

    if (object === null) {
      return false;
    }

    const v1: TRate = -math.deg(math.atan2(this.smartCoverDirection!.x, this.smartCoverDirection!.z));
    const v2: TRate = -math.deg(math.atan2(object.direction().x, object.direction().z));
    const rotY: TRate = math.min(math.abs(v1 - v2), 360 - math.abs(v1) - math.abs(v2));

    const isDistanceReached: boolean =
      object.position().distance_to_sqr(this.vertexPosition!) <= this.state.reachDistance;
    const isDirectionReached: boolean = rotY < 50;

    return isDistanceReached && isDirectionReached;
  }

  /**
   * todo: Description.
   */
  public fillApprovedActions(): void {
    const isInCamp: boolean = this.camp !== null;

    if (this.state.availableAnimations !== null) {
      for (const [k, v] of this.state.availableAnimations) {
        table.insert(this.state.approvedActions, {
          predicate: animpointPredicateAlways,
          name: v,
        });
      }
    } else {
      if (this.availableActions !== null) {
        for (const [k, action] of this.availableActions) {
          if (action.predicate(this.object.id(), isInCamp)) {
            table.insert(this.state.approvedActions, action);
          }
        }
      }
    }

    if (this.state.approvedActions.length() === 0) {
      abort("There is no approved actions for stalker[%s] in animpoint", this.object.name());
    }

    logger.info("Filled approved actions:", this.object.name(), this.state.approvedActions.length());
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
    logger.info("Start:", this.object.name());

    if (this.state.useCamp) {
      this.camp = CampStoryManager.getCurrentCamp(this.position);
    }

    this.fillApprovedActions();

    if (this.camp !== null) {
      this.camp.registerNpc(this.object.id());
    } else {
      this.currentAction = this.state.approvedActions!.get(math.random(this.state.approvedActions!.length())).name;
    }

    this.isStarted = true;
    this.coverName = this.state.coverName;

    logger.info("Started:", this.object.name(), this.currentAction, this.coverName);
  }

  /**
   * todo: Description.
   */
  public stop(): void {
    logger.info("Stop:", this.object.name());

    if (this.camp !== null) {
      this.camp.unregisterNpc(this.object.id());
    }

    this.isStarted = false;
    this.currentAction = null;
  }
}
