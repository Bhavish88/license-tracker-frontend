// ===============================
// AUTH CHECK
// ===============================
if (!window.LCTAuth || !window.LCTAuth.isAuthenticated()) {
  window.location.href = "login.html";
}

// ===============================
// ELEMENTS
// ===============================
const grid = document.getElementById("documentsGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");
const sortBtn = document.getElementById("sortBtn");
const countText = document.getElementById("countText");

let allDocs = [];
let categoriesMap = new Map();
let sortAsc = true;

// ===============================
// HELPERS
// ===============================
function getStatus(expiryDate) {
  if (!expiryDate) return "Active";

  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Expired";
  if (diffDays <= 30) return "Expiring";
  return "Active";
}

function authHeaders() {
  return {
    Authorization: "Bearer " + localStorage.getItem("lct_access")
  };
}

function getDocIcon(type) {
  if (type === "license") {
    return `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
        <circle cx="8" cy="12" r="2" fill="currentColor"/>
        <line x1="13" y1="10" x2="18" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <line x1="13" y1="14" x2="16" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
  } else {
    // Certificate - Document with Seal
    return `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="16" cy="16" r="3.5" stroke="currentColor" stroke-width="1.5" fill="currentColor" opacity="0.2"/>
        <path d="M16 14.5V17.5M14.5 16H17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `;
  }
} 

// ===============================
// FETCH CATEGORIES
// ===============================
async function loadCategories() {
  const res = await fetch("http://127.0.0.1:8000/api/categories/", {
    headers: authHeaders()
  });

  if (!res.ok) return;

  const data = await res.json();
  const list = Array.isArray(data) ? data : data.results || [];

  list.forEach(c => categoriesMap.set(c.id, c.name));

  categoryFilter.innerHTML = `<option value="all">All Categories</option>
    <option value="License">License</option>
    <option value="Certificate">Certificate</option>`;

  list.forEach(c => {
    categoryFilter.innerHTML += `<option value="${c.id}">${c.name}</option>`;
  });
}

// ===============================
// FETCH DOCUMENTS
// ===============================
async function loadDocuments() {
  try {
    const [licensesRes, certsRes] = await Promise.all([
      fetch("http://127.0.0.1:8000/api/licenses/", { headers: authHeaders() }),
      fetch("http://127.0.0.1:8000/api/certificates/", { headers: authHeaders() })
    ]);

    const licensesData = await licensesRes.json();
    const certsData = await certsRes.json();

    const licenses = Array.isArray(licensesData)
      ? licensesData
      : licensesData.results || [];

    const certificates = Array.isArray(certsData)
      ? certsData
      : certsData.results || [];

    allDocs = [
      ...licenses.map(l => ({
        id: l.id,
        title: l.name,
        expiry: l.expiry_date,
        category: "License",
        type: "license",
        status: getStatus(l.expiry_date)
      })),
      ...certificates.map(c => ({
        id: c.id,
        title: c.title,
        expiry: c.expiry_date,
        category: c.category || null,
        categoryName: c.category_name || "Uncategorized",
        type: "certificate",
        status: getStatus(c.expiry_date)
      }))
    ];

    render();
  } catch (e) {
    console.error(e);
    grid.innerHTML = "<p>Failed to load documents.</p>";
  }
}

// ===============================
// VIEW DOCUMENT (PDF / FILE)
// ===============================
function viewDoc(id, type) {
  const url =
    type === "certificate"
      ? `http://127.0.0.1:8000/api/certificates/${id}/download/`
      : `http://127.0.0.1:8000/api/licenses/${id}/download/`;

  window.open(url, "_blank");
}

