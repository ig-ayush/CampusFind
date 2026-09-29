const STORAGE_KEY = "campusFindItems";
const THEME_KEY = "campusFindTheme";

const sampleItems = [
  {
    id: crypto.randomUUID(),
    name: "Wireless Headphones",
    status: "found",
    category: "Electronics",
    location: "Main Library",
    date: new Date().toISOString().slice(0, 10),
    description: "Black wireless headphones found near the library entrance.",
    contact: "library.help@example.com"
  },
  {
    id: crypto.randomUUID(),
    name: "Blue Notebook",
    status: "lost",
    category: "Books",
    location: "Block B Classroom",
    date: "2026-09-27",
    description: "Blue ruled notebook with handwritten Java notes.",
    contact: "student01@example.com"
  },
  {
    id: crypto.randomUUID(),
    name: "College ID Card",
    status: "found",
    category: "ID Cards",
    location: "Cafeteria",
    date: "2026-09-26",
    description: "Student ID card found near the cafeteria payment counter.",
    contact: "campus.office@example.com"
  },
  {
    id: crypto.randomUUID(),
    name: "Black Water Bottle",
    status: "lost",
    category: "Other",
    location: "Sports Ground",
    date: "2026-09-25",
    description: "Matte black reusable bottle with a small sticker on the side.",
    contact: "student02@example.com"
  },
  {
    id: crypto.randomUUID(),
    name: "USB-C Charger",
    status: "found",
    category: "Electronics",
    location: "Computer Lab",
    date: "2026-09-24",
    description: "65W USB-C laptop charger left on a lab desk.",
    contact: "lab.support@example.com"
  },
  {
    id: crypto.randomUUID(),
    name: "Grey Hoodie",
    status: "lost",
    category: "Clothing",
    location: "Auditorium",
    date: "2026-09-23",
    description: "Grey hoodie, medium size, left after a college event.",
    contact: "student03@example.com"
  }
];

let items = loadItems();

const itemsGrid = document.getElementById("itemsGrid");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const categoryFilter = document.getElementById("categoryFilter");
const reportForm = document.getElementById("reportForm");
const itemModal = document.getElementById("itemModal");
const modalContent = document.getElementById("modalContent");
const toast = document.getElementById("toast");

function loadItems() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { return JSON.parse(saved); } catch (_) {}
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleItems));
  return sampleItems;
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

function itemEmoji(category) {
  return {
    Electronics: "🎧",
    Books: "📚",
    "ID Cards": "🪪",
    Accessories: "🎒",
    Clothing: "🧥",
    Other: "📦"
  }[category] || "📦";
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  }).format(date);
}

function renderItems() {
  const search = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;
  const category = categoryFilter.value;

  const filtered = items.filter(item => {
    const searchable = `${item.name} ${item.location} ${item.description} ${item.category}`.toLowerCase();
    return (!search || searchable.includes(search))
      && (status === "all" || item.status === status)
      && (category === "all" || item.category === category);
  });

  itemsGrid.innerHTML = filtered.map(item => `
    <article class="item-card" data-id="${item.id}" tabindex="0" role="button" aria-label="View ${escapeHTML(item.name)}">
      <div class="item-top">
        <div class="item-emoji">${itemEmoji(item.category)}</div>
        <span class="status-pill ${item.status}">${item.status.toUpperCase()}</span>
      </div>
      <h3>${escapeHTML(item.name)}</h3>
      <p>${escapeHTML(item.description)}</p>
      <div class="item-meta">
        <span>📍 ${escapeHTML(item.location)}</span>
        <span>📅 ${formatDate(item.date)}</span>
      </div>
    </article>
  `).join("");

  emptyState.classList.toggle("hidden", filtered.length !== 0);
  itemsGrid.classList.toggle("hidden", filtered.length === 0);

  document.querySelectorAll(".item-card").forEach(card => {
    card.addEventListener("click", () => openItem(card.dataset.id));
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") openItem(card.dataset.id);
    });
  });
}

function openItem(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;

  modalContent.innerHTML = `
    <div class="modal-icon">${itemEmoji(item.category)}</div>
    <span class="status-pill ${item.status}">${item.status.toUpperCase()}</span>
    <h2 id="modalTitle">${escapeHTML(item.name)}</h2>
    <p>${escapeHTML(item.description)}</p>
    <div class="detail-list">
      <div><small>Category</small><strong>${escapeHTML(item.category)}</strong></div>
      <div><small>Location</small><strong>📍 ${escapeHTML(item.location)}</strong></div>
      <div><small>Date reported</small><strong>${formatDate(item.date)}</strong></div>
      <div><small>Contact</small><strong>${escapeHTML(item.contact)}</strong></div>
    </div>
    <a class="btn btn-primary" style="width:100%" href="${contactLink(item.contact)}">Contact reporter →</a>
  `;
  itemModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function contactLink(contact) {
  const value = contact.trim();
  return value.includes("@") ? `mailto:${encodeURIComponent(value)}` : `tel:${value.replace(/[^\d+]/g, "")}`;
}

function closeModal() {
  itemModal.classList.add("hidden");
  document.body.style.overflow = "";
}

function updateDashboard() {
  const lost = items.filter(i => i.status === "lost").length;
  const found = items.filter(i => i.status === "found").length;
  document.getElementById("totalStat").textContent = items.length;
  document.getElementById("lostStat").textContent = lost;
  document.getElementById("foundStat").textContent = found;
  document.getElementById("recentStat").textContent = Math.min(items.length, 5);

  const recent = [...items]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  document.getElementById("recentList").innerHTML = recent.map(item => `
    <div class="recent-row">
      <div class="recent-main">
        <div class="recent-emoji">${itemEmoji(item.category)}</div>
        <div>
          <strong>${escapeHTML(item.name)}</strong>
          <small>${escapeHTML(item.location)} · ${formatDate(item.date)}</small>
        </div>
      </div>
      <span class="status-pill ${item.status}">${item.status}</span>
    </div>
  `).join("");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

reportForm.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(reportForm);
  const item = {
    id: crypto.randomUUID(),
    name: data.get("name").trim(),
    status: data.get("status"),
    category: data.get("category"),
    location: data.get("location").trim(),
    date: data.get("date"),
    description: data.get("description").trim(),
    contact: data.get("contact").trim()
  };

  items.unshift(item);
  saveItems();
  reportForm.reset();
  document.getElementById("dateInput").value = new Date().toISOString().slice(0, 10);
  renderItems();
  updateDashboard();
  showToast("Your item report was published!");
  location.hash = "items";
});

[searchInput, statusFilter, categoryFilter].forEach(el => {
  el.addEventListener("input", renderItems);
  el.addEventListener("change", renderItems);
});

document.querySelectorAll("[data-close-modal]").forEach(el => el.addEventListener("click", closeModal));
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme === "dark") document.documentElement.dataset.theme = "dark";
themeToggle.textContent = savedTheme === "dark" ? "☀" : "☾";

themeToggle.addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme === "dark";
  if (dark) {
    delete document.documentElement.dataset.theme;
    localStorage.setItem(THEME_KEY, "light");
    themeToggle.textContent = "☾";
  } else {
    document.documentElement.dataset.theme = "dark";
    localStorage.setItem(THEME_KEY, "dark");
    themeToggle.textContent = "☀";
  }
});

const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");
menuToggle.addEventListener("click", () => nav.classList.toggle("open"));
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".nav-link")];
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
    }
  });
}, { rootMargin: "-25% 0px -65% 0px" });
sections.forEach(section => observer.observe(section));

document.getElementById("dateInput").value = new Date().toISOString().slice(0, 10);
renderItems();
updateDashboard();
