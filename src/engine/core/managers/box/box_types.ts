import { TCount, TSection } from "@/engine/lib/types";

export interface IBoxDropItemDescriptor {
  count: TCount;
  section: TSection;
}

export interface IBoxDropProbabilityDescriptor {
  min: TCount;
  max: TCount;
}
