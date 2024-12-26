import { beforeEach, describe, expect, it } from "@jest/globals";

import { getManager, registerSimulator } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { travelConfig } from "@/engine/core/managers/travel/TravelConfig";
import { TravelManager } from "@/engine/core/managers/travel/TravelManager";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { TRUE } from "@/engine/lib/constants/words";
import {
  AnyObject,
  GameObject,
  ServerCreatureObject,
  ServerGroupObject,
  ServerSmartZoneObject,
} from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import {
  MockAlifeHumanStalker,
  MockAlifeOnlineOfflineGroup,
  MockAlifeSmartZone,
  MockGameObject,
  MockPhraseDialog,
} from "@/fixtures/xray";

describe("TravelManager", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly initialize callbacks", () => {
    const eventsManager: EventsManager = getManager(EventsManager);
    const manager: TravelManager = getManager(TravelManager);

    manager.initialize();

    expect(eventsManager.getSubscribersCount()).toBe(2);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.DUMP_LUA_DATA)).toBe(1);
    expect(eventsManager.getEventSubscribersCount(EGameEvent.ACTOR_UPDATE)).toBe(1);

    manager.destroy();

    expect(eventsManager.getSubscribersCount()).toBe(0);
  });

  it("should correctly have correct configuration", () => {
    expect(travelConfig.TRAVEL_DISTANCE_MIN_THRESHOLD).toBe(50);
    expect(travelConfig.TRAVEL_TELEPORT_DELAY).toBe(3000);
    expect(travelConfig.TRAVEL_RESOLVE_DELAY).toBe(6000);

    expect(travelConfig.TRAVEL_LOCATIONS).toEqualLuaTables({
      zat_a1: "st_stalker_zat_a1",
      zat_sim_1: "st_stalker_zat_sim_1",
      zat_sim_2: "st_stalker_zat_sim_2",
    });
    expect(travelConfig.TRAVEL_DESCRIPTORS_BY_NAME).toEqualLuaTables({
      zat_b100: {
        condlist: parseConditionsList(TRUE),
        level: "zaton",
        name: "st_zat_b100_name",
        phraseId: "1002",
      },
      zat_b55: {
        condlist: parseConditionsList(TRUE),
        level: "zaton",
        name: "st_zat_b55_name",
        phraseId: "1001",
      },
      zat_stalker_base_smart: {
        condlist: parseConditionsList(TRUE),
        name: "st_zat_a2_name",
        level: "zaton",
        phraseId: "1000",
      },
    });
    expect(travelConfig.TRAVEL_DESCRIPTORS_BY_PHRASE).toEqualLuaTables({
      "1000": "zat_stalker_base_smart",
      "1001": "zat_b55",
      "1002": "zat_b100",
    });
  });

  it("should correctly initialize and destroy", () => {
    const manager: TravelManager = getManager(TravelManager);

    manager.initialize();

    expect(manager.isTraveling).toBe(false);
    expect(manager.isTravelTeleported).toBe(false);
    expect(manager.travelingStartedAt).toBe(0);
  });

  it("should correctly initialize travel dialog phrases", () => {
    const manager: TravelManager = getManager(TravelManager);
    const dialog: MockPhraseDialog = MockPhraseDialog.create();

    manager.initialize();
    manager.initializeTravellerDialog(MockPhraseDialog.mock(dialog));

    expect(dialog.list).toEqual({
      "0": {
        goodwillLevel: -10000,
        id: "0",
        prevPhraseId: "",
        script: {
          actions: [],
          preconditions: [],
          text: null,
        },
        text: "dm_traveler_what_are_you_doing",
      },
      "1": {
        goodwillLevel: -10000,
        id: "1",
        prevPhraseId: "0",
        script: {
          actions: [],
          preconditions: [],
          text: "travel_callbacks.get_squad_current_action_description",
        },
        text: "if you see this - this is bad",
      },
      "1000": {
        goodwillLevel: -10000,
        id: "1000",
        prevPhraseId: "121",
        script: {
          actions: [],
          preconditions: ["travel_callbacks.can_negotiate_travel_to_smart"],
          text: null,
        },
        text: "translated_st_zat_a2_name.",
      },
      "1000_1": {
        goodwillLevel: -10000,
        id: "1000_1",
        prevPhraseId: "1000",
        script: {
          actions: [],
          preconditions: [],
          text: "travel_callbacks.get_travel_cost",
        },
        text: "if you see this - this is bad",
      },
      "1000_11": {
        goodwillLevel: -10000,
        id: "1000_11",
        prevPhraseId: "1000_1",
        script: {
          actions: ["travel_callbacks.on_travel_to_specific_smart_with_squad"],
          preconditions: ["travel_callbacks.is_enough_money_to_travel"],
          text: null,
        },
        text: "dm_traveler_actor_agree",
      },
      "1000_13": {
        goodwillLevel: -10000,
        id: "1000_13",
        prevPhraseId: "1000_1",
        script: {
          actions: [],
          preconditions: ["travel_callbacks.is_not_enough_money_to_travel"],
          text: null,
        },
        text: "dm_traveler_actor_has_no_money",
      },
      "1000_14": {
        goodwillLevel: -10000,
        id: "1000_14",
        prevPhraseId: "1000_1",
        script: {
          actions: [],
          preconditions: [],
          text: null,
        },
        text: "dm_traveler_actor_refuse",
      },
      "1001": {
        goodwillLevel: -10000,
        id: "1001",
        prevPhraseId: "121",
        script: {
          actions: [],
          preconditions: ["travel_callbacks.can_negotiate_travel_to_smart"],
          text: null,
        },
        text: "translated_st_zat_b55_name.",
      },
      "1001_1": {
        goodwillLevel: -10000,
        id: "1001_1",
        prevPhraseId: "1001",
        script: {
          actions: [],
          preconditions: [],
          text: "travel_callbacks.get_travel_cost",
        },
        text: "if you see this - this is bad",
      },
      "1001_11": {
        goodwillLevel: -10000,
        id: "1001_11",
        prevPhraseId: "1001_1",
        script: {
          actions: ["travel_callbacks.on_travel_to_specific_smart_with_squad"],
          preconditions: ["travel_callbacks.is_enough_money_to_travel"],
          text: null,
        },
        text: "dm_traveler_actor_agree",
      },
      "1001_13": {
        goodwillLevel: -10000,
        id: "1001_13",
        prevPhraseId: "1001_1",
        script: {
          actions: [],
          preconditions: ["travel_callbacks.is_not_enough_money_to_travel"],
          text: null,
        },
        text: "dm_traveler_actor_has_no_money",
      },
      "1001_14": {
        goodwillLevel: -10000,
        id: "1001_14",
        prevPhraseId: "1001_1",
        script: {
          actions: [],
          preconditions: [],
          text: null,
        },
        text: "dm_traveler_actor_refuse",
      },
      "1002": {
        goodwillLevel: -10000,
        id: "1002",
        prevPhraseId: "121",
        script: {
          actions: [],
          preconditions: ["travel_callbacks.can_negotiate_travel_to_smart"],
          text: null,
        },
        text: "translated_st_zat_b100_name.",
      },
      "1002_1": {
        goodwillLevel: -10000,
        id: "1002_1",
        prevPhraseId: "1002",
        script: {
          actions: [],
          preconditions: [],
          text: "travel_callbacks.get_travel_cost",
        },
        text: "if you see this - this is bad",
      },
      "1002_11": {
        goodwillLevel: -10000,
        id: "1002_11",
        prevPhraseId: "1002_1",
        script: {
          actions: ["travel_callbacks.on_travel_to_specific_smart_with_squad"],
          preconditions: ["travel_callbacks.is_enough_money_to_travel"],
          text: null,
        },
        text: "dm_traveler_actor_agree",
      },
      "1002_13": {
        goodwillLevel: -10000,
        id: "1002_13",
        prevPhraseId: "1002_1",
        script: {
          actions: [],
          preconditions: ["travel_callbacks.is_not_enough_money_to_travel"],
          text: null,
        },
        text: "dm_traveler_actor_has_no_money",
      },
      "1002_14": {
        goodwillLevel: -10000,
        id: "1002_14",
        prevPhraseId: "1002_1",
        script: {
          actions: [],
          preconditions: [],
          text: null,
        },
        text: "dm_traveler_actor_refuse",
      },
      "11": {
        goodwillLevel: -10000,
        id: "11",
        prevPhraseId: "1",
        script: {
          actions: [],
          preconditions: ["travel_callbacks.can_actor_move_with_squad"],
          text: null,
        },
        text: "dm_traveler_can_i_go_with_you",
      },
      "111": {
        goodwillLevel: -10000,
        id: "111",
        prevPhraseId: "11",
        script: {
          actions: [],
          preconditions: ["travel_callbacks.can_squad_take_actor"],
          text: null,
        },
        text: "dm_traveler_stalker_actor_companion_yes",
      },
      "1111": {
        goodwillLevel: -10000,
        id: "1111",
        prevPhraseId: "111",
        script: {
          actions: ["travel_callbacks.on_travel_together_with_squad"],
          preconditions: [],
          text: null,
        },
        text: "dm_traveler_actor_go_with_squad",
      },
      "1112": {
        goodwillLevel: -10000,
        id: "1112",
        prevPhraseId: "111",
        script: {
          actions: [],
          preconditions: [],
          text: null,
        },
        text: "dm_traveler_actor_dont_go_with_squad",
      },
      "112": {
        goodwillLevel: -10000,
        id: "112",
        prevPhraseId: "11",
        script: {
          actions: [],
          preconditions: ["travel_callbacks.cannot_squad_take_actor"],
          text: null,
        },
        text: "dm_traveler_stalker_actor_companion_no",
      },
      "12": {
        goodwillLevel: -10000,
        id: "12",
        prevPhraseId: "1",
        script: {
          actions: [],
          preconditions: [],
          text: null,
        },
        text: "dm_traveler_take_me_to",
      },
      "121": {
        goodwillLevel: -10000,
        id: "121",
        prevPhraseId: "12",
        script: {
          actions: [],
          preconditions: ["travel_callbacks.can_squad_travel"],
          text: null,
        },
        text: "dm_traveler_stalker_where_do_you_want",
      },
      "1211": {
        goodwillLevel: -10000,
        id: "1211",
        prevPhraseId: "121",
        script: {
          actions: [],
          preconditions: [],
          text: null,
        },
        text: "dm_traveler_actor_refuse",
      },
      "122": {
        goodwillLevel: -10000,
        id: "122",
        prevPhraseId: "12",
        script: {
          actions: [],
          preconditions: ["travel_callbacks.cannot_squad_travel"],
          text: null,
        },
        text: "dm_traveler_stalker_i_cant_travel",
      },
      "13": {
        goodwillLevel: -10000,
        id: "13",
        prevPhraseId: "1",
        script: {
          actions: [],
          preconditions: [],
          text: null,
        },
        text: "dm_traveler_bye",
      },
    });
  });

  it("should correctly check if can use travel dialogs", () => {
    const manager: TravelManager = getManager(TravelManager);
    const squad: ServerGroupObject = MockAlifeOnlineOfflineGroup.mock();
    const zone: ServerSmartZoneObject = MockAlifeSmartZone.mock({ name: "jup_b41" });
    const serverObject: ServerCreatureObject = MockAlifeHumanStalker.mock();
    const object: GameObject = MockGameObject.mock({ id: serverObject.id });
    const actor: GameObject = MockGameObject.mockActor();

    serverObject.group_id = squad.id;

    squad.commander_id = () => object.id();
    object.character_community = <T>() => "stalker" as T;
    expect(manager.canStartTravelingDialogs(actor, object)).toBe(true);

    squad.commander_id = () => -1;
    expect(manager.canStartTravelingDialogs(actor, object)).toBe(false);

    squad.commander_id = () => object.id();
    object.character_community = <T>() => "bandit" as T;
    expect(manager.canStartTravelingDialogs(actor, object)).toBe(false);

    object.character_community = <T>() => "army" as T;
    expect(manager.canStartTravelingDialogs(actor, object)).toBe(false);

    object.character_community = <T>() => "freedom" as T;
    expect(manager.canStartTravelingDialogs(actor, object)).toBe(true);

    serverObject.m_smart_terrain_id = zone.id;
    expect(manager.canStartTravelingDialogs(actor, object)).toBe(false);

    zone.name = <T>() => "random_smart" as T;
    expect(manager.canStartTravelingDialogs(actor, object)).toBe(true);
  });

  it.todo("should correctly check if can use with squad");

  it.todo("should correctly generate current action description for squads");

  it.todo("should correctly check if smart reachable");

  it.todo("should correctly check if squad can travel");

  it.todo("should correctly check if can negotiate traveling");

  it("should correctly calculate travel price", () => {
    const manager: TravelManager = getManager(TravelManager);

    expect(manager.getTravelPriceByDistance(10)).toBe(50);
    expect(manager.getTravelPriceByDistance(100)).toBe(100);
    expect(manager.getTravelPriceByDistance(500)).toBe(500);
    expect(manager.getTravelPriceByDistance(750)).toBe(750);
    expect(manager.getTravelPriceByDistance(1500)).toBe(1500);
  });

  it.todo("should correctly calculate travel price for phrases");

  it.todo("should correctly calculate generate travel cost strings");

  it.todo("should correctly check if actor has enough money for traveling");

  it.todo("should correctly handle traveling with squad somewhere");

  it.todo("should correctly handle traveling with squad to specific destination");

  it.todo("should correctly handle updates");

  it("should correctly dump event", () => {
    const manager: TravelManager = getManager(TravelManager);
    const data: AnyObject = {};

    EventsManager.emitEvent(EGameEvent.DUMP_LUA_DATA, data);

    expect(data).toEqual({ TravelManager: expect.any(Object) });
    expect(manager.onDebugDump({})).toEqual({ TravelManager: expect.any(Object) });
  });
});
