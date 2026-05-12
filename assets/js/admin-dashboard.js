// 🔐 ADMIN PAGE PROTECTION
if (!window.LCTAuth.isAuthenticated()) {
  window.location.href = "login.html";
}

const payload = window.LCTAuth.decodeJwtPayload(
  window.LCTAuth.getAccessToken()
);

if (!payload?.is_staff && !payload?.is_superuser) {
  window.location.href = "dashboard.html";
}

// ✅ ONLY RUN IF ADMIN DASHBOARD ELEMENT EXISTS
if (document.getElementById("totalUsers")) {
  const totalUsersEl = document.getElementById("totalUsers");
  const totalCertificatesEl = document.getElementById("totalCertificates");
  const totalLicensesEl = document.getElementById("totalLicenses");
  const totalCategoriesEl = document.getElementById("totalCategories");
  const statusTextEl = document.getElementById("adminStatusText");
  const activityListEl = document.getElementById("recentActivityList");

  async function loadAdminDashboard() {
    try {
      statusTextEl.textContent = "Loading system data…";

      const res = await get("/api/admin/dashboard/");
      if (!res.ok) throw new Error();

      totalUsersEl.textContent = res.data.total_users;
      totalCertificatesEl.textContent = res.data.total_certificates;
      totalLicensesEl.textContent = res.data.total_licenses;
      totalCategoriesEl.textContent = res.data.total_categories;

      statusTextEl.textContent = "System data loaded.";
    } catch {
      statusTextEl.textContent = "Failed to load admin data.";
    }
  }

  function getActivityMeta(action = "") {
  const text = action.toLowerCase();

  if (text.includes("certificate"))
    return { icon: "📄", cls: "icon-cert" };

  if (text.includes("license"))
    return { icon: "🪪", cls: "icon-license" };

  if (text.includes("registered"))
    return { icon: "👤", cls: "icon-user" };

  if (text.includes("deleted"))
    return { icon: "❌", cls: "icon-delete" };

  return { icon: "⚙️", cls: "icon-system" };
}

function getRelativeTime(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

async function loadRecentActivity() {
  try {
    const res = await get("/api/admin/recent-activity/");
    if (!res.ok || !res.data?.length) {
      activityListEl.innerHTML = "<li>No recent activity.</li>";
      return;
    }

    activityListEl.innerHTML = "";

    res.data.slice(0, 5).forEach(item => {
      const username = item.user
        ? item.user.username
        : item.meta?.username || "System";

      const { icon, cls } = getActivityMeta(item.action);
      const time = getRelativeTime(item.created_at);

      const li = document.createElement("li");
      li.className = "activity-item";

      li.innerHTML = `
        <div class="activity-icon ${cls}">${icon}</div>
        <div class="activity-content">
          <div class="activity-text">
            <strong>${username}</strong> ${item.action}
          </div>
          <div class="activity-time">${time}</div>
        </div>
      `;

      activityListEl.appendChild(li);
    });

  } catch {
    activityListEl.innerHTML = "<li>Failed to load activity.</li>";
  }
}


  loadAdminDashboard();
  loadRecentActivity();
}
function getRelativeTime(dateString) {
  const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

function getActivityIcon(action = "") {
  const text = action.toLowerCase();

  if (text.includes("certificate")) return "📄";
  if (text.includes("license")) return "🪪";
  if (text.includes("registered")) return "👤";
  if (text.includes("deleted")) return "❌";

  return "⚙️";
}

// ------------------------------
// ADMIN SIDEBAR NAVIGATION
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-link[data-page]");

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const page = link.getAttribute("data-page");
      if (!page) return;

      window.location.href = page;
    });
  });
});
