import { useEffect, useState, useCallback } from "react";
import { getClient, isClientReady } from "./client";
import { getOrgRoom } from "./rooms";

export function useStateEvents<T>(
  roomId: string | null,
  eventType: string,
): Record<string, T> {
  const [data, setData] = useState<Record<string, T>>({});

  useEffect(() => {
    if (!roomId || !isClientReady()) return;
    const client = getClient();
    const room = client.getRoom(roomId);
    if (!room) return;

    const load = () => {
      const events = room.currentState.getStateEvents(eventType) || [];
      const result: Record<string, T> = {};
      for (const evt of events) {
        const key = evt.getStateKey();
        const content = evt.getContent();
        if (key && content && !content.deleted) {
          result[key] = { id: key, ...content } as T;
        }
      }
      setData(result);
    };
    load();

    const handler = (event: any) => {
      if (event.getType() === eventType && event.getRoomId() === roomId) {
        load();
      }
    };
    client.on("RoomState.events" as any, handler);

    return () => {
      client.removeListener("RoomState.events" as any, handler);
    };
  }, [roomId, eventType]);

  return data;
}

export function useUserRole(): "admin" | "attorney" | null {
  const [role, setRole] = useState<"admin" | "attorney" | null>(null);

  useEffect(() => {
    if (!isClientReady()) return;

    const check = async () => {
      try {
        const client = getClient();
        const orgRoomId = await getOrgRoom();
        const room = client.getRoom(orgRoomId);
        if (!room) {
          setRole("attorney");
          return;
        }
        const pl = room.currentState.getStateEvents(
          "m.room.power_levels",
          "",
        );
        const myPl =
          pl?.getContent()?.users?.[client.getUserId()!] ?? 0;
        setRole(myPl >= 50 ? "admin" : "attorney");
      } catch {
        setRole("attorney");
      }
    };
    check();
  }, []);

  return role;
}

export function useMatrixSync(callback: () => void): void {
  useEffect(() => {
    if (!isClientReady()) return;
    const client = getClient();

    const handler = () => callback();
    client.on("RoomState.events" as any, handler);
    client.on("Room.timeline" as any, handler);

    return () => {
      client.removeListener("RoomState.events" as any, handler);
      client.removeListener("Room.timeline" as any, handler);
    };
  }, [callback]);
}

export function useRoomId(
  getRoom: () => Promise<string>,
): string | null {
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (!isClientReady()) return;
    getRoom()
      .then(setRoomId)
      .catch(() => setRoomId(null));
  }, [getRoom]);

  return roomId;
}

export function useOrgRoomId(): string | null {
  return useRoomId(useCallback(() => getOrgRoom(), []));
}
