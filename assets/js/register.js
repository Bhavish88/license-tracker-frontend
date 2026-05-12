document.querySelectorAll(".toggle-password").forEach(toggle => {
  toggle.onclick = () => {
    const input = document.getElementById(toggle.dataset.target);
    if (!input) return;

    input.type = input.type === "password" ? "text" : "password";
    toggle.textContent = input.type === "password" ? "Show" : "Hide";
  };
});

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = regUsername.value.trim();
  const email = regEmail.value.trim();
  const password = regPassword.value.trim();
  const confirm = regConfirmPassword.value.trim();
  const registerError = document.getElementById("registerError");

  registerError.textContent = "";

  // 🔹 Required fields
  if (!username || !email || !password || !confirm) {
    registerError.textContent = "All fields are required.";
    return;
  }

  // 🔹 Username: no spaces
  if (/\s/.test(username)) {
    registerError.textContent = "Username cannot contain spaces.";
    return;
  }

  // 🔹 Email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    registerError.textContent = "Enter a valid email address.";
    return;
  }

  // 🔹 Password length (as per your test case: at least 8 chars)
  if (password.length < 8) {
    registerError.textContent = "Password should be at least 8 characters.";
    return;
  }

  // 🔹 Confirm password match
  if (password !== confirm) {
    registerError.textContent = "Passwords do not match.";
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:8000/api/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    let data = {};
    try {
      data = await res.json();
    } catch {
      // If backend doesn't return JSON
      registerError.textContent = "Unexpected server response.";
      return;
    }

    if (!res.ok) {
      // Backend validation errors (e.g., duplicate email)
      if (data && typeof data === "object") {
        registerError.textContent = Object.values(data).flat().join(" ");
      } else {
        registerError.textContent = "Registration failed.";
      }
      return;
    }

    // ✅ SUCCESS
    window.location.href = "login.html?registered=1";

  } catch (err) {
    registerError.textContent = "Server error. Try again later.";
  }
});
