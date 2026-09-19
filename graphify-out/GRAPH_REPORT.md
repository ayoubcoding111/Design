# Graph Report - Restaurent design  (2026-09-18)

## Corpus Check
- 2 files · ~214,714 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 26 nodes · 49 edges · 4 communities (1 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0c303d33`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CartEngine
- SoundEngine
- app.js

## God Nodes (most connected - your core abstractions)
1. `CartEngine` - 12 edges
2. `SoundEngine` - 9 edges
3. `setFlavor()` - 2 edges
4. `openCart()` - 2 edges
5. `closeCart()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (4 total, 2 thin omitted)

### Community 2 - "app.js"
Cohesion: 0.40
Nodes (3): closeCart(), openCart(), setFlavor()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CartEngine` connect `CartEngine` to `app.js`, `.playPop`?**
  _High betweenness centrality (0.466) - this node is a cross-community bridge._
- **Why does `SoundEngine` connect `SoundEngine` to `app.js`, `.playPop`?**
  _High betweenness centrality (0.292) - this node is a cross-community bridge._
- **Why does `setFlavor()` connect `app.js` to `SoundEngine`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._