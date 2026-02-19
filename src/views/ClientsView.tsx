import FieldGroup from "../components/FieldGroup";
import { useStore } from "../store";
import { CLIENT_FIELDS, uid, now, SM } from "../lib/utils";
import { DEFAULT_BLOCKS } from "../templates/habeas-1225b2";
import type { ImmigrationClient, Petition } from "../models";

export default function ClientsView() {
  const {
    clients,
    petitions,
    currentUser,
    selectedClientId,
    selectClient,
    selectPetition,
    updateClient,
    updatePetition,
    setView,
    setEditorTab,
    pushLog,
  } = useStore();

  const createClient = () => {
    const id = uid();
    const c: ImmigrationClient & { roomId: string } = {
      id,
      name: "",
      country: "",
      yearsInUS: "",
      entryDate: "",
      entryMethod: "without inspection",
      apprehensionLocation: "",
      apprehensionDate: "",
      criminalHistory: "has no criminal record",
      communityTies: "",
      createdAt: now(),
      roomId: "",
    };
    updateClient(id, c);
    pushLog({
      op: "CREATE",
      target: id,
      payload: null,
      frame: { t: now(), entity: "client" },
    });
    selectClient(id);
  };

  const handleClientUpdate = (
    id: string,
    key: string,
    val: string,
  ) => {
    const existing = clients[id];
    if (!existing) return;
    updateClient(id, { ...existing, [key]: val });
    pushLog({
      op: "FILL",
      target: `client.${key}`,
      payload: val,
      frame: { t: now(), entity: "client", id },
    });
  };

  const createPetition = (clientId: string) => {
    const id = uid();
    const p: Petition & { roomId: string } = {
      id,
      clientId,
      createdBy: currentUser,
      stage: "drafted",
      stageHistory: [{ stage: "drafted", at: now() }],
      blocks: DEFAULT_BLOCKS.map((b) => ({ ...b })),
      district: "",
      division: "",
      caseNumber: "",
      facilityName: "",
      facilityCity: "",
      facilityState: "",
      warden: "",
      fieldOfficeDirector: "",
      fieldOfficeName: "",
      filingDate: "",
      filingDay: "",
      filingMonthYear: "",
      createdAt: now(),
      roomId: clients[clientId]?.roomId || "",
    };
    updatePetition(id, p);
    pushLog({
      op: "CREATE",
      target: id,
      payload: null,
      frame: { t: now(), entity: "petition", clientId },
    });
    selectPetition(id);
    setEditorTab("court");
    setView("editor");
  };

  const client = selectedClientId
    ? clients[selectedClientId]
    : null;
  const clientPets = client
    ? Object.values(petitions).filter(
        (p) => p.clientId === client.id,
      )
    : [];
  const clientList = Object.values(clients);

  return (
    <div className="clients-view">
      <div className="cv-sidebar">
        <div className="cv-head">
          <span className="cv-title">Clients</span>
          <button className="hbtn accent" onClick={createClient}>
            + New
          </button>
        </div>
        <div className="cv-list">
          {clientList.length === 0 && (
            <div className="cv-empty">No clients yet.</div>
          )}
          {clientList.map((c) => {
            const pets = Object.values(petitions).filter(
              (p) => p.clientId === c.id,
            );
            return (
              <div
                key={c.id}
                className={`cv-item ${selectedClientId === c.id ? "on" : ""}`}
                onClick={() => selectClient(c.id)}
              >
                <div className="cv-item-name">
                  {c.name || "Unnamed"}
                </div>
                <div className="cv-item-meta">
                  {c.country}
                  {pets.length > 0 && ` · ${pets.length} pet.`}
                </div>
                {pets.map((p) => (
                  <span
                    key={p.id}
                    className="stage-badge sm"
                    style={{ background: SM[p.stage].color }}
                  >
                    {p.stage}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <div className="cv-detail">
        {client ? (
          <>
            <div className="cv-detail-head">
              <h2>{client.name || "New Client"}</h2>
              <button
                className="hbtn accent"
                onClick={() => createPetition(client.id)}
              >
                + New Petition
              </button>
            </div>
            <FieldGroup
              title="Client Information"
              fields={CLIENT_FIELDS}
              data={client}
              onChange={(k, v) =>
                handleClientUpdate(client.id, k, v)
              }
            />
            {clientPets.length > 0 && (
              <div className="fg">
                <div className="fg-title">Petitions</div>
                {clientPets.map((p) => (
                  <div
                    key={p.id}
                    className="pet-row"
                    onClick={() => {
                      selectPetition(p.id);
                      setView("editor");
                    }}
                  >
                    <span
                      className="stage-badge"
                      style={{
                        background: SM[p.stage].color,
                      }}
                    >
                      {p.stage}
                    </span>
                    <span style={{ flex: 1, fontSize: 12 }}>
                      {p.caseNumber || "No case no."}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#aaa",
                      }}
                    >
                      {new Date(
                        p.createdAt,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="cv-empty-detail">
            <div
              style={{
                fontSize: 48,
                opacity: 0.3,
                marginBottom: 16,
              }}
            >
              &#9878;
            </div>
            <p>Select or create a client.</p>
          </div>
        )}
      </div>
    </div>
  );
}
