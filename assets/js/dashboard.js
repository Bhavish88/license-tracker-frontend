// ===============================
// AUTH PROTECTION
// ===============================
if (!window.LCTAuth || !window.LCTAuth.isAuthenticated()) {
  window.location.href = "login.html";
}

// Removed redundant explicit localStorage session checks because window.LCTAuth.isAuthenticated() handles it correctly.
// ===============================
// DASHBOARD LOAD
// ===============================
async function loadDashboard() {
  try {
    // Dashboard summary
    const dashboardRes = await get("/api/dashboard/");

    if (!dashboardRes.ok) {
      throw new Error("Dashboard API failed");
    }

    const summary = dashboardRes.data || {};

    document.getElementById("totalDocuments").textContent = summary.total || 0;
    document.getElementById("expiringSoon").textContent = summary.expiring_soon || 0;
    document.getElementById("expiredCount").textContent = summary.expired || 0;

    // Expiry list
    const expiryRes = await get("/api/expiry/");
    renderExpiringList(expiryRes.ok ? expiryRes.data.expiring_soon : []);

    // Recent uploads
    await loadRecentUploads();

  } catch (err) {
    console.error("Dashboard load error:", err);
  }
}

// ===============================
// RECENT UPLOADS
// ===============================
async function loadRecentUploads() {
  try {
    const [licensesRes, certificatesRes] = await Promise.all([
      get("/api/licenses/"),
      get("/api/certificates/")
    ]);

    const licenses = Array.isArray(licensesRes.data)
      ? licensesRes.data
      : licensesRes.data?.results || [];

    const certificates = Array.isArray(certificatesRes.data)
      ? certificatesRes.data
      : certificatesRes.data?.results || [];

    const combined = [...licenses, ...certificates]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    renderRecentUploads(combined);

    document.getElementById("activeLicenses").textContent = licenses.length;

  } catch (err) {
    console.error("Recent uploads error:", err);
  }
}

function renderRecentUploads(items) {
  const container = document.getElementById("recentUploads");
  container.innerHTML = "";

  if (!items.length) {
    container.innerHTML = "<p>No documents uploaded yet.</p>";
    return;
  }

  items.forEach(item => {
    const name = item.title || item.name || "Untitled";
    const type = item.license_type || item.certificate_type || "Document";
    const created = item.created_at
      ? new Date(item.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      : "-";

    const statusClass = item.is_expired
      ? "badge-expired"
      : item.days_left <= 30
      ? "badge-expiring"
      : "badge-active";

    const statusIcon =
      statusClass === "badge-active"
        ? "fa-check-circle"
        : "fa-clock";

    const statusText =
      statusClass === "badge-active" ? "Active" : "Expiring";

    container.innerHTML += `
      <div class="document-item">
        <div class="document-info">
          <h4 class="document-name">${name}</h4>
          <p class="document-type">${type}</p>
        </div>

        <div class="document-meta">
          <span class="document-date">${created}</span>
          <span class="badge ${statusClass}">
            <i class="fas ${statusIcon}"></i> ${statusText}
          </span>
        </div>
      </div>
    `;
  });
}

// ===============================
// EXPIRING SOON LIST
// ===============================
function renderExpiringList(items) {
  const container = document.getElementById("expiringList");
  container.innerHTML = "";

  if (!items || !items.length) {
    container.innerHTML = "<p>No documents expiring soon.</p>";
    return;
  }

  items.slice(0, 5).forEach(item => {
    const name = item.title || item.name || "Untitled";
    const days = item.days_left ?? "-";
    const expiry = item.expiry_date
      ? new Date(item.expiry_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      : "-";

    container.innerHTML += `
      <div class="expiring-item">
        <div class="expiring-info">
          <h4 class="expiring-name">${name}</h4>
          <p class="expiring-date">Expires: ${expiry}</p>
        </div>

        <div class="days-remaining">
          <span class="days-number">${days}</span>
          <span class="days-label">days<br>remaining</span>
        </div>
      </div>
    `;
  });
}

// ===============================
// SIDEBAR NAVIGATION
// ===============================


document.querySelectorAll(".nav-link[data-page]").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    window.location.href = link.dataset.page;
  });
});

// ===============================
// LOGOUT
// ===============================
document.getElementById("logoutBtn").addEventListener("click", () => {
  window.LCTAuth.logout(true);
});

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", loadDashboard);
