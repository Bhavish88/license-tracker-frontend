// ===============================
// AUTH CHECK
// ===============================
if (!window.LCTAuth || !window.LCTAuth.isAuthenticated()) {
  window.location.href = "login.html";
}

// ===============================
// ELEMENTS (EXISTING)
// ===============================
const docType = document.getElementById("docType");
const licenseFields = document.getElementById("licenseFields");
const certificateFields = document.getElementById("certificateFields");
const form = document.getElementById("uploadForm");
const actionMessage = document.getElementById("uploadActionMessage"); // bottom message
const fileInput = document.getElementById("file");
const uploadMain = document.querySelector(".upload-main");

const steps = document.querySelectorAll(".step");
const stepCards = document.querySelectorAll(".upload-card");
const filePreview = document.getElementById("filePreview");

// ===============================
// STEP HELPERS
// ===============================
function activateStep(index) {
  steps.forEach((step, i) => {
    step.classList.remove("active", "completed");
    if (i < index) step.classList.add("completed");
    if (i === index) step.classList.add("active");
  });

  if (stepCards[index]) {
    stepCards[index].scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// ===============================
// TOGGLE FIELDS
// ===============================
function toggleFields() {
  if (!docType || !licenseFields || !certificateFields) return;

  if (docType.value === "license") {
    licenseFields.style.display = "block";
    certificateFields.style.display = "none";
  } else if (docType.value === "certificate") {
    certificateFields.style.display = "block";
    licenseFields.style.display = "none";
    loadCategories();
  } else {
    licenseFields.style.display = "none";
    certificateFields.style.display = "none";
  }
}

docType.addEventListener("change", () => {
  toggleFields();
  activateStep(1);
});

toggleFields();

// ===============================
// FILE PREVIEW
// ===============================
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  filePreview.querySelector(".file-name").textContent = file.name;
  filePreview.querySelector(".file-size").textContent =
    (file.size / 1024).toFixed(2) + " KB";

  filePreview.classList.remove("hidden");
  activateStep(2);
});

// ===============================
// MESSAGE HELPERS (BOTTOM BAR)
// ===============================
let messageTimer = null;

function clearActionMessage() {
  if (!actionMessage) return;
  actionMessage.textContent = "";
  actionMessage.classList.add("hidden");
  if (messageTimer) {
    clearTimeout(messageTimer);
    messageTimer = null;
  }
}

function showActionError(msg) {
  if (!actionMessage) return;
  actionMessage.textContent = msg;
  actionMessage.className = "action-message error";
  actionMessage.classList.remove("hidden");
}

function showActionSuccess(msg) {
  if (!actionMessage) return;
  actionMessage.textContent = msg;
  actionMessage.className = "action-message success";
  actionMessage.classList.remove("hidden");

  // Optional: auto-hide after 4 seconds (remove this if you want it to persist)
  if (messageTimer) clearTimeout(messageTimer);
  messageTimer = setTimeout(() => {
    clearActionMessage();
  }, 4000);
}

// ===============================
// SUBMIT HANDLER
// ===============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearActionMessage();

  const type = docType.value;
  const file = fileInput.files[0];

  if (!type) return showActionError("Please select document type.");

  const formData = new FormData();
  let endpoint = "";

  if (type === "license") {
    const name = document.getElementById("licenseName").value.trim();
    const issueDate = document.getElementById("licenseIssueDate").value;
    const expiryDate = document.getElementById("licenseExpiryDate").value;

    if (!name || !issueDate || !expiryDate) {
      return showActionError("License name, issue date and expiry date are required.");
    }

    if (new Date(expiryDate) <= new Date(issueDate)) {
      return showActionError("Expiry date must be after issue date.");
    }

    formData.append("name", name);
    formData.append("number", document.getElementById("licenseNumber").value || "");
    formData.append("issued_by", document.getElementById("issuedBy").value || "");
    formData.append("issue_date", issueDate);
    formData.append("expiry_date", expiryDate);

    if (file) formData.append("file", file);

    endpoint = "/api/licenses/";
  }

  if (type === "certificate") {
    const title = document.getElementById("certificateTitle").value.trim();
    const issuedDate = document.getElementById("certificateIssuedDate").value;
    const expiryDate = document.getElementById("certificateExpiryDate").value;
    const category = document.getElementById("certificateCategory").value;

    if (!title || !issuedDate || !file) {
      return showActionError("Title, issued date and file are required.");
    }

    if (expiryDate && new Date(expiryDate) <= new Date(issuedDate)) {
      return showActionError("Expiry date must be after issue date.");
    }

    formData.append("title", title);
    formData.append("issued_date", issuedDate);
    formData.append("expiry_date", expiryDate || "");
    formData.append("file", file);
    if (category) formData.append("category", category);

    endpoint = "/api/certificates/";
  }

  try {
    activateStep(3);

    const res = await fetch("http://127.0.0.1:8000" + endpoint, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("lct_access")
      },
      body: formData
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) return showActionError(parseBackendError(data));

    // ✅ SUCCESS (message now persists)
    showActionSuccess("Document uploaded successfully!");

    // Reset form AFTER showing message (no hiding)
    form.reset();
    toggleFields();
    filePreview.classList.add("hidden");

  } catch (err) {
    console.error(err);
    showActionError("Server error. Please try again later.");
  }
});

// ===============================
// LOAD CATEGORIES
// ===============================
async function loadCategories() {
  const categorySelect = document.getElementById("certificateCategory");
  if (!categorySelect) return;

  categorySelect.innerHTML = "";
  categorySelect.disabled = true;

  const loadingOpt = document.createElement("option");
  loadingOpt.textContent = "Loading categories...";
  loadingOpt.value = "";
  categorySelect.appendChild(loadingOpt);

  try {
    const res = await fetch("http://127.0.0.1:8000/api/categories/", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("lct_access")
      }
    });

    if (!res.ok) throw new Error("Failed to load categories");

    const data = await res.json();
    const categories = Array.isArray(data) ? data : (data.results || []);

    categorySelect.innerHTML = "";

    if (!categories.length) {
      categorySelect.innerHTML = `
        <option value="">No categories found</option>
        <option value="__add__">+ Add Category</option>
      `;
      categorySelect.disabled = false;
      return;
    }

    categorySelect.appendChild(new Option("Select category", ""));

    categories.forEach(cat => {
      const label =
        cat.name ||
        cat.category_name ||
        cat.title ||
        "Unnamed Category";

      categorySelect.appendChild(new Option(label, cat.id));
    });

    categorySelect.disabled = false;

  } catch (err) {
    console.error("Category load error:", err);
    categorySelect.innerHTML = `<option value="">Unable to load categories</option>`;
  }
}

// ===============================
// HELPERS
// ===============================
function parseBackendError(data) {
  if (typeof data !== "object") return "Upload failed.";
  return Object.values(data).flat().join(" ");
}
