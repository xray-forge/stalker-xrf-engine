import { cond, game, move, patrol, sound_object } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { getManager, registry } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { ISchemeMonsterState } from "@/engine/core/schemes/restrictor/sr_monster/sr_monster_types";
import {
  scriptCaptureMonster,
  scriptCommandMonster,
  scriptReleaseMonster,
  trySwitchToAnotherSection,
} from "@/engine/core/utils/scheme";
import { copyVector, subVectors } from "@/engine/core/utils/vector";
import {
  ESoundObjectType,
  GameObject,
  Optional,
  ServerMonsterAbstractObject,
  SoundObject,
  TCount,
  TIndex,
  TName,
  Vector,
} from "@/engine/lib/types";

/**
 * todo;
 */
export class MonsterManager extends AbstractSchemeManager<ISchemeMonsterState> {
  public isActorInside: Optional<boolean> = null;
  public finalAction: Optional<boolean> = null;
  public idleState: Optional<boolean> = null;
  public pathName: Optional<string> = null;
  public curPoint: Optional<number> = null;
  public dir!: Vector;
  public current!: Vector;
  public target!: Vector;

  public monster: Optional<ServerMonsterAbstractObject> = null;
  public monsterObject: Optional<GameObject> = null;

  public soundObject: Optional<SoundObject> = null;
  public appearSound!: SoundObject;

  public override activate(): void {
    this.isActorInside = false;

    this.state.idleEnd = 0;
    this.state.signals = new LuaTable();
    this.soundObject = null;
    this.finalAction = false;
    this.appearSound = new sound_object("monsters_boar_boar_swamp_appear_1");
    this.idleState = false;
    this.pathName = null;
    this.monsterObject = null;
  }

  public update(delta: number): void {
    const actor: GameObject = registry.actor;

    if (this.idleState) {
      if (this.state.idleEnd <= game.time()) {
        this.idleState = false;
      }

      return;
    }

    if (this.isActorInside === null && this.state.monster !== null) {
      this.isActorInside = this.object.inside(actor.position());

      return;
    }

    if (this.object.inside(actor.position())) {
      if (!this.isActorInside) {
        this.onEnter();
        this.isActorInside = true;
      }
    }

    if (
      this.finalAction &&
      (registry.objects.get(this.monster!.id) === null ||
        this.monsterObject!.position().distance_to(this.state.path.point(this.state.path.count() - 1)) <= 1)
    ) {
      if (registry.objects.has(this.monster!.id)) {
        scriptReleaseMonster(this.monsterObject as GameObject);
      }

      registry.simulator.release(this.monster, true);

      this.monster = null;
      this.monsterObject = null;
      this.finalAction = false;
      this.idleState = true;
      this.state.idleEnd = game.time() + this.state.idle;
      this.isActorInside = false;
      this.resetPath();

      return;
    }

    if (this.isActorInside === true && this.monster === null) {
      const targetPosition: Vector = copyVector(this.current);

      targetPosition.mad(this.dir, (this.state.soundSlideVel * delta) / 1000);
      if (targetPosition.distance_to(this.current) > this.current.distance_to(this.target)) {
        this.curPoint = this.getNextPoint();
        this.setPositions();
      } else {
        this.current = copyVector(targetPosition);
      }

      this.soundObject = getManager(SoundManager).play(this.object.id(), this.state.soundObject, null, null);
      if (this.soundObject && this.soundObject.playing()) {
        this.soundObject.set_position(this.current);
      }
    } else if (
      this.monsterObject === null &&
      this.monster !== null &&
      registry.objects.get(this.monster.id) !== null &&
      !this.finalAction
    ) {
      this.monsterObject = registry.objects.get(this.monster.id).object!;

      scriptCaptureMonster(this.monsterObject, true);

      scriptCommandMonster(
        this.monsterObject,
        new move(move.run_fwd, this.state.path.point(this.state.path.count() - 1)),
        new cond(cond.move_end)
      );
      this.finalAction = true;
    }

    trySwitchToAnotherSection(this.object, this.state);
  }

  /**
   * todo: Description.
   */
  public onEnter(): void {
    this.resetPath();
    this.setPositions();
  }

  /**
   * todo: Description.
   */
  public resetPath(): void {
    this.curPoint = 0;

    const pathCount: TCount = this.state.pathTable!.length();

    if (pathCount === 1) {
      this.pathName = this.state.pathTable!.get(1);
      this.state.path = new patrol(this.pathName);

      return;
    }

    let pathNameNew: Optional<TName> = this.pathName;

    // todo: WTF?
    while (this.pathName === pathNameNew) {
      pathNameNew = this.state.pathTable!.get(math.random(1, pathCount));
    }

    this.pathName = pathNameNew;
    this.state.path = new patrol(this.pathName!);
  }

  /**
   * todo: Description.
   */
  public getNextPoint(): TIndex {
    if (this.curPoint! + 1 < this.state.path.count()) {
      return this.curPoint! + 1;
    } else {
      return 0;
    }
  }

  /**
   * todo: Description.
   */
  public setPositions(): void {
    if (this.getNextPoint() === 0) {
      if (this.monster === null && this.state.monster !== null) {
        this.monster = registry.simulator.create<ServerMonsterAbstractObject>(
          this.state.monster,
          this.current,
          this.object.level_vertex_id(),
          this.object.game_vertex_id()
        );
      }

      this.appearSound.play_at_pos(registry.actor, this.current, 0, ESoundObjectType.S3D);

      if (this.soundObject !== null) {
        this.soundObject.stop();
      }

      this.resetPath();
    }

    this.current = this.state.path.point(this.curPoint as number);
    this.target = this.state.path.point(this.getNextPoint());
    this.dir = subVectors(this.target, this.current).normalize();
  }
}
