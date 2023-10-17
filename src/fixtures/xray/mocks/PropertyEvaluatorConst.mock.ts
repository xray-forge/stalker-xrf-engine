import { GameObject, PropertyEvaluator } from "@/engine/lib/types";
import { MockPropertyEvaluator } from "@/fixtures/xray/mocks/PropertyEvaluator.mock";

/**
 * Mock property storage graph used in AI logics.
 */
export class MockPropertyEvaluatorConst extends MockPropertyEvaluator {
  public constructor(public readonly value: boolean) {
    super(null as unknown as GameObject, "const_evaluator");
  }

  public evaluate(): boolean {
    return this.value;
  }

  public asMock(): PropertyEvaluator {
    return this as unknown as PropertyEvaluator;
  }
}
