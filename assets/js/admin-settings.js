// admin-settings.js

// 🔐 AUTH GUARD
if (!window.LCTAuth.isAuthenticated()) {
  window.location.href = "login.html";
}

const jwtPayload = window.LCTAuth.decodeJwtPayload(
  window.LCTAuth.getAccessToken()
);

if (!jwtPayload?.is_staff && !jwtPayload?.is_superuser) {
  window.location.href = "dashboard.html";
}

// ==============================
// ELEMENTS
// ==============================
const form = document.getElementById("adminSettingsForm");

const defaultNotifyDays = document.getElementById("defaultNotifyDays");
const emailNotificationsEnabled = document.getElementById("emailNotificationsEnabled");
const smsNotificationsEnabled = document.getElementById("smsNotificationsEnabled");

const adminUsername = document.getElementById("adminUsername");
const adminEmail = document.getElementById("adminEmail");
const adminRole = document.getElementById("adminRole");
const adminLastLogin = document.getElementById("adminLastLogin");

// ==============================
// LOAD SETTINGS
// ==============================
async function loadAdminSettings() {
  const res = await get("/api/admin/settings/");
  if (!res.ok) {
    console.error("Failed to load admin settings");
    return;
  }

  const { system_settings, admin_profile } = res.data;

  // System settings
  defaultNotifyDays.value = system_settings.default_notify_days;
  emailNotificationsEnabled.checked = system_settings.email_notifications_enabled;
  smsNotificationsEnabled.checked = system_settings.sms_notifications_enabled;

  // Admin profile (read-only)
  adminUsername.textContent = admin_profile.username;
  adminEmail.textContent = admin_profile.email;
  adminRole.textContent = admin_profile.role;
  adminLastLogin.textContent = admin_profile.last_login
    ? new Date(admin_profile.last_login).toLocaleString()
    : "Never";
}

// ==============================
// SAVE SETTINGS
// ==============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    default_notify_days: Number(defaultNotifyDays.value),
    email_notifications_enabled: emailNotificationsEnabled.checked,
    sms_notifications_enabled: smsNotificationsEnabled.checked,
  };

  const res = await put("/api/admin/settings/", payload);

  if (res.ok) {
    alert("Admin settings updated successfully");
  } else {
    alert("Failed to update settings");
  }
});

// ==============================
// INIT
// ==============================
loadAdminSettings();
