const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:3000').replace(/\/$/, '');

// #region agent log
function agentLog(hypothesisId, location, message, data) {
  fetch('http://127.0.0.1:7367/ingest/21418c56-b853-4108-8f09-760aa65fe092', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'be41fc' },
    body: JSON.stringify({
      sessionId: 'be41fc',
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
}
// #endregion

export function getApiBase() {
  return API_BASE;
}

export async function apiRequest(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const method = options.method || 'GET';
  console.log('API Request:', { path, method, url });
  agentLog('H1', 'api.js:apiRequest', 'request', { path, method, apiBase: API_BASE });

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    console.error('API Network Error:', err);
    agentLog('H2', 'api.js:apiRequest', 'network_error', { path, name: err?.name, message: String(err?.message || err) });
    throw err;
  }

  console.log('API Response:', { path, status: res.status, ok: res.ok });
  agentLog('H3', 'api.js:apiRequest', 'response', { path, status: res.status, ok: res.ok });

  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch (e) {
    console.error('API JSON Parse Error:', { text, error: e });
    agentLog('H4', 'api.js:apiRequest', 'json_parse_error', { path, status: res.status, textLen: text?.length });
    throw new Error('Invalid JSON from server');
  }

  console.log('API Body:', { path, body });
  if (!res.ok) {
    const msg = body?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body;
}

export async function registerOnServer(username, publicKeySpkiB64) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, publicKey: publicKeySpkiB64 }),
  });
}

export async function loginOnServer(username) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
}

export async function listUsers(excludeUserId) {
  const q = excludeUserId ? `?exclude=${encodeURIComponent(excludeUserId)}` : '';
  return apiRequest(`/api/auth/users${q}`);
}

export async function fetchPublicKey(userId) {
  return apiRequest(`/api/auth/public-key/${encodeURIComponent(userId)}`);
}

export async function sendMessageApi(payload) {
  return apiRequest('/api/messages/send', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchChat(senderId, receiverId) {
  const q = `?senderId=${encodeURIComponent(senderId)}&receiverId=${encodeURIComponent(receiverId)}`;
  return apiRequest(`/api/messages/chat${q}`);
}

export async function deleteChatApi(userId, contactId) {
  return apiRequest(`/api/delete/chat/${encodeURIComponent(userId)}/${encodeURIComponent(contactId)}`, {
    method: 'DELETE',
  });
}

export async function deleteAllUserChatsApi(userId) {
  return apiRequest(`/api/delete/user/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });
}
