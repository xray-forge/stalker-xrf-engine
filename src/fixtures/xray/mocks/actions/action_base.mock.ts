import { ActionBase, GameObject, Optional } from "@/engine/lib/types";
import { MockWorldProperty } from "@/fixtures/xray/mocks/actions/world_property.mock";
import { MockLuabindClass } from "@/fixtures/xray/mocks/luabind.mock";

/**
 * Mock action base class for handling with GOAP planner.
 */
export class MockActionBase extends MockLuabindClass {
  public static mock(object: Optional<GameObject> = null, name?: string): ActionBase {
    return new MockActionBase(object, name) as unknown as ActionBase;
  }

  public object: Optional<GameObject>;
  public name: string;

  public preconditions: Array<MockWorldProperty> = [];
  public effects: Array<MockWorldProperty> = [];

  public constructor(object: Optional<GameObject> = null, name?: string) {
    super();

    this.object = object;
    this.name = name ?? this.constructor.name;
  }

  public initialize(): void {}

  public execute(): void {}

  public finalize(): void {}

  public setup(object: GameObject): void {
    this.object = object;
  }

  public add_precondition(property: MockWorldProperty): void {
    this.preconditions.push(property);
  }

  public add_effect(property: MockWorldProperty): void {
    this.effects.push(property);
  }

  public getPrecondition(id: number): Optional<MockWorldProperty> {
    return this.preconditions.find((it) => it.condition() === id) ?? null;
  }

  public getEffect(id: number): Optional<MockWorldProperty> {
    return this.effects.find((it) => it.condition() === id) ?? null;
  }
}

/**
 * Mock action base method.
 */
export function mockActionBase(object: Optional<GameObject> = null, name: string = "generic"): ActionBase {
  return new MockActionBase(object, name) as unknown as ActionBase;
}
