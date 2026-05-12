// 🔐 Auth guard (MANDATORY)
if (!window.LCTAuth || !window.LCTAuth.isAuthenticated()) {
  window.location.href = "login.html";
}

// ==============================
// ELEMENTS
// ==============================
const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const profileForm = document.getElementById("profileForm");
const formActions = document.querySelector(".form-actions");

const profileNameEl = document.getElementById("profileName");
const profileUsernameEl = document.getElementById("profileUsername");

const profileInputs = profileForm.querySelectorAll("input");

const fullNameInput = profileInputs[0];
const usernameInput = profileInputs[1];
const emailInput = profileInputs[2];
const phoneInput = profileInputs[3];

// Password inputs
const passwordInputs = document.querySelectorAll(".card input[type='password']");
const currentPasswordInput = passwordInputs[0];
const newPasswordInput = passwordInputs[1];
const confirmPasswordInput = passwordInputs[2];

// Password toggle icons
const toggleIcons = document.querySelectorAll(".toggle-password");

// Update password button
const updatePasswordBtn = document.getElementById("updatePasswordBtn");

// ==============================
// PLACEHOLDERS
// ==============================
fullNameInput.placeholder = "Enter full name";
usernameInput.placeholder = "Enter username";
emailInput.placeholder = "Enter email address";
phoneInput.placeholder = "Enter 10-digit phone number";

currentPasswordInput.placeholder = "Current password";
newPasswordInput.placeholder = "New password (min 8 characters)";
confirmPasswordInput.placeholder = "Confirm new password";

// ==============================
// PASSWORD SHOW / HIDE
// ==============================
toggleIcons.forEach((icon) => {
  icon.addEventListener("click", () => {
    const input = icon.previousElementSibling;

    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      input.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  });
});

// ==============================
// MESSAGE BOX
// ==============================
const messageBox = document.createElement("div");
messageBox.style.marginTop = "12px";
profileForm.appendChild(messageBox);

function showMessage(msg, success = true) {
  messageBox.textContent = msg;
  messageBox.style.color = success ? "green" : "red";
}

// ==============================
// ENABLE / DISABLE
// ==============================
function disableProfileInputs(disabled = true) {
  profileInputs.forEach(i => (i.disabled = disabled));
  saveBtn.disabled = disabled;

  formActions.style.display = disabled ? "none" : "flex";
  editBtn.style.display = disabled ? "inline-flex" : "none";
}

// ==============================
// LOAD PROFILE
// ==============================
async function loadProfile() {
  try {
    const res = await get("/api/profile/");
    if (!res.ok) throw res;

    const data = res.data || {};

    fullNameInput.value = data.full_name || "";
    usernameInput.value = data.username || "";
    emailInput.value = data.email || "";
    phoneInput.value = data.phone_number || "";

    profileNameEl.textContent = data.full_name || "—";
    profileUsernameEl.textContent = data.username || "—";

    disableProfileInputs(true);
  } catch {
    showMessage("Failed to load profile", false);
  }
}

// ==============================
// EDIT MODE
// ==============================
editBtn.addEventListener("click", () => {
  disableProfileInputs(false);
});

cancelBtn.addEventListener("click", () => {
  disableProfileInputs(true);
  loadProfile();
});

// ==============================
// SAVE PROFILE (PHONE = EXACTLY 10 DIGITS)
// ==============================
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showMessage("");

  const fullName = fullNameInput.value.trim();
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();

  if (fullName && !/^[A-Za-z\s]+$/.test(fullName)) {
    showMessage("Enter a valid name (alphabets only)", false);
    return;
  }

  if (username && /\s/.test(username)) {
    showMessage("Username cannot contain spaces", false);
    return;
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showMessage("Enter a valid email address", false);
    return;
  }

  // ✅ EXACTLY 10 DIGITS
  if (phone && !/^\d{10}$/.test(phone)) {
    showMessage("Enter a valid 10-digit phone number", false);
    return;
  }

  const payload = {};
  if (fullName) payload.full_name = fullName;
  if (username) payload.username = username;
  if (phone) payload.phone_number = phone;

  if (Object.keys(payload).length === 0) {
    showMessage("Nothing to update", false);
    return;
  }

  try {
    const res = await fetchJSON(API_BASE + "/api/profile/", "PATCH", payload);

    if (!res.ok) {
      showMessage("Profile update failed", false);
      return;
    }

    profileNameEl.textContent = fullNameInput.value;
    profileUsernameEl.textContent = usernameInput.value;

    showMessage("Profile updated successfully", true);
    disableProfileInputs(true);
  } catch {
    showMessage("Server error while updating profile", false);
  }
});

// ==============================
// CHANGE PASSWORD
// ==============================
updatePasswordBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  showMessage("");

  const current = currentPasswordInput.value;
  const next = newPasswordInput.value;
  const confirm = confirmPasswordInput.value;

  if (!current || !next || !confirm) {
    showMessage("All password fields are required", false);
    return;
  }

  if (next.length < 8) {
    showMessage("Password should be at least 8 characters", false);
    return;
  }

  if (next !== confirm) {
    showMessage("Passwords do not match", false);
    return;
  }

  try {
    const res = await fetchJSON(
      API_BASE + "/api/profile/change-password/",
      "POST",
      {
        current_password: current,
        new_password: next,
        confirm_password: confirm
      }
    );

    if (!res.ok) {
      showMessage(res.data?.detail || "Password update failed", false);
      return;
    }

    showMessage("Password updated successfully", true);
    currentPasswordInput.value = "";
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";
  } catch {
    showMessage("Server error while updating password", false);
  }
});

// ==============================
// INIT
// ==============================
loadProfile();
