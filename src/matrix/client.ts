import * as sdk from "matrix-js-sdk";

let client: sdk.MatrixClient | null = null;

const STORAGE_KEY = "amino_matrix_session";

interface StoredSession {
  baseUrl: string;
  userId: string;
  accessToken: string;
  deviceId: string;
}

export function getStoredSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function storeSession(session: StoredSession): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
  if (client) {
    client.stopClient();
    client = null;
  }
}

export async function loginWithPassword(
  baseUrl: string,
  username: string,
  password: string,
): Promise<sdk.MatrixClient> {
  const tempClient = sdk.createClient({ baseUrl });
  const response = await tempClient.login("m.login.password", {
    user: username,
    password,
    initial_device_display_name: "Amino Habeas App",
  });

  storeSession({
    baseUrl,
    userId: response.user_id,
    accessToken: response.access_token,
    deviceId: response.device_id,
  });

  return initMatrix(baseUrl, response.user_id, response.access_token);
}

export async function initMatrix(
  baseUrl: string,
  userId: string,
  accessToken: string,
): Promise<sdk.MatrixClient> {
  if (client) {
    client.stopClient();
  }

  client = sdk.createClient({
    baseUrl,
    userId,
    accessToken,
  });

  await client.startClient({
    initialSyncLimit: 0,
  });

  // Wait for initial sync
  await new Promise<void>((resolve) => {
    const onSync = (state: string) => {
      if (state === "PREPARED") {
        client!.removeListener("sync" as any, onSync);
        resolve();
      }
    };
    client!.on("sync" as any, onSync);
  });

  return client;
}

export function getClient(): sdk.MatrixClient {
  if (!client) throw new Error("Matrix client not initialized");
  return client;
}

export function isClientReady(): boolean {
  return client !== null;
}

// Helpers for custom event types — matrix-js-sdk v34 has strict typing
// that doesn't support arbitrary event type strings. These wrappers cast
// through `any` so call sites stay clean.
export async function sendState(
  roomId: string,
  eventType: string,
  content: Record<string, any>,
  stateKey: string,
): Promise<void> {
  const c = getClient();
  await (c as any).sendStateEvent(roomId, eventType, content, stateKey);
}

export async function sendTimeline(
  roomId: string,
  eventType: string,
  content: Record<string, any>,
): Promise<void> {
  const c = getClient();
  await (c as any).sendEvent(roomId, eventType, content);
}
