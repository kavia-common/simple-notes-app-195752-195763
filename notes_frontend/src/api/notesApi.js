/**
 * Notes API client.
 *
 * Base URL is configurable via the environment variable:
 * - REACT_APP_API_BASE_URL (preferred)
 * Defaults to http://localhost:3001
 */

const DEFAULT_BASE_URL = "http://localhost:3001";

/**
 * PUBLIC_INTERFACE
 * Returns the configured API base URL.
 */
export function getApiBaseUrl() {
  return process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE_URL;
}

async function request(path, options = {}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  // Try to parse JSON for both success and error bodies.
  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const message =
      (data && (data.detail || data.message)) ||
      `Request failed with status ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    error.body = data;
    throw error;
  }

  return data;
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

/**
 * PUBLIC_INTERFACE
 * Fetch all notes.
 * Expected backend: GET /notes -> Note[]
 */
export async function listNotes() {
  return request("/notes", { method: "GET" });
}

/**
 * PUBLIC_INTERFACE
 * Fetch one note by id.
 * Expected backend: GET /notes/{id} -> Note
 */
export async function getNote(noteId) {
  return request(`/notes/${encodeURIComponent(noteId)}`, { method: "GET" });
}

/**
 * PUBLIC_INTERFACE
 * Create a note.
 * Expected backend: POST /notes {title, content} -> Note
 */
export async function createNote(payload) {
  return request("/notes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * PUBLIC_INTERFACE
 * Update a note.
 * Expected backend: PUT /notes/{id} {title, content} -> Note
 */
export async function updateNote(noteId, payload) {
  return request(`/notes/${encodeURIComponent(noteId)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * PUBLIC_INTERFACE
 * Delete a note.
 * Expected backend: DELETE /notes/{id} -> {ok: true} (or empty)
 */
export async function deleteNote(noteId) {
  return request(`/notes/${encodeURIComponent(noteId)}`, {
    method: "DELETE",
  });
}
