// ===============================
// AUTH CHECK
// ===============================
if (!window.LCTAuth || !window.LCTAuth.isAuthenticated()) {
  window.location.href = "login.html";
}

// ===============================
// ELEMENTS
// ===============================
const categoryGrid = document.getElementById("categoryGrid");
const modal = document.getElementById("categoryModal");
const categoryInput = document.getElementById("categoryNameInput");
const modalTitle = document.getElementById("modalTitle");
const addBtn = document.getElementById("addCategoryBtn");
const cancelBtn = document.getElementById("cancelModal");
const saveBtn = document.getElementById("saveCategory");

let editingCategoryId = null;

// ===============================
// API HELPERS (USE api.js)
// ===============================
async function fetchCategories() {
  const res = await fetch(API_BASE + "/api/categories/", {
    headers: window.LCTAuth.authHeader()
  });

  if (!res.ok) return [];

  const data = await res.json();
  return data.results || [];
}

async function createCategory(name) {
  return fetch(API_BASE + "/api/categories/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...window.LCTAuth.authHeader()
    },
    body: JSON.stringify({ name })
  });
}

async function updateCategory(id, name) {
  return fetch(API_BASE + `/api/categories/${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...window.LCTAuth.authHeader()
    },
    body: JSON.stringify({ name })
  });
}

async function deleteCategory(id) {
  return fetch(API_BASE + `/api/categories/${id}/`, {
    method: "DELETE",
    headers: window.LCTAuth.authHeader()
  });
}

// ===============================
// RENDER
// ===============================
async function renderCategories() {
  const categories = await fetchCategories();
  categoryGrid.innerHTML = "";

  if (categories.length === 0) {
    categoryGrid.innerHTML =
      `<p style="color:#64748b">No categories yet.</p>`;
    return;
  }

  categories.forEach(cat => {
    const card = document.createElement("div");
    card.className = "category-card";

    card.innerHTML = `
      <div class="category-left">
        <div class="folder-icon">📁</div>
        <div>
          <div class="category-name">${cat.name}</div>
          <div class="category-count">—</div>
        </div>
      </div>
      <div class="category-actions">
        <button title="Edit">✏️</button>
        <button title="Delete">🗑️</button>
      </div>
    `;

    const [editBtn, deleteBtn] = card.querySelectorAll("button");

    editBtn.onclick = () => openEditModal(cat.id, cat.name);
    deleteBtn.onclick = () => removeCategory(cat.id);

    categoryGrid.appendChild(card);
  });
}

// ===============================
// MODAL
// ===============================
function openAddModal() {
  editingCategoryId = null;
  categoryInput.value = "";
  modalTitle.textContent = "Add Category";
  modal.classList.remove("hidden");
}

function openEditModal(id, name) {
  editingCategoryId = id;
  categoryInput.value = name;
  modalTitle.textContent = "Edit Category";
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
  editingCategoryId = null;
  categoryInput.value = "";
}

// ===============================
// ACTIONS
// ===============================
async function saveCategory() {
  const name = categoryInput.value.trim();
  if (!name) return;

  if (editingCategoryId) {
    await updateCategory(editingCategoryId, name);
  } else {
    await createCategory(name);
  }

  closeModal();
  renderCategories();
}

async function removeCategory(id) {
  if (!confirm("Delete this category?")) return;
  await deleteCategory(id);
  renderCategories();
}

// ===============================
// EVENTS
// ===============================
addBtn.addEventListener("click", openAddModal);
cancelBtn.addEventListener("click", closeModal);
saveBtn.addEventListener("click", saveCategory);

// ===============================
// INIT
// ===============================
renderCategories();
