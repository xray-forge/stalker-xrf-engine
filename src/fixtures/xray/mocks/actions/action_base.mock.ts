import { ActionBase, ClientObject, Optional, WorldProperty } from "@/engine/lib/types";
import { MockLuabindClass } from "@/fixtures/xray/mocks/luabind.mock";

/**
 * todo;
 */
export class MockActionBase extends MockLuabindClass {
  public object: Optional<ClientObject>;
  public name: string;

  public preconditions: Array<WorldProperty> = [];
  public effects: Array<WorldProperty> = [];

  public constructor(object: Optional<ClientObject> = null, name: string) {
    super();

    this.object = object;
    this.name = name || this.constructor.name;
  }

  public initialize(): void {}

  public execute(): void {}

  public setup(object: ClientObject): void {
    this.object = object;
  }

  public add_precondition(property: WorldProperty): void {
    this.preconditions.push(property);
  }

  public add_effect(property: WorldProperty): void {
    this.effects.push(property);
  }

  public getPrecondition(id: number): Optional<WorldProperty> {
    return this.preconditions.find((it) => it.condition() === id) ?? null;
  }

  public getEffect(id: number): Optional<WorldProperty> {
    return this.effects.find((it) => it.condition() === id) ?? null;
  }
}

export function mockActionBase(object: Optional<ClientObject> = null, name: string = "generic"): ActionBase {
  return new MockActionBase(object, name) as unknown as ActionBase;
}
