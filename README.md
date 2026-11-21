# Leonida Ledger — GTA VI Trophy Guide & Tracker

[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Iruwae/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Iruwae/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

Leonida Ledger is an offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: every trophy carries its official name, description and grade plus a guide written for this entry that cites its sources, a roadmap to the platinum ordered missable-first, a spoiler shield that hides story trophies until they are earned, and a checklist whose progress is saved in the browser and can be exported and imported. The audit strip on every tab reads 55/55 official names · 1P 2G 6S 46B · 28 PSN-hidden · 55/55 guides cited · sources read 21 Nov 2026 · 1 possibly missable — because there is exactly one: Positive Mental Attitude, and the guide tells you to do its Chapter 1 meditation first, before it can be missed.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. The app is plain static files under `app/` with no build step and no network at runtime — the only file it fetches is its own `app/data/trophies.json`.

## Tabs

- **Tracker** — the full checklist with search, kind and grade filters, PSN-hidden / disputed / not-earned filters, spoiler shield, export/import, clear, and a demo-progress loader. Click any trophy to open its guide with citations.
- **Roadmap** — six stages to the platinum: the one possibly missable trophy first (Chapter 1), then the story, stranger strands, collectibles, activities, and the 100% cleanup.
- **Missables** — the one possibly missable trophy in full, plus the missable content that does *not* affect any trophy.
- **Sources** — every source with its link, the read date (21 Nov 2026), and a Trophy × Source matrix showing which sources each guide cites.

*Built for the make.fun bounty [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01) — ref 817k0hr2.*
