// World Cup Predictions — local-only
// Predictions are stored in localStorage. No backend required.

(function () {
  "use strict";

  const STORAGE_KEY = "wc_predictions_v1";

  // ----- Tournament start (placeholder) -----
  // Update to the actual opening match date when announced.
  // Using a date well in the future so the countdown always shows.
  const TOURNAMENT_START = new Date("2026-06-11T18:00:00Z");

  // ----- Countdown -----
  const $days = document.getElementById("days");
  const $hours = document.getElementById("hours");
  const $minutes = document.getElementById("minutes");
  const $seconds = document.getElementById("seconds");

  function pad(n) { return String(n).padStart(2, "0"); }

  function tick() {
    const diff = TOURNAMENT_START - new Date();
    if (diff <= 0) {
      $days.textContent = "0";
      $hours.textContent = "00";
      $minutes.textContent = "00";
      $seconds.textContent = "00";
      return;
    }
    const sec = Math.floor(diff / 1000) % 60;
    const min = Math.floor(diff / (1000 * 60)) % 60;
    const hr = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const day = Math.floor(diff / (1000 * 60 * 60 * 24));
    $days.textContent = String(day);
    $hours.textContent = pad(hr);
    $minutes.textContent = pad(min);
    $seconds.textContent = pad(sec);
  }
  tick();
  setInterval(tick, 1000);

  // ----- Storage -----
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.warn("Failed to load predictions:", e);
      return [];
    }
  }

  function save(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  // ----- Render -----
  const $list = document.getElementById("predictions-list");
  const $chart = document.getElementById("bar-chart");
  const $statTotal = document.getElementById("stat-total");
  const $statTop = document.getElementById("stat-top");
  const $statScore = document.getElementById("stat-score");

  function render() {
    const items = load();
    $statTotal.textContent = String(items.length);

    // Top pick (most-picked team)
    const tally = {};
    items.forEach(it => { tally[it.team] = (tally[it.team] || 0) + 1; });
    const topEntry = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
    $statTop.textContent = topEntry ? topEntry[0] : "—";

    // Most predicted score
    const scoreTally = {};
    items.forEach(it => {
      const key = `${it.scoreWinner}-${it.scoreRunner}`;
      scoreTally[key] = (scoreTally[key] || 0) + 1;
    });
    const topScore = Object.entries(scoreTally).sort((a, b) => b[1] - a[1])[0];
    $statScore.textContent = topScore ? topScore[0] : "—";

    // Bar chart (top 8 teams)
    const top = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const max = top.length ? top[0][1] : 1;
    $chart.innerHTML = "";
    if (top.length === 0) {
      $chart.innerHTML = '<p class="muted" style="margin:0;">No picks yet.</p>';
    } else {
      top.forEach(([team, count]) => {
        const pct = (count / max) * 100;
        const row = document.createElement("div");
        row.className = "bar-row";
        row.innerHTML = `
          <div class="label">${escapeHtml(team)}</div>
          <div class="bar" style="width: ${pct}%;"></div>
          <div class="count">${count}</div>
        `;
        $chart.appendChild(row);
      });
    }

    // List (newest first)
    $list.innerHTML = "";
    if (items.length === 0) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = "No predictions yet — be the first.";
      $list.appendChild(li);
      return;
    }

    items
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .forEach(it => {
        const li = document.createElement("li");
        li.className = "prediction";
        li.innerHTML = `
          <div>
            <div class="who">${escapeHtml(it.name)} picks <span class="pick">${escapeHtml(it.team)}</span> to win</div>
            <div class="meta">${escapeHtml(it.team)} ${it.scoreWinner} – ${it.scoreRunner} ${escapeHtml(it.runnerUp)}</div>
            ${it.note ? `<div class="note">“${escapeHtml(it.note)}”</div>` : ""}
          </div>
          <div class="meta">${formatDate(it.createdAt)}</div>
          <button class="delete" aria-label="Delete prediction" data-id="${it.id}">×</button>
        `;
        $list.appendChild(li);
      });
  }

  function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  // ----- Form -----
  const $form = document.getElementById("prediction-form");
  const $msg = document.getElementById("form-message");

  function setMessage(text, type) {
    $msg.textContent = text;
    $msg.className = "form-message" + (type ? " " + type : "");
  }

  $form.addEventListener("submit", function (e) {
    e.preventDefault();
    setMessage("");

    const data = new FormData($form);
    const name = String(data.get("name") || "").trim();
    const team = String(data.get("team") || "");
    const runnerUp = String(data.get("runnerUp") || "");
    const scoreWinner = Number(data.get("scoreWinner"));
    const scoreRunner = Number(data.get("scoreRunner") || 0);
    const note = String(data.get("note") || "").trim();

    if (!name) return setMessage("Please enter a name.", "err");
    if (!team) return setMessage("Please pick a champion.", "err");
    if (!runnerUp) return setMessage("Please pick a runner-up.", "err");
    if (team === runnerUp) return setMessage("Champion and runner-up must be different teams.", "err");
    if (!Number.isFinite(scoreWinner) || scoreWinner < 0) return setMessage("Enter a valid score.", "err");

    const items = load();
    items.push({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name,
      team,
      runnerUp,
      scoreWinner,
      scoreRunner,
      note,
      createdAt: Date.now(),
    });
    save(items);

    $form.reset();
    setMessage("Prediction submitted! Check the leaderboard below.", "ok");
    render();

    document.getElementById("leaderboard").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // ----- Delete + clear -----
  $list.addEventListener("click", function (e) {
    const btn = e.target.closest(".delete");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const items = load().filter(it => it.id !== id);
    save(items);
    render();
  });

  document.getElementById("clear-btn").addEventListener("click", function () {
    if (!confirm("Remove all predictions stored in this browser?")) return;
    save([]);
    render();
  });

  // ----- Initial render -----
  render();
})();
