import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import AppHeader from "./components/AppHeader";
import NotesListPane from "./components/NotesListPane";
import NoteEditorPane from "./components/NoteEditorPane";
import {
  createNote,
  deleteNote,
  listNotes,
  updateNote,
} from "./api/notesApi";

function normalizeNoteFromApi(note) {
  // Defensive normalization since backend contract may vary while being implemented.
  return {
    id: note.id,
    title: note.title ?? "",
    content: note.content ?? "",
    created_at: note.created_at ?? note.createdAt,
    updated_at: note.updated_at ?? note.updatedAt,
  };
}

// PUBLIC_INTERFACE
function App() {
  const [notes, setNotes] = useState([]);

  const [selectedId, setSelectedId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState("updated_desc");

  const [mode, setMode] = useState("empty"); // "empty" | "view" | "edit" | "create"
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");

  const [isListLoading, setIsListLoading] = useState(false);
  const [listError, setListError] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const selectedNote = useMemo(() => {
    const found = notes.find((n) => String(n.id) === String(selectedId));
    return found || null;
  }, [notes, selectedId]);

  async function refreshNotes(keepSelection = true) {
    setIsListLoading(true);
    setListError("");
    try {
      const data = await listNotes();
      const items = Array.isArray(data) ? data : data?.items;
      const normalized = Array.isArray(items) ? items.map(normalizeNoteFromApi) : [];
      setNotes(normalized);

      if (!keepSelection) {
        setSelectedId(null);
        setMode("empty");
      } else if (selectedId != null) {
        const stillExists = normalized.some(
          (n) => String(n.id) === String(selectedId)
        );
        if (!stillExists) {
          setSelectedId(null);
          setMode("empty");
        }
      }
    } catch (e) {
      setListError(e.message || "Failed to load notes.");
    } finally {
      setIsListLoading(false);
    }
  }

  useEffect(() => {
    refreshNotes(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startCreate() {
    setSaveError("");
    setDeleteError("");
    setMode("create");
    setSelectedId(null);
    setDraftTitle("");
    setDraftContent("");
  }

  function selectNote(noteId) {
    setSaveError("");
    setDeleteError("");
    setSelectedId(noteId);
    setMode("view");
  }

  function startEdit() {
    if (!selectedNote) return;
    setSaveError("");
    setDeleteError("");
    setMode("edit");
    setDraftTitle(selectedNote.title || "");
    setDraftContent(selectedNote.content || "");
  }

  function cancelEdit() {
    setSaveError("");
    setDeleteError("");
    if (selectedNote) {
      setMode("view");
      setDraftTitle("");
      setDraftContent("");
      return;
    }
    setMode("empty");
    setDraftTitle("");
    setDraftContent("");
  }

  async function save() {
    if (isSaving || isDeleting) return;

    setIsSaving(true);
    setSaveError("");
    setDeleteError("");

    try {
      const payload = {
        title: (draftTitle || "").trim(),
        content: draftContent || "",
      };

      if (mode === "create") {
        const created = normalizeNoteFromApi(await createNote(payload));
        // Put newly created note at top for immediate feedback.
        setNotes((prev) => [created, ...prev.filter((n) => n.id !== created.id)]);
        setSelectedId(created.id);
        setMode("view");
        setDraftTitle("");
        setDraftContent("");
      } else if (mode === "edit" && selectedNote) {
        const updated = normalizeNoteFromApi(
          await updateNote(selectedNote.id, payload)
        );
        setNotes((prev) =>
          prev.map((n) => (String(n.id) === String(updated.id) ? updated : n))
        );
        setMode("view");
        setDraftTitle("");
        setDraftContent("");
      }
    } catch (e) {
      setSaveError(e.message || "Failed to save note.");
    } finally {
      setIsSaving(false);
    }
  }

  async function remove() {
    if (!selectedNote || isSaving || isDeleting) return;

    const ok = window.confirm(
      `Delete "${(selectedNote.title || "Untitled").trim()}"? This cannot be undone.`
    );
    if (!ok) return;

    setIsDeleting(true);
    setDeleteError("");
    setSaveError("");

    try {
      await deleteNote(selectedNote.id);
      setNotes((prev) =>
        prev.filter((n) => String(n.id) !== String(selectedNote.id))
      );
      setSelectedId(null);
      setMode("empty");
    } catch (e) {
      setDeleteError(e.message || "Failed to delete note.");
    } finally {
      setIsDeleting(false);
    }
  }

  const headerStatus = useMemo(() => {
    if (isListLoading) return { kind: "info", text: "Loading…" };
    if (listError) return { kind: "error", text: "Offline" };
    if (isSaving) return { kind: "info", text: "Saving…" };
    if (isDeleting) return { kind: "info", text: "Deleting…" };
    return null;
  }, [isListLoading, listError, isSaving, isDeleting]);

  return (
    <div className="appShell">
      <AppHeader
        title="Notes"
        subtitle="Create, edit, and organize your notes."
        status={headerStatus}
      />

      <main className="splitLayout">
        <NotesListPane
          notes={notes}
          selectedId={selectedId}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          sortKey={sortKey}
          onSortKeyChange={setSortKey}
          onSelectNote={selectNote}
          onCreateNew={startCreate}
          isLoading={isListLoading}
          errorMessage={listError}
        />

        <NoteEditorPane
          mode={mode}
          note={selectedNote}
          draftTitle={draftTitle}
          draftContent={draftContent}
          onDraftTitleChange={setDraftTitle}
          onDraftContentChange={setDraftContent}
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onSave={save}
          onDelete={remove}
          isSaving={isSaving}
          isDeleting={isDeleting}
          errorMessage={saveError || deleteError}
        />
      </main>

      {listError ? (
        <div className="bottomBar" role="alert">
          <div className="bottomBar__text">
            {listError}{" "}
            <button
              className="linkButton"
              onClick={() => refreshNotes(true)}
              disabled={isListLoading}
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
