import { extern, TNumberId } from "xray16/lib";

import { EGameEvent, EventsManager } from "@/engine/core/managers/events";

/** Handle dynamic object unregistration. */
extern("CSE_ALifeDynamicObject_on_unregister", (id: TNumberId): void => {
  EventsManager.emitEvent(EGameEvent.SERVER_OBJECT_UNREGISTERED, id);
});
