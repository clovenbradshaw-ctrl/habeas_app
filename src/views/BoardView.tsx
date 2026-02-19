import { useStore } from "../store";
import { STAGES, SM, ts } from "../lib/utils";

export default function BoardView() {
  const {
    petitions,
    clients,
    role,
    currentUser,
    selectPetition,
    setView,
  } = useStore();

  const updatePetition = useStore((s) => s.updatePetition);
  const pushLog = useStore((s) => s.pushLog);

  const all = Object.values(petitions);
  const vis =
    role === "admin"
      ? all
      : all.filter((p) => p.createdBy === currentUser);

  const changeStage = (id: string, dir: "advance" | "revert") => {
    const pet = petitions[id];
    if (!pet) return;
    const idx = STAGES.indexOf(pet.stage as any);
    const ni = dir === "advance" ? idx + 1 : idx - 1;
    if (ni < 0 || ni >= STAGES.length) return;
    const next = STAGES[ni];
    const now = new Date().toISOString();
    pushLog({
      op: "STAGE",
      target: id,
      payload: next,
      frame: { t: now, prior: pet.stage },
    });
    updatePetition(id, {
      ...pet,
      stage: next,
      stageHistory: [
        ...pet.stageHistory,
        { stage: next, at: now },
      ],
    });
  };

  return (
    <div className="board-view">
      <div className="kanban">
        {STAGES.map((stage) => {
          const items = vis
            .filter((p) => p.stage === stage)
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            );
          const m = SM[stage];
          return (
            <div key={stage} className="kb-col">
              <div
                className="kb-col-head"
                style={{ borderBottomColor: m.color }}
              >
                <span className="kb-col-title">{m.label}</span>
                <span
                  className="kb-col-count"
                  style={{ background: m.color }}
                >
                  {items.length}
                </span>
              </div>
              <div className="kb-col-body">
                {items.length === 0 && (
                  <div className="kb-empty">None</div>
                )}
                {items.map((p) => {
                  const cl = clients[p.clientId];
                  const si = STAGES.indexOf(p.stage as any);
                  return (
                    <div
                      key={p.id}
                      className="kb-card"
                      style={{ borderLeftColor: m.color }}
                    >
                      <div
                        className="kb-card-name"
                        onClick={() => {
                          selectPetition(p.id);
                          setView("editor");
                        }}
                      >
                        {cl?.name || "Unnamed"}
                      </div>
                      <div className="kb-card-meta">
                        {p.caseNumber || "No case no."}
                        {p.district ? ` · ${p.district}` : ""}
                      </div>
                      <div className="kb-card-meta">
                        {p.facilityName || ""}
                      </div>
                      <div className="kb-card-date">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </div>
                      {p.stageHistory?.length > 1 && (
                        <div className="kb-dots">
                          {p.stageHistory.map((sh, i) => (
                            <span
                              key={i}
                              className="kb-dot"
                              style={{
                                background:
                                  SM[sh.stage]?.color,
                              }}
                              title={`${sh.stage} ${ts(sh.at)}`}
                            />
                          ))}
                        </div>
                      )}
                      <div className="kb-card-actions">
                        {si > 0 && (
                          <button
                            className="kb-btn"
                            onClick={() =>
                              changeStage(p.id, "revert")
                            }
                          >
                            &larr; {STAGES[si - 1]}
                          </button>
                        )}
                        {si < STAGES.length - 1 && (
                          <button
                            className="kb-btn accent"
                            onClick={() =>
                              changeStage(p.id, "advance")
                            }
                          >
                            {STAGES[si + 1]} &rarr;
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {Object.keys(petitions).length === 0 && (
        <div className="board-empty">
          <p>
            No petitions yet. Go to <strong>Clients</strong> to create one,
            or set up <strong>Directory</strong> first.
          </p>
        </div>
      )}
    </div>
  );
}
