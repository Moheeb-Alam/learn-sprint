// Thin wrapper around fetch for the LearnSprint API.
async function request(url, options = {}) {
  let res;
  try {
    res = await fetch(url, { ...options, headers: { Accept: 'application/json', ...(options.headers || {}) } });
  } catch {
    const err = new Error('Could not reach the server. Check your connection and try again.');
    err.network = true;
    throw err;
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok) {
    const err = new Error((body && body.message) || `Request failed (${res.status}).`);
    err.status = res.status;
    err.errors = (body && body.errors) || {};
    throw err;
  }
  return body;
}

export const getServices = () => request('/api/services');
export const getProjects = () => request('/api/projects');
export const getConfig = () => request('/api/config');
export const sendContact = (payload) =>
  request('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
