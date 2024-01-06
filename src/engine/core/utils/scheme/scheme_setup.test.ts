import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { EEvaluatorId } from "@/engine/core/ai/planner/types";
import { TAbstractSchemeConstructor } from "@/engine/core/ai/scheme";
import { registry } from "@/engine/core/database";
import { SchemeMobCombat } from "@/engine/core/schemes/monster/mob_combat";
import { SchemePhysicalOnHit } from "@/engine/core/schemes/physical/ph_on_hit";
import { SchemeCombat } from "@/engine/core/schemes/stalker/combat";
import { SchemeCombatIgnore } from "@/engine/core/schemes/stalker/combat_ignore";
import { SchemeHit } from "@/engine/core/schemes/stalker/hit";
import {
  addCommonActionPreconditions,
  disableObjectBaseSchemes,
  loadSchemeImplementation,
  loadSchemeImplementations,
} from "@/engine/core/utils/scheme/scheme_setup";
import { ActionBase, EScheme, ESchemeType } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockActionBase, MockGameObject } from "@/fixtures/xray";

describe("disableObjectGenericSchemes util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly call disable based on scheme type", () => {
    const schemes: Array<TAbstractSchemeConstructor> = [
      SchemeCombat,
      SchemeCombatIgnore,
      SchemeHit,
      SchemeMobCombat,
      SchemePhysicalOnHit,
    ];

    loadSchemeImplementations($fromArray(schemes));

    schemes.forEach((it) => jest.spyOn(it, "disable").mockImplementation(jest.fn()));

    disableObjectBaseSchemes(MockGameObject.mock(), ESchemeType.STALKER);

    expect(SchemeCombat.disable).toHaveBeenCalledTimes(1);
    expect(SchemeCombatIgnore.disable).toHaveBeenCalledTimes(1);
    expect(SchemeHit.disable).toHaveBeenCalledTimes(1);
    expect(SchemeMobCombat.disable).toHaveBeenCalledTimes(0);
    expect(SchemePhysicalOnHit.disable).toHaveBeenCalledTimes(0);

    schemes.forEach((it) => jest.spyOn(it, "disable").mockReset().mockImplementation(jest.fn()));

    disableObjectBaseSchemes(MockGameObject.mock(), ESchemeType.MONSTER);

    expect(SchemeCombat.disable).toHaveBeenCalledTimes(0);
    expect(SchemeCombatIgnore.disable).toHaveBeenCalledTimes(1);
    expect(SchemeHit.disable).toHaveBeenCalledTimes(0);
    expect(SchemeMobCombat.disable).toHaveBeenCalledTimes(1);
    expect(SchemePhysicalOnHit.disable).toHaveBeenCalledTimes(0);

    schemes.forEach((it) => jest.spyOn(it, "disable").mockReset().mockImplementation(jest.fn()));

    disableObjectBaseSchemes(MockGameObject.mock(), ESchemeType.OBJECT);

    expect(SchemeCombat.disable).toHaveBeenCalledTimes(0);
    expect(SchemeCombatIgnore.disable).toHaveBeenCalledTimes(0);
    expect(SchemeHit.disable).toHaveBeenCalledTimes(0);
    expect(SchemeMobCombat.disable).toHaveBeenCalledTimes(0);
    expect(SchemePhysicalOnHit.disable).toHaveBeenCalledTimes(1);

    schemes.forEach((it) => jest.spyOn(it, "disable").mockReset().mockImplementation(jest.fn()));

    disableObjectBaseSchemes(MockGameObject.mock(), ESchemeType.HELICOPTER);

    expect(SchemeCombat.disable).toHaveBeenCalledTimes(0);
    expect(SchemeCombatIgnore.disable).toHaveBeenCalledTimes(0);
    expect(SchemeHit.disable).toHaveBeenCalledTimes(1);
    expect(SchemeMobCombat.disable).toHaveBeenCalledTimes(0);
    expect(SchemePhysicalOnHit.disable).toHaveBeenCalledTimes(0);
  });
});

describe("loadSchemeImplementation util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly load scheme and validate it", () => {
    const firstMock: TAbstractSchemeConstructor = {} as unknown as TAbstractSchemeConstructor;
    const secondMock: TAbstractSchemeConstructor = {
      SCHEME_SECTION: EScheme.SR_TIMER,
    } as unknown as TAbstractSchemeConstructor;
    const thirdMock: TAbstractSchemeConstructor = {
      SCHEME_SECTION: EScheme.MEET,
      SCHEME_TYPE: ESchemeType.STALKER,
    } as unknown as TAbstractSchemeConstructor;

    expect(() => loadSchemeImplementation(firstMock)).toThrow();
    expect(() => loadSchemeImplementation(secondMock)).toThrow();

    expect(registry.schemes.length()).toBe(0);

    loadSchemeImplementation(thirdMock);

    expect(registry.schemes.length()).toBe(1);

    expect(registry.schemes.get(EScheme.MEET)).toBe(thirdMock);
  });
});

describe("loadSchemeImplementations util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly load schemes list", () => {
    const firstMock: TAbstractSchemeConstructor = {} as unknown as TAbstractSchemeConstructor;
    const secondMock: TAbstractSchemeConstructor = {
      SCHEME_SECTION: EScheme.SR_TIMER,
    } as unknown as TAbstractSchemeConstructor;
    const thirdMock: TAbstractSchemeConstructor = {
      SCHEME_SECTION: EScheme.MEET,
      SCHEME_TYPE: ESchemeType.STALKER,
    } as unknown as TAbstractSchemeConstructor;
    const fourthMock: TAbstractSchemeConstructor = {
      SCHEME_SECTION: EScheme.COMBAT,
      SCHEME_TYPE: ESchemeType.STALKER,
    } as unknown as TAbstractSchemeConstructor;

    expect(() => loadSchemeImplementation(firstMock)).toThrow();
    expect(() => loadSchemeImplementation(secondMock)).toThrow();

    expect(registry.schemes.length()).toBe(0);

    loadSchemeImplementations($fromArray([thirdMock, fourthMock]));

    expect(registry.schemes.length()).toBe(2);

    expect(registry.schemes.get(EScheme.MEET)).toBe(thirdMock);
    expect(registry.schemes.get(EScheme.COMBAT)).toBe(fourthMock);
  });
});

describe("addCommonActionPreconditions util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should add generic base conditions", () => {
    const action: MockActionBase = new MockActionBase(MockGameObject.mock(), "test");

    expect(action.preconditions).toHaveLength(0);

    addCommonActionPreconditions(action as unknown as ActionBase);

    expect(action.preconditions).toHaveLength(6);
    expect(action.preconditions[0].condition()).toBe(EEvaluatorId.IS_MEET_CONTACT);
    expect(action.preconditions[0].value()).toBe(false);
    expect(action.preconditions[1].condition()).toBe(EEvaluatorId.IS_WOUNDED);
    expect(action.preconditions[1].value()).toBe(false);
    expect(action.preconditions[2].condition()).toBe(EEvaluatorId.IS_ABUSED);
    expect(action.preconditions[2].value()).toBe(false);
    expect(action.preconditions[3].condition()).toBe(EEvaluatorId.IS_WOUNDED_EXISTING);
    expect(action.preconditions[3].value()).toBe(false);
    expect(action.preconditions[4].condition()).toBe(EEvaluatorId.IS_CORPSE_EXISTING);
    expect(action.preconditions[4].value()).toBe(false);
    expect(action.preconditions[5].condition()).toBe(EEvaluatorId.ITEMS);
    expect(action.preconditions[5].value()).toBe(false);
  });
});
