import { useState } from "react";
import FieldGroup from "../components/FieldGroup";
import ProvenanceBadge from "../components/ProvenanceBadge";
import { useStore } from "../store";
import {
  FACILITY_FIELDS,
  COURT_FIELDS,
  NATIONAL_FIELDS,
  ATT_PROFILE_FIELDS,
  uid,
  now,
} from "../lib/utils";
import type { Facility, Court, AttorneyProfile } from "../models";
import * as dirApi from "../matrix/directory";
import { isClientReady } from "../matrix/client";

export default function DirectoryView() {
  const {
    facilities,
    courts,
    national,
    attProfiles,
    currentUser,
    updateFacility,
    removeFacility,
    updateCourt,
    removeCourt,
    setNational,
    updateAttProfile,
    removeAttProfile,
    pushLog,
  } = useStore();

  const [tab, setTab] = useState("facilities");
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, any>>({});

  const startEdit = (record: Record<string, any>) => {
    setEditId(record.id);
    setDraft({ ...record });
  };
  const cancelEdit = () => {
    setEditId(null);
    setDraft({});
  };

  const addFacility = () => {
    const id = uid();
    const f: Facility = {
      id,
      name: "",
      city: "",
      state: "",
      warden: "",
      fieldOfficeName: "",
      fieldOfficeDirector: "",
      createdBy: currentUser,
      createdAt: now(),
      updatedBy: currentUser,
      updatedAt: now(),
    };
    updateFacility(id, f);
    pushLog({
      op: "CREATE",
      target: id,
      payload: null,
      frame: { t: now(), entity: "facility" },
    });
    startEdit(f);
  };

  const saveFacility = async () => {
    const f = draft as Facility;
    updateFacility(f.id, {
      ...f,
      updatedBy: currentUser,
      updatedAt: now(),
    });
    if (isClientReady()) {
      try {
        await dirApi.upsertFacility(f);
      } catch (e) {
        console.error("Failed to sync facility:", e);
      }
    }
    pushLog({
      op: "UPDATE",
      target: f.id,
      payload: f.name,
      frame: { t: now(), entity: "facility" },
    });
    cancelEdit();
  };

  const delFacility = async (id: string) => {
    removeFacility(id);
    if (isClientReady()) {
      try {
        await dirApi.deleteFacility(id);
      } catch (e) {
        console.error("Failed to delete facility:", e);
      }
    }
    pushLog({
      op: "DELETE",
      target: id,
      payload: null,
      frame: { t: now(), entity: "facility" },
    });
    cancelEdit();
  };

  const addCourt = () => {
    const id = uid();
    const c: Court = {
      id,
      district: "",
      division: "",
      createdBy: currentUser,
      createdAt: now(),
      updatedBy: currentUser,
      updatedAt: now(),
    };
    updateCourt(id, c);
    pushLog({
      op: "CREATE",
      target: id,
      payload: null,
      frame: { t: now(), entity: "court" },
    });
    startEdit(c);
  };

  const saveCourt = async () => {
    const c = draft as Court;
    updateCourt(c.id, {
      ...c,
      updatedBy: currentUser,
      updatedAt: now(),
    });
    if (isClientReady()) {
      try {
        await dirApi.upsertCourt(c);
      } catch (e) {
        console.error("Failed to sync court:", e);
      }
    }
    pushLog({
      op: "UPDATE",
      target: c.id,
      payload: c.district,
      frame: { t: now(), entity: "court" },
    });
    cancelEdit();
  };

  const delCourt = async (id: string) => {
    removeCourt(id);
    if (isClientReady()) {
      try {
        await dirApi.deleteCourt(id);
      } catch (e) {
        console.error("Failed to delete court:", e);
      }
    }
    pushLog({
      op: "DELETE",
      target: id,
      payload: null,
      frame: { t: now(), entity: "court" },
    });
    cancelEdit();
  };

  const addAttProfile = () => {
    const id = uid();
    const a: AttorneyProfile = {
      id,
      name: "",
      barNo: "",
      firm: "",
      address: "",
      cityStateZip: "",
      phone: "",
      fax: "",
      email: "",
      proHacVice: "",
      createdBy: currentUser,
      createdAt: now(),
      updatedBy: currentUser,
      updatedAt: now(),
    };
    updateAttProfile(id, a);
    pushLog({
      op: "CREATE",
      target: id,
      payload: null,
      frame: { t: now(), entity: "attorney_profile" },
    });
    startEdit(a);
  };

  const saveAttProfile = async () => {
    const a = draft as AttorneyProfile;
    updateAttProfile(a.id, {
      ...a,
      updatedBy: currentUser,
      updatedAt: now(),
    });
    if (isClientReady()) {
      try {
        await dirApi.upsertAttorney(a);
      } catch (e) {
        console.error("Failed to sync attorney:", e);
      }
    }
    pushLog({
      op: "UPDATE",
      target: a.id,
      payload: a.name,
      frame: { t: now(), entity: "attorney_profile" },
    });
    cancelEdit();
  };

  const delAttProfile = async (id: string) => {
    removeAttProfile(id);
    if (isClientReady()) {
      try {
        await dirApi.deleteAttorney(id);
      } catch (e) {
        console.error("Failed to delete attorney:", e);
      }
    }
    pushLog({
      op: "DELETE",
      target: id,
      payload: null,
      frame: { t: now(), entity: "attorney_profile" },
    });
    cancelEdit();
  };

  const handleNationalChange = async (key: string, val: string) => {
    const updated = { ...national, [key]: val, updatedBy: currentUser, updatedAt: now() };
    setNational(updated);
    if (isClientReady()) {
      try {
        await dirApi.updateNational({ [key]: val });
      } catch (e) {
        console.error("Failed to sync national:", e);
      }
    }
    pushLog({
      op: "UPDATE",
      target: "national",
      payload: val,
      frame: { t: now(), field: key },
    });
  };

  return (
    <div className="dir-view">
      <div className="dir-tabs">
        {(
          [
            [
              "facilities",
              `Facilities (${Object.keys(facilities).length})`,
            ],
            ["courts", `Courts (${Object.keys(courts).length})`],
            [
              "attorneys",
              `Attorney Profiles (${Object.keys(attProfiles).length})`,
            ],
            ["national", "National Defaults"],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            className={`dir-tab ${tab === k ? "on" : ""}`}
            onClick={() => {
              setTab(k);
              cancelEdit();
            }}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="dir-body">
        {tab === "facilities" && (
          <div className="dir-section">
            <div className="dir-head">
              <h3>Detention Facilities</h3>
              <button className="hbtn accent" onClick={addFacility}>
                + Add Facility
              </button>
            </div>
            <p className="dir-desc">
              Each facility bundles its warden, location, and linked field
              office. Selecting a facility on a petition auto-fills all six
              fields.
            </p>
            <div className="dir-list">
              {Object.values(facilities).map((f) => (
                <div
                  key={f.id}
                  className={`dir-card ${editId === f.id ? "editing" : ""}`}
                >
                  {editId === f.id ? (
                    <>
                      {FACILITY_FIELDS.map((ff) => (
                        <div key={ff.key} className="frow">
                          <label className="flbl">{ff.label}</label>
                          <input
                            className="finp"
                            value={(draft as any)[ff.key] || ""}
                            placeholder={ff.ph || ""}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                [ff.key]: e.target.value,
                              }))
                            }
                          />
                        </div>
                      ))}
                      <div className="dir-card-actions">
                        <button className="hbtn accent" onClick={saveFacility}>
                          Save
                        </button>
                        <button className="hbtn" onClick={cancelEdit}>
                          Cancel
                        </button>
                        <button
                          className="hbtn danger"
                          onClick={() => delFacility(f.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="dir-card-head"
                        onClick={() => startEdit(f)}
                      >
                        <strong>{f.name || "Unnamed Facility"}</strong>
                        <span className="dir-card-sub">
                          {f.city}, {f.state}
                        </span>
                      </div>
                      <div className="dir-card-detail">
                        Warden: {f.warden || "\u2014"} · FO:{" "}
                        {f.fieldOfficeName || "\u2014"} · FOD:{" "}
                        {f.fieldOfficeDirector || "\u2014"}
                      </div>
                      <ProvenanceBadge record={f} />
                    </>
                  )}
                </div>
              ))}
              {Object.keys(facilities).length === 0 && (
                <div className="dir-empty">
                  No facilities yet. Add one to get started.
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "courts" && (
          <div className="dir-section">
            <div className="dir-head">
              <h3>Courts</h3>
              <button className="hbtn accent" onClick={addCourt}>
                + Add Court
              </button>
            </div>
            <p className="dir-desc">
              District + division combos. Selecting a court on a petition fills
              both fields.
            </p>
            <div className="dir-list">
              {Object.values(courts).map((c) => (
                <div
                  key={c.id}
                  className={`dir-card ${editId === c.id ? "editing" : ""}`}
                >
                  {editId === c.id ? (
                    <>
                      {COURT_FIELDS.map((ff) => (
                        <div key={ff.key} className="frow">
                          <label className="flbl">{ff.label}</label>
                          <input
                            className="finp"
                            value={(draft as any)[ff.key] || ""}
                            placeholder={ff.ph || ""}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                [ff.key]: e.target.value,
                              }))
                            }
                          />
                        </div>
                      ))}
                      <div className="dir-card-actions">
                        <button className="hbtn accent" onClick={saveCourt}>
                          Save
                        </button>
                        <button className="hbtn" onClick={cancelEdit}>
                          Cancel
                        </button>
                        <button
                          className="hbtn danger"
                          onClick={() => delCourt(c.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="dir-card-head"
                        onClick={() => startEdit(c)}
                      >
                        <strong>{c.district || "Unnamed"}</strong>
                        <span className="dir-card-sub">{c.division}</span>
                      </div>
                      <ProvenanceBadge record={c} />
                    </>
                  )}
                </div>
              ))}
              {Object.keys(courts).length === 0 && (
                <div className="dir-empty">No courts yet.</div>
              )}
            </div>
          </div>
        )}

        {tab === "attorneys" && (
          <div className="dir-section">
            <div className="dir-head">
              <h3>Attorney Profiles</h3>
              <button className="hbtn accent" onClick={addAttProfile}>
                + Add Attorney
              </button>
            </div>
            <p className="dir-desc">
              Reusable attorney profiles. Select as Attorney 1 or 2 on any
              petition.
            </p>
            <div className="dir-list">
              {Object.values(attProfiles).map((a) => (
                <div
                  key={a.id}
                  className={`dir-card ${editId === a.id ? "editing" : ""}`}
                >
                  {editId === a.id ? (
                    <>
                      {ATT_PROFILE_FIELDS.map((ff) => (
                        <div key={ff.key} className="frow">
                          <label className="flbl">{ff.label}</label>
                          <input
                            className="finp"
                            value={(draft as any)[ff.key] || ""}
                            placeholder={ff.ph || ""}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                [ff.key]: e.target.value,
                              }))
                            }
                          />
                        </div>
                      ))}
                      <div className="dir-card-actions">
                        <button
                          className="hbtn accent"
                          onClick={saveAttProfile}
                        >
                          Save
                        </button>
                        <button className="hbtn" onClick={cancelEdit}>
                          Cancel
                        </button>
                        <button
                          className="hbtn danger"
                          onClick={() => delAttProfile(a.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="dir-card-head"
                        onClick={() => startEdit(a)}
                      >
                        <strong>{a.name || "Unnamed"}</strong>
                        <span className="dir-card-sub">
                          {a.firm} · {a.barNo}
                        </span>
                      </div>
                      <div className="dir-card-detail">
                        {a.email} · {a.phone}
                      </div>
                      <ProvenanceBadge record={a} />
                    </>
                  )}
                </div>
              ))}
              {Object.keys(attProfiles).length === 0 && (
                <div className="dir-empty">No attorney profiles yet.</div>
              )}
            </div>
          </div>
        )}

        {tab === "national" && (
          <div className="dir-section">
            <div className="dir-head">
              <h3>National Defaults</h3>
            </div>
            <p className="dir-desc">
              These auto-fill on every petition. Update when officials change.
            </p>
            <div className="dir-card editing">
              {NATIONAL_FIELDS.map((f) => (
                <div key={f.key} className="frow">
                  <label className="flbl">{f.label}</label>
                  <input
                    className="finp"
                    value={(national as any)[f.key] || ""}
                    placeholder={f.ph || ""}
                    onChange={(e) => handleNationalChange(f.key, e.target.value)}
                  />
                </div>
              ))}
              <ProvenanceBadge record={national} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
