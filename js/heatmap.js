const YEAR = 2026;
const DATA_URL = "js/physics-heatmap-2026";

const pad = (n) => String(n).padStart(2, "0");
const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Levels: 0, 1–2, 3–5, 6–9, 10+
function levelForCount(c) {
  if (c <= 0) return 0;
  if (c <= 2) return 1;
  if (c <= 5) return 2;
  if (c <= 9) return 3;
  return 4;
}

function renderHeatmap(year, dailyCounts) {
  const heatmapEl = document.getElementById("heatmap");
  const totalEl = document.getElementById("totalSolved");

  if (!heatmapEl || !totalEl) return;

  heatmapEl.innerHTML = "";

  const jan1 = new Date(year, 0, 1);

  // Start at Sunday on/before Jan 1 (GitHub-like alignment)
  const start = new Date(jan1);
  start.setDate(jan1.getDate() - jan1.getDay());

  const daysToShow = 52 * 7; // 52 weeks

  let total = 0;

  for (let i = 0; i < daysToShow; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    const iso = toISODate(d);
    const count = dailyCounts[iso] ?? 0;

    if (d.getFullYear() === year) total += count;

    const lvl = levelForCount(count);

    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = `day lvl${lvl}`;
    cell.title = `${iso}\n${count} problem${count === 1 ? "" : "s"} solved`;
    cell.setAttribute("aria-label", `${iso}: ${count} problems solved`);

    if (d.getFullYear() !== year) cell.style.opacity = "0.35";

    heatmapEl.appendChild(cell);
  }

  totalEl.textContent = total;
}

async function init() {
  try {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${DATA_URL} (${res.status})`);
    const dailyCounts = await res.json();
    renderHeatmap(YEAR, dailyCounts);
  } catch (err) {
    console.error(err);
    const heatmapEl = document.getElementById("heatmap");
    if (heatmapEl) heatmapEl.textContent = "Could not load heatmap data. Check file paths and run with a local server.";
  }
}

document.addEventListener("DOMContentLoaded", init);
