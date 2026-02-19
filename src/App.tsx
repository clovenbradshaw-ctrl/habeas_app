import { useState, useEffect, useCallback } from "react";
import LoginView from "./views/LoginView";
import BoardView from "./views/BoardView";
import ClientsView from "./views/ClientsView";
import DirectoryView from "./views/DirectoryView";
import EditorView from "./views/EditorView";
import { useStore } from "./store";
import {
  getStoredSession,
  initMatrix,
  clearSession,
  getClient,
  isClientReady,
} from "./matrix/client";
import {
  getFacilities,
  getCourts,
  getAttorneyProfiles,
  getNational,
} from "./matrix/directory";
import { getAllClients, getAllPetitions } from "./matrix/petitions";
import { getOrgRoom } from "./matrix/rooms";
import { SM } from "./lib/utils";
import { doExportDoc } from "./export/word";
import { doExportPDF } from "./export/pdf";
import { buildVarMap } from "./lib/utils";

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState("");

  const {
    currentView,
    selectedPetitionId,
    petitions,
    clients,
    national,
    attProfiles,
    role,
    setView,
    setRole,
    setCurrentUser,
    setFacilities,
    setCourts,
    setAttProfiles,
    setNational,
    setClients,
    setPetitions,
  } = useStore();

  const hydrateStore = useCallback(async () => {
    try {
      const [fac, crt, att, nat] = await Promise.all([
        getFacilities(),
        getCourts(),
        getAttorneyProfiles(),
        getNational(),
      ]);
      setFacilities(fac);
      setCourts(crt);
      setAttProfiles(att);
      setNational(nat);

      const cl = await getAllClients();
      setClients(cl);

      const pet = await getAllPetitions();
      setPetitions(pet);

      // Get role
      const client = getClient();
      const orgRoomId = await getOrgRoom();
      const room = client.getRoom(orgRoomId);
      if (room) {
        const pl = room.currentState.getStateEvents(
          "m.room.power_levels",
          "",
        );
        const myPl =
          pl?.getContent()?.users?.[client.getUserId()!] ?? 0;
        setRole(myPl >= 50 ? "admin" : "attorney");
      } else {
        setRole("attorney");
      }

      setCurrentUser(client.getUserId() || "");
    } catch (e: any) {
      console.error("Hydration error:", e);
      setSyncError(e?.message || "Failed to sync data from server");
    }
  }, [
    setFacilities,
    setCourts,
    setAttProfiles,
    setNational,
    setClients,
    setPetitions,
    setRole,
    setCurrentUser,
  ]);

  // Try to restore session on mount
  useEffect(() => {
    const restore = async () => {
      const session = getStoredSession();
      if (session) {
        try {
          await initMatrix(
            session.baseUrl,
            session.userId,
            session.accessToken,
          );
          setAuthenticated(true);
          await hydrateStore();
        } catch (e) {
          console.error("Session restore failed:", e);
          clearSession();
        }
      }
      setLoading(false);
    };
    restore();
  }, [hydrateStore]);

  const handleLogin = async () => {
    setAuthenticated(true);
    try {
      await hydrateStore();
    } catch (e: any) {
      setSyncError(
        e?.message || "Failed to load data. The app will work in local mode.",
      );
    }
  };

  const handleLogout = () => {
    clearSession();
    setAuthenticated(false);
    setSyncError("");
  };

  if (loading) {
    return (
      <div className="loading-wrap">
        <div className="loading-text">Connecting...</div>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  const pet = selectedPetitionId
    ? petitions[selectedPetitionId]
    : null;
  const petClient = pet ? clients[pet.clientId] : null;
  const att1 = pet?._att1Id ? attProfiles[pet._att1Id] : null;
  const att2 = pet?._att2Id ? attProfiles[pet._att2Id] : null;
  const vars = pet
    ? buildVarMap(petClient || {}, pet, att1 || {}, att2 || {}, national)
    : {};

  return (
    <div className="root">
      {syncError && (
        <div className="sync-banner">
          {syncError}
          <button
            onClick={() => setSyncError("")}
            style={{
              marginLeft: 12,
              background: "none",
              border: "1px solid rgba(255,255,255,.4)",
              color: "#fff",
              padding: "2px 8px",
              borderRadius: 3,
              cursor: "pointer",
              fontSize: 11,
            }}
          >
            Dismiss
          </button>
        </div>
      )}
      <header className="hdr">
        <div className="hdr-left">
          <span className="hdr-brand">Habeas</span>
          <nav className="hdr-nav">
            {(
              [
                ["board", "Board"],
                ["clients", "Clients"],
                ["directory", "Directory"],
                ...(pet ? [["editor", "Editor"]] : []),
              ] as const
            ).map(([k, l]) => (
              <button
                key={k}
                className={`nav-btn ${currentView === k ? "on" : ""}`}
                onClick={() => setView(k as any)}
              >
                {l}
              </button>
            ))}
          </nav>
        </div>
        <div className="hdr-right">
          <span
            className="role-badge"
            style={{
              color: role === "admin" ? "#a08540" : "#8a8a9a",
            }}
          >
            {role === "admin" ? "Admin" : "Attorney"}
          </span>
          {pet && (
            <>
              <span
                className="stage-badge"
                style={{ background: SM[pet.stage]?.color }}
              >
                {pet.stage}
              </span>
              <button
                className="hbtn export"
                onClick={() =>
                  doExportDoc(
                    pet.blocks,
                    vars,
                    petClient?.name,
                  )
                }
              >
                Word
              </button>
              <button
                className="hbtn export"
                onClick={() => doExportPDF(pet.blocks, vars)}
              >
                PDF
              </button>
            </>
          )}
          <button className="hbtn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      {currentView === "board" && <BoardView />}
      {currentView === "directory" && <DirectoryView />}
      {currentView === "clients" && <ClientsView />}
      {currentView === "editor" && <EditorView />}
    </div>
  );
}
