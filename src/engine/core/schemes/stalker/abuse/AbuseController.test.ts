import { beforeEach, describe, expect, it } from "@jest/globals";
import { time_global } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMockOnce } from "xray16/testing/utils";

import { ISchemeAbuseState } from "@/engine/core/schemes/stalker/abuse/abuse_types";
import { AbuseController } from "@/engine/core/schemes/stalker/abuse/AbuseController";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

describe("AbuseController", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should initialize with default abuse settings", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeAbuseState = mockSchemeState(EScheme.ABUSE);
    const controller: AbuseController = new AbuseController(object, state);

    expect(controller.object).toBe(object);
    expect(controller.state).toBe(state);
    expect(controller.isEnabled).toBe(true);
    expect(controller.isHitDone).toBe(false);
    expect(controller.abuseRate).toBe(2);
    expect(controller.abuseValue).toBe(0);
    expect(controller.abuseThreshold).toBe(5);
    expect(controller.lastUpdatedAt).toBeNull();
  });

  it("should initialize update time, decay abuse, and clamp its maximum", () => {
    const controller: AbuseController = new AbuseController(MockGameObject.mock(), mockSchemeState(EScheme.ABUSE));

    replaceFunctionMockOnce(time_global, () => 1_000);

    expect(controller.update()).toBe(false);
    expect(controller.lastUpdatedAt).toBe(1_000);

    controller.abuseValue = 10;

    replaceFunctionMockOnce(time_global, () => 11_000);

    expect(controller.update()).toBe(true);
    expect(controller.abuseValue).toBe(5.5);
    expect(controller.lastUpdatedAt).toBe(11_000);
  });

  it("should report threshold abuse and re-arm a completed hit after decay", () => {
    const controller: AbuseController = new AbuseController(MockGameObject.mock(), mockSchemeState(EScheme.ABUSE));

    controller.abuseValue = 5;
    expect(controller.isAbused()).toBe(true);

    controller.abuseValue = 4;
    expect(controller.isAbused()).toBe(false);

    controller.isHitDone = true;
    controller.lastUpdatedAt = 0;

    replaceFunctionMockOnce(time_global, () => 20_000);

    expect(controller.update()).toBe(false);
    expect(controller.abuseValue).toBe(3);
    expect(controller.isHitDone).toBe(false);
  });

  it("should add abuse using the configured rate and clear it", () => {
    const controller: AbuseController = new AbuseController(MockGameObject.mock(), mockSchemeState(EScheme.ABUSE));

    controller.addAbuse(2);
    expect(controller.abuseValue).toBe(4);

    controller.setAbuseRate(3);
    controller.addAbuse(2);
    expect(controller.abuseValue).toBe(10);

    controller.clearAbuse();
    expect(controller.abuseValue).toBe(0);
  });

  it("should disable updates and additions until abuse is enabled again", () => {
    const controller: AbuseController = new AbuseController(MockGameObject.mock(), mockSchemeState(EScheme.ABUSE));

    controller.addAbuse(2);
    controller.disableAbuse();
    controller.addAbuse(2);

    expect(controller.abuseValue).toBe(4);
    expect(controller.update()).toBe(false);
    expect(controller.lastUpdatedAt).toBeNull();

    controller.enableAbuse();
    controller.addAbuse(2);

    expect(controller.isEnabled).toBe(true);
    expect(controller.abuseValue).toBe(8);
  });
});
