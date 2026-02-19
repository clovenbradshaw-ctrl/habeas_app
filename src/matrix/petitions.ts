import { getClient, sendState, sendTimeline } from "./client";
import { EVT_CLIENT, EVT_PETITION, EVT_PETITION_BLOCKS, EVT_OP } from "./events";
import { getClientRooms } from "./rooms";
import type { ImmigrationClient, Petition, Block } from "../models";

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

export async function createClientRoom(
  clientData: ImmigrationClient,
): Promise<string> {
  const client = getClient();
  const { room_id } = await client.createRoom({
    name: `client:${clientData.name || clientData.id}`,
    visibility: "private" as any,
    invite: [],
    initial_state: [
      {
        type: EVT_CLIENT,
        state_key: "",
        content: {
          name: clientData.name,
          country: clientData.country,
          yearsInUS: clientData.yearsInUS,
          entryDate: clientData.entryDate,
          entryMethod: clientData.entryMethod,
          apprehensionLocation: clientData.apprehensionLocation,
          apprehensionDate: clientData.apprehensionDate,
          criminalHistory: clientData.criminalHistory,
          communityTies: clientData.communityTies,
        },
      },
    ],
  });

  await sendTimeline(room_id, EVT_OP, {
    op: "CREATE",
    target: clientData.id,
    payload: null,
    frame: { entity: "client" },
  });

  return room_id;
}

export async function updateClientData(
  roomId: string,
  data: Partial<ImmigrationClient>,
): Promise<void> {
  const existing = readSingleState(roomId, EVT_CLIENT, "")?.getContent() || {};
  await sendState(roomId, EVT_CLIENT, { ...existing, ...data }, "");
}

export async function getAllClients(): Promise<
  Record<string, ImmigrationClient & { roomId: string }>
> {
  const client = getClient();
  const roomIds = getClientRooms();
  const result: Record<string, ImmigrationClient & { roomId: string }> = {};

  for (const roomId of roomIds) {
    const evt = readSingleState(roomId, EVT_CLIENT, "");
    if (evt) {
      const content = evt.getContent();
      if (content && !content.deleted) {
        const id = content.id || roomId;
        result[id] = {
          id,
          name: content.name || "",
          country: content.country || "",
          yearsInUS: content.yearsInUS || "",
          entryDate: content.entryDate || "",
          entryMethod: content.entryMethod || "without inspection",
          apprehensionLocation: content.apprehensionLocation || "",
          apprehensionDate: content.apprehensionDate || "",
          criminalHistory: content.criminalHistory || "",
          communityTies: content.communityTies || "",
          createdAt: new Date(evt.getTs()).toISOString(),
          roomId,
        };
      }
    }
  }
  return result;
}

export async function getAllPetitions(): Promise<
  Record<string, Petition & { roomId: string }>
> {
  const roomIds = getClientRooms();
  const result: Record<string, Petition & { roomId: string }> = {};

  for (const roomId of roomIds) {
    const petEvents = readStateEvents(roomId, EVT_PETITION);
    for (const evt of petEvents) {
      const petId = evt.getStateKey();
      const content = evt.getContent();
      if (!petId || !content || content.deleted) continue;

      const blocksEvt = readSingleState(roomId, EVT_PETITION_BLOCKS, petId);
      const blocks: Block[] = blocksEvt?.getContent()?.blocks || [];

      result[petId] = {
        id: petId,
        clientId: content.clientId || "",
        createdBy: evt.getSender() || "",
        stage: content.stage || "drafted",
        stageHistory: content.stageHistory || [
          { stage: "drafted", at: new Date(evt.getTs()).toISOString() },
        ],
        blocks,
        district: content.district || "",
        division: content.division || "",
        caseNumber: content.caseNumber || "",
        facilityName: content.facilityName || "",
        facilityCity: content.facilityCity || "",
        facilityState: content.facilityState || "",
        warden: content.warden || "",
        fieldOfficeDirector: content.fieldOfficeDirector || "",
        fieldOfficeName: content.fieldOfficeName || "",
        filingDate: content.filingDate || "",
        filingDay: content.filingDay || "",
        filingMonthYear: content.filingMonthYear || "",
        templateId: content.templateId,
        att1Id: content.att1Id,
        att2Id: content.att2Id,
        _facilityId: content._facilityId,
        _courtId: content._courtId,
        _att1Id: content._att1Id,
        _att2Id: content._att2Id,
        createdAt: new Date(evt.getTs()).toISOString(),
        roomId,
      };
    }
  }
  return result;
}

export async function createPetition(
  roomId: string,
  petition: Petition,
  blocks: Block[],
): Promise<void> {
  await sendState(roomId, EVT_PETITION, {
    clientId: petition.clientId,
    stage: petition.stage,
    stageHistory: petition.stageHistory,
    caseNumber: petition.caseNumber,
    district: petition.district,
    division: petition.division,
    facilityName: petition.facilityName,
    facilityCity: petition.facilityCity,
    facilityState: petition.facilityState,
    warden: petition.warden,
    fieldOfficeDirector: petition.fieldOfficeDirector,
    fieldOfficeName: petition.fieldOfficeName,
    att1Id: petition.att1Id,
    att2Id: petition.att2Id,
    filingDate: petition.filingDate,
    filingDay: petition.filingDay,
    filingMonthYear: petition.filingMonthYear,
    templateId: petition.templateId,
  }, petition.id);

  await sendState(roomId, EVT_PETITION_BLOCKS, { blocks }, petition.id);

  await sendTimeline(roomId, EVT_OP, {
    op: "CREATE",
    target: petition.id,
    payload: null,
    frame: { entity: "petition" },
  });
}

export async function updatePetitionState(
  roomId: string,
  petitionId: string,
  data: Partial<Petition>,
): Promise<void> {
  const existing =
    readSingleState(roomId, EVT_PETITION, petitionId)?.getContent() || {};
  await sendState(roomId, EVT_PETITION, { ...existing, ...data }, petitionId);
}

export async function updatePetitionBlocks(
  roomId: string,
  petitionId: string,
  blocks: Block[],
): Promise<void> {
  await sendState(roomId, EVT_PETITION_BLOCKS, { blocks }, petitionId);
}

export async function advanceStage(
  roomId: string,
  petitionId: string,
  newStage: string,
  priorStage: string,
  stageHistory: Array<{ stage: string; at: string }>,
): Promise<void> {
  const existing =
    readSingleState(roomId, EVT_PETITION, petitionId)?.getContent() || {};

  const newHistory = [
    ...stageHistory,
    { stage: newStage, at: new Date().toISOString() },
  ];

  await sendState(roomId, EVT_PETITION, {
    ...existing,
    stage: newStage,
    stageHistory: newHistory,
  }, petitionId);

  await sendTimeline(roomId, EVT_OP, {
    op: "STAGE",
    target: petitionId,
    payload: newStage,
    frame: { prior: priorStage },
  });
}
