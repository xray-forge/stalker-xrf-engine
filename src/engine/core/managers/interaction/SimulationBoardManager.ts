import {
  actor_stats,
  alife,
  clsid,
  game_graph,
  level,
  TXR_net_processor,
  XR_cse_alife_creature_abstract,
  XR_net_packet,
} from "xray16";

import { registry, SIMULATION_LTX } from "@/engine/core/database";
import { AbstractCoreManager } from "@/engine/core/managers/base/AbstractCoreManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { SmartTerrain } from "@/engine/core/objects/server/smart/SmartTerrain";
import { SquadReachTargetAction } from "@/engine/core/objects/server/squad/action";
import { Squad } from "@/engine/core/objects/server/squad/Squad";
import { TSimulationObject } from "@/engine/core/objects/server/types";
import { evaluateSimulationPriority } from "@/engine/core/utils/alife";
import { abort } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { changeTeamSquadGroup } from "@/engine/core/utils/object";
import { parseStringsList } from "@/engine/core/utils/parse";
import { TCommunity } from "@/engine/lib/constants/communities";
import { levels, TLevel } from "@/engine/lib/constants/levels";
import { LuaArray, Optional, TCount, TName, TNumberId, TRate, TSection, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

const groupIdByLevelName: LuaTable<TLevel, TNumberId> = $fromObject({
  [levels.zaton]: 1,
  [levels.pripyat]: 2,
  [levels.jupiter]: 3,
  [levels.labx8]: 4,
  [levels.jupiter_underground]: 5,
});

/**
 * todo;
 */
export interface ISmartTerrainDescriptor {
  smartTerrain: SmartTerrain;
  assignedSquads: LuaTable<TNumberId, Squad>;
  stayingSquadsCount: TCount;
}

/**
 * todo;
 */
export interface ISimulationFactionDescriptor {
  id: TNumberId;
  name: TCommunity;
  isCommunity: boolean;
}

/**
 * todo;
 */
export class SimulationBoardManager extends AbstractCoreManager {
  protected areDefaultSimulationSquadsSpawned: boolean = false;

  protected factions: LuaArray<ISimulationFactionDescriptor> = new LuaTable();
  protected smartTerrains: LuaTable<TNumberId, ISmartTerrainDescriptor> = new LuaTable();
  protected smartTerrainsByName: LuaTable<TName, SmartTerrain> = new LuaTable();
  protected squads: LuaTable<TNumberId, Squad> = new LuaTable();

  protected temporaryAssignedSquads: LuaTable<TNumberId, LuaArray<Squad>> = new LuaTable();
  protected temporaryEnteredSquads: LuaTable<TNumberId, LuaArray<Squad>> = new LuaTable();

  public override initialize(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.ACTOR_NET_DESTROY, this.onActorNetworkDestroy, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.unregisterCallback(EGameEvent.ACTOR_NET_DESTROY, this.onActorNetworkDestroy);
  }

  /**
   * todo: Description.
   */
  public getFactions(): LuaArray<ISimulationFactionDescriptor> {
    return this.factions;
  }

  /**
   * todo: Description.
   */
  public getSquads(): LuaTable<TNumberId, Squad> {
    return this.squads;
  }

  /**
   * todo: Description.
   */
  public getSmartTerrainDescriptors(): LuaTable<TNumberId, ISmartTerrainDescriptor> {
    return this.smartTerrains;
  }

  /**
   * todo: Description.
   */
  public getSmartTerrainByName(name: TName): Optional<SmartTerrain> {
    return this.smartTerrainsByName.get(name);
  }

  /**
   * todo: Description.
   */
  public getSmartTerrainDescriptorById(smartTerrainId: TNumberId): Optional<ISmartTerrainDescriptor> {
    return this.smartTerrains.get(smartTerrainId);
  }

  /**
   * todo: Description.
   */
  public getSmartTerrainPopulation(smart: SmartTerrain): TCount {
    return this.smartTerrains.get(smart.id).stayingSquadsCount;
  }

  /**
   * todo: Description.
   */
  public getSmartTerrainActiveSquads(smartTerrainId: TNumberId): TCount {
    let count: TCount = 0;

    for (const [k, squad] of this.smartTerrains.get(smartTerrainId).assignedSquads) {
      if (squad.getScriptTarget() !== null) {
        count = count + 1;
      }
    }

    return count;
  }

  /**
   * Initialize game squads on game start, spawn all pre-defined squads.
   * todo;
   */
  public initializeDefaultSimulationSquads(): void {
    if (this.areDefaultSimulationSquadsSpawned) {
      return;
    } else {
      this.areDefaultSimulationSquadsSpawned = true;
    }

    logger.info("Spawn default simulation squads");

    for (const serverLevel of game_graph().levels()) {
      const levelSectionName: TSection = "start_position_" + alife().level_name(serverLevel.id);

      if (!SIMULATION_LTX.section_exist(levelSectionName)) {
        return;
      }

      const levelSquadsCount: TCount = SIMULATION_LTX.line_count(levelSectionName);

      for (const it of $range(0, levelSquadsCount - 1)) {
        const [, id, value] = SIMULATION_LTX.r_line(levelSectionName, it, "", "");
        const smartTerrainsNames: LuaArray<TName> = parseStringsList(value);

        for (const [, name] of smartTerrainsNames) {
          const smartTerrain: Optional<SmartTerrain> = this.smartTerrainsByName.get(name);

          if (smartTerrain === null) {
            abort("Wrong smart name [%s] in start position", tostring(name));
          }

          const squad = this.createSmartSquad(smartTerrain, id);

          this.enterSmartTerrain(squad, smartTerrain.id);
        }
      }
    }

    logger.info("Spawned default simulation squads");
  }

  /**
   * todo: Description.
   */
  public registerSquad(squad: Squad): void {
    this.squads.set(squad.id, squad);
  }

  /**
   * todo: Description.
   */
  public unRegisterSquad(squad: Squad): void {
    this.squads.delete(squad.id);
  }

  /**
   * todo: Description.
   */
  public registerSmartTerrain(object: SmartTerrain): void {
    if (this.smartTerrains.get(object.id) !== null) {
      abort("Smart already exist in board list [%s].", object.name());
    }

    this.smartTerrains.set(object.id, { smartTerrain: object, assignedSquads: new LuaTable(), stayingSquadsCount: 0 });
    this.smartTerrainsByName.set(object.name(), object);
  }

  /**
   * todo: Description.
   */
  public initializeSmartTerrain(object: SmartTerrain): void {
    if (this.temporaryAssignedSquads.has(object.id)) {
      for (const [index, squad] of this.temporaryAssignedSquads.get(object.id)) {
        this.assignSquadToSmartTerrain(squad, object.id);
      }

      this.temporaryAssignedSquads.delete(object.id);
    }

    if (this.temporaryEnteredSquads.has(object.id)) {
      for (const [k, v] of this.temporaryEnteredSquads.get(object.id)) {
        this.enterSmartTerrain(v, object.id);
      }

      this.temporaryEnteredSquads.delete(object.id);
    }
  }

  /**
   * todo: Description.
   */
  public unregisterSmartTerrain(object: SmartTerrain): void {
    if (!this.smartTerrains.has(object.id)) {
      abort("Trying to unregister 'nil' smart [%s].", object.name());
    }

    this.smartTerrains.delete(object.id);
  }

  /**
   * todo: Description.
   */
  public createSmartSquad(smartTerrain: SmartTerrain, squadId: TStringId): Squad {
    const squad: Squad = alife().create<Squad>(
      tostring(squadId),
      smartTerrain.position,
      smartTerrain.m_level_vertex_id,
      smartTerrain.m_game_vertex_id
    );

    logger.info("Creating squad in smart:", squad.name(), smartTerrain.name());

    squad.createSquadMembers(smartTerrain);
    squad.updateSquadRelationToActor();

    this.assignSquadToSmartTerrain(squad, smartTerrain.id);

    for (const squadMember of squad.squad_members()) {
      squad.simulationBoardManager.setupObjectSquadAndGroup(squadMember.object);
    }

    return squad;
  }

  /**
   * todo: Description.
   */
  public onRemoveSquad(squad: Squad): void {
    logger.info("Remove squad:", squad.name());

    this.exitSmartTerrain(squad, squad.assignedSmartTerrainId);
    this.assignSquadToSmartTerrain(squad, null);

    squad.onRemoveSquadFromSimulation();
  }

  /**
   * todo: Description.
   */
  public assignSquadToSmartTerrain(squad: Squad, smartTerrainId: Optional<TNumberId>): void {
    if (smartTerrainId !== null && !this.smartTerrains.has(smartTerrainId)) {
      if (!this.temporaryAssignedSquads.has(smartTerrainId)) {
        this.temporaryAssignedSquads.set(smartTerrainId, new LuaTable());
      }

      table.insert(this.temporaryAssignedSquads.get(smartTerrainId), squad);

      return;
    }

    let oldSmartTerrainId: Optional<TNumberId> = null;

    if (squad.assignedSmartTerrainId !== null) {
      oldSmartTerrainId = squad.assignedSmartTerrainId;
    }

    if (oldSmartTerrainId !== null && this.smartTerrains.has(oldSmartTerrainId)) {
      this.smartTerrains.get(oldSmartTerrainId).assignedSquads.delete(squad.id);
      this.smartTerrains.get(oldSmartTerrainId).smartTerrain.updateMapDisplay();
    }

    if (smartTerrainId === null) {
      squad.assignSmartTerrain(null);

      return;
    }

    const target: ISmartTerrainDescriptor = this.smartTerrains.get(smartTerrainId);

    squad.assignSmartTerrain(target.smartTerrain);
    target.assignedSquads.set(squad.id, squad);
    target.smartTerrain.updateMapDisplay();
  }

  /**
   * todo: Description.
   */
  public exitSmartTerrain(squad: Squad, smartTerrainId: Optional<TNumberId>): void {
    if (smartTerrainId === null) {
      return;
    }

    if (squad.enteredSmartTerrainId !== smartTerrainId) {
      return;
    }

    squad.enteredSmartTerrainId = null;

    const smart = this.smartTerrains.get(smartTerrainId);

    if (smart === null) {
      abort("Smart null while smart_id not null [%s]", tostring(smartTerrainId));
    }

    smart.stayingSquadsCount = smart.stayingSquadsCount - 1;
    smart.assignedSquads.delete(squad.id);
  }

  /**
   * todo: Description.
   */
  public enterSmartTerrain(squad: Squad, smartTerrainId: TNumberId): void {
    if (!this.smartTerrains.has(smartTerrainId)) {
      if (!this.temporaryEnteredSquads.has(smartTerrainId)) {
        this.temporaryEnteredSquads.set(smartTerrainId, new LuaTable());
      }

      table.insert(this.temporaryEnteredSquads.get(smartTerrainId), squad);

      return;
    }

    const smartTerrainDescriptor: ISmartTerrainDescriptor = this.smartTerrains.get(smartTerrainId);

    if (squad.enteredSmartTerrainId !== null) {
      abort("Couldn't enter smart, still in old one. Squad: [%s]", squad.name());
    }

    squad.enteredSmartTerrainId = smartTerrainId;
    squad.isItemListSpawned = false;

    smartTerrainDescriptor.stayingSquadsCount = smartTerrainDescriptor.stayingSquadsCount + 1;
  }

  /**
   * todo;
   * todo: Seems too complex.
   */
  public setupObjectSquadAndGroup(object: XR_cse_alife_creature_abstract): void {
    const levelName: TLevel = level.name();
    const groupId: TNumberId = groupIdByLevelName.get(levelName) || 0;

    // Reload, probably not needed.
    object = alife().object(object.id)!;

    // todo: Check, probably magic or unused code with duplicated changeTeam calls.
    changeTeamSquadGroup(object, object.team, object.squad, groupId);

    const squad: Optional<Squad> = alife().object<Squad>(object.group_id);

    if (squad === null) {
      return changeTeamSquadGroup(object, object.team, 0, object.group);
    }

    let smartTerrain: Optional<SmartTerrain> = null;

    if (squad.currentAction !== null && squad.currentAction.name === SquadReachTargetAction.ACTION_NAME) {
      smartTerrain = alife().object<SmartTerrain>(squad.assignedTargetId!);
    } else if (squad.assignedSmartTerrainId !== null) {
      smartTerrain = alife().object<SmartTerrain>(squad.assignedSmartTerrainId);
    }

    if (smartTerrain === null) {
      return changeTeamSquadGroup(object, object.team, 0, object.group);
    }

    let objectSquadId: TNumberId = 0;

    if (smartTerrain.clsid() === clsid.smart_terrain) {
      objectSquadId = smartTerrain.squadId;
    }

    changeTeamSquadGroup(object, object.team, objectSquadId, object.group);
  }

  /**
   * todo: Description.
   */
  public getSquadSimulationTarget(squad: Squad): Optional<TSimulationObject> {
    const availableTargets: LuaArray<{ prior: TRate; target: TSimulationObject }> = new LuaTable();
    let mostPriorityTask: Optional<TSimulationObject> = null;

    for (const [id, simulationObject] of registry.simulationObjects) {
      let currentPriority: TRate = 0;

      if (simulationObject.id !== squad.id) {
        currentPriority = evaluateSimulationPriority(simulationObject, squad);
      }

      if (currentPriority > 0) {
        table.insert(availableTargets, { prior: currentPriority, target: simulationObject });
      }
    }

    if (availableTargets.length() > 0) {
      table.sort(availableTargets, (a, b) => a.prior > b.prior);

      let maxId: TNumberId = math.floor(0.3 * availableTargets.length());

      if (maxId === 0) {
        maxId = 1;
      }

      mostPriorityTask = availableTargets.get(math.random(maxId)).target;
    }

    return (
      mostPriorityTask ||
      (squad.assignedSmartTerrainId && alife().object<SmartTerrain>(squad.assignedSmartTerrainId)) ||
      squad
    );
  }

  /**
   * todo: Description.
   */
  public onActorNetworkDestroy(): void {
    if (actor_stats.remove_from_ranking !== null) {
      actor_stats.remove_from_ranking(registry.actor.id());
    }

    if (this.factions !== null) {
      for (const [index, faction] of this.factions) {
        GlobalSoundManager.getInstance().stopSoundByObjectId(faction.id);
      }
    }
  }

  /**
   * todo: Description.
   */
  public onActorNetworkRegister(): void {
    this.initializeDefaultSimulationSquads();
  }

  /**
   * Save simulation data.
   */
  public override save(packet: XR_net_packet): void {
    packet.w_bool(this.areDefaultSimulationSquadsSpawned);
  }

  /**
   * Load simulation data.
   */
  public override load(reader: TXR_net_processor): void {
    this.areDefaultSimulationSquadsSpawned = reader.r_bool();
  }
}
