import React from "react";

/**
 * PUBLIC_INTERFACE
 * Right pane: note viewer/editor. Controlled inputs.
 *
 * Supports:
 * - creating new note draft
 * - editing existing note
 * - save/cancel/delete actions
 */
export default function NoteEditorPane({
  mode, // "empty" | "view" | "edit" | "create"
  note,
  draftTitle,
  draftContent,
  onDraftTitleChange,
  onDraftContentChange,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
  errorMessage,
}) {
  const isEditable = mode === "edit" || mode === "create";
  const showEmpty = mode === "empty";

  return (
    <section className="pane pane--right" aria-label="Note editor">
      <div className="paneHeader">
        <div className="paneHeader__row">
          <h2 className="paneHeader__title">
            {mode === "create"
              ? "New note"
              : note
              ? (note.title || "").trim() || "Untitled"
              : "Note"}
          </h2>

          <div className="buttonRow">
            {mode === "view" ? (
              <button className="btn btn--secondary" onClick={onStartEdit}>
                Edit
              </button>
            ) : null}

            {isEditable ? (
              <>
                <button
                  className="btn btn--primary"
                  onClick={onSave}
                  disabled={isSaving || isDeleting}
                >
                  {isSaving ? "Saving…" : "Save"}
                </button>
                <button
                  className="btn btn--ghost"
                  onClick={onCancelEdit}
                  disabled={isSaving || isDeleting}
                >
                  Cancel
                </button>
              </>
            ) : null}

            {note && mode !== "create" ? (
              <button
                className="btn btn--danger"
                onClick={onDelete}
                disabled={isSaving || isDeleting}
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            ) : null}
          </div>
        </div>

        {errorMessage ? (
          <div className="inlineAlert inlineAlert--error" role="alert">
            {errorMessage}
          </div>
        ) : null}
      </div>

      <div className="paneBody">
        {showEmpty ? (
          <div className="state state--empty">
            Select a note from the list or create a new one.
          </div>
        ) : isEditable ? (
          <form
            className="editor"
            onSubmit={(e) => {
              e.preventDefault();
              onSave();
            }}
          >
            <label className="inputLabel" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              className="input"
              value={draftTitle}
              onChange={(e) => onDraftTitleChange(e.target.value)}
              placeholder="Untitled"
              autoFocus
            />

            <label className="inputLabel" htmlFor="content">
              Content
            </label>
            <textarea
              id="content"
              className="textarea"
              value={draftContent}
              onChange={(e) => onDraftContentChange(e.target.value)}
              placeholder="Write your note…"
              rows={14}
            />
          </form>
        ) : (
          <article className="viewer" aria-label="Note content">
            <div className="viewer__content">
              {(note?.content || "").trim() ? (
                <pre className="viewer__pre">{note.content}</pre>
              ) : (
                <div className="state state--empty">No content yet.</div>
              )}
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
