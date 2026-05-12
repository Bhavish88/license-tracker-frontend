// frontend/assets/js/auth.js
// Auth helper for License & Certificate Tracker frontend
// Handles login, logout, token storage, headers, and refresh flow

// ===============================
// CONFIG
// ===============================
const LOGIN_URL = "http://127.0.0.1:8000/api/token/";
const REFRESH_URL = "http://127.0.0.1:8000/api/token/refresh/";


const ACCESS_KEY = "lct_access";
const REFRESH_KEY = "lct_refresh";
const USER_KEY = "lct_user"; // optional (username/email)

// ===============================
// TOKEN HELPERS
// ===============================
function setTokens({ access, refresh }, username = "") {
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  if (username) localStorage.setItem(USER_KEY, username);
}

function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

function getSavedUser() {
  return localStorage.getItem(USER_KEY) || "";
}

function isAuthenticated() {
  return !!getAccessToken();
}

// ===============================
// AUTH HEADER
// ===============================
function authHeader() {
  const token = getAccessToken();
  return token ? { Authorization: "Bearer " + token } : {};
}

// ===============================
// LOGIN
// ===============================
async function login(username, password) {
  try {
    const res = await fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data && data.access) {
      setTokens({ access: data.access, refresh: data.refresh }, username);
      return { ok: true, data, status: res.status };
    }

    return { ok: false, data, status: res.status };
  } catch (err) {
    console.error("Login error:", err);
    return { ok: false, error: err };
  }
}

// ===============================
// REFRESH TOKEN
// ===============================
async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  try {
    const res = await fetch(REFRESH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh })
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data && data.access) {
      localStorage.setItem(ACCESS_KEY, data.access);
      return true;
    }

    clearTokens();
    return false;
  } catch (err) {
    console.error("Refresh token error:", err);
    clearTokens();
    return false;
  }
}

// ===============================
// LOGOUT
// ===============================
function logout(redirect = true) {
  clearTokens();
  if (redirect) {
    window.location.href = "login.html";
  }
}

// ===============================
// AUTHED FETCH (AUTO REFRESH)
// ===============================
async function authedFetch(input, init = {}, tryRefresh = true) {
  init.headers = init.headers ? { ...init.headers } : {};

  if (!init.headers.Authorization) {
    const token = getAccessToken();
    if (token) init.headers.Authorization = "Bearer " + token;
  }

  let res = await fetch(input, init);

  if (res.status === 401 && tryRefresh) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      init.headers.Authorization = "Bearer " + getAccessToken();
      res = await fetch(input, init);
    } else {
      logout(true);
    }
  }

  return res;
}

// ===============================
// JWT DECODE (UI ONLY)
// ===============================
function decodeJwtPayload(token) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

// ===============================
// NAVBAR HELPER
// ===============================
function applyAuthStateToNav({ loginBtn, logoutBtn, userEl } = {}) {
  const token = getAccessToken();

  if (token) {
    if (loginBtn) loginBtn.classList.add("hidden");
    if (logoutBtn) logoutBtn.classList.remove("hidden");

    if (userEl) {
      const saved = getSavedUser();
      if (saved) {
        userEl.textContent = saved;
      } else {
        const payload = decodeJwtPayload(token);
        userEl.textContent =
          (payload && (payload.username || payload.email)) || "";
      }
      userEl.classList.remove("hidden");
    }
  } else {
    if (loginBtn) loginBtn.classList.remove("hidden");
    if (logoutBtn) logoutBtn.classList.add("hidden");
    if (userEl) userEl.classList.add("hidden");
  }
}

// ===============================
// EXPOSE GLOBAL OBJECT
// ===============================
window.LCTAuth = {
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getSavedUser,
  isAuthenticated,
  authHeader,
  login,
  refreshAccessToken,
  logout,
  authedFetch,
  decodeJwtPayload,
  applyAuthStateToNav
};
