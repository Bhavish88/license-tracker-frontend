// 🔐 Auth guard
if (!window.LCTAuth.isAuthenticated()) {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const emailToggle = document.getElementById("notifyEmail");
  const notifyDaysInput = document.getElementById("defaultNotifyDays");
  const saveBtn = document.getElementById("saveSettingsBtn");
  const messageBox = document.getElementById("settingsMessage");

  function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = type === "success" ? "msg-success" : "msg-error";
  }

  function clearMessage() {
    messageBox.textContent = "";
    messageBox.className = "";
  }

  // 🔄 Normalize API response (future-safe)
  function normalizeData(data) {
    return data && data.results ? data.results : data;
  }

  // 📥 Load settings
  async function loadSettings() {
    clearMessage();
    try {
      const res = await fetch(API_BASE + "/api/settings/", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("lct_access"),
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load settings");
      }

      const data = normalizeData(await res.json());

      emailToggle.checked = !!data.notify_via_email;
      notifyDaysInput.value = data.default_notify_days ?? 30;

    } catch (err) {
      showMessage("Failed to load settings.", "error");
    }
  }

  // 💾 Save settings
  async function saveSettings() {
    clearMessage();

    const notifyDays = parseInt(notifyDaysInput.value, 10);

    if (isNaN(notifyDays) || notifyDays < 1) {
      showMessage("Notify days must be at least 1.", "error");
      return;
    }

    const payload = {
      notify_via_email: emailToggle.checked,
      default_notify_days: notifyDays,
    };

    try {
      const res = await fetch(API_BASE + "/api/settings/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("lct_access"),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Update failed");
      }

      showMessage("Settings saved successfully.", "success");

    } catch (err) {
      showMessage("Failed to save settings.", "error");
    }
  }

  saveBtn.addEventListener("click", saveSettings);

  loadSettings();
});
