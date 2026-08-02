import { GameObject } from "xray16/alias";
import { extern, TName, TSection } from "xray16/lib";

import { anomalyHasArtefact } from "@/engine/core/utils/anomaly";

/**
 * Check whether anomaly with name has artefact.
 *
 * Where:
 * - anomalyName - name of the anomaly to check
 * - artefactSection - section of the artefact to check.
 */
extern(
  "xr_conditions.anomaly_has_artefact",
  (_: GameObject, __: GameObject, [anomalyName, artefactSection]: [TName, TSection]): boolean => {
    return anomalyHasArtefact(anomalyName, artefactSection);
  }
);
