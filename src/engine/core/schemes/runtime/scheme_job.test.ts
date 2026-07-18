import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, IniFile, ServerCreatureObject } from "xray16/alias";
import { MAX_ALIFE_RANK, TNumberId } from "xray16/lib";
import { MockGameObject, MockIniFile, MockServerAlifeCreatureAbstract } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { IRegistryObjectState, registerObject, registerSimulator } from "@/engine/core/database";
import { IObjectJobState, ISmartTerrainJobDescriptor, SmartTerrain } from "@/engine/core/objects/smart_terrain";
import {
  configureObjectSchemes,
  initializeObjectSchemeLogic,
} from "@/engine/core/schemes/runtime/scheme_initialization";
import { setupObjectLogicsOnSpawn, setupSmartTerrainObjectJobLogic } from "@/engine/core/schemes/runtime/scheme_job";
import { activateSchemeBySection, getSectionToActivate } from "@/engine/core/schemes/runtime/scheme_logic";
import { ESchemeType } from "@/engine/lib/types";
import { MockSmartTerrain, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime/scheme_initialization");
jest.mock("@/engine/core/schemes/runtime/scheme_logic");

describe("setupObjectSmartJobsAndLogicOnSpawn util", () => {
  beforeEach(() => {
    resetRegistry();

    resetFunctionMock(initializeObjectSchemeLogic);
    resetFunctionMock(configureObjectSchemes);
    resetFunctionMock(activateSchemeBySection);
  });

  it("should correctly setup logics without terrain", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const terrain: SmartTerrain = MockSmartTerrain.mock();

    terrain.jobsConfigName = "test.ltx";
    terrain.jobsConfig = MockIniFile.mock("test.ltx", {
      "walker@job": {},
    });

    terrain.jobs.set(10, {
      objectId: object.id(),
      section: "walker@job",
    } as ISmartTerrainJobDescriptor);

    expect(initializeObjectSchemeLogic).toHaveBeenCalledTimes(0);

    setupObjectLogicsOnSpawn(object, state, ESchemeType.STALKER, true);
    expect(initializeObjectSchemeLogic).toHaveBeenCalledTimes(1);

    registerSimulator();

    setupObjectLogicsOnSpawn(object, state, ESchemeType.STALKER, true);
    expect(initializeObjectSchemeLogic).toHaveBeenCalledTimes(2);

    const serverObject: ServerCreatureObject = MockServerAlifeCreatureAbstract.mock({ id: object.id() });

    serverObject.m_smart_terrain_id = null as unknown as TNumberId;

    setupObjectLogicsOnSpawn(object, state, ESchemeType.STALKER, true);
    expect(initializeObjectSchemeLogic).toHaveBeenCalledTimes(3);

    serverObject.m_smart_terrain_id = MAX_ALIFE_RANK;

    setupObjectLogicsOnSpawn(object, state, ESchemeType.STALKER, true);
    expect(initializeObjectSchemeLogic).toHaveBeenCalledTimes(4);

    serverObject.m_smart_terrain_id = terrain.id;

    setupObjectLogicsOnSpawn(object, state, ESchemeType.STALKER, true);
    expect(initializeObjectSchemeLogic).toHaveBeenCalledTimes(5);

    terrain.objectJobDescriptors.set(object.id(), {
      jobId: 10,
      schemeType: ESchemeType.STALKER,
      isBegun: true,
    } as IObjectJobState);

    setupObjectLogicsOnSpawn(object, state, ESchemeType.STALKER, true);
    expect(initializeObjectSchemeLogic).toHaveBeenCalledTimes(6);

    replaceFunctionMock(getSectionToActivate, () => "walker@job");
    setupObjectLogicsOnSpawn(object, state, ESchemeType.STALKER, false);
    expect(initializeObjectSchemeLogic).toHaveBeenCalledTimes(6);
    expect(activateSchemeBySection).toHaveBeenCalledTimes(1);
    expect(configureObjectSchemes).toHaveBeenCalledTimes(1);
  });
});

describe("setupSmartTerrainObjectJobLogic util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();

    resetFunctionMock(configureObjectSchemes);
    resetFunctionMock(activateSchemeBySection);
  });

  it("should correctly setup jobs and logics with job ini", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "walker@job": {},
    });

    registerObject(object);

    terrain.objectJobDescriptors.set(object.id(), {
      jobId: 10,
      schemeType: ESchemeType.STALKER,
    } as IObjectJobState);

    terrain.jobs.set(10, {
      objectId: object.id(),
      section: "walker@job",
      iniFile: ini,
      iniPath: ini.fname(),
    } as ISmartTerrainJobDescriptor);

    replaceFunctionMock(getSectionToActivate, () => null);

    expect(() => setupSmartTerrainObjectJobLogic(terrain, object)).toThrow(
      `Smart terrain '${terrain.name()}' setup logics for '${object.name()}' section 'nil', don't use section 'nil'.`
    );
    expect(configureObjectSchemes).toHaveBeenCalledTimes(1);
    expect(configureObjectSchemes).toHaveBeenCalledWith(
      object,
      ini,
      "test.ltx",
      ESchemeType.STALKER,
      "walker@job",
      terrain.name()
    );
    expect(activateSchemeBySection).not.toHaveBeenCalled();

    replaceFunctionMock(getSectionToActivate, () => "walker@job");
    setupSmartTerrainObjectJobLogic(terrain, object);

    expect(configureObjectSchemes).toHaveBeenCalledTimes(2);

    expect(activateSchemeBySection).toHaveBeenCalledWith(object, ini, "walker@job", terrain.name(), false);
  });

  it("should correctly setup jobs and logics with terrain ini", () => {
    const terrain: SmartTerrain = MockSmartTerrain.mock();
    const object: GameObject = MockGameObject.mock();

    terrain.jobsConfigName = "test_jobs.ltx";
    terrain.jobsConfig = MockIniFile.mock("sample.ltx", {
      "walker@job": {},
    });

    registerObject(object);

    terrain.objectJobDescriptors.set(object.id(), {
      jobId: 10,
      schemeType: ESchemeType.STALKER,
    } as IObjectJobState);

    terrain.jobs.set(10, {
      objectId: object.id(),
      section: "walker@job",
    } as ISmartTerrainJobDescriptor);

    replaceFunctionMock(getSectionToActivate, () => null);

    expect(() => setupSmartTerrainObjectJobLogic(terrain, object)).toThrow(
      `Smart terrain '${terrain.name()}' setup logics for '${object.name()}' section 'nil', don't use section 'nil'.`
    );
    expect(configureObjectSchemes).toHaveBeenCalledTimes(1);
    expect(configureObjectSchemes).toHaveBeenCalledWith(
      object,
      terrain.jobsConfig,
      "test_jobs.ltx",
      ESchemeType.STALKER,
      "walker@job",
      terrain.name()
    );
    expect(activateSchemeBySection).not.toHaveBeenCalled();

    replaceFunctionMock(getSectionToActivate, () => "walker@job");
    setupSmartTerrainObjectJobLogic(terrain, object);

    expect(configureObjectSchemes).toHaveBeenCalledTimes(2);
    expect(activateSchemeBySection).toHaveBeenCalledWith(
      object,
      terrain.jobsConfig,
      "walker@job",
      terrain.name(),
      false
    );
  });
});
