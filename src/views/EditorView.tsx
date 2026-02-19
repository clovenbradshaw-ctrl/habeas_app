import { useCallback, useRef } from "react";
import PaginatedDoc from "../components/PaginatedDoc";
import FieldGroup from "../components/FieldGroup";
import Picker from "../components/Picker";
import { useStore } from "../store";
import {
  CLIENT_FIELDS,
  COURT_FIELDS,
  FACILITY_FIELDS,
  FILING_FIELDS,
  RESPONDENT_FIELDS,
  buildVarMap,
  now,
  ts,
} from "../lib/utils";

export default function EditorView() {
  const {
    petitions,
    clients,
    facilities,
    courts,
    attProfiles,
    national,
    selectedPetitionId,
    editorTab,
    log,
    setEditorTab,
    updatePetition,
    updateClient,
    pushLog,
    setView,
  } = useStore();

  const logEndRef = useRef<HTMLDivElement>(null);

  const pet = selectedPetitionId
    ? petitions[selectedPetitionId]
    : null;
  const client = pet ? clients[pet.clientId] : null;
  const att1 = pet?._att1Id ? attProfiles[pet._att1Id] : null;
  const att2 = pet?._att2Id ? attProfiles[pet._att2Id] : null;
  const vars = pet ? buildVarMap(client || {}, pet, att1 || {}, att2 || {}, national) : {};
  const caseNo = pet?.caseNumber?.trim()
    ? `C/A No. ${pet.caseNumber}`
    : "";

  const handleBlockEdit = useCallback(
    (bid: string, nc: string, oc: string) => {
      if (!pet) return;
      updatePetition(pet.id, {
        ...pet,
        blocks: pet.blocks.map((b) =>
          b.id === bid ? { ...b, content: nc } : b,
        ),
      });
      pushLog({
        op: "REVISE",
        target: bid,
        payload: nc,
        frame: { t: now(), prior: oc, petition: pet.id },
      });
    },
    [pet, updatePetition, pushLog],
  );

  const handlePetField = (key: string, val: string) => {
    if (!pet) return;
    updatePetition(pet.id, { ...pet, [key]: val });
    pushLog({
      op: "FILL",
      target: `petition.${key}`,
      payload: val,
      frame: { t: now(), entity: "petition", id: pet.id },
    });
  };

  const handleClientField = (key: string, val: string) => {
    if (!client) return;
    updateClient(client.id, { ...client, [key]: val });
    pushLog({
      op: "FILL",
      target: `client.${key}`,
      payload: val,
      frame: { t: now(), entity: "client", id: client.id },
    });
  };

  const applyFacility = (facId: string) => {
    if (!pet) return;
    const f = facilities[facId];
    if (!f) return;
    updatePetition(pet.id, {
      ...pet,
      facilityName: f.name,
      facilityCity: f.city,
      facilityState: f.state,
      warden: f.warden,
      fieldOfficeName: f.fieldOfficeName,
      fieldOfficeDirector: f.fieldOfficeDirector,
      _facilityId: facId,
    });
    pushLog({
      op: "APPLY",
      target: "facility",
      payload: facId,
      frame: { t: now(), petition: pet.id },
    });
  };

  const applyCourt = (courtId: string) => {
    if (!pet) return;
    const c = courts[courtId];
    if (!c) return;
    updatePetition(pet.id, {
      ...pet,
      district: c.district,
      division: c.division,
      _courtId: courtId,
    });
    pushLog({
      op: "APPLY",
      target: "court",
      payload: courtId,
      frame: { t: now(), petition: pet.id },
    });
  };

  const applyAtt = (slot: "_att1Id" | "_att2Id", attId: string) => {
    if (!pet) return;
    updatePetition(pet.id, { ...pet, [slot]: attId });
    pushLog({
      op: "APPLY",
      target: slot === "_att1Id" ? "att1" : "att2",
      payload: attId,
      frame: { t: now(), petition: pet.id },
    });
  };

  const attList = Object.values(attProfiles);

  if (!pet) {
    return (
      <div className="editor-view">
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#aaa",
          }}
        >
          No petition selected.
        </div>
      </div>
    );
  }

  return (
    <div className="editor-view">
      <div className="ed-sidebar">
        <div className="ed-tabs">
          {(
            [
              ["client", "Client"],
              ["court", "Court + Facility"],
              ["atty", "Attorneys"],
              ["filing", "Filing"],
              ["log", `Log (${log.length})`],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              className={`ed-tab ${editorTab === k ? "on" : ""}`}
              onClick={() => setEditorTab(k)}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="ed-fields">
          {editorTab === "client" && client && (
            <FieldGroup
              title="Client (shared)"
              fields={CLIENT_FIELDS}
              data={client}
              onChange={handleClientField}
            />
          )}

          {editorTab === "court" && (
            <>
              <Picker
                label="Select Court"
                items={Object.values(courts)}
                displayKey={(c: any) =>
                  `${c.district} — ${c.division}`
                }
                value={pet._courtId || ""}
                onChange={applyCourt}
                onNew={() => setView("directory")}
              />
              <FieldGroup
                title="Court (manual override)"
                fields={COURT_FIELDS}
                data={pet}
                onChange={handlePetField}
              />
              <div style={{ height: 8 }} />
              <Picker
                label="Select Facility"
                items={Object.values(facilities)}
                displayKey={(f: any) =>
                  `${f.name} — ${f.city}, ${f.state}`
                }
                value={pet._facilityId || ""}
                onChange={applyFacility}
                onNew={() => setView("directory")}
              />
              <FieldGroup
                title="Facility (manual override)"
                fields={FACILITY_FIELDS}
                data={pet}
                onChange={handlePetField}
              />
              <FieldGroup
                title="Respondents (manual override)"
                fields={RESPONDENT_FIELDS}
                data={pet}
                onChange={handlePetField}
              />
            </>
          )}

          {editorTab === "atty" && (
            <>
              <Picker
                label="Attorney 1"
                items={attList}
                displayKey={(a: any) =>
                  `${a.name} — ${a.firm}`
                }
                value={pet._att1Id || ""}
                onChange={(v) => applyAtt("_att1Id", v)}
                onNew={() => setView("directory")}
              />
              <Picker
                label="Attorney 2"
                items={attList}
                displayKey={(a: any) =>
                  `${a.name} — ${a.firm}`
                }
                value={pet._att2Id || ""}
                onChange={(v) => applyAtt("_att2Id", v)}
                onNew={() => setView("directory")}
              />
              {!pet._att1Id && !pet._att2Id && (
                <p
                  style={{
                    fontSize: 11,
                    color: "#aaa",
                    marginTop: 8,
                  }}
                >
                  Select attorney profiles from the Directory, or add new
                  ones with +
                </p>
              )}
            </>
          )}

          {editorTab === "filing" && (
            <FieldGroup
              title="Filing"
              fields={FILING_FIELDS}
              data={pet}
              onChange={handlePetField}
            />
          )}

          {editorTab === "log" && (
            <div className="lscroll">
              {log.length === 0 && (
                <div className="lempty">No operations yet.</div>
              )}
              {log.map((e, i) => {
                const c: Record<string, string> = {
                  FILL: "#5aa06f",
                  REVISE: "#c9a040",
                  CREATE: "#7a70c0",
                  STAGE: "#4a7ab5",
                  APPLY: "#60a0d0",
                  UPDATE: "#a08540",
                  DELETE: "#c05050",
                };
                return (
                  <div key={i} className="lentry">
                    <span className="lts">
                      {new Date(e.frame.t).toLocaleTimeString(
                        "en-US",
                        { hour12: false },
                      )}
                    </span>{" "}
                    <span
                      style={{
                        color: c[e.op] || "#888",
                        fontWeight: 600,
                      }}
                    >
                      {e.op}
                    </span>
                    <span className="ld">(</span>
                    <span className="lt">{e.target}</span>
                    {e.payload != null && (
                      <>
                        <span className="ld">, </span>
                        <span className="lp">
                          {typeof e.payload === "string"
                            ? `"${e.payload.slice(0, 25)}${e.payload.length > 25 ? "\u2026" : ""}"`
                            : "\u2026"}
                        </span>
                      </>
                    )}
                    <span className="ld">)</span>
                  </div>
                );
              })}
              <div ref={logEndRef} />
            </div>
          )}
        </div>
      </div>
      <div className="doc-scroll">
        <PaginatedDoc
          blocks={pet.blocks}
          vars={vars}
          onEdit={handleBlockEdit}
          caseNo={caseNo}
        />
        <div style={{ height: 60, flexShrink: 0 }} />
      </div>
    </div>
  );
}
