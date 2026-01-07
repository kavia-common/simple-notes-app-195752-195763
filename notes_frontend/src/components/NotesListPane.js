import React, { useMemo } from "react";

function normalizeText(value) {
  return (value || "").toString().toLowerCase();
}

/**
 * PUBLIC_INTERFACE
 * Left pane: searchable/sortable list of notes plus "New" action.
 */
export default function NotesListPane({
  notes,
  selectedId,
  searchQuery,
  onSearchQueryChange,
  sortKey,
  onSortKeyChange,
  onSelectNote,
  onCreateNew,
  isLoading,
  errorMessage,
}) {
  const filteredSorted = useMemo(() => {
    const q = normalizeText(searchQuery).trim();

    const filtered = q
      ? notes.filter((n) => {
          const t = normalizeText(n.title);
          const c = normalizeText(n.content);
          return t.includes(q) || c.includes(q);
        })
      : notes;

    const sorted = [...filtered].sort((a, b) => {
      const at = normalizeText(a.title);
      const bt = normalizeText(b.title);

      if (sortKey === "title_asc") return at.localeCompare(bt);
      if (sortKey === "title_desc") return bt.localeCompare(at);

      // fallback: prefer updated_at if present, else id
      const au = a.updated_at || a.updatedAt || a.created_at || a.createdAt;
      const bu = b.updated_at || b.updatedAt || b.created_at || b.createdAt;
      if (au && bu) return String(bu).localeCompare(String(au));

      return String(b.id).localeCompare(String(a.id));
    });

    return sorted;
  }, [notes, searchQuery, sortKey]);

  return (
    <aside className="pane pane--left" aria-label="Notes list">
      <div className="paneHeader">
        <div className="paneHeader__row">
          <h2 className="paneHeader__title">Notes</h2>
          <button className="btn btn--primary" onClick={onCreateNew}>
            New
          </button>
        </div>

        <div className="paneHeader__controls">
          <label className="inputLabel" htmlFor="search">
            Search
          </label>
          <input
            id="search"
            className="input"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search title or content…"
          />

          <label className="inputLabel" htmlFor="sort">
            Sort
          </label>
          <select
            id="sort"
            className="select"
            value={sortKey}
            onChange={(e) => onSortKeyChange(e.target.value)}
          >
            <option value="updated_desc">Recently updated</option>
            <option value="title_asc">Title (A → Z)</option>
            <option value="title_desc">Title (Z → A)</option>
          </select>
        </div>
      </div>

      <div className="paneBody">
        {isLoading ? (
          <div className="state state--loading" role="status" aria-live="polite">
            Loading notes…
          </div>
        ) : errorMessage ? (
          <div className="state state--error" role="alert">
            {errorMessage}
          </div>
        ) : filteredSorted.length === 0 ? (
          <div className="state state--empty">No notes found.</div>
        ) : (
          <ul className="notesList" role="listbox" aria-label="Notes">
            {filteredSorted.map((note) => {
              const isSelected = String(note.id) === String(selectedId);
              const preview =
                (note.content || "").trim().slice(0, 120) ||
                "No content yet…";
              return (
                <li key={note.id} className="notesList__item">
                  <button
                    type="button"
                    className={`noteCard ${
                      isSelected ? "noteCard--selected" : ""
                    }`}
                    onClick={() => onSelectNote(note.id)}
                    aria-selected={isSelected}
                    role="option"
                  >
                    <div className="noteCard__title">
                      {(note.title || "").trim() || "Untitled"}
                    </div>
                    <div className="noteCard__preview">{preview}</div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
