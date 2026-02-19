export type { Facility } from "./facility";
export type { Court } from "./court";
export type { AttorneyProfile } from "./attorney";
export type { ImmigrationClient } from "./client";
export type { Block, Petition, StageEntry } from "./petition";
export type { PetitionTemplate } from "./template";

export interface NationalDefaults {
  iceDirector: string;
  iceDirectorTitle: string;
  dhsSecretary: string;
  attorneyGeneral: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  history?: Array<{ by: string; at: string; change: string }>;
}
