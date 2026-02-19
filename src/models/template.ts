import type { Block } from "./petition";

export interface PetitionTemplate {
  id: string;
  name: string;
  description: string;
  legalBasis: string;
  blocks: Block[];
  archived: boolean;
}
