
import { useState } from "react";
import { useApplications } from "../hooks/useApplications";
import {
  Search,
  Plus,
  Kanban,
  List,
  Pencil,
  Check,
  X,
} from "lucide-react";

const HeaderToolbar = () => {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    openCreateModal,
    stats,
  } = useApplications();

  // Load the saved title or use the default title.
  const [boardTitle, setBoardTitle] = useState(
    () => localStorage.getItem("jobSahayBoardTitle") || "Job Hunt 2026"
  );

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(boardTitle);

  const total = stats.totalApplications || 0;
  const inProgress = (stats.interviews || 0) + (stats.offers || 0);

  // Save the new board title.
  const saveBoardTitle = (e) => {
    e.preventDefault();

    const newTitle = editedTitle.trim();

    if (!newTitle) return;

    setBoardTitle(newTitle);
    localStorage.setItem("jobSahayBoardTitle", newTitle);
    setIsEditingTitle(false);
  };

  // Cancel editing and restore the previous title.
  const cancelTitleEdit = () => {
    setEditedTitle(boardTitle);
    setIsEditingTitle(false);
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="header-bar">
        <div className="header-title-area">
          {isEditingTitle ? (
            <form
              className="board-title-edit-form"
              onSubmit={saveBoardTitle}
            >
              <input
                className="board-title-input"
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    cancelTitleEdit();
                  }
                }}
                autoFocus
                maxLength={60}
                aria-label="Edit board title"
              />

              <button
                type="submit"
                className="edit-title-action save-title"
                title="Save title"
                aria-label="Save title"
                disabled={!editedTitle.trim()}
              >
                <Check size={17} />
              </button>

              <button
                type="button"
                className="edit-title-action cancel-title"
                onClick={cancelTitleEdit}
                title="Cancel editing"
                aria-label="Cancel editing"
              >
                <X size={17} />
              </button>
            </form>
          ) : (
            <>
              <h2>{boardTitle}</h2>

              <button
                type="button"
                className="edit-badge"
                title="Edit board name"
                aria-label="Edit board name"
                onClick={() => {
                  setEditedTitle(boardTitle);
                  setIsEditingTitle(true);
                }}
              >
                <Pencil size={15} />
              </button>
            </>
          )}
        </div>

        <div className="header-summary-pill">
          <span>Target Progress</span>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${
                  total > 0
                    ? Math.min(
                        100,
                        Math.round((inProgress / total) * 100)
                      )
                    : 0
                }%`,
              }}
            />
          </div>

          <span style={{ fontWeight: 600 }}>
            {inProgress}/{total} Active
          </span>
        </div>
      </header>

      {/* Toolbar */}
      <section
        className="toolbar"
        aria-label="Application controls"
      >
        <div className="search-container">
          <Search size={16} className="search-icon" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, tag, position, etc..."
            aria-label="Search applications"
          />
        </div>

        <div className="controls-right">
          {/* Status Filter */}
          <select
            className="status-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter applications by status"
          >
            <option value="All">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Sort By */}
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort applications"
          >
            <option value="applicationDate_desc">
              Date: Newest First
            </option>
            <option value="applicationDate_asc">
              Date: Oldest First
            </option>
            <option value="companyName_asc">Company: A–Z</option>
            <option value="companyName_desc">Company: Z–A</option>
            <option value="jobTitle_asc">Job Title: A–Z</option>
          </select>

          {/* View Toggle */}
          <div
            className="view-toggle"
            role="group"
            aria-label="View toggle"
          >
            <button
              type="button"
              className={viewMode === "kanban" ? "active" : ""}
              onClick={() => setViewMode("kanban")}
              title="Kanban Board view"
              aria-label="Kanban Board view"
            >
              <Kanban size={16} />
            </button>

            <button
              type="button"
              className={viewMode === "table" ? "active" : ""}
              onClick={() => setViewMode("table")}
              title="Table view"
              aria-label="Table view"
            >
              <List size={16} />
            </button>
          </div>

          {/* Add Job */}
          <button
            type="button"
            className="btn btn-primary btn-add-job"
            onClick={() => openCreateModal("Applied")}
          >
            <Plus size={16} />
            <span>Add Job</span>
          </button>
        </div>
      </section>
    </>
  );
};

export default HeaderToolbar;
