import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { stalker_ids } from "xray16";

import { registry } from "@/engine/core/database";
import { EEvaluatorId, TAbstractSchemeConstructor } from "@/engine/core/schemes/base";
import { SchemeCombat } from "@/engine/core/schemes/combat";
import { SchemeCombatIgnore } from "@/engine/core/schemes/combat_ignore";
import { SchemeHit } from "@/engine/core/schemes/hit";
import { SchemeMobCombat } from "@/engine/core/schemes/mob_combat";
import { SchemePhysicalOnHit } from "@/engine/core/schemes/ph_on_hit";
import {
  addCommonActionPreconditions,
  disableObjectBaseSchemes,
  loadSchemeImplementation,
  loadSchemeImplementations,
} from "@/engine/core/utils/scheme/scheme_setup";
import { ActionBase, EScheme, ESchemeType } from "@/engine/lib/types";
import { MockActionBase, mockClientGameObject } from "@/fixtures/xray";

describe("'scheme setup' utils", () => {
  beforeEach(() => {
    registry.schemes = new LuaTable();
  });

  it("'disableObjectGenericSchemes' should correctly call disable based on scheme type", () => {
    const schemes: Array<TAbstractSchemeConstructor> = [
      SchemeCombat,
      SchemeCombatIgnore,
      SchemeHit,
      SchemeMobCombat,
      SchemePhysicalOnHit,
    ];

    loadSchemeImplementations($fromArray(schemes));

    schemes.forEach((it) => jest.spyOn(it, "disable").mockImplementation(jest.fn()));

    disableObjectBaseSchemes(mockClientGameObject(), ESchemeType.STALKER);

    expect(SchemeCombat.disable).toHaveBeenCalledTimes(1);
    expect(SchemeCombatIgnore.disable).toHaveBeenCalledTimes(1);
    expect(SchemeHit.disable).toHaveBeenCalledTimes(1);
    expect(SchemeMobCombat.disable).toHaveBeenCalledTimes(0);
    expect(SchemePhysicalOnHit.disable).toHaveBeenCalledTimes(0);

    schemes.forEach((it) => jest.spyOn(it, "disable").mockReset().mockImplementation(jest.fn()));

    disableObjectBaseSchemes(mockClientGameObject(), ESchemeType.MONSTER);

    expect(SchemeCombat.disable).toHaveBeenCalledTimes(0);
    expect(SchemeCombatIgnore.disable).toHaveBeenCalledTimes(1);
    expect(SchemeHit.disable).toHaveBeenCalledTimes(0);
    expect(SchemeMobCombat.disable).toHaveBeenCalledTimes(1);
    expect(SchemePhysicalOnHit.disable).toHaveBeenCalledTimes(0);

    schemes.forEach((it) => jest.spyOn(it, "disable").mockReset().mockImplementation(jest.fn()));

    disableObjectBaseSchemes(mockClientGameObject(), ESchemeType.ITEM);

    expect(SchemeCombat.disable).toHaveBeenCalledTimes(0);
    expect(SchemeCombatIgnore.disable).toHaveBeenCalledTimes(0);
    expect(SchemeHit.disable).toHaveBeenCalledTimes(0);
    expect(SchemeMobCombat.disable).toHaveBeenCalledTimes(0);
    expect(SchemePhysicalOnHit.disable).toHaveBeenCalledTimes(1);

    schemes.forEach((it) => jest.spyOn(it, "disable").mockReset().mockImplementation(jest.fn()));

    disableObjectBaseSchemes(mockClientGameObject(), ESchemeType.HELI);

    expect(SchemeCombat.disable).toHaveBeenCalledTimes(0);
    expect(SchemeCombatIgnore.disable).toHaveBeenCalledTimes(0);
    expect(SchemeHit.disable).toHaveBeenCalledTimes(1);
    expect(SchemeMobCombat.disable).toHaveBeenCalledTimes(0);
    expect(SchemePhysicalOnHit.disable).toHaveBeenCalledTimes(0);
  });

  it("'loadSchemeImplementation' should correctly load scheme and validate it", () => {
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

  it("'loadSchemeImplementations' should correctly load schemes list", () => {
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

  it("'addCommonActionPreconditions' should add generic base conditions", () => {
    const action: MockActionBase = new MockActionBase(mockClientGameObject(), "test");

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
    expect(action.preconditions[5].condition()).toBe(stalker_ids.property_items);
    expect(action.preconditions[5].value()).toBe(false);
  });
});
