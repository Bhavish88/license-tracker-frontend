// api.js - small fetch wrapper + auth helpers
const API_BASE = "http://127.0.0.1:8000";

async function fetchJSON(url, method = "GET", body = null, isForm = false) {
  const headers = window.LCTAuth
    ? { ...window.LCTAuth.authHeader() }
    : {};

  if (!isForm) {
    headers["Content-Type"] = "application/json";
  }

  const opts = { method, headers };

  if (body) {
    opts.body = isForm ? body : JSON.stringify(body);
  }

  const res = await fetch(url, opts);

  const text = await res.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {}

  return {
    ok: res.ok,
    status: res.status,
    data
  };
}

async function get(path) {
  return fetchJSON(API_BASE + path, "GET");
}
async function post(path, body, isForm = false) {
  return fetchJSON(API_BASE + path, "POST", body, isForm);
}
async function put(path, body, isForm = false) {
  return fetchJSON(API_BASE + path, "PUT", body, isForm);
}
async function del(path) {
  return fetchJSON(API_BASE + path, "DELETE");
}

/** Download helper */
async function downloadFile(path, filenameFallback) {
  const url = API_BASE + path;
  const headers = window.LCTAuth
    ? window.LCTAuth.authHeader()
    : {};

  const res = await fetch(url, { method: "GET", headers });
  if (!res.ok) throw { status: res.status };

  const blob = await res.blob();
  const urlBlob = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = urlBlob;
  a.download = filenameFallback || "download";
  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(urlBlob);
}
