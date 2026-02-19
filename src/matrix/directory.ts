import { getClient, sendState, sendTimeline } from "./client";
import { getOrgRoom } from "./rooms";
import {
  EVT_FACILITY,
  EVT_COURT,
  EVT_ATTORNEY,
  EVT_NATIONAL,
  EVT_OP,
} from "./events";
import type {
  Facility,
  Court,
  AttorneyProfile,
  NationalDefaults,
} from "../models";

// ── Read helpers ────────────────────────────────────

function readStateEvents(roomId: string, eventType: string) {
  const client = getClient();
  const room = client.getRoom(roomId);
  return (room?.currentState as any).getStateEvents(eventType) || [];
}

function readSingleState(roomId: string, eventType: string, stateKey: string) {
  const client = getClient();
  const room = client.getRoom(roomId);
  return (room?.currentState as any).getStateEvents(eventType, stateKey);
}

export async function getFacilities(): Promise<Record<string, Facility>> {
  const roomId = await getOrgRoom();
  const events = readStateEvents(roomId, EVT_FACILITY);

  const result: Record<string, Facility> = {};
  for (const evt of events) {
    const key = evt.getStateKey();
    const content = evt.getContent();
    if (key && content?.name && !content.deleted) {
      result[key] = {
        id: key,
        ...content,
        createdBy: evt.getSender() ?? undefined,
        updatedAt: new Date(evt.getTs()).toISOString(),
      } as Facility;
    }
  }
  return result;
}

export async function getCourts(): Promise<Record<string, Court>> {
  const roomId = await getOrgRoom();
  const events = readStateEvents(roomId, EVT_COURT);

  const result: Record<string, Court> = {};
  for (const evt of events) {
    const key = evt.getStateKey();
    const content = evt.getContent();
    if (key && content?.district && !content.deleted) {
      result[key] = {
        id: key,
        ...content,
        createdBy: evt.getSender() ?? undefined,
        updatedAt: new Date(evt.getTs()).toISOString(),
      } as Court;
    }
  }
  return result;
}

export async function getAttorneyProfiles(): Promise<
  Record<string, AttorneyProfile>
> {
  const roomId = await getOrgRoom();
  const events = readStateEvents(roomId, EVT_ATTORNEY);

  const result: Record<string, AttorneyProfile> = {};
  for (const evt of events) {
    const key = evt.getStateKey();
    const content = evt.getContent();
    if (key && content?.name && !content.deleted) {
      result[key] = {
        id: key,
        ...content,
        createdBy: evt.getSender() ?? undefined,
        updatedAt: new Date(evt.getTs()).toISOString(),
      } as AttorneyProfile;
    }
  }
  return result;
}

export async function getNational(): Promise<NationalDefaults> {
  const roomId = await getOrgRoom();
  const evt = readSingleState(roomId, EVT_NATIONAL, "");
  if (evt) {
    const content = evt.getContent();
    return {
      iceDirector: content.iceDirector || "",
      iceDirectorTitle: content.iceDirectorTitle || "",
      dhsSecretary: content.dhsSecretary || "",
      attorneyGeneral: content.attorneyGeneral || "",
      createdBy: evt.getSender() ?? undefined,
      updatedAt: new Date(evt.getTs()).toISOString(),
    };
  }
  return {
    iceDirector: "",
    iceDirectorTitle: "",
    dhsSecretary: "",
    attorneyGeneral: "",
  };
}

// ── Write helpers ───────────────────────────────────

export async function upsertFacility(facility: Facility): Promise<void> {
  const roomId = await getOrgRoom();
  await sendState(roomId, EVT_FACILITY, {
    name: facility.name,
    city: facility.city,
    state: facility.state,
    warden: facility.warden,
    fieldOfficeName: facility.fieldOfficeName,
    fieldOfficeDirector: facility.fieldOfficeDirector,
  }, facility.id);
  await sendTimeline(roomId, EVT_OP, {
    op: "UPDATE",
    target: `facility.${facility.id}`,
    payload: facility.name,
    frame: { entity: "facility" },
  });
}

export async function deleteFacility(id: string): Promise<void> {
  const roomId = await getOrgRoom();
  await sendState(roomId, EVT_FACILITY, { deleted: true }, id);
  await sendTimeline(roomId, EVT_OP, {
    op: "DELETE",
    target: `facility.${id}`,
    payload: null,
    frame: { entity: "facility" },
  });
}

export async function upsertCourt(court: Court): Promise<void> {
  const roomId = await getOrgRoom();
  await sendState(roomId, EVT_COURT, {
    district: court.district,
    division: court.division,
  }, court.id);
  await sendTimeline(roomId, EVT_OP, {
    op: "UPDATE",
    target: `court.${court.id}`,
    payload: court.district,
    frame: { entity: "court" },
  });
}

export async function deleteCourt(id: string): Promise<void> {
  const roomId = await getOrgRoom();
  await sendState(roomId, EVT_COURT, { deleted: true }, id);
  await sendTimeline(roomId, EVT_OP, {
    op: "DELETE",
    target: `court.${id}`,
    payload: null,
    frame: { entity: "court" },
  });
}

export async function upsertAttorney(att: AttorneyProfile): Promise<void> {
  const roomId = await getOrgRoom();
  await sendState(roomId, EVT_ATTORNEY, {
    name: att.name,
    barNo: att.barNo,
    firm: att.firm,
    address: att.address,
    cityStateZip: att.cityStateZip,
    phone: att.phone,
    fax: att.fax,
    email: att.email,
    proHacVice: att.proHacVice,
  }, att.id);
  await sendTimeline(roomId, EVT_OP, {
    op: "UPDATE",
    target: `attorney.${att.id}`,
    payload: att.name,
    frame: { entity: "attorney" },
  });
}

export async function deleteAttorney(id: string): Promise<void> {
  const roomId = await getOrgRoom();
  await sendState(roomId, EVT_ATTORNEY, { deleted: true }, id);
  await sendTimeline(roomId, EVT_OP, {
    op: "DELETE",
    target: `attorney.${id}`,
    payload: null,
    frame: { entity: "attorney" },
  });
}

export async function updateNational(
  data: Partial<NationalDefaults>,
): Promise<void> {
  const roomId = await getOrgRoom();
  const existing = await getNational();
  await sendState(roomId, EVT_NATIONAL, {
    iceDirector: data.iceDirector ?? existing.iceDirector,
    iceDirectorTitle: data.iceDirectorTitle ?? existing.iceDirectorTitle,
    dhsSecretary: data.dhsSecretary ?? existing.dhsSecretary,
    attorneyGeneral: data.attorneyGeneral ?? existing.attorneyGeneral,
  }, "");
  await sendTimeline(roomId, EVT_OP, {
    op: "UPDATE",
    target: "national",
    payload: JSON.stringify(data),
    frame: { entity: "national" },
  });
}
