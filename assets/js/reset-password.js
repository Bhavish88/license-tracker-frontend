document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resetPasswordForm");
  const newPass = document.getElementById("newPassword");
  const confirmPass = document.getElementById("confirmPassword");
  const messageEl = document.getElementById("resetMessage");

  const params = new URLSearchParams(window.location.search);
  const uid = params.get("uid");
  const token = params.get("token");

  if (!uid || !token) {
    messageEl.textContent = "Invalid or expired reset link.";
    return;
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    messageEl.textContent = "";

    const p1 = newPass.value.trim();
    const p2 = confirmPass.value.trim();

    if (!p1 || !p2) {
      messageEl.textContent = "All fields are required.";
      return;
    }

    if (p1.length < 8) {
      messageEl.textContent = "Password must be at least 8 characters.";
      return;
    }

    if (p1 !== p2) {
      messageEl.textContent = "Passwords do not match.";
      return;
    }

    try {
      const res = await post("/api/password-reset-confirm/", {
        uid: Number(uid),
        token: token,
        new_password: p1
      });

      if (!res.ok) {
        messageEl.textContent =
          res.data?.detail || "Reset failed.";
        return;
      }

      messageEl.style.color = "#16a34a";
      messageEl.textContent = "Password reset successful.";

      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);

    } catch {
      messageEl.textContent = "Server error. Try again.";
    }
  });
});
