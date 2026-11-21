# Leonida Ledger — GTA 6 Trophy Guide (Round 4)

[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Iruwae/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Iruwae/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

**Bounty:** https://make.fun/bounty/gta6-trophy-guide-01

A complete GTA 6 trophy guide for PS5: all **55 trophies** (1 Platinum, 2 Gold, 6 Silver, 46 Bronze), every claim cited. **55/55 trophies carry a citation; 50 have a confirmed method; 5 are flagged UNCONFIRMED** — never presented as working methods. Built from **14 source sites**, read 21 Nov 2026.

## What this round changes (vs Round 3)

- **Per-claim citations:** every trophy in `app/data/trophies.json` cites 1–2 named sources with real URLs. The audit strip in the UI is computed live from the data — the numbers you see are the numbers in the file.
- **Honest counts only:** 55/55 cited, 50 confirmed, 5 unconfirmed, 14 sources. No claim without a source.
- **Disputes section:** 5 documented disagreements with both versions + "Our call" — including the Chapter 1 balcony meditation, the five unconfirmed trophies, the 'Irredeemable' name that appears in some lists but not in the 55, which Stranger strands count, and missable content that does *not* affect trophies.
- **Interactive checklist:** search, filter by category (story / strangers / activities / crime / unconfirmed / possibly missable), tick trophies off — progress persists in your browser.

## The facts that matter

- **Difficulty 4/10, ~200h to Platinum** (PowerPyx). One playthrough, all offline, single-player. No online trophies.
- **Only possibly missable trophy: Positive Mental Attitude** — meditate at all 18 spots. In Chapter 1, after the mission *Down to Earth*, talk to Lucia in the kitchen in the morning, follow her to the balcony and choose **Accept**. Whether that balcony meditation is required is unconfirmed — do it anyway (see Disputes).
- **Hardest trophy: A Long Road** — 100% completion. The checklist only appears after the story, but progress made during the story counts.
- **No mission replay, no mission gold medals.** Keep a manual save at the start and end of each chapter.
- **Cheats disable trophies and saving.**

## Run it

```sh
node main.ts
# → http://localhost:8080/
```

No dependencies, no build step, no network calls at runtime. The app is plain HTML/CSS/JS in `app/`; the data lives in `app/data/trophies.json` (55 trophies, 14 sources, 5 disputes, framework facts).

## Sources (14, read 21 Nov 2026)

PowerPyx, KeenGamer, PlanetGTA6, GamesFuze, EGamers, GTAScoop, CryptoGames, The Games Wiki, Exophase, PSNProfiles, TrueAchievements, GTABase, TechWiser, Beebom / CULTR. Verified URLs are in `app/data/trophies.json` and on the page; the 6 sources whose URLs could not be verified are named without a link. Trophy names are quoted as published; all guide text is written in our own words.

## Honesty note

The game released 19 Nov 2026 and the trophy list was first published 18 Nov 2026. Methods may change as players confirm more. Anything we could not confirm in two sources is marked **UNCONFIRMED** in the data and in the UI.
