// admin-notifications.js

if (!window.LCTAuth.isAuthenticated()) {
  window.location.href = "login.html";
}

const payload = window.LCTAuth.decodeJwtPayload(
  window.LCTAuth.getAccessToken()
);

if (!payload?.is_staff && !payload?.is_superuser) {
  window.location.href = "dashboard.html";
}

const tableBody = document.getElementById("notificationTableBody");
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const statusFilter = document.getElementById("statusFilter");

async function loadNotifications() {
  const params = new URLSearchParams();

  if (searchInput.value) params.append("search", searchInput.value);
  if (typeFilter.value) params.append("type", typeFilter.value);
  if (statusFilter.value) params.append("status", statusFilter.value);

  const res = await fetch(
    "http://127.0.0.1:8000/api/admin/notifications/?" + params.toString(),
    {
      headers: window.LCTAuth.authHeader()
    }
  );

  if (!res.ok) {
    console.error("Failed to load admin notifications");
    return;
  }

  const data = await res.json();
  renderTable(data);
}

function renderTable(data) {
  tableBody.innerHTML = "";

  data.forEach(n => {
    tableBody.innerHTML += `
      <tr>
        <td>
          <strong>${n.username}</strong><br/>
          <small>${n.email || ""}</small>
        </td>
        <td>${n.message}</td>
        <td>
          ${n.document_type || "-"}<br/>
          <small>${n.document_title || ""}</small>
        </td>
        <td>
          <span class="badge badge-type">${n.tag || "system"}</span>
        </td>
        <td>
          <span class="badge ${n.is_read ? "badge-read" : "badge-unread"}">
            ${n.is_read ? "Read" : "Unread"}
          </span>
        </td>
        <td>${new Date(n.sent_at).toLocaleString()}</td>
      </tr>
    `;
  });
}

[searchInput, typeFilter, statusFilter].forEach(el =>
  el.addEventListener("input", loadNotifications)
);

loadNotifications();
