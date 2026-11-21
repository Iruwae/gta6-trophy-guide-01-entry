# Leonida Ledger — GTA VI Trophy Guide & Tracker

[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Iruwae/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Iruwae/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

Leonida Ledger is an offline, static web app that guides you to the Grand Theft Auto VI platinum on PlayStation 5: all 55 official trophies with their PlayStation names, descriptions and grades, a guide in our own words for every single one with named sources and links, a missable-first roadmap (the Chapter 1 meditation comes before anything else), and a tracker that saves your progress in the browser, with search, kind and grade filters, a spoiler shield for story trophies, and export/import. Everything runs from local files with the network off, and every claim that is still unconfirmed — six trophies whose methods the guides have not verified yet — is flagged honestly instead of presented as fact.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — or serve `app/` with any static server, for example `python3 -m http.server` from inside `app/`.

## What's inside

- `app/index.html`, `app/app.js`, `app/style.css` — the guide and tracker (Tracker, Roadmap, Missables, Sources tabs).
- `app/data/trophies.json` — all 55 official trophies: name, description, grade, PSN-hidden flag, kind, missable flag, disputed flag, roadmap stage, guide and sources.
- `screenshots/` — four real renders of the app in a browser: the tracker with demo progress and a guide open, the roadmap, the missables tab, and the sources tab.
- `main.ts` — hands the entry in: copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json`.

## Facts, honestly stated

- 55 trophies: 1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden on PSN.
- All offline, single-player; one playthrough is enough; no online trophies.
- Only one possibly missable trophy: Positive Mental Attitude (meditate at all 18 spots — do the Chapter 1 Lucia meditation first).
- Sources read 21 Nov 2026. The game is days old: methods may change as players confirm more.

---

Built for [make.fun](https://make.fun/bounty/gta6-trophy-guide-01) — bounty gta6-trophy-guide-01, ref 817k0hr2.
