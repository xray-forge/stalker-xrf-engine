import { alife, cond, game, move, patrol, sound_object } from "xray16";

import { registry } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { ISchemeMonsterState } from "@/engine/core/schemes/sr_monster/ISchemeMonsterState";
import { action } from "@/engine/core/utils/object/object_action";
import { scriptCaptureMonster, scriptReleaseMonster } from "@/engine/core/utils/scheme";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { copyVector, subVectors } from "@/engine/core/utils/vector";
import { sounds } from "@/engine/lib/constants/sound/sounds";
import {
  ClientObject,
  ESoundObjectType,
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
  public monsterObject: Optional<ClientObject> = null;

  public soundObject: Optional<SoundObject> = null;
  public appearSound!: SoundObject;

  /**
   * todo: Description.
   */
  public override resetScheme(): void {
    this.isActorInside = false;

    this.state.idle_end = 0;
    this.state.signals = new LuaTable();
    this.soundObject = null;
    this.finalAction = false;
    this.appearSound = new sound_object(sounds.monsters_boar_boar_swamp_appear_1);
    this.idleState = false;
    this.pathName = null;
    this.monsterObject = null;
  }

  /**
   * todo: Description.
   */
  public update(delta: number): void {
    const actor: ClientObject = registry.actor;

    if (this.idleState) {
      if (this.state.idle_end <= game.time()) {
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
        scriptReleaseMonster(this.monsterObject as ClientObject);
      }

      alife().release(this.monster, true);

      this.monster = null;
      this.monsterObject = null;
      this.finalAction = false;
      this.idleState = true;
      this.state.idle_end = game.time() + this.state.idle;
      this.isActorInside = false;
      this.resetPath();

      return;
    }

    if (this.isActorInside === true && this.monster === null) {
      const targetPosition: Vector = copyVector(this.current);

      targetPosition.mad(this.dir, (this.state.sound_slide_vel * delta) / 1000);
      if (targetPosition.distance_to(this.current) > this.current.distance_to(this.target)) {
        this.curPoint = this.getNextPoint();
        this.setPositions();
      } else {
        this.current = copyVector(targetPosition);
      }

      this.soundObject = GlobalSoundManager.getInstance().playSound(this.object.id(), this.state.snd_obj, null, null);
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

      action(
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

    const pathCount: TCount = this.state.path_table!.length();

    if (pathCount === 1) {
      this.pathName = this.state.path_table!.get(1);
      this.state.path = new patrol(this.pathName);

      return;
    }

    let pathNameNew: Optional<TName> = this.pathName;

    // todo: WTF?
    while (this.pathName === pathNameNew) {
      pathNameNew = this.state.path_table!.get(math.random(1, pathCount));
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
        this.monster = alife().create<ServerMonsterAbstractObject>(
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
