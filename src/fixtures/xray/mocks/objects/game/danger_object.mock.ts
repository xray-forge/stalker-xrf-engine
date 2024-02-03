import { DangerObject, GameObject, Optional, TDangerType, TTimestamp } from "@/engine/lib/types";
import { MockGameObject } from "@/fixtures/xray/mocks/objects/game/game_object.mock";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

/**
 * Mock xray engine danger object.
 */
export class MockDangerObject {
  public static create(): MockDangerObject {
    return new MockDangerObject();
  }

  public static mock(): DangerObject {
    return new MockDangerObject() as unknown as DangerObject;
  }

  public static attack_sound: number = 1;
  public static attacked: number = 5;
  public static bullet_ricochet: number = 0;
  public static enemy_sound: number = 7;
  public static entity_attacked: number = 2;
  public static entity_corpse: number = 4;
  public static entity_death: number = 3;
  public static grenade: number = 6;
  public static hit: number = 2;
  public static sound: number = 1;
  public static visual: number = 0;

  public dangerType: TDangerType = 6;
  public dangerObject: GameObject = MockGameObject.mock();
  public dangerDependentObject: Optional<GameObject> = null;
  public dangerPosition: MockVector = MockVector.create(1.5, -0.5, 1);

  public time(): TTimestamp {
    return -1;
  }

  public position(): MockVector {
    return this.dangerPosition;
  }

  public object(): GameObject {
    return this.dangerObject;
  }

  public dependent_object(): Optional<GameObject> {
    return this.dangerDependentObject;
  }

  public type(): TDangerType {
    return this.dangerType;
  }

  public asMock(): DangerObject {
    return this as unknown as DangerObject;
  }
}
