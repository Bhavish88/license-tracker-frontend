// 🔐 Auth check
if (!window.LCTAuth.isAuthenticated()) {
  window.location.href = "login.html";
}

// DOM references
const table = document.getElementById("expiryTable");
const count30 = document.getElementById("count30");
const count60 = document.getElementById("count60");
const countExpired = document.getElementById("countExpired");
const detailsModal = document.getElementById("detailsModal");
const detailsContent = document.getElementById("detailsContent");
const closeDetailsBtn = document.getElementById("closeDetailsBtn");

// Helpers
function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toDateString();
}

function statusBadge(daysLeft) {
  if (daysLeft < 0) {
    return `<span class="badge expired">Expired</span>`;
  }
  return `<span class="badge expiring">Expiring Soon</span>`;
}

function openDetails(item) {
  detailsContent.innerHTML = `
    <p><strong>Name:</strong> ${item.title || item.name}</p>
    <p><strong>Type:</strong> ${item.type}</p>
    <p><strong>Category:</strong> ${
      item.type === "certificate" ? "Certificate" : "License"
    }</p>
    <p><strong>Expiry Date:</strong> ${formatDate(item.expiry_date)}</p>
    <p><strong>Days Left:</strong> ${item.days_left}</p>
  `;

  detailsModal.classList.remove("hidden");
}

closeDetailsBtn.addEventListener("click", () => {
  detailsModal.classList.add("hidden");
});

function renewDoc(type, id) {
  window.location.href = `upload.html?renew=${type}&id=${id}`;
}

// Render logic
function renderExpiry(data) {
  table.innerHTML = "";

  let c30 = 0;
  let c60 = 0;
  let cExpired = 0;

  const allItems = [...data.expired, ...data.expiring_soon, ...data.valid];

  allItems.forEach((item) => {
    const days = item.days_left;

    let statusHTML = "";
    if (days < 0) {
      statusHTML = statusBadge(days);
      cExpired++;
    } else {
      statusHTML = statusBadge(days);
      if (days <= 30) c30++;
      else if (days <= 60) c60++;
    }

    const name = item.type === "certificate" ? item.title : item.name;

    const category = item.type === "certificate" ? "Certificate" : "License";

    table.innerHTML += `
      <tr>
        <td>${name}</td>
        <td>${category}</td>
        <td>${formatDate(item.expiry_date)}</td>
        <td>${statusHTML}</td>
        <td class="right">
          <button class="action-btn view" onclick='openDetails(${JSON.stringify(item)})'>
  Details
</button>

<button class="action-btn renew"
  onclick="renewDoc('${item.type}', ${item.id})">
  Renew Doc
</button>

        </td>
      </tr>
    `;
  });

  count30.textContent = c30;
  count60.textContent = c60;
  countExpired.textContent = cExpired;
}

// Fetch from backend
async function loadExpiryData() {
  try {
    const res = await get("/api/expiry/");

    if (!res.ok) {
      table.innerHTML = `
        <tr>
          <td colspan="5" style="color:red;">Failed to load expiry data</td>
        </tr>
      `;
      return;
    }

    const data = res.data || {
      expired: [],
      expiring_soon: [],
      valid: [],
    };

    renderExpiry(data);
  } catch (err) {
    console.error(err);
    table.innerHTML = `
      <tr>
        <td colspan="5" style="color:red;">Something went wrong</td>
      </tr>
    `;
  }
}

// Init
loadExpiryData();
