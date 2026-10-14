import { useMemo } from "react";
import { useApplications } from "../hooks/useApplications";
import KanbanColumn from "./KanbanColumn";

const COLUMNS = ["Applied", "Interview", "Offer", "Rejected"];

const KanbanBoard = () => {
  const { applications, search, statusFilter } = useApplications();

  // Partition applications into status buckets
  const groupedApplications = useMemo(() => {
    const buckets = {
      Applied: [],
      Interview: [],
      Offer: [],
      Rejected: []
    };

    applications.forEach((app) => {
      if (buckets[app.status]) {
        buckets[app.status].push(app);
      }
    });

    return buckets;
  }, [applications]);

  const hasFilterActive = Boolean(search || statusFilter !== "All");

  return (
    <section className="kanban-board" aria-label="Kanban application board">
      {statusFilter !== "All" ? (
        // When user explicitly filtered by a status, render only that column or highlight it
        <KanbanColumn
          key={statusFilter}
          status={statusFilter}
          applications={groupedApplications[statusFilter] || []}
        />
      ) : (
        COLUMNS.map((columnStatus) => (
          <KanbanColumn
            key={columnStatus}
            status={columnStatus}
            applications={groupedApplications[columnStatus] || []}
          />
        ))
      )}

      {applications.length === 0 && hasFilterActive && (
        <div
          style={{
            gridColumn: "1 / -1",
            textAlign: "center",
            padding: "40px 20px",
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px dashed #cbd5e1",
            color: "#64748b"
          }}
        >
          <p style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "4px" }}>
            No matching job applications found
          </p>
          <span style={{ fontSize: "0.85rem" }}>
            Try adjusting your search query or status filter to see more results.
          </span>
        </div>
      )}
    </section>
  );
};

export default KanbanBoard;