// ===============================
// EDIT DOCUMENT
// ===============================
async function editDoc(id, type) {
  const doc = allDocs.find(d => d.id === id && d.type === type);
  if (!doc) return;

  const newTitle = prompt("Enter new name/title:", doc.title);
  if (!newTitle) return;

  const newExpiry = prompt("Enter expiry date (YYYY-MM-DD):", doc.expiry || "");
  const newCategory =
    type === "certificate"
      ? prompt("Enter category ID (leave blank to keep same):", "")
      : null;

  const formData = new FormData();
  formData.append(type === "license" ? "name" : "title", newTitle);
  if (newExpiry) formData.append("expiry_date", newExpiry);
  if (newCategory) formData.append("category", newCategory);

  const endpoint =
    type === "certificate"
      ? `http://127.0.0.1:8000/api/certificates/${id}/`
      : `http://127.0.0.1:8000/api/licenses/${id}/`;

  const res = await fetch(endpoint, {
    method: "PATCH",
    headers: authHeaders(),
    body: formData
  });

  if (!res.ok) {
    alert("Update failed");
    return;
  }

  loadDocuments();
}

// ===============================
// DELETE DOCUMENT
// ===============================
async function deleteDoc(id, type) {
  if (!confirm("Do you really want to delete this document?")) return;

  const endpoint =
    type === "certificate"
      ? `http://127.0.0.1:8000/api/certificates/${id}/`
      : `http://127.0.0.1:8000/api/licenses/${id}/`;

  const res = await fetch(endpoint, {
    method: "DELETE",
    headers: authHeaders()
  });

  if (!res.ok) {
    alert("Delete failed");
    return;
  }

  allDocs = allDocs.filter(d => d.id !== id);
  render();
}

// ===============================
// RENDER
// ===============================
function render() {
  const search = searchInput.value.toLowerCase();
  const cat = categoryFilter.value;
  const status = statusFilter.value;

  let filtered = allDocs.filter(d => {
    const matchesCategory =
      cat === "all" ||
      d.category === cat ||
      d.category == cat ||
      d.type === cat.toLowerCase();

    return (
      d.title.toLowerCase().includes(search) &&
      matchesCategory &&
      (status === "all" || d.status === status)
    );
  });

  filtered.sort((a, b) => {
    if (!a.expiry) return 1;
    if (!b.expiry) return -1;
    return sortAsc
      ? new Date(a.expiry) - new Date(b.expiry)
      : new Date(b.expiry) - new Date(a.expiry);
  });

  grid.innerHTML = "";
  countText.textContent = `${filtered.length} documents found`;

  if (!filtered.length) {
    grid.innerHTML = "<p>No documents found.</p>";
    return;
  }

  filtered.forEach(d => {
    const iconClass = d.type === "license" ? "doc-icon-license" : "doc-icon-certificate";
    
    grid.innerHTML += `
      <div class="document-card">
        <span class="status-badge ${d.status}">${d.status}</span>

        <div class="doc-header">
          <div class="doc-icon ${iconClass}">
            ${getDocIcon(d.type)}
          </div>
          <div>
            <div class="doc-title">${d.title}</div>
            <div class="doc-category">
              ${d.type === "certificate" ? d.categoryName : "License"}
            </div>
          </div>
        </div>

        <div class="doc-dates">
          <span>Expiry</span>
          <span>${d.expiry || "N/A"}</span>
        </div>

        <div class="doc-actions">
          <button onclick="viewDoc(${d.id}, '${d.type}')">View</button>
          <button onclick="editDoc(${d.id}, '${d.type}')">Edit</button>
          <button onclick="deleteDoc(${d.id}, '${d.type}')">Delete</button>
        </div>
      </div>
    `;
  });
}

// ===============================
// EVENTS
// ===============================
searchInput.addEventListener("input", render);
categoryFilter.addEventListener("change", render);
statusFilter.addEventListener("change", render);

sortBtn.addEventListener("click", () => {
  sortAsc = !sortAsc;
  sortBtn.textContent = sortAsc ? "Sort by Expiry ↑" : "Sort by Expiry ↓";
  render();
});

// ===============================
// INIT
// ===============================
(async function init() {
  await loadCategories();
  await loadDocuments();
})();