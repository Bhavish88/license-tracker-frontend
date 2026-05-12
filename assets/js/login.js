const loginBox = document.getElementById("loginFormBox");
const forgotBox = document.getElementById("forgotFormBox");
const leftText = document.getElementById("leftText");

// ---------- TOGGLE ----------
function showLogin() {
  if (!loginBox || !forgotBox || !leftText) return;

  loginBox.classList.remove("hidden");
  forgotBox.classList.add("hidden");
  leftText.textContent =
    "Securely manage, track, and organize your important licenses and certificates in one place.";
}

function showForgot() {
  if (!loginBox || !forgotBox || !leftText) return;

  loginBox.classList.add("hidden");
  forgotBox.classList.remove("hidden");
  leftText.textContent =
    "Enter your registered email and we’ll help you reset your password.";
}

document.getElementById("goForgot").onclick = (e) => {
  e.preventDefault();
  showForgot();
};

document.getElementById("goLoginFromForgot").onclick = (e) => {
  e.preventDefault();
  showLogin();
};

// ---------- PASSWORD TOGGLE ----------
document.querySelectorAll(".toggle-password").forEach((toggle) => {
  toggle.onclick = () => {
    const input = document.getElementById(toggle.dataset.target);
    if (!input) return;

    input.type = input.type === "password" ? "text" : "password";
    toggle.textContent = input.type === "password" ? "Show" : "Hide";
  };
});

// ---------- LOGIN ----------
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();
  const error = document.getElementById("loginError");

  error.textContent = "";

  // 🔹 Frontend validation added
  if (!username || !password) {
    error.textContent = "Username and password are required.";
    return;
  }

  try {
    const result = await window.LCTAuth.login(username, password);

    if (!result.ok) {
      error.textContent = "Invalid username or password.";
      return;
    }

    const payload = window.LCTAuth.decodeJwtPayload(
      window.LCTAuth.getAccessToken()
    );

    if (payload.is_staff || payload.is_superuser) {
      window.location.href = "admin-dashboard.html";
    } else {
      window.location.href = "dashboard.html";
    }
  } catch {
    error.textContent = "Server error. Try again.";
  }
});

// ---------- FORGOT ----------
document.getElementById("forgotForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailInput = document.getElementById("forgotEmail");
  const errorEl = document.getElementById("forgotError");

  errorEl.textContent = "";

  const email = emailInput.value.trim();
  if (!email) {
    errorEl.textContent = "Email is required.";
    return;
  }

  try {
    const res = await post("/api/password-reset/", { email });

    if (!res.ok) {
      errorEl.textContent = res.data?.detail || "Unable to send reset link.";
      return;
    }

    errorEl.style.color = "#16a34a";
    errorEl.textContent = "If this email exists, a reset link has been sent.";

    emailInput.value = "";

    setTimeout(showLogin, 2000);
  } catch {
    errorEl.textContent = "Server error. Try again later.";
  }
});

// ===============================
// SHOW REGISTER SUCCESS MESSAGE
// ===============================
const successMsg = document.getElementById("registerSuccess");

if (localStorage.getItem("register_success") === "1") {
  successMsg.textContent = "Registration successful. Please sign in.";
  successMsg.style.color = "#16a34a";
  successMsg.style.marginBottom = "10px";
  localStorage.removeItem("register_success");
}

const params = new URLSearchParams(window.location.search);
if (params.get("registered") === "1") {
  document.getElementById("registerSuccess").textContent =
    "Registration successful. Please sign in.";
}
