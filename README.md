# FIFA World Cup 2026 — Predictions

A simple, modern website where fans can submit and view predictions for the upcoming FIFA World Cup.

## Features

- 📝 **Submit predictions** — pick a champion, runner-up, predicted final score, and a "bold take"
- 📊 **Live leaderboard** — see the top-picked teams, most-predicted score, and every prediction
- ⏱️ **Countdown timer** — counts down to tournament kickoff
- 💾 **Local storage** — predictions are saved in the browser (no backend needed)
- 📱 **Responsive** — works on phone, tablet, and desktop

## Files

- `index.html` — page structure
- `styles.css` — styling
- `app.js` — interactivity, form handling, and local storage

## Run locally

Just open `index.html` in your browser. No build step, no dependencies.

## Deploy to GitHub Pages

1. Create a new GitHub repository (e.g. `world-cup-predictions`).
2. Push these files to the `main` branch.
3. In your repo, go to **Settings → Pages**.
4. Under **Source**, choose `Deploy from a branch`, then select `main` and `/ (root)`. Save.
5. Wait a minute — your site will be live at `https://<your-username>.github.io/world-cup-predictions/`.

## Customize

- **Tournament start date**: open `app.js` and update the `TOURNAMENT_START` constant to the real opening match date/time.
- **Team list**: add or remove `<option>` entries inside `<select id="team">` in `index.html`.
- **Colors and feel**: tweak the CSS variables at the top of `styles.css` (e.g. `--accent`, `--gold`).
