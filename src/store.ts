import { create } from "zustand";
import type {
  Facility,
  Court,
  AttorneyProfile,
  NationalDefaults,
  ImmigrationClient,
  Petition,
} from "./models";

export interface AppState {
  // Shared directory (from !org room)
  facilities: Record<string, Facility>;
  courts: Record<string, Court>;
  attProfiles: Record<string, AttorneyProfile>;
  national: NationalDefaults;

  // Clients + petitions (from !client:* rooms)
  clients: Record<string, ImmigrationClient & { roomId: string }>;
  petitions: Record<string, Petition & { roomId: string }>;

  // Operation log (local)
  log: Array<{
    op: string;
    target: string;
    payload: any;
    frame: { t: string; [k: string]: any };
  }>;

  // UI state
  role: "admin" | "attorney" | null;
  currentUser: string;
  currentView: "board" | "clients" | "directory" | "editor" | "admin";
  selectedClientId: string | null;
  selectedPetitionId: string | null;
  editorTab: string;

  // Actions
  setFacilities: (f: Record<string, Facility>) => void;
  setCourts: (c: Record<string, Court>) => void;
  setAttProfiles: (a: Record<string, AttorneyProfile>) => void;
  setNational: (n: NationalDefaults) => void;
  setClients: (
    c: Record<string, ImmigrationClient & { roomId: string }>,
  ) => void;
  setPetitions: (p: Record<string, Petition & { roomId: string }>) => void;
  setRole: (r: "admin" | "attorney" | null) => void;
  setCurrentUser: (u: string) => void;
  setView: (v: AppState["currentView"]) => void;
  selectClient: (id: string | null) => void;
  selectPetition: (id: string | null) => void;
  setEditorTab: (tab: string) => void;
  pushLog: (entry: AppState["log"][number]) => void;

  // Granular updates
  updateFacility: (id: string, f: Facility) => void;
  removeFacility: (id: string) => void;
  updateCourt: (id: string, c: Court) => void;
  removeCourt: (id: string) => void;
  updateAttProfile: (id: string, a: AttorneyProfile) => void;
  removeAttProfile: (id: string) => void;
  updateClient: (
    id: string,
    c: ImmigrationClient & { roomId: string },
  ) => void;
  updatePetition: (id: string, p: Petition & { roomId: string }) => void;
}

export const useStore = create<AppState>((set) => ({
  facilities: {},
  courts: {},
  attProfiles: {},
  national: {
    iceDirector: "",
    iceDirectorTitle: "",
    dhsSecretary: "",
    attorneyGeneral: "",
  },
  clients: {},
  petitions: {},
  log: [],
  role: null,
  currentUser: "",
  currentView: "board",
  selectedClientId: null,
  selectedPetitionId: null,
  editorTab: "client",

  setFacilities: (f) => set({ facilities: f }),
  setCourts: (c) => set({ courts: c }),
  setAttProfiles: (a) => set({ attProfiles: a }),
  setNational: (n) => set({ national: n }),
  setClients: (c) => set({ clients: c }),
  setPetitions: (p) => set({ petitions: p }),
  setRole: (r) => set({ role: r }),
  setCurrentUser: (u) => set({ currentUser: u }),
  setView: (v) => set({ currentView: v }),
  selectClient: (id) => set({ selectedClientId: id }),
  selectPetition: (id) => set({ selectedPetitionId: id }),
  setEditorTab: (tab) => set({ editorTab: tab }),
  pushLog: (entry) => set((s) => ({ log: [...s.log, entry] })),

  updateFacility: (id, f) =>
    set((s) => ({ facilities: { ...s.facilities, [id]: f } })),
  removeFacility: (id) =>
    set((s) => {
      const n = { ...s.facilities };
      delete n[id];
      return { facilities: n };
    }),
  updateCourt: (id, c) =>
    set((s) => ({ courts: { ...s.courts, [id]: c } })),
  removeCourt: (id) =>
    set((s) => {
      const n = { ...s.courts };
      delete n[id];
      return { courts: n };
    }),
  updateAttProfile: (id, a) =>
    set((s) => ({ attProfiles: { ...s.attProfiles, [id]: a } })),
  removeAttProfile: (id) =>
    set((s) => {
      const n = { ...s.attProfiles };
      delete n[id];
      return { attProfiles: n };
    }),
  updateClient: (id, c) =>
    set((s) => ({ clients: { ...s.clients, [id]: c } })),
  updatePetition: (id, p) =>
    set((s) => ({ petitions: { ...s.petitions, [id]: p } })),
}));
