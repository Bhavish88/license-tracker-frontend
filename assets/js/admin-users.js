// ---------------------
// DOM REFERENCES
// ---------------------
const tableHead = document.getElementById("tableHead");
const tableBody = document.getElementById("tableBody");
const filterButtons = document.querySelectorAll(".filter-btn");

// ---------------------
// AUTH INFO (USED ONLY FOR UI, NOT SECURITY)
// ---------------------
const token = localStorage.getItem("accessToken");
const isStaff = localStorage.getItem("is_staff") === "true";
const isSuperuser = localStorage.getItem("is_superuser") === "true";

// ---------------------
// FETCH HELPER (USES api.js)
// ---------------------
async function fetchAdminData(path) {
  const res = await get(path);

  if (!res.ok) {
    alert(`Access denied or server error (${res.status})`);
    return [];
  }

  return res.data;
}

// ---------------------
// RENDER FUNCTIONS
// ---------------------
function renderUsers(data) {
  tableHead.innerHTML = `
    <tr>
      <th>Username</th>
      <th>Email</th>
      <th>First Name</th>
      <th>Last Name</th>
      <th>Action</th>
    </tr>
  `;

  tableBody.innerHTML = data
    .map(
      (u) => `
      <tr>
        <td>${u.username}</td>
        <td>${u.email}</td>
        <td>${u.first_name || "-"}</td>
        <td>${u.last_name || "-"}</td>
        <td>
          <button class="danger-btn" onclick="deleteUser(${u.id})">
            Delete
          </button>
        </td>
      </tr>
    `
    )
    .join("");
}

function renderLicenses(data) {
  tableHead.innerHTML = `
    <tr>
      <th>Title</th>
      <th>Owner</th>
      <th>Issued By</th>
      <th>Issue Date</th>
      <th>Expiry Date</th>
    </tr>
  `;

  tableBody.innerHTML = data
    .map(
      (l) => `
      <tr>
        <td>${l.name}</td>
        <td>${l.owner}</td>
        <td>${l.issued_by || "-"}</td>
        <td>${l.issue_date || "-"}</td>
        <td>${l.expiry_date || "-"}</td>
      </tr>
    `
    )
    .join("");
}

function renderCertificates(data) {
  tableHead.innerHTML = `
    <tr>
      <th>Title</th>
      <th>Owner</th>
      <th>Category</th>
      <th>Issue Date</th>
      <th>Expiry Date</th>
    </tr>
  `;

  tableBody.innerHTML = data
    .map(
      (c) => `
      <tr>
        <td>${c.title}</td>
        <td>${c.owner}</td>
        <td>${c.category || "-"}</td>
        <td>${c.issued_date}</td>
        <td>${c.expiry_date || "-"}</td>
      </tr>
    `
    )
    .join("");
}

// ---------------------
// DELETE USER
// ---------------------
async function deleteUser(userId) {
  const confirmDelete = confirm(
    "This will permanently delete the user and ALL related data. Continue?"
  );

  if (!confirmDelete) return;

  const res = await del(`/api/admin/users/${userId}/`);

  if (res.ok) {
    alert("User deleted successfully");
    loadUsers();
  } else {
    alert(`Failed to delete user (${res.status})`);
  }
}

// ---------------------
// LOADERS
// ---------------------
async function loadUsers() {
  const data = await fetchAdminData("/api/admin/users/");
  renderUsers(data);
}

async function loadLicenses() {
  const data = await fetchAdminData("/api/admin/licenses/");
  renderLicenses(data);
}

async function loadCertificates() {
  const data = await fetchAdminData("/api/admin/certificates/");
  renderCertificates(data);
}

// ---------------------
// FILTER HANDLER
// ---------------------
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;

    if (filter === "users") loadUsers();
    if (filter === "licenses") loadLicenses();
    if (filter === "certificates") loadCertificates();
  });
});

// ---------------------
// INITIAL LOAD
// ---------------------
loadUsers();
