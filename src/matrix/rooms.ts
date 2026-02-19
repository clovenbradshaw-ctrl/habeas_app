import { getClient } from "./client";
import { EVT_CLIENT } from "./events";

let orgRoomId: string | null = null;
let templatesRoomId: string | null = null;

const ORG_ALIAS =
  import.meta.env.VITE_ORG_ROOM_ALIAS || "#org:aminoimmigration.com";
const TEMPLATES_ALIAS =
  import.meta.env.VITE_TEMPLATES_ROOM_ALIAS ||
  "#templates:aminoimmigration.com";

export async function getOrgRoom(): Promise<string> {
  if (orgRoomId) return orgRoomId;
  const client = getClient();
  const result = await client.getRoomIdForAlias(ORG_ALIAS);
  orgRoomId = result.room_id;
  return orgRoomId;
}

export async function getTemplatesRoom(): Promise<string> {
  if (templatesRoomId) return templatesRoomId;
  const client = getClient();
  const result = await client.getRoomIdForAlias(TEMPLATES_ALIAS);
  templatesRoomId = result.room_id;
  return templatesRoomId;
}

export function getClientRooms(): string[] {
  const client = getClient();
  const rooms = client.getRooms();
  return rooms
    .filter((r) => {
      try {
        const ev = (r.currentState as any).getStateEvents(EVT_CLIENT, "");
        return ev && ev.getContent() && !ev.getContent().deleted;
      } catch {
        return false;
      }
    })
    .map((r) => r.roomId);
}

export function resetRoomCache(): void {
  orgRoomId = null;
  templatesRoomId = null;
}
